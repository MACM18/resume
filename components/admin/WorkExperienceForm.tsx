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
import {
  addWorkExperience,
  updateWorkExperience,
} from "@/lib/work-experiences";
import { WorkExperience } from "@/types/portfolio";
import { toast } from "@/components/ui/sonner";

const workSchema = z.object({
  company: z.string().min(2, "Company must be at least 2 characters."),
  position: z.string().min(2, "Position must be at least 2 characters."),
  location: z.string().optional().or(z.literal("")),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  is_current: z.boolean().default(false),
  visible: z.boolean().default(true),
  description: z.string().optional(), // textarea, newline separated bullets
});

type WorkFormValues = z.infer<typeof workSchema>;

export function WorkExperienceForm({
  experience,
  onSuccess,
}: {
  experience?: WorkExperience | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      company: experience?.company || "",
      position: experience?.position || "",
      location: experience?.location || "",
      start_date: experience?.start_date?.slice(0, 10) || "",
      end_date: experience?.end_date?.slice(0, 10) || "",
      is_current: experience?.is_current ?? false,
      visible: experience?.visible ?? true,
      description: (experience?.description || []).join("\n"),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: WorkFormValues) => {
      const payload = {
        company: data.company,
        position: data.position,
        location: data.location || null,
        start_date: data.start_date,
        end_date: data.is_current ? null : data.end_date || null,
        is_current: data.is_current,
        visible: data.visible,
        description: data.description
          ? data.description
              .split("\n")
              .map((d) => d.trim())
              .filter(Boolean)
          : [],
      };
      if (experience) {
        return updateWorkExperience(
          experience.id,
          payload as Partial<WorkExperience>
        );
      }
      return addWorkExperience(payload as any);
    },
    onSuccess: () => {
      toast.success(
        `Work experience ${experience ? "updated" : "added"} successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ["user-work-experiences"] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        `Failed to ${experience ? "update" : "add"} work experience.`
      );
      console.error(error);
    },
  });

  function onSubmit(data: WorkFormValues) {
    if (!data.is_current && !data.end_date) {
      toast.error("End date is required when not current.");
      return;
    }
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='company'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder='Acme Inc.' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='position'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input placeholder='Senior Developer' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder='Remote / City, Country' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='start_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='end_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    {...field}
                    disabled={form.watch("is_current")}
                  />
                </FormControl>
                <FormDescription>Leave empty if current</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='is_current'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Current Role</FormLabel>
                  <FormDescription>
                    If checked, end date will be set to none.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='visible'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Visible on site</FormLabel>
                  <FormDescription>
                    Toggle public visibility of this experience.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highlights</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={"Led X...\nImproved Y by Z%..."}
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormDescription>One bullet per line.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : experience ? "Update" : "Add"}
        </Button>
      </form>
    </Form>
  );
}
