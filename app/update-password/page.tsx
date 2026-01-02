"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
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
import { toast } from "@/components/ui/sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/lib/profile";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const UpdatePasswordPage = () => {
  const { status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Check if this is a first-time password setup (from invite)
  const isFirstTime = searchParams.get("first") === "true";

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(
      isFirstTime
        ? z
            .object({
              newPassword: z
                .string()
                .min(6, "New password must be at least 6 characters."),
              confirmPassword: z
                .string()
                .min(6, "Please confirm your password."),
            })
            .refine((data) => data.newPassword === data.confirmPassword, {
              message: "Passwords don't match",
              path: ["confirmPassword"],
            })
        : passwordSchema
    ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: isFirstTime ? undefined : data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update password");
      }

      // After successful password update, fetch the user's profile to get their domain
      const profile = await getCurrentUserProfile();
      return profile;
    },
    onSuccess: (profile) => {
      toast.success("Password updated successfully!");
      if (profile?.domain) {
        // If they have a domain, redirect to their admin page
        const protocol = profile.domain.startsWith("localhost")
          ? "http://"
          : "https://";
        window.location.href = `${protocol}${profile.domain}/admin`;
      } else {
        // If they don't have a domain, they are a new user. Send to claim page.
        router.push("/claim-domain");
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(`Failed to update password: ${error.message}`);
    },
  });

  if (status === "loading") {
    return (
      <div className='min-h-screen flex items-center justify-center text-foreground/70'>
        <Loader2 className='animate-spin' />
        <p className='ml-3'>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className='min-h-screen flex items-center justify-center px-6'>
        <GlassCard className='p-8 text-center'>
          <AlertTriangle className='h-16 w-16 text-destructive mx-auto mb-6' />
          <h1 className='text-2xl font-bold mb-4'>Not Logged In</h1>
          <p className='text-foreground/70 mb-4'>
            Please log in to update your password.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center pt-24 pb-32 px-6'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='w-full max-w-md'
      >
        <GlassCard className='p-8'>
          <h2 className='text-3xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent'>
            {isFirstTime ? "Set Your Password" : "Update Password"}
          </h2>
          {error && (
            <div className='mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm'>
              {error}
            </div>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutate(data))}
              className='space-y-4'
            >
              {!isFirstTime && (
                <FormField
                  control={form.control}
                  name='currentPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='••••••••'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={isPending} className='w-full'>
                {isPending ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;
