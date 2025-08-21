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
import { toast } from "@/components/ui/sonner";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/lib/profile";
import { Loader2, Trash, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { useSupabase } from "../providers/AuthProvider"; // Import useSupabase

const homePageSchema = z.object({
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Required"),
      icon: z.string().min(1, "Required"),
      href: z.string().url("Must be a valid URL"),
      label: z.string().min(1, "Required"),
    })
  ),
  experienceHighlights: z.array(
    z.object({
      metric: z.string().min(1, "Required"),
      title: z.string().min(1, "Required"),
      subtitle: z.string().min(1, "Required"),
      description: z.string().min(1, "Required"),
    })
  ),
  technicalExpertise: z.array(
    z.object({
      name: z.string().min(1, "Required"),
      skills: z.string().min(1, "Required"),
    })
  ),
  achievements: z.array(
    z.object({
      title: z.string().min(1, "Required"),
      description: z.string().min(1, "Required"),
      metric: z.string().min(1, "Required"),
      label: z.string().min(1, "Required"),
    })
  ),
  callToAction: z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    email: z.string().email("Must be a valid email"),
  }),
  about_card_description: z.string().optional(), // Add to schema
});

type HomePageFormValues = z.infer<typeof homePageSchema>;

export function HomePageForm() {
  const queryClient = useQueryClient();
  const { supabase } = useSupabase(); // Use supabase client

  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  const form = useForm<HomePageFormValues>({
    resolver: zodResolver(homePageSchema),
    values: {
      socialLinks: profile?.home_page_data?.socialLinks || [],
      experienceHighlights: profile?.home_page_data?.experienceHighlights || [],
      technicalExpertise:
        profile?.home_page_data?.technicalExpertise?.map((e) => ({
          ...e,
          skills: Array.isArray(e.skills)
            ? e.skills.join(", ")
            : e.skills || "",
        })) || [],
      achievements: profile?.home_page_data?.achievements || [],
      callToAction: profile?.home_page_data?.callToAction || {
        title: "",
        description: "",
        email: "",
      },
      about_card_description:
        profile?.home_page_data?.about_card_description || "", // Initialize
    },
  });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({ control: form.control, name: "socialLinks" });
  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: form.control, name: "experienceHighlights" });
  const {
    fields: techFields,
    append: appendTech,
    remove: removeTech,
  } = useFieldArray({ control: form.control, name: "technicalExpertise" });
  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({ control: form.control, name: "achievements" });

  const aboutPageStory = profile?.about_page_data?.story;

  const generateAboutCardDescriptionMutation = useMutation({
    mutationFn: async (story: string[]) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-about-card-description",
        {
          body: { about_story: story },
        }
      );
      if (error) throw error;
      return data.about_card_description as string;
    },
    onSuccess: (generatedDescription) => {
      form.setValue("about_card_description", generatedDescription, {
        shouldValidate: true,
      });
      toast.success("About card description generated successfully!");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to generate description: ${error.message}`);
      } else {
        toast.error("Failed to generate description.");
      }
    },
  });

  const mutation = useMutation({
    mutationFn: (data: HomePageFormValues) => {
      // Add missing HomePageData fields (name, tagline) if needed
      const processedData = {
        ...data,
        name: profile?.full_name ?? "", // Ensure full_name is passed
        tagline: profile?.tagline ?? "", // Ensure tagline is passed

        // Process social links to add mailto: for email links
        socialLinks: data.socialLinks.map((link) => ({
          ...link,
          href:
            link.platform.toLowerCase() === "mail" ||
            link.platform.toLowerCase() === "email"
              ? link.href.startsWith("mailto:")
                ? link.href
                : `mailto:${link.href}`
              : link.href,
        })),

        technicalExpertise: data.technicalExpertise.map((e) => ({
          ...e,
          skills: e.skills.split(",").map((s) => s.trim()),
        })),
      };
      return updateCurrentUserProfile({
        home_page_data: processedData,
      });
    },
    onSuccess: () => {
      toast.success("Home page data updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to update data: ${error.message}`);
      } else {
        toast.error("Failed to update data.");
      }
    },
  });

  if (isLoading) {
    return <Skeleton className='h-96 w-full' />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className='space-y-8'
      >
        {/* Social Links */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Social Links</h3>
          <div className='space-y-4'>
            {socialFields.map((field, index) => (
              <div
                key={field.id}
                className='p-4 border rounded-lg bg-glass-bg/10 relative'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.platform`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.href`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='absolute top-2 right-2'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Social Link?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeSocial(index)}
                          className='bg-destructive hover:bg-destructive/90'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              appendSocial({ platform: "", icon: "", href: "", label: "" })
            }
            className='mt-4'
          >
            Add Social Link
          </Button>
        </div>

        <Separator />

        {/* Experience Highlights */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Experience Highlights</h3>
          <div className='space-y-4'>
            {expFields.map((field, index) => (
              <div
                key={field.id}
                className='p-4 border rounded-lg bg-glass-bg/10 relative'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name={`experienceHighlights.${index}.metric`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`experienceHighlights.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`experienceHighlights.${index}.subtitle`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='md:col-span-2'>
                    <FormField
                      control={form.control}
                      name={`experienceHighlights.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className='absolute top-2 right-2'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Highlight?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeExp(index)}
                          className='bg-destructive hover:bg-destructive/90'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              appendExp({
                metric: "",
                title: "",
                subtitle: "",
                description: "",
              })
            }
            className='mt-4'
          >
            Add Highlight
          </Button>
        </div>

        <Separator />

        {/* Technical Expertise */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Technical Expertise</h3>
          <div className='space-y-4'>
            {techFields.map((field, index) => (
              <div
                key={field.id}
                className='p-4 border rounded-lg bg-glass-bg/10 relative'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name={`technicalExpertise.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='md:col-span-2'>
                    <FormField
                      control={form.control}
                      name={`technicalExpertise.${index}.skills`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (comma-separated)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className='absolute top-2 right-2'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Expertise Area?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeTech(index)}
                          className='bg-destructive hover:bg-destructive/90'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => appendTech({ name: "", skills: "" })}
            className='mt-4'
          >
            Add Expertise Area
          </Button>
        </div>

        <Separator />

        {/* Achievements */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Achievements</h3>
          <div className='space-y-4'>
            {achievementFields.map((field, index) => (
              <div
                key={field.id}
                className='p-4 border rounded-lg bg-glass-bg/10 relative'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name={`achievements.${index}.metric`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`achievements.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`achievements.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`achievements.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='absolute top-2 right-2'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Achievement?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeAchievement(index)}
                          className='bg-destructive hover:bg-destructive/90'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              appendAchievement({
                metric: "",
                label: "",
                title: "",
                description: "",
              })
            }
            className='mt-4'
          >
            Add Achievement
          </Button>
        </div>

        <Separator />

        {/* About Me Card Description */}
        <div>
          <h3 className='text-lg font-medium mb-4'>
            About Me Card Description
          </h3>
          <FormField
            control={form.control}
            name='about_card_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description for Home Page &quot;About Me&quot; Card
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='A concise summary for the About Me card on the homepage.'
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  This text appears on the &quot;About Me&quot; quick access
                  card on your homepage.
                </FormDescription>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    generateAboutCardDescriptionMutation.mutate(
                      aboutPageStory || []
                    )
                  }
                  disabled={
                    generateAboutCardDescriptionMutation.isPending ||
                    !aboutPageStory ||
                    aboutPageStory.length === 0
                  }
                  className='mt-2'
                >
                  {generateAboutCardDescriptionMutation.isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Sparkles className='mr-2' size={16} />
                  )}
                  Generate from About Page Story
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Call to Action */}
        <div>
          <h3 className='text-lg font-medium mb-2'>Call To Action</h3>
          <div className='p-3 border rounded-md space-y-2'>
            <FormField
              control={form.control}
              name='callToAction.title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='callToAction.description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='callToAction.email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            "Save Home Page"
          )}
        </Button>
      </form>
    </Form>
  );
}
