"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "./GlassCard";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { toast } from "./ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: profileData } = useQuery({
    queryKey: ["profileData", hostname],
    queryFn: () => getProfileData(hostname),
    enabled: !!hostname,
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const recipientEmail = profileData?.home_page_data?.callToAction?.email;
      if (!recipientEmail) {
        throw new Error("Recipient email is not configured.");
      }
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, recipientEmail }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }
    },
    onSuccess: () => {
      toast.success("Message sent successfully!");
      form.reset();
      setIsOpen(false);
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to send message: ${error.message}`);
      } else {
        toast.error("Failed to send message.");
      }
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    mutation.mutate(data);
  };

  if (!profileData?.home_page_data?.callToAction?.email) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className='fixed bottom-30 right-6 md:bottom-6 z-50'
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setIsOpen(true)} className='group'>
              <GlassCard className='rounded-full p-4' hover={true}>
                <Mail className='h-6 w-6 text-foreground/80 group-hover:text-primary transition-colors duration-300' />
              </GlassCard>
            </button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            <p>Contact Me</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='bg-transparent border-none shadow-none p-0 max-w-lg'>
          <GlassCard className='p-8' hover={false}>
            <DialogHeader>
              <DialogTitle className='text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2'>
                Let&apos;s Create Something Amazing
              </DialogTitle>
              <DialogDescription className='text-foreground/70'>
                I&apos;m always excited to hear about new projects and
                opportunities. Drop me a line and let&apos;s chat.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 mt-6'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder='John Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Email</FormLabel>
                      <FormControl>
                        <Input placeholder='john.doe@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='message'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Your message here...'
                          {...field}
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  disabled={mutation.isPending}
                  className='w-full'
                >
                  {mutation.isPending ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </Form>
          </GlassCard>
        </DialogContent>
      </Dialog>
    </>
  );
}
