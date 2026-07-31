"use client";

import Script from "next/script";
import { useState } from "react";
import { ArrowUpRight, Loader2, Mail, Send } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ContactPageSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { getDynamicIcon } from "@/lib/icons";
import type { Profile } from "@/types/portfolio";

interface ReCaptcha {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha: ReCaptcha;
  }
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.55, delay }} className={className}>{children}</motion.div>;
}

export default function ContactClient({ initialProfile, hostname }: { initialProfile: Profile; hostname: string }) {
  const profileData = initialProfile;
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!hostname) return <ContactPageSkeleton />;
  if (!profileData) return <DomainNotClaimed />;

  const homeData = profileData.home_page_data;
  const contactEmail = homeData?.callToAction?.email || "";
  const socialLinks = homeData?.socialLinks || [];
  const contactNumbers = profileData.contact_numbers || [];
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      let recaptchaToken = "";
      if (recaptchaSiteKey && window.grecaptcha) {
        try {
          await new Promise<void>((resolve) => window.grecaptcha.ready(resolve));
          recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: "contact" });
        } catch (error) {
          console.error("reCAPTCHA execution error:", error);
        }
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, recipientEmail: contactEmail, recaptchaToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      if (window.dataLayer) window.dataLayer.push({ event: "generate_lead", form_name: "contact_form" });
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form_name: "contact_form" });

      toast({ title: "Message sent!", description: "Thank you for reaching out. I'll get back to you soon." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      toast({ title: "Unable to send message", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <ErrorBoundary><main className='min-h-screen pb-24'>
    <style dangerouslySetInnerHTML={{ __html: ".grecaptcha-badge { visibility: hidden !important; }" }} />
    {recaptchaSiteKey && <Script src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`} strategy='afterInteractive' />}

    <section className='border-b border-foreground/10 px-6 pb-16 pt-32 md:pb-24 md:pt-40'>
      <div className='mx-auto max-w-7xl'><Reveal><p className='mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Contact / Start a conversation</p></Reveal><div className='grid gap-10 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:gap-20'><Reveal delay={0.06}><h1 className='max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] md:text-7xl'>Let&apos;s make something useful.</h1></Reveal><Reveal delay={0.12}><p className='max-w-xl text-lg leading-8 text-foreground/65'>{homeData?.callToAction?.description || "Have a project, idea, or opportunity in mind? Share a little context and I’ll get back to you soon."}</p></Reveal></div></div>
    </section>

    <div className='mx-auto grid max-w-7xl gap-16 px-6 pt-14 md:pt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24'>
      <div className='space-y-12'>
        <Reveal><section><p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary'>A good place to begin</p><h2 className='text-3xl font-semibold tracking-tight'>Tell me what you&apos;re working toward.</h2><p className='mt-5 max-w-md leading-7 text-foreground/60'>A useful first message can be brief. Goals, current context, timing, and what success looks like are more helpful than a perfect brief.</p><div className='mt-7 space-y-3 text-sm text-foreground/55'><p>01 / What are you hoping to build or improve?</p><p>02 / What stage is the idea or product at?</p><p>03 / Is there a timeline or key constraint?</p></div></section></Reveal>
        <Reveal delay={0.08}><section className='border-t border-foreground/10 pt-6'><p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45'>Direct contact</p>{contactEmail ? <a href={`mailto:${contactEmail}`} className='inline-flex items-center gap-2 text-base text-foreground/75 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'><Mail size={16} className='text-primary' />{contactEmail}</a> : <p className='text-sm text-foreground/50'>Email contact is not available right now.</p>}</section></Reveal>
        {contactNumbers.length > 0 && <Reveal delay={0.12}><ContactNumbersDisplay contactNumbers={contactNumbers} /></Reveal>}
        {socialLinks.length > 0 && <Reveal delay={0.16}><section className='border-t border-foreground/10 pt-6'><p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45'>Elsewhere</p><div className='flex flex-wrap gap-3'>{socialLinks.map((social) => { const Icon = getDynamicIcon(social.icon); if (!Icon) return null; return <a key={`${social.platform}-${social.label}`} href={social.href} target='_blank' rel='noopener noreferrer' aria-label={social.display_label || social.label || social.platform} className='inline-flex items-center gap-2 border-b border-foreground/15 pb-2 text-sm text-foreground/60 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>{social.display_label || social.label || social.platform}<Icon size={14} /></a>; })}</div></section></Reveal>}
      </div>

      <Reveal delay={0.08}><section className='border-t border-foreground/15 pt-6' aria-labelledby='contact-form-heading'><div className='mb-8 flex items-start justify-between gap-6'><div><p className='mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary'>Send an inquiry</p><h2 id='contact-form-heading' className='text-3xl font-semibold tracking-tight'>Start with the essentials.</h2></div><ArrowUpRight className='mt-1 text-primary' aria-hidden='true' /></div><form onSubmit={handleSubmit} className='space-y-6'><div className='grid gap-6 sm:grid-cols-2'><div><label htmlFor='name' className='mb-2 block text-sm font-medium'>Name</label><Input id='name' name='name' autoComplete='name' value={formData.name} onChange={(event) => updateField('name', event.target.value)} placeholder='Your name' required className='border-foreground/15 bg-transparent focus-visible:ring-primary' /></div><div><label htmlFor='email' className='mb-2 block text-sm font-medium'>Email</label><Input id='email' name='email' type='email' autoComplete='email' value={formData.email} onChange={(event) => updateField('email', event.target.value)} placeholder='you@example.com' required className='border-foreground/15 bg-transparent focus-visible:ring-primary' /></div></div><div><label htmlFor='subject' className='mb-2 block text-sm font-medium'>Subject</label><Input id='subject' name='subject' value={formData.subject} onChange={(event) => updateField('subject', event.target.value)} placeholder='What can I help with?' required className='border-foreground/15 bg-transparent focus-visible:ring-primary' /></div><div><label htmlFor='message' className='mb-2 block text-sm font-medium'>Message</label><Textarea id='message' name='message' value={formData.message} onChange={(event) => updateField('message', event.target.value)} placeholder='Share the goals, context, timing, or questions behind your project...' rows={8} required className='resize-none border-foreground/15 bg-transparent focus-visible:ring-primary' /></div><Button type='submit' disabled={isSubmitting} size='lg' className='h-12 rounded-full px-7'>{isSubmitting ? <><Loader2 className='animate-spin' size={17} /> Sending...</> : <><Send size={17} /> Send message</>}</Button><p className='text-xs leading-5 text-foreground/45'>Your message is only used to respond to this inquiry. I typically reply within 24–48 hours on business days.</p></form></section></Reveal>
    </div>
  </main></ErrorBoundary>;
}
