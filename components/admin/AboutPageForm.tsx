"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/lib/profile";
import { Loader2, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const aboutPageSchema = z.object({
  title: z.string().min(1, "Required"),
  subtitle: z.string().min(1, "Required"),
  story: z.string().min(1, "Required"),
  skills: z.array(z.object({
    category: z.string().min(1, "Required"),
    icon: z.string().min(1, "Required"),
    items: z.string().min(1, "Required"),
  })),
  callToAction: z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    email: z.string().email("Must be a valid email"),
  }),
});

type AboutPageFormValues = z.infer<typeof aboutPageSchema>;

export function AboutPageForm() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  const form = useForm<AboutPageFormValues>({
    resolver: zodResolver(aboutPageSchema),
    values: {
      title: profile?.about_page_data?.title || "",
      subtitle: profile?.about_page_data?.subtitle || "",
      story: profile?.about_page_data?.story.join("\n\n") || "",
      skills: profile?.about_page_data?.skills.map(s => ({...s, items: s.items.join(', ')})) || [],
      callToAction: profile?.about_page_data?.callToAction || { title: '', description: '', email: '' },
    },
    enableReinitialize: true,
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: "skills" });

  const mutation = useMutation({
    mutationFn: (data: AboutPageFormValues) => {
        const processedData = {
            ...data,
            story: data.story.split("\n\n"),
            skills: data.skills.map(s => ({...s, items: s.items.split(',').map(i => i.trim())}))
        };
        return updateCurrentUserProfile({ about_page_data: processedData as any });
    },
    onSuccess: () => {
      toast.success("About page data updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update data: ${error.message}`);
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-8">
        
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="subtitle" render={({ field }) => <FormItem><FormLabel>Page Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="story" render={({ field }) => <FormItem><FormLabel>Your Story</FormLabel><FormControl><Textarea rows={8} {...field} /></FormControl><FormMessage /></FormItem>} />

        <Separator />

        {/* Skills */}
        <div>
          <h3 className="text-lg font-medium mb-2">Skills</h3>
          {skillFields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md space-y-2 relative mb-2">
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeSkill(index)}><Trash size={14} /></Button>
              <FormField control={form.control} name={`skills.${index}.category`} render={({ field }) => <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`skills.${index}.icon`} render={({ field }) => <FormItem><FormLabel>Icon Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`skills.${index}.items`} render={({ field }) => <FormItem><FormLabel>Items (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendSkill({ category: "", icon: "", items: "" })}>Add Skill Category</Button>
        </div>

        <Separator />

        {/* Call to Action */}
        <div>
          <h3 className="text-lg font-medium mb-2">Call To Action</h3>
          <div className="p-3 border rounded-md space-y-2">
            <FormField control={form.control} name="callToAction.title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="callToAction.description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="callToAction.email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="animate-spin" /> : "Save About Page"}
        </Button>
      </form>
    </Form>
  );
}