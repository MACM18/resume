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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addResume, updateResume } from "@/lib/resumes";
import { Resume } from "@/types/portfolio";
import { toast } from "@/components/ui/sonner";
import { Trash } from "lucide-react";

const resumeSchema = z.object({
  role: z.string().min(2, "Role is required."),
  title: z.string().min(2, "Title is required."),
  summary: z.string().min(10, "Summary is required."),
  skills: z.string().min(1, "Please add at least one skill."),
  project_ids: z.string(),
  experience: z.array(z.object({
    company: z.string().min(1, "Company is required."),
    position: z.string().min(1, "Position is required."),
    duration: z.string().min(1, "Duration is required."),
    description: z.string().min(1, "Description is required."),
  })),
  education: z.array(z.object({
    degree: z.string().min(1, "Degree is required."),
    school: z.string().min(1, "School is required."),
    year: z.string().min(4, "Year is required."),
  })),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

interface ResumeFormProps {
  resume?: Resume | null;
  onSuccess: () => void;
}

export function ResumeForm({ resume, onSuccess }: ResumeFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      role: resume?.role || "",
      title: resume?.title || "",
      summary: resume?.summary || "",
      skills: resume?.skills.join(", ") || "",
      project_ids: resume?.project_ids.join(", ") || "",
      experience: resume?.experience.map(exp => ({...exp, description: exp.description.join("\n")})) || [],
      education: resume?.education || [],
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "education" });

  const mutation = useMutation({
    mutationFn: (data: ResumeFormValues) => {
      const processedData = {
        ...data,
        skills: data.skills.split(',').map(t => t.trim()),
        project_ids: data.project_ids.split(',').map(t => t.trim()),
        experience: data.experience.map(exp => ({...exp, description: exp.description.split("\n")})),
      };
      if (resume) {
        return updateResume(resume.id, processedData);
      }
      return addResume(processedData);
    },
    onSuccess: () => {
      toast.success(`Resume ${resume ? 'updated' : 'added'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["user-resumes"] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to ${resume ? 'update' : 'add'} resume.`);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        {/* Core Fields */}
        <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="developer" {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Full Stack Developer" {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="summary" render={({ field }) => <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea placeholder="A brief summary..." {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="skills" render={({ field }) => <FormItem><FormLabel>Skills</FormLabel><FormControl><Input placeholder="React, TypeScript, ..." {...field} /></FormControl><FormDescription>Comma-separated list.</FormDescription><FormMessage /></FormItem>} />
        <FormField control={form.control} name="project_ids" render={({ field }) => <FormItem><FormLabel>Project IDs</FormLabel><FormControl><Input placeholder="project-1, project-2" {...field} /></FormControl><FormDescription>Comma-separated list of project IDs to feature.</FormDescription><FormMessage /></FormItem>} />

        {/* Experience */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Experience</h3>
          {expFields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md space-y-2 relative">
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeExp(index)}><Trash size={14} /></Button>
              <FormField control={form.control} name={`experience.${index}.position`} render={({ field }) => <FormItem><FormLabel>Position</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`experience.${index}.duration`} render={({ field }) => <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>One point per line.</FormDescription><FormMessage /></FormItem>} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ position: "", company: "", duration: "", description: "" })}>Add Experience</Button>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Education</h3>
          {eduFields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md space-y-2 relative">
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeEdu(index)}><Trash size={14} /></Button>
              <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => <FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`education.${index}.school`} render={({ field }) => <FormItem><FormLabel>School</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`education.${index}.year`} render={({ field }) => <FormItem><FormLabel>Year</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ degree: "", school: "", year: "" })}>Add Education</Button>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Resume"}
        </Button>
      </form>
    </Form>
  );
}