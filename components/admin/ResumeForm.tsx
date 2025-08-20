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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addResume, updateResume, uploadResumePdf } from "@/lib/resumes";
import { getProjectsForCurrentUser } from "@/lib/projects";
import { Resume } from "@/types/portfolio";
import { toast } from "@/components/ui/sonner";
import { Trash, FileUp, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { useSupabase } from "../providers/AuthProvider";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCurrentUserProfile } from "@/lib/profile"; // Import to get profile data

const resumeSchema = z.object({
  role: z.string().min(2, "Role is required."),
  title: z.string().min(2, "Title is required."),
  summary: z.string().min(10, "Summary is required."),
  skills: z.string().min(1, "Please add at least one skill."),
  project_ids: z.array(z.string()).optional(),
  resume_url: z.string().url().nullable(),
  pdf_source: z.enum(['uploaded', 'generated']).default('uploaded'),
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
  certifications: z.array( // New certifications array
    z.object({
      name: z.string().min(1, "Certification name is required."),
      issuer: z.string().min(1, "Issuer is required."),
      date: z.string().min(4, "Date is required (e.g., 2023)."),
      url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    })
  ).optional(),
  location: z.string().min(2, "Location is required.").optional(), // New location field
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

interface ResumeFormProps {
  resume?: Resume | null;
  onSuccess: () => void;
}

export function ResumeForm({ resume, onSuccess }: ResumeFormProps) {
  const queryClient = useQueryClient();
  const { session, supabase } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getProjectsForCurrentUser,
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
      pdf_source: resume?.pdf_source || 'uploaded',
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
        throw new Error("Profile or projects data not loaded for AI generation.");
      }
      const currentResumeData = form.getValues(); // Get current form values for resume
      const { data, error } = await supabase.functions.invoke("generate-resume-summary", {
        body: {
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
        },
      });
      if (error) throw error;
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
    const publicUrl = await uploadResumePdf(file, session.user.id, role);
    setIsUploading(false);
    if (publicUrl) {
      form.setValue("resume_url", publicUrl);
      toast.success("PDF uploaded successfully!");
    } else {
      toast.error("Failed to upload PDF.");
    }
  };

  const isGeneratingSummary = generateSummaryMutation.isPending;
  const isDataReadyForAI = !isLoadingProfile && !isLoadingProjects && profile && projects;

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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Full Stack Developer' {...field} />
              </FormControl>
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
          name="pdf_source"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>PDF Source</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="uploaded" />
                    </FormControl>
                    <FormLabel className="font-normal">Uploaded</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="generated" />
                    </FormControl>
                    <FormLabel className="font-normal">Generated</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PDF Upload */}
        {form.watch('pdf_source') === 'uploaded' && (
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
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateSummaryMutation.mutate()}
                disabled={isGeneratingSummary || !isDataReadyForAI}
                className="mt-2"
              >
                {isGeneratingSummary ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2" size={16} />
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
            onClick={() => appendCert({ name: "", issuer: "", date: "", url: "" })}
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