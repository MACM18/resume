"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import type { Profile } from "@/types/portfolio";
import { ChapterArt } from "@/components/portfolio/ChapterArt";
import { CinematicArtwork } from "@/components/portfolio/CinematicArtwork";

export default function ContactClient({ initialProfile }: { initialProfile: Profile; hostname: string }) {
  if (!initialProfile) return <DomainNotClaimed />;
  const homeData = initialProfile.home_page_data;
  const contactEmail = homeData?.callToAction?.email || "";
  const contactNumbers = initialProfile.contact_numbers || [];

  return <main className="portfolio-page story-contact-page relative isolate min-h-screen overflow-hidden px-6 pb-24 pt-32 md:pt-40">
    <CinematicArtwork className="cinematic-artwork--contact-page" />
    <div className="relative z-10 mx-auto max-w-7xl">
      <div className="contact-page-heading"><p className="story-kicker"><span>Contact</span> / Start a conversation</p><ChapterArt variant="contact" className="contact-page-art" /></div>
      <div className="mt-6 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] md:text-7xl">Let&apos;s make something useful.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/65">{homeData?.callToAction?.description || "Have a project, idea, or opportunity in mind? Share a little context and I’ll get back to you soon."}</p>
          <div className="mt-10 border-t border-foreground/15 pt-6">
            <p className="story-kicker">Direct contact</p>
            {contactEmail && <a href={`mailto:${contactEmail}`} className="mt-4 inline-flex items-center gap-2 text-foreground/75 hover:text-primary"><Mail size={16} />{contactEmail}</a>}
            {contactNumbers.length > 0 && <div className="mt-6"><ContactNumbersDisplay contactNumbers={contactNumbers} /></div>}
          </div>
          <section className="mt-10 border-t border-foreground/15 pt-6" aria-labelledby="studio-heading">
            <p className="story-kicker">Also building at MACM Studio</p>
            <h2 id="studio-heading" className="mt-3 text-2xl font-semibold">Need a website or custom web app?</h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-foreground/65">At <strong className="text-foreground">macm.lk</strong>, I bring design and development together for businesses that need a useful, maintainable digital presence.</p>
            <a href="https://macm.lk" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore macm.lk <ArrowUpRight size={15} /></a>
          </section>
        </div>
        <section className="story-contact-page-form" aria-label="Send a message"><ContactForm /></section>
      </div>
    </div>
  </main>;
}
