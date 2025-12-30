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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/lib/profile";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters."),
  tagline: z.string().min(10, "Tagline must be at least 10 characters."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || "",
      tagline: profile?.tagline || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => updateCurrentUserProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to update profile: ${error.message}`);
      } else {
        toast.error("Failed to update profile.");
      }
    },
  });

  function onSubmit(data: ProfileFormValues) {
    mutation.mutate(data);
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-24' />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='full_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder='John Doe' 
                  {...field}
                  className='h-11'
                />
              </FormControl>
              <FormDescription className='text-xs'>
                Your full professional name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='tagline'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>Professional Tagline</FormLabel>
              <FormControl>
                <Input
                  placeholder='Full-Stack Developer passionate about creating amazing experiences'
                  {...field}
                  className='h-11'
                />
              </FormControl>
              <FormDescription className='text-xs'>
                A one-line description of your expertise
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={mutation.isPending} size='lg' className='w-full md:w-auto'>
          {mutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            \"Save Changes\"
          )}
        </Button>
      </form>
    </Form>
  );
}
