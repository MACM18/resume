"use client";

import { useForm } from "react-hook-form";
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
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const invitationSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

export function UserInvitationForm() {
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InvitationFormValues) => {
      const { error } = await supabase.functions.invoke("invite-user", {
        body: { email: data.email },
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Invitation sent to ${variables.email}`);
      form.reset();
    },
    onError: (error: Error | { message: string }) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  function onSubmit(data: InvitationFormValues) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Email</FormLabel>
              <FormControl>
                <Input placeholder='new.user@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            "Send Invitation"
          )}
        </Button>
      </form>
    </Form>
  );
}