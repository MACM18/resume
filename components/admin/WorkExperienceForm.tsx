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
      // Show only year-month in the inputs
      start_date: experience?.start_date
        ? experience.start_date.slice(0, 7)
        : "",
      end_date: experience?.end_date ? experience.end_date.slice(0, 7) : "",
      is_current: experience?.is_current ?? false,
      visible: experience?.visible ?? true,
      description: (experience?.description || []).join("\n"),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: WorkFormValues) => {
      // Convert month inputs (YYYY-MM) to first-of-month date strings (YYYY-MM-01)
      const monthToDate = (m?: string | null) =>
        m && m.length === 7 ? `${m}-01` : null;

      const payload: Omit<
        WorkExperience,
        "id" | "user_id" | "created_at" | "is_current"
      > & { is_current?: boolean } = {
        company: data.company,
        position: data.position,
        location: data.location || null,
        start_date: (() => {
          const start = monthToDate(data.start_date);
          if (!start) {
            throw new Error("Start date must be in YYYY-MM format.");
          }
          return start;
        })(),
        end_date: data.is_current ? null : monthToDate(data.end_date),
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
        // updateWorkExperience accepts a partial update; cast payload to satisfy its parameter type
        return updateWorkExperience(
          experience.id,
          payload as Partial<WorkExperience>
        );
      }
      return addWorkExperience(payload);
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
                  <Input type='month' {...field} />
                </FormControl>
                <FormDescription>
                  Month and year only. Stored as the first of the month.
                </FormDescription>
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
                    type='month'
                    {...field}
                    disabled={form.watch("is_current")}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty if current. Stored as the first of the month.
                </FormDescription>
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
