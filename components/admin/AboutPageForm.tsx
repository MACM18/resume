"use client";

import { useForm, useFieldArray, type FieldPath } from "react-hook-form";
import { useState } from "react";
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
import { getCurrentUserProfile, updateCurrentUserProfileContent } from "@/lib/profile";
import type { AboutPageData, Profile } from "@/types/portfolio";
import { BookOpen, Loader2, Phone, Plus, Save, Sparkles, Trash, UserRound, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { IconPicker } from "./IconPicker";
import { Switch } from "@/components/ui/switch";

const aboutPageSchema = z.object({
  title: z.string().min(1, "Required"),
  subtitle: z.string().min(1, "Required"),
  story: z.string().min(1, "Required"),
  skills: z.array(
    z.object({
      category: z.string().min(1, "Required"),
      icon: z.string().min(1, "Required"),
      items: z.string().min(1, "Required"),
    })
  ),
  contactNumbers: z.array(
    z.object({
      id: z.string(),
      number: z.string().min(1, "Phone number is required"),
      label: z.string().min(1, "Label is required"),
      isActive: z.boolean(),
      isPrimary: z.boolean(),
    })
  ),
  callToAction: z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
  }),
});

type AboutPageFormValues = z.infer<typeof aboutPageSchema>;

type AboutTab = "header" | "story" | "skills" | "contact" | "cta";
const aboutTabFields: Record<AboutTab, FieldPath<AboutPageFormValues>[]> = {
  header: ["title", "subtitle"],
  story: ["story"],
  skills: ["skills"],
  contact: ["contactNumbers"],
  cta: ["callToAction"],
};
const aboutTabLabels: Record<AboutTab, string> = {
  header: "Header", story: "Story", skills: "Skills", contact: "Contact", cta: "CTA",
};

