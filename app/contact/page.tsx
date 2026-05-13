"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { getEffectiveDomain } from "@/lib/utils";
import { useEffect } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import Script from "next/script";
import {
  PageHeaderSkeleton,
  FeatureCardSkeleton,
} from "@/components/ui/loading-skeleton";
import { getDynamicIcon } from "@/lib/icons";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface ReCaptcha {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha: ReCaptcha;
  }
}

const ContactPage = () => {
  const [hostname, setHostname] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profileData", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve(null);
      return getProfileData(domain);
    },
    enabled: !!hostname,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA if site key is configured
      let recaptchaToken = "";
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      
      if (siteKey && window.grecaptcha) {
        try {
          await new Promise<void>((resolve) => window.grecaptcha.ready(resolve));
          recaptchaToken = await window.grecaptcha.execute(siteKey, {
            action: "contact",
          });
        } catch (err) {
          console.error("reCAPTCHA execution error:", err);
        }
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recipientEmail: profileData?.home_page_data?.callToAction?.email || "",
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      // Google Analytics tracking
      if (typeof window !== "undefined") {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "generate_lead",
            form_name: "contact_form",
          });
        }
        if (typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            form_name: "contact_form",
          });
        }
      }

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !hostname) {
    return (
      <div className='min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto'>
        <PageHeaderSkeleton />
        <div className='grid lg:grid-cols-2 gap-8'>
          <FeatureCardSkeleton />
          <FeatureCardSkeleton />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  const contactEmail = profileData.home_page_data?.callToAction?.email || "";
  const socialLinks = profileData.home_page_data?.socialLinks || [];
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <ErrorBoundary>
      {/* Hide reCAPTCHA badge as requested */}
      <style dangerouslySetInnerHTML={{ __html: `
        .grecaptcha-badge { visibility: hidden !important; }
      `}} />
      
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          strategy="afterInteractive"
        />
      )}

      <div className='min-h-screen relative pt-20 md:pt-32 pb-20 px-6'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <SectionHeader
            title='Get In Touch'
            subtitle='Have a project in mind or just want to chat? Feel free to reach out!'
            gradient='mixed'
          />

          <div className='grid lg:grid-cols-2 gap-8 mb-16'>
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard variant='gradient' className='p-8'>
                <h3 className='text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div>
                    <label
                      htmlFor='name'
                      className='block text-sm font-medium mb-2'
                    >
                      Name
                    </label>
                    <Input
                      id='name'
                      name='name'
                      autoComplete='name'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='Your name'
                      required
                      className='bg-glass-bg/20'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='email'
                      className='block text-sm font-medium mb-2'
                    >
                      Email
                    </label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      autoComplete='email'
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder='your.email@example.com'
                      required
                      className='bg-glass-bg/20'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='subject'
                      className='block text-sm font-medium mb-2'
                    >
                      Subject
                    </label>
                    <Input
                      id='subject'
                      name='subject'
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="What's this about?"
                      required
                      className='bg-glass-bg/20'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='message'
                      className='block text-sm font-medium mb-2'
                    >
                      Message
                    </label>
                    <Textarea
                      id='message'
                      name='message'
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder='Tell me about your project or inquiry...'
                      rows={6}
                      required
                      className='bg-glass-bg/20 resize-none'
                    />
                  </div>
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground'
                    size='lg'
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='mr-2 animate-spin' size={18} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className='mr-2' size={18} />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>

            {/* Contact Information */}
            <div className='space-y-6'>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <FeatureCard
                  icon={Mail}
                  title='Email'
                  description={contactEmail || "Contact email not available"}
                  accentColor='primary'
                />
              </motion.div>

              {/* Contact Numbers */}
              {profileData.contact_numbers &&
                profileData.contact_numbers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <ContactNumbersDisplay
                      contactNumbers={profileData.contact_numbers}
                    />
                  </motion.div>
                )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <GlassCard variant='gradient' className='p-6'>
                    <h3 className='text-xl font-semibold mb-6 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent'>
                      Connect on Social
                    </h3>
                    <div className='flex flex-wrap gap-4'>
                      {socialLinks.map((social) => {
                        const Icon = getDynamicIcon(social.icon);
                        if (!Icon) return null;
                        return (
                          <a
                            key={social.label}
                            href={social.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center justify-center w-12 h-12 rounded-xl bg-glass-bg/20 border border-glass-border/30 hover:border-primary/60 hover:bg-glass-bg/30 transition-all group'
                            aria-label={social.platform}
                            title={social.display_label || social.label || social.platform}
                          >
                            <Icon
                              className='text-foreground/60 group-hover:text-primary transition-colors'
                              size={22}
                            />
                          </a>
                        );
                      })}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <GlassCard variant='minimal' className='p-6'>
                  <h3 className='text-lg font-semibold mb-4 text-accent'>
                    Response Time
                  </h3>
                  <p className='text-foreground/70 leading-relaxed'>
                    I typically respond within 24-48 hours during business days.
                    For urgent inquiries, please mention it in the subject line.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ContactPage;
