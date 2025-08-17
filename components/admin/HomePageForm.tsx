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

const homePageSchema = z.object({
  socialLinks: z.array(z.object({
    platform: z.string().min(1, "Required"),
    icon: z.string().min(1, "Required"),
    href: z.string().url("Must be a valid URL"),
    label: z.string().min(1, "Required"),
  })),
  experienceHighlights: z.array(z.object({
    metric: z.string().min(1, "Required"),
    title: z.string().min(1, "Required"),
    subtitle: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
  })),
  technicalExpertise: z.array(z.object({
    name: z.string().min(1, "Required"),
    skills: z.string().min(1, "Required"),
    icon: z.string().min(1, "Required"),
  })),
  achievements: z.array(z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    metric: z.string().min(1, "Required"),
    label: z.string().min(1, "Required"),
  })),
  callToAction: z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    email: z.string().email("Must be a valid email"),
  }),
});

type HomePageFormValues = z.infer<typeof homePageSchema>;

export function HomePageForm() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  const form = useForm<HomePageFormValues>({
    resolver: zodResolver(homePageSchema),
    values: {
      socialLinks: profile?.home_page_data?.socialLinks || [],
      experienceHighlights: profile?.home_page_data?.experienceHighlights || [],
      technicalExpertise: profile?.home_page_data?.technicalExpertise.map(e => ({...e, skills: e.skills.join(', ')})) || [],
      achievements: profile?.home_page_data?.achievements || [],
      callToAction: profile?.home_page_data?.callToAction || { title: '', description: '', email: '' },
    },
    enableReinitialize: true,
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({ control: form.control, name: "socialLinks" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "experienceHighlights" });
  const { fields: techFields, append: appendTech, remove: removeTech } = useFieldArray({ control: form.control, name: "technicalExpertise" });
  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({ control: form.control, name: "achievements" });

  const mutation = useMutation({
    mutationFn: (data: HomePageFormValues) => {
        const processedData = {
            ...data,
            technicalExpertise: data.technicalExpertise.map(e => ({...e, skills: e.skills.split(',').map(s => s.trim())}))
        };
        return updateCurrentUserProfile({ home_page_data: processedData as any });
    },
    onSuccess: () => {
      toast.success("Home page data updated successfully!");
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
        
        {/* Social Links */}
        <div>
          <h3 className="text-lg font-medium mb-2">Social Links</h3>
          {socialFields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md space-y-2 relative mb-2">
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeSocial(index)}><Trash size={14} /></Button>
              <FormField control={form.control} name={`socialLinks.${index}.platform`} render={({ field }) => <FormItem><FormLabel>Platform</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`socialLinks.${index}.icon`} render={({ field }) => <FormItem><FormLabel>Icon Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`socialLinks.${index}.href`} render={({ field }) => <FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`socialLinks.${index}.label`} render={({ field }) => <FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendSocial({ platform: "", icon: "", href: "", label: "" })}>Add Social Link</Button>
        </div>

        <Separator />

        {/* Experience Highlights */}
        <div>
          <h3 className="text-lg font-medium mb-2">Experience Highlights</h3>
          {expFields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md space-y-2 relative mb-2">
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeExp(index)}><Trash size={14} /></Button>
              <FormField control={form.control} name={`experienceHighlights.${index}.metric`} render={({ field }) => <FormItem><FormLabel>Metric</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`experienceHighlights.${index}.title`} render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`experienceHighlights.${index}.subtitle`} render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name={`experienceHighlights.${index}.description`} render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ metric: "", title: "", subtitle: "", description: "" })}>Add Highlight</Button>
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
          {mutation.isPending ? <Loader2 className="animate-spin" /> : "Save Home Page"}
        </Button>
      </form>
    </Form>
  );
}