"use client";

import { Contact } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadVCard, generateVCard } from "@/lib/vcard";

export function SaveContactButton({
  fullName,
  email,
  phone,
  url,
  photo,
}: {
  fullName: string;
  email: string;
  phone?: string;
  url: string;
  photo?: string;
}) {
  function saveContact() {
    const contact = generateVCard({ fullName, email, phone, url, photo });
    downloadVCard(contact, `${fullName.replace(/\s+/g, "_")}_contact.vcf`);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={saveContact}
      className="h-12 w-12 rounded-full border border-foreground/10 text-foreground/65 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      aria-label="Save contact"
      title="Save contact"
    >
      <Contact size={19} />
    </Button>
  );
}
