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
// import { GlassCard } from "./GlassCard";
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
      {/* Fixed Contact Button - Bottom Left on Mobile, Bottom Right on Desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className='fixed bottom-20 left-4 md:bottom-6 md:right-6 md:left-auto z-40'
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className='group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
            >
              <Mail className='h-5 w-5 md:h-6 md:w-6' />
            </button>
          </TooltipTrigger>
          <TooltipContent side='right' className='md:hidden'>
            <p>Contact Me</p>
          </TooltipContent>
          <TooltipContent side='left' className='hidden md:block'>
            <p>Contact Me</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>

      {/* Contact Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='bg-background border-foreground/10 max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-2xl md:text-3xl font-bold mb-2'>
              Let&apos;s Connect
            </DialogTitle>
            <DialogDescription className='text-foreground/70'>
              I&apos;m always excited to hear about new projects and
              opportunities. Drop me a message!
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-5 mt-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        {...field}
                        className='h-11'
                      />
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
                      <Input
                        placeholder='john.doe@example.com'
                        {...field}
                        className='h-11'
                      />
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
                        placeholder='Tell me about your project...'
                        {...field}
                        rows={5}
                        className='resize-none'
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
                size='lg'
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className='mr-2 h-4 w-4' />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
