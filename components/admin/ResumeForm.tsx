"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addResume, updateResume, uploadResumePdf } from "@/lib/resumes";
import { getProjectsForCurrentUser } from "@/lib/projects";
import {
  getUploadedResumesForCurrentUser,
  getResumePublicUrl,
} from "@/lib/resumes";
import { Resume, UploadedResume } from "@/types/portfolio";
import { toast } from "@/components/ui/sonner";
import { Trash, FileUp, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { useSupabase } from "../providers/AuthProvider";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCurrentUserProfile } from "@/lib/profile"; // Import to get profile data

const resumeSchema = z.object({
  role: z.string().min(2, "Role is required."),
  title: z.string().optional(),
  summary: z.string().min(10, "Summary is required."),
  skills: z.string().min(1, "Please add at least one skill."),
  project_ids: z.array(z.string()).optional(),
  resume_url: z.string().url().nullable(),
  pdf_source: z.enum(["uploaded", "generated"]).default("uploaded"),
  uploaded_resume_id: z.string().nullable().optional(), // New field for uploaded resume reference
  experience: z.array(
    z.object({
      company: z.string().min(1, "Company is required."),
      position: z.string().min(1, "Position is required."),
      duration: z.string().min(1, "Duration is required."),
      description: z.string().min(1, "Description is required."),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string().min(1, "Degree is required."),
      school: z.string().min(1, "School is required."),
      year: z.string().min(4, "Year is required."),
    })
  ),
  certifications: z
    .array(
      // New certifications array
      z.object({
        name: z.string().min(1, "Certification name is required."),
        issuer: z.string().min(1, "Issuer is required."),
        date: z.string().min(4, "Date is required (e.g., 2023)."),
        url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
      })
    )
    .optional(),
  location: z.string().min(2, "Location is required.").optional(), // New location field
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

interface ResumeFormProps {
  resume?: Resume | null;
  onSuccess: () => void;
}

export function ResumeForm({ resume, onSuccess }: ResumeFormProps) {
  const queryClient = useQueryClient();
  const { session } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getProjectsForCurrentUser,
  });

  const { data: uploadedResumes = [] } = useQuery({
    queryKey: ["uploaded-resumes"],
    queryFn: getUploadedResumesForCurrentUser,
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      role: resume?.role || "",
      title: resume?.title || "",
      summary: resume?.summary || "",
      skills: resume?.skills.join(", ") || "",
      project_ids: resume?.project_ids || [],
      resume_url: resume?.resume_url || null,
      pdf_source: resume?.pdf_source || "uploaded",
      uploaded_resume_id: resume?.uploaded_resume_id || null,
      experience:
        resume?.experience.map((exp) => ({
          ...exp,
          description: exp.description.join("\n"),
        })) || [],
      education: resume?.education || [],
      certifications: resume?.certifications || [], // Initialize certifications
      location: resume?.location || "", // Initialize location
    },
  });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: form.control, name: "experience" });
  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control: form.control, name: "education" });
  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({ control: form.control, name: "certifications" }); // New field array for certifications

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !projects) {
        throw new Error(
          "Profile or projects data not loaded for AI generation."
        );
      }
      const currentResumeData = form.getValues(); // Get current form values for resume
      const res = await fetch("/api/generate-resume-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: {
            ...currentResumeData,
            skills: currentResumeData.skills.split(",").map((s) => s.trim()),
            experience: currentResumeData.experience.map((exp) => ({
              ...exp,
              description: exp.description.split("\n"),
            })),
          },
          profile: {
            full_name: profile.full_name,
            tagline: profile.tagline,
            about_page_data: profile.about_page_data,
          },
          projects: projects,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate summary");
      }
      const data = await res.json();
      return data.summary as string;
    },
    onSuccess: (generatedSummary) => {
      form.setValue("summary", generatedSummary, { shouldValidate: true });
      toast.success("Resume summary generated successfully!");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to generate summary: ${error.message}`);
      } else {
        toast.error("Failed to generate summary.");
      }
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ResumeFormValues) => {
      const processedData = {
        ...data,
        skills: data.skills.split(",").map((t) => t.trim()),
        project_ids: data.project_ids || [],
        experience: data.experience.map((exp) => ({
          ...exp,
          description: exp.description.split("\n"),
        })),
        certifications: data.certifications || [], // Ensure certifications are included
        uploaded_resume_id: data.uploaded_resume_id || null, // Include uploaded resume reference
      };
      if (resume) {
        return updateResume(resume.id, processedData);
      }
      return addResume(processedData);
    },
    onSuccess: () => {
      toast.success(`Resume ${resume ? "updated" : "added"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["user-resumes"] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to ${resume ? "update" : "add"} resume: ${error}`);
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    const role = form.getValues("role");
    if (!file || !session?.user.id || !role) {
      toast.error("Please provide a role name before uploading a file.");
      return;
    }
    setIsUploading(true);
    const uploadedResume = await uploadResumePdf(file, session.user.id, role);
    setIsUploading(false);
    if (uploadedResume) {
      form.setValue("resume_url", uploadedResume.public_url || null);
      form.setValue("uploaded_resume_id", uploadedResume.id);
      toast.success("PDF uploaded successfully!");
      // Refresh the uploaded resumes list
      queryClient.invalidateQueries({ queryKey: ["uploaded-resumes"] });
    } else {
      toast.error("Failed to upload PDF.");
    }
  };

  const isGeneratingSummary = generateSummaryMutation.isPending;
  const isDataReadyForAI =
    !isLoadingProfile && !isLoadingProjects && profile && projects;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className='space-y-4 max-h-[70vh] overflow-y-auto p-1'
      >
        {/* Core Fields */}
        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder='developer' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder='Full Stack Developer' {...field} />
              </FormControl>
              <FormDescription>
                Optional custom title for this resume
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='location'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder='San Francisco, CA' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PDF Source */}
        <FormField
          control={form.control}
          name='pdf_source'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel>PDF Source</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex space-x-4'
                >
                  <FormItem className='flex items-center space-x-2 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='uploaded' />
                    </FormControl>
                    <FormLabel className='font-normal'>Uploaded</FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-2 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='generated' />
                    </FormControl>
                    <FormLabel className='font-normal'>Generated</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Uploaded PDF Selector + Preview */}
        {form.watch("pdf_source") === "uploaded" && (
          <div className='space-y-4'>
            <FormItem>
              <FormLabel>Select an Uploaded PDF</FormLabel>
              <FormDescription>
                Choose from your previously uploaded PDFs below.
              </FormDescription>

              {uploadedResumes.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No uploaded resumes found.</p>
                  <p className='text-sm'>
                    Upload a PDF first using the Resume Manager tab.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto'>
                  {uploadedResumes.map((uploadedResume: UploadedResume) => {
                    const isSelected =
                      form.watch("uploaded_resume_id") === uploadedResume.id;
                    return (
                      <div
                        key={uploadedResume.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                        onClick={async () => {
                          form.setValue(
                            "uploaded_resume_id",
                            uploadedResume.id
                          );
                          // Try to get a fresh public URL
                          const publicUrl = await getResumePublicUrl(
                            uploadedResume.file_path
                          );
                          form.setValue(
                            "resume_url",
                            publicUrl || uploadedResume.public_url || null
                          );
                        }}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='w-12 h-16 bg-red-100 rounded flex items-center justify-center text-red-600 text-xs font-semibold flex-shrink-0'>
                            PDF
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-medium text-sm truncate'>
                              {uploadedResume.original_filename}
                            </h4>
                            <p className='text-xs text-muted-foreground mt-1'>
                              {uploadedResume.file_size
                                ? `${Math.round(
                                    uploadedResume.file_size / 1024
                                  )} KB • `
                                : ""}
                              {new Date(
                                uploadedResume.created_at
                              ).toLocaleDateString()}
                            </p>
                            {isSelected && (
                              <div className='flex items-center gap-2 mt-2'>
                                <div className='w-2 h-2 bg-primary rounded-full'></div>
                                <span className='text-xs text-primary font-medium'>
                                  Selected
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Preview Button */}
                        <div className='mt-3 flex gap-2'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                className='flex-1'
                                onClick={(e) => e.stopPropagation()}
                              >
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-4xl max-h-[90vh]'>
                              <DialogHeader>
                                <DialogTitle>
                                  {uploadedResume.original_filename}
                                </DialogTitle>
                              </DialogHeader>
                              <div className='w-full h-[70vh] border rounded overflow-hidden'>
                                <iframe
                                  src={
                                    uploadedResume.public_url ||
                                    uploadedResume.file_path
                                  }
                                  className='w-full h-full'
                                  title={`Preview of ${uploadedResume.original_filename}`}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>

                          {isSelected && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                form.setValue("uploaded_resume_id", null);
                                form.setValue("resume_url", null);
                              }}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Small Inline Preview */}
              {form.watch("resume_url") && (
                <div className='mt-4'>
                  <h4 className='text-sm font-medium mb-2'>
                    Selected Resume Preview:
                  </h4>
                  <div className='border rounded overflow-hidden bg-gray-50'>
                    <iframe
                      src={String(form.watch("resume_url"))}
                      className='w-full h-48'
                      title='Selected resume preview'
                    />
                  </div>
                </div>
              )}

              <FormMessage />
            </FormItem>
          </div>
        )}

        {/* PDF Upload */}
        {form.watch("pdf_source") === "uploaded" && (
          <FormItem>
            <FormLabel>Resume PDF</FormLabel>
            <div className='flex items-center gap-4'>
              <Button asChild variant='outline'>
                <label htmlFor='resume-upload' className='cursor-pointer'>
                  {isUploading ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <FileUp className='mr-2 h-4 w-4' />
                  )}
                  {isUploading ? "Uploading..." : "Upload PDF"}
                </label>
              </Button>
              <Input
                id='resume-upload'
                type='file'
                accept='.pdf'
                className='hidden'
                onChange={handleFileUpload}
              />
              {form.watch("resume_url") && (
                <div className='flex items-center gap-2 text-sm text-green-400'>
                  <CheckCircle size={16} />
                  <span>PDF Linked</span>
                </div>
              )}
            </div>
            <FormDescription>
              Upload a PDF version of this resume.
            </FormDescription>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name='summary'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea placeholder='A brief summary...' {...field} />
              </FormControl>
              <FormDescription>
                A concise overview of your professional profile.
              </FormDescription>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => generateSummaryMutation.mutate()}
                disabled={isGeneratingSummary || !isDataReadyForAI}
                className='mt-2'
              >
                {isGeneratingSummary ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Sparkles className='mr-2' size={16} />
                )}
                Generate with AI
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='skills'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Input placeholder='React, TypeScript, ...' {...field} />
              </FormControl>
              <FormDescription>Comma-separated list.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Selector */}
        <FormField
          control={form.control}
          name='project_ids'
          render={() => (
            <FormItem>
              <FormLabel>Featured Projects</FormLabel>
              <FormDescription>
                Select the projects you want to feature on this resume.
              </FormDescription>
              <div className='space-y-2'>
                {isLoadingProjects ? (
                  <p>Loading projects...</p>
                ) : (
                  projects?.map((project) => (
                    <FormField
                      key={project.id}
                      control={form.control}
                      name='project_ids'
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={project.id}
                            className='flex flex-row items-start space-x-3 space-y-0'
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(project.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        project.id,
                                      ])
                                    : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== project.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              {project.title}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Experience */}
        <div className='space-y-2'>
          <h3 className='text-lg font-medium'>Experience</h3>
          {expFields.map((field, index) => (
            <div
              key={field.id}
              className='p-3 border rounded-md space-y-2 relative'
            >
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute top-1 right-1 h-6 w-6'
                onClick={() => removeExp(index)}
              >
                <Trash size={14} />
              </Button>
              <FormField
                control={form.control}
                name={`experience.${index}.position`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`experience.${index}.company`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`experience.${index}.duration`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`experience.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>One point per line.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              appendExp({
                position: "",
                company: "",
                duration: "",
                description: "",
              })
            }
          >
            Add Experience
          </Button>
        </div>

        {/* Education */}
        <div className='space-y-2'>
          <h3 className='text-lg font-medium'>Education</h3>
          {eduFields.map((field, index) => (
            <div
              key={field.id}
              className='p-3 border rounded-md space-y-2 relative'
            >
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute top-1 right-1 h-6 w-6'
                onClick={() => removeEdu(index)}
              >
                <Trash size={14} />
              </Button>
              <FormField
                control={form.control}
                name={`education.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`education.${index}.school`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`education.${index}.year`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => appendEdu({ degree: "", school: "", year: "" })}
          >
            Add Education
          </Button>
        </div>

        {/* Certifications */}
        <div className='space-y-2'>
          <h3 className='text-lg font-medium'>Certifications</h3>
          {certFields.map((field, index) => (
            <div
              key={field.id}
              className='p-3 border rounded-md space-y-2 relative'
            >
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute top-1 right-1 h-6 w-6'
                onClick={() => removeCert(index)}
              >
                <Trash size={14} />
              </Button>
              <FormField
                control={form.control}
                name={`certifications.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certifications.${index}.issuer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certifications.${index}.date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (e.g., 2023)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certifications.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credential URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              appendCert({ name: "", issuer: "", date: "", url: "" })
            }
          >
            Add Certification
          </Button>
        </div>

        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Resume"}
        </Button>
      </form>
    </Form>
  );
}
