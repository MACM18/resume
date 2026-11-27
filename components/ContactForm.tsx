"use client";

import Script from "next/script";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReCaptcha {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: ReCaptcha;
  }
}

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "" });
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const update = (field: keyof typeof fields, value: string) => setFields((current) => ({ ...current, [field]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    try {
      let recaptchaToken = "";
      if (siteKey && window.grecaptcha) {
        await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "contact" });
      }
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, recaptchaToken }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send your message. Please try again.");
      setFields({ name: "", email: "", subject: "", message: "" });
      setResult({ ok: true, text: "Message sent. I’ll get back to you soon." });
      if (window.dataLayer) window.dataLayer.push({ event: "generate_lead", form_name: "contact_form" });
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form_name: "contact_form" });
    } catch (error) {
      setResult({ ok: false, text: error instanceof Error ? error.message : "Could not send your message." });
    } finally {
      setPending(false);
    }
  }

  return <>
    {siteKey && <Script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`} strategy="afterInteractive" />}
    <form onSubmit={submit} className={`contact-form ${compact ? "contact-form-compact" : ""}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="contact-field">Name<Input name="name" autoComplete="name" placeholder="Your name" value={fields.name} onChange={(event) => update("name", event.target.value)} required maxLength={120} /></label>
        <label className="contact-field">Email<Input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={fields.email} onChange={(event) => update("email", event.target.value)} required maxLength={254} /></label>
      </div>
      <label className="contact-field">What would you like to discuss?<Input name="subject" placeholder="A new build, an improvement, or a role" value={fields.subject} onChange={(event) => update("subject", event.target.value)} required maxLength={160} /></label>
      <label className="contact-field">A little context<Textarea name="message" placeholder="What are you trying to do, and what would a good outcome look like?" rows={compact ? 5 : 8} value={fields.message} onChange={(event) => update("message", event.target.value)} required maxLength={6000} className="resize-y" /></label>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-full px-6">{pending ? <><Loader2 size={17} className="animate-spin" /> Sending</> : <>Send message <Send size={16} /></>}</Button>
        <p aria-live="polite" role="status" className={`text-sm ${result?.ok ? "text-primary" : result ? "text-destructive" : "text-foreground/45"}`}>{result?.text || "Your details are only used to reply to this message."}</p>
      </div>
    </form>
  </>;
}
