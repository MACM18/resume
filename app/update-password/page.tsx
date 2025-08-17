"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/AuthProvider';
import { GlassCard } from '@/components/GlassCard';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const UpdatePasswordPage = () => {
  const { session } = useSupabase();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Supabase client needs time to process the recovery token from the URL
    // and establish a session. We wait for the session object to be available.
    if (session) {
      setIsReady(true);
    }
  }, [session]);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Password updated successfully! Redirecting to admin...');
      router.push('/admin');
    },
    onError: (error) => {
      toast.error(`Failed to update password: ${error.message}`);
    },
  });

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Set New Password
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="animate-spin" /> : 'Update Password'}
              </Button>
            </form>
          </Form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;