export function AboutPageForm() {
  const [activePanel, setActivePanel] = useState<AboutTab>("header");
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
      story: profile?.about_page_data?.story?.join("\n\n") || "",
      skills:
        profile?.about_page_data?.skills?.map((s) => ({
          ...s,
          items: Array.isArray(s.items) ? s.items.join(", ") : s.items || "",
        })) || [],
      contactNumbers: profile?.contact_numbers || [],
      callToAction: profile?.about_page_data?.callToAction || {
        title: "Ready to Work Together?",
        description:
          "I'm always open to discussing new opportunities and interesting projects. Let's connect and see how we can create something amazing together.",
      },
    },
    resetOptions: { keepDirtyValues: true },
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control: form.control, name: "skills" });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({ control: form.control, name: "contactNumbers" });

  const mutation = useMutation({
    mutationFn: (payload: { tab: AboutTab; patch?: Partial<AboutPageData>; contact_numbers?: Profile["contact_numbers"] }) =>
      updateCurrentUserProfileContent({
        about_page_data_patch: payload.patch,
        contact_numbers: payload.contact_numbers,
      }),
    onSuccess: (_result, variables) => {
      toast.success(aboutTabLabels[variables.tab] + " saved");
      void queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to save this tab");
    },
  });

  const saveActiveTab = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(await form.trigger(aboutTabFields[activePanel], { shouldFocus: true }))) {
      toast.error("Check the highlighted fields in this tab");
      return;
    }
    const data = form.getValues();
    let patch: Partial<AboutPageData> | undefined;
    let contact_numbers: Profile["contact_numbers"] | undefined;
    switch (activePanel) {
      case "header":
        patch = { title: data.title, subtitle: data.subtitle };
        break;
      case "story":
        patch = { story: data.story.split("\n\n") };
        break;
      case "skills":
        patch = { skills: data.skills.map((item) => ({
          category: item.category,
          icon: item.icon,
          items: item.items.split(",").map((skill) => skill.trim()).filter(Boolean),
        })) };
        break;
      case "contact":
        contact_numbers = data.contactNumbers;
        break;
      case "cta":
        patch = { callToAction: {
          ...data.callToAction,
          email: profile?.home_page_data?.callToAction?.email || "",
        } };
        break;
    }
    mutation.mutate({ tab: activePanel, patch, contact_numbers });
  };

  if (isLoading) {
    return <Skeleton className='h-96 w-full' />;
  }

  return (
    <div className='space-y-8'>
      <Form {...form}>
        <form
          onSubmit={saveActiveTab}
          className='about-editor space-y-5'
        >
          <div className='rounded-xl border border-border bg-muted/20 p-3 sm:p-4'>
            <div className='flex items-center justify-between gap-4'>
              <div><p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>About page editor</p><p className='mt-1 text-sm text-muted-foreground'>Edit one group at a time and save the active tab.</p></div>
              </div>
            <div className='mt-4 flex gap-1 overflow-x-auto rounded-lg border border-border bg-background/60 p-1' role='group' aria-label='About page content groups'>
              {[["header", "Header", UserRound], ["story", "Story", BookOpen], ["skills", "Skills", Wrench], ["contact", "Contact", Phone], ["cta", "CTA", Sparkles]].map(([key, label, Icon]) => (
                <button key={String(key)} type='button' aria-pressed={activePanel === key} onClick={() => setActivePanel(String(key) as AboutTab)} className={'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' + (activePanel === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon size={14} aria-hidden='true' /><span>{String(label)}</span></button>
              ))}
            </div>
          </div>
          {/* Page Header */}
          <section className={activePanel === 'header' ? 'about-panel rounded-xl border border-border bg-card p-4 sm:p-6' : 'hidden'}>
            <div>
              <h3 className='text-lg font-medium mb-4'>Page Header</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                The title and subtitle that appear at the top of your About
                page.
              </p>
            </div>

            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='About Me' />
                  </FormControl>
                  <FormDescription>
                    Main heading for your About page (e.g., &quot;About
                    Me&quot;, &quot;My Story&quot;)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='subtitle'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Subtitle</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Passionate developer creating innovative digital solutions'
                    />
                  </FormControl>
                  <FormDescription>
                    A compelling subtitle that summarizes your professional
                    identity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>


          {/* Story Section */}
          <section className={activePanel === 'story' ? 'about-panel rounded-xl border border-border bg-card p-4 sm:p-6' : 'hidden'}>
            <h3 className='text-lg font-medium mb-4'>Your Story</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Tell your professional journey in a compelling narrative. Separate
              paragraphs with a blank line.
            </p>

            <FormField
              control={form.control}
              name='story'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal & Professional Story</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      {...field}
                      placeholder={`My journey in technology began during my college years when I discovered my passion for creating digital solutions that solve real-world problems.

Throughout my career, I've had the opportunity to work on diverse projects ranging from e-commerce platforms to mobile applications, each teaching me valuable lessons about user experience and technical excellence.

Today, I combine my technical expertise with a deep understanding of business needs to create software that not only functions flawlessly but also drives meaningful results for users and organizations.`}
                    />
                  </FormControl>
                  <FormDescription>
                    Write your story in multiple paragraphs. Separate each
                    paragraph with a blank line. Include your background,
                    journey, passions, and what drives you professionally.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>


          {/* Skills */}
          <section className={activePanel === 'skills' ? 'about-panel rounded-xl border border-border bg-card p-4 sm:p-6' : 'hidden'}>
            <h3 className='text-lg font-medium mb-4'>Skills & Expertise</h3>
            <p className='mb-4 text-sm text-muted-foreground'>Group skills by area and choose an icon for each group.</p>
            <div className='space-y-4'>
              {skillFields.map((field, index) => (
                <div
                  key={field.id}
                  className='p-4 border rounded-lg bg-glass-bg/10 relative'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name={`skills.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`skills.${index}.icon`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <div className='flex items-center gap-2'>
                              <IconPicker
                                value={field.value ?? ""}
                                onChange={(data) => field.onChange(data.icon)}
                              />
                              <span className='text-sm text-muted-foreground'>
                                {field.value
                                  ? `Selected: ${field.value}`
                                  : "Select an icon"}
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='md:col-span-2'>
                      <FormField
                        control={form.control}
                        name={`skills.${index}.items`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Items (comma-separated)</FormLabel>
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
                            Delete Skill Category?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeSkill(index)}
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
              onClick={() => appendSkill({ category: "", icon: "", items: "" })}
              className='mt-4'
            >
              Add Skill Category
            </Button>
          </section>


          {/* Contact Numbers */}
          <section className={activePanel === 'contact' ? 'about-panel rounded-xl border border-border bg-card p-4 sm:p-6' : 'hidden'}>
            <h3 className='text-lg font-medium mb-4'>Contact Numbers</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Add phone numbers that visitors can request to view. Active
              numbers will be shown publicly with privacy protection.
            </p>
            <div className='space-y-4'>
              {contactFields.map((field, index) => (
                <div
                  key={field.id}
                  className='p-4 border rounded-lg bg-glass-bg/10 relative'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name={`contactNumbers.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Mobile' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contactNumbers.${index}.number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='+1 234 567 8900' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='md:col-span-2 flex items-center gap-6'>
                      <FormField
                        control={form.control}
                        name={`contactNumbers.${index}.isActive`}
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className='text-sm font-normal'>
                              Show publicly (with privacy protection)
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contactNumbers.${index}.isPrimary`}
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  // If setting as primary, unset all other numbers as primary
                                  if (checked) {
                                    contactFields.forEach((_, i) => {
                                      if (i !== index) {
                                        form.setValue(
                                          `contactNumbers.${i}.isPrimary`,
                                          false
                                        );
                                      }
                                    });
                                  }
                                  field.onChange(checked);
                                }}
                              />
                            </FormControl>
                            <FormLabel className='text-sm font-normal'>
                              Primary number
                            </FormLabel>
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
                            Delete Contact Number?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeContact(index)}
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
            {contactFields.length < 5 && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  appendContact({
                    id: `contact-${Date.now()}`,
                    label: "",
                    number: "",
                    isActive: false,
                    isPrimary: false,
                  })
                }
                className='mt-4'
              >
                <Plus className='w-4 h-4 mr-2' />
                Add Contact Number
              </Button>
            )}
            {contactFields.length >= 5 && (
              <p className='text-sm text-muted-foreground mt-4'>
                Maximum of 5 contact numbers allowed.
              </p>
            )}
          </section>


          {/* Call to Action */}
          <section className={activePanel === 'cta' ? 'about-panel rounded-xl border border-border bg-card p-4 sm:p-6' : 'hidden'}>
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
            </div>
          </section>

          <div className='sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur'>
            <p className='hidden text-xs text-muted-foreground sm:block'>Saving updates this tab only.</p>
            <Button type='submit' disabled={mutation.isPending} className='ml-auto gap-2'>{mutation.isPending ? <Loader2 className='animate-spin' /> : <Save size={16} />} Save {aboutTabLabels[activePanel]}</Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
