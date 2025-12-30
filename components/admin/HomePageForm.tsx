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
import { Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "./IconPicker";
import { Separator } from "@/components/ui/separator";
import { DeleteButton } from "../DeleteButton";

const homePageSchema = z.object({
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Required"),
      icon: z.string().min(1, "Please select an icon"),
      href: z
        .string()
        .min(1, "Required")
        .refine((value) => {
          // Allow URLs or email addresses
          const urlPattern = /^https?:\/\/.+/;
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return urlPattern.test(value) || emailPattern.test(value);
        }, "Must be a valid URL or email address"),
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
  about_card_description: z.string().optional(),
  projects_card_description: z.string().optional(),
  experience_card_description: z.string().optional(),
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
      technicalExpertise:
        profile?.home_page_data?.technicalExpertise?.map((e) => ({
          ...e,
          skills: Array.isArray(e.skills)
            ? e.skills.join(", ")
            : e.skills || "",
        })) || [],
      achievements: profile?.home_page_data?.achievements || [],
      callToAction: profile?.home_page_data?.callToAction || {
        title: "Let's Connect & Collaborate",
        description:
          "I'm always excited to discuss new opportunities, share ideas, or explore potential collaborations. Feel free to reach out!",
        email: "",
      },
      about_card_description:
        profile?.home_page_data?.about_card_description || "",
      projects_card_description:
        profile?.home_page_data?.projects_card_description || "",
      experience_card_description:
        profile?.home_page_data?.experience_card_description || "",
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
      const res = await fetch("/api/generate-about-card-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about_story: story }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate description");
      }
      const data = await res.json();
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
          <h3 className='text-lg font-medium mb-4'>Social Links & Contact</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Add your professional social media profiles and contact information
            to help visitors connect with you.
          </p>
          <div className='mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
            <p className='text-xs text-foreground/70'>
              <strong>💡 Icon Tip:</strong> Click the circular icon button to
              select from thousands of brand and social icons. Try searching
              for: &quot;github&quot;, &quot;linkedin&quot;,
              &quot;twitter&quot;, &quot;email&quot;, or your preferred
              platform.
            </p>
          </div>
          <div className='space-y-4'>
            {socialFields.map((field, index) => (
              <div
                key={field.id}
                className='p-4 border rounded-lg bg-glass-bg/10 flex gap-4 items-center'
              >
                <input
                  type='hidden'
                  {...form.register(`socialLinks.${index}.platform`)}
                />
                <input
                  type='hidden'
                  {...form.register(`socialLinks.${index}.label`)}
                />
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.icon`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <IconPicker
                          value={field.value ?? ""}
                          onChange={({ icon, platform, label }) => {
                            field.onChange(icon);
                            form.setValue(
                              `socialLinks.${index}.platform`,
                              platform,
                              { shouldValidate: true }
                            );
                            form.setValue(`socialLinks.${index}.label`, label, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.href`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <div className='flex gap-2 items-center'>
                          <Input
                            {...field}
                            placeholder={
                              form
                                .getValues(`socialLinks.${index}.platform`)
                                ?.toLowerCase() === "email" ||
                              form
                                .getValues(`socialLinks.${index}.platform`)
                                ?.toLowerCase() === "mail"
                                ? "hello@example.com"
                                : `Enter ${form.getValues(
                                    `socialLinks.${index}.platform`
                                  )} URL`
                            }
                            className='h-10'
                          />
                          <DeleteButton
                            onDelete={() => removeSocial(index)}
                            title='Delete Social Link?'
                          />
                        </div>
                      </FormControl>
                      <FormDescription className='text-xs'>
                        {form
                          .getValues(`socialLinks.${index}.platform`)
                          ?.toLowerCase() === "email" ||
                        form
                          .getValues(`socialLinks.${index}.platform`)
                          ?.toLowerCase() === "mail"
                          ? "Enter email address (e.g., contact@yoursite.com)"
                          : "Enter full URL (e.g., https://github.com/username)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          <p className='text-sm text-muted-foreground mb-4'>
            Showcase your most impressive professional achievements with
            compelling metrics and descriptions.
          </p>
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
                        <FormLabel>Metric (Number or Symbol)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='5+, 100%, #1, etc.' />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Short metric or number that stands out (e.g., 5+,
                          100%, #1, 500K)
                        </FormDescription>
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
                          <Input {...field} placeholder='Years of Experience' />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Main title describing what the metric represents
                        </FormDescription>
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
                          <Input
                            {...field}
                            placeholder='Full-Stack Development'
                          />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Specific area or specialization
                        </FormDescription>
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
                            <Textarea
                              {...field}
                              placeholder='Brief description of your experience and achievements in this area...'
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            Detailed explanation of this experience highlight
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className='absolute top-2 right-2'>
                  <DeleteButton
                    onDelete={() => removeExp(index)}
                    title='Delete Highlight?'
                  />
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
          <p className='text-sm text-muted-foreground mb-4'>
            Organize your technical skills into categories to showcase your
            diverse expertise and specializations.
          </p>
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
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Frontend Development'
                          />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Name of the technical category or domain
                        </FormDescription>
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
                            <Input
                              {...field}
                              placeholder='React, TypeScript, Next.js, Tailwind CSS'
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            List specific technologies, tools, or skills
                            separated by commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className='absolute top-2 right-2'>
                  <DeleteButton
                    onDelete={() => removeTech(index)}
                    title='Delete Expertise Area?'
                  />
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
          <h3 className='text-lg font-medium mb-4'>
            Achievements & Recognition
          </h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Highlight your most significant accomplishments with metrics that
            demonstrate your impact and value.
          </p>
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
                        <FormLabel>Achievement Metric</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='100%, 50+, #1, 10K' />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Impressive number or ranking that highlights your
                          achievement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`achievements.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric Label</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Success Rate' />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          What the metric represents (e.g., &quot;Projects
                          Completed&quot;, &quot;Client Satisfaction&quot;)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`achievements.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achievement Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Top Performer Award' />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Name or title of the achievement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`achievements.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achievement Description</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Recognized for outstanding performance and innovative solutions'
                          />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Brief description of what this achievement represents
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='absolute top-2 right-2'>
                  <DeleteButton
                    onDelete={() => removeAchievement(index)}
                    title='Delete Achievement?'
                  />
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
          <h3 className='text-lg font-medium mb-4'>About Me Card Summary</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Create a compelling summary that appears on your homepage About Me
            card to give visitors a quick overview of who you are.
          </p>
          <FormField
            control={form.control}
            name='about_card_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me Card Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='A passionate developer with expertise in modern web technologies, dedicated to creating innovative solutions that make a difference.'
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  This brief summary appears on the &quot;About Me&quot; quick
                  access card on your homepage. Keep it concise and engaging
                  (2-3 sentences).
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

        {/* Projects Card Description */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Projects Card Summary</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Customize the description that appears on your homepage Projects
            card to showcase your work.
          </p>
          <FormField
            control={form.control}
            name='projects_card_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projects Card Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Explore my latest work featuring modern technologies and innovative solutions.'
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  This summary appears on the &quot;Projects&quot; quick access
                  card on your homepage. Keep it brief and highlight your work
                  (2-3 sentences).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Experience Card Description */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Experience Card Summary</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Customize the description that appears on your homepage Experience
            card to highlight your professional background.
          </p>
          <FormField
            control={form.control}
            name='experience_card_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Card Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Professional background and skills across multiple disciplines.'
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  This summary appears on the &quot;Experience&quot; quick
                  access card on your homepage. Keep it concise (2-3 sentences).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Call to Action */}
        <div>
          <h3 className='text-lg font-medium mb-2'>Call to Action</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Create an engaging section that encourages visitors to get in touch
            with you for opportunities and collaborations.
          </p>
          <div className='p-3 border rounded-md space-y-2'>
            <FormField
              control={form.control}
              name='callToAction.title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Let's Connect & Collaborate"
                    />
                  </FormControl>
                  <FormDescription className='text-xs'>
                    Compelling headline to encourage visitors to get in touch
                  </FormDescription>
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
                    <Textarea
                      {...field}
                      placeholder="I'm always excited to discuss new opportunities, share ideas, or explore potential collaborations. Feel free to reach out!"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription className='text-xs'>
                    Brief message explaining why visitors should contact you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='callToAction.email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='your.email@example.com'
                      type='email'
                    />
                  </FormControl>
                  <FormDescription className='text-xs'>
                    Primary email address for contact inquiries
                  </FormDescription>
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
