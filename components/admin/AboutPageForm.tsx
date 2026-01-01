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
import { Loader2, Trash, Plus } from "lucide-react";
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
    mutationFn: (data: AboutPageFormValues) => {
      const processedData = {
        ...data,
        story: data.story.split("\n\n"),
        skills: data.skills.map((s) => ({
          ...s,
          items: s.items.split(",").map((i) => i.trim()),
        })),
        callToAction: {
          ...data.callToAction,
          email: profile?.home_page_data?.callToAction?.email || "",
        },
      };
      return updateCurrentUserProfile({
        about_page_data: processedData,
        contact_numbers: data.contactNumbers,
      });
    },
    onSuccess: () => {
      toast.success("About page data updated successfully!");
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
    <div className='space-y-8'>
      <div>
        <h2 className='text-xl font-semibold mb-2'>About Page Content</h2>
        <p className='text-sm text-muted-foreground mb-6'>
          Create compelling content for your About page that tells your story,
          showcases your skills, and connects with visitors.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className='space-y-8'
        >
          {/* Page Header */}
          <div className='space-y-6'>
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
          </div>

          <Separator />

          {/* Story Section */}
          <div>
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
          </div>

          <Separator />

          {/* Skills */}
          <div>
            <h3 className='text-lg font-medium mb-4'>Skills & Expertise</h3>
            <div className='mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
              <p className='text-xs text-foreground/70'>
                <strong>💡 Icon Tip:</strong> Click the circular icon button to
                browse thousands of icons. Icons are stored as{" "}
                <code className='bg-foreground/10 px-1 rounded'>
                  Prefix.IconName
                </code>{" "}
                (e.g.,{" "}
                <code className='bg-foreground/10 px-1 rounded'>
                  Si.SiReact
                </code>
                ). Search for keywords like &quot;code&quot;, &quot;react&quot;,
                or &quot;github&quot; to find relevant icons.
              </p>
            </div>
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
          </div>

          <Separator />

          {/* Contact Numbers */}
          <div>
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
            </div>
          </div>

          <Button type='submit' disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className='animate-spin' />
            ) : (
              "Save About Page"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
