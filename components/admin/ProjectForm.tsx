"use client";

import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProject, updateProject, uploadProjectImage, deleteProjectImage } from "@/lib/projects";
import { Project } from "@/types/portfolio";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import { FileUp, Loader2, CheckCircle, Trash } from "lucide-react";
import Image from "next/image";
import { useSupabase } from "../providers/AuthProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  long_description: z
    .string()
    .min(20, "Long description must be at least 20 characters."),
  image: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
  tech: z
    .string()
    .min(1, "Please add at least one technology (comma-separated)."),
  demo_url: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
  github_url: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onSuccess: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const { session } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      long_description: project?.long_description || "",
      image: project?.image || "",
      tech: project?.tech.join(", ") || "",
      demo_url: project?.demo_url || "",
      github_url: project?.github_url || "",
      featured: project?.featured || false,
      published: project?.published ?? true,
    },
  });

  const imageUrl = form.watch("image");

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadProjectImage(file);
      form.setValue("image", publicUrl, { shouldValidate: true });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl || !session?.user.id) return;

    try {
      await deleteProjectImage(session.user.id, imageUrl);
      form.setValue("image", "", { shouldValidate: true }); // Clear the image field
      toast.success("Image removed successfully!");
    } catch (error) {
      toast.error("Failed to remove image.");
      console.error(error);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: ProjectFormValues) => {
      const processedData = {
        ...data,
        tech: data.tech.split(",").map((t) => t.trim()),
      };
      if (project) {
        return updateProject(project.id, processedData);
      }
      return addProject(processedData);
    },
    onSuccess: () => {
      toast.success(`Project ${project ? "updated" : "added"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to ${project ? "update" : "add"} project.`);
      console.error(error);
    },
  });

  function onSubmit(data: ProjectFormValues) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 max-h-[70vh] overflow-y-auto p-1'
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Project Title' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='A brief summary of the project'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='long_description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='A detailed description of the project'
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='image'
          render={() => (
            <FormItem>
              <FormLabel>Project Image</FormLabel>
              <div className="flex items-center gap-4">
                <Button asChild variant="outline">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileUp className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? "Uploading..." : "Upload Image"}
                  </label>
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                {imageUrl && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle size={16} />
                    <span>Image Linked</span>
                  </div>
                )}
              </div>
              {imageUrl && (
                <div className="mt-4 space-y-2">
                  <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-glass-border">
                    <Image src={imageUrl} alt="Project preview" width={400} height={225} className="object-cover w-full h-full" />
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full max-w-sm"
                      >
                        <Trash className="mr-2" size={16} /> Remove Image
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete this image from your storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveImage}>
                          Delete Image
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='tech'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies</FormLabel>
              <FormControl>
                <Input placeholder='React, TypeScript, Next.js' {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of technologies.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='demo_url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demo URL</FormLabel>
              <FormControl>
                <Input placeholder='https://project-demo.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='github_url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub URL</FormLabel>
              <FormControl>
                <Input placeholder='https://github.com/user/repo' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='featured'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Feature this project</FormLabel>
                <FormDescription>
                  Featured projects are displayed prominently on the projects
                  page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='published'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Publish this project</FormLabel>
                <FormDescription>
                  Unpublished projects will not be visible on your public
                  portfolio.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Project"}
        </Button>
      </form>
    </Form>
  );
}