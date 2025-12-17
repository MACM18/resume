"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
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
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const schema = z
  .object({
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [linkError, setLinkError] = useState<string | null>(null);

  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const isValidLink = useMemo(() => Boolean(email) && Boolean(token), [email, token]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: data.newPassword }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to reset password");
      }
    },
    onSuccess: () => {
      toast.success("Password reset successfully. You can now log in.");
      router.push("/login");
    },
    onError: (error: Error) => {
      setLinkError(error.message);
      toast.error(error.message);
    },
  });

  if (!isValidLink) {
    return (
      <div className='min-h-screen flex items-center justify-center px-6'>
        <GlassCard className='p-8 text-center max-w-md w-full'>
          <h1 className='text-2xl font-bold mb-3'>Invalid reset link</h1>
          <p className='text-foreground/70'>The password reset link is missing information.</p>
          <Button className='mt-6' onClick={() => router.push("/login")}>Go to Login</Button>
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
            Reset Password
          </h2>

          {linkError && (
            <div className='mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm'>
              {linkError}
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutate(data))}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='••••••••' {...field} />
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
                      <Input type='password' placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={isPending} className='w-full'>
                {isPending ? <Loader2 className='animate-spin' /> : "Reset Password"}
              </Button>
            </form>
          </Form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
