import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProfileDataServer } from "@/lib/profile.server";
import AboutClient from "./AboutClient";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { Profile } from "@/types/portfolio";
import { Metadata } from "next";
import { generateAboutMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const protocol = hdr.get("x-forwarded-proto") ?? "https";
  const domain = getEffectiveDomain(host);
  const profile = domain ? await getProfileDataServer(domain) : null;
  return generateAboutMetadata(profile, domain || "", `${protocol}://${host}`);
}

export default async function Page() {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);

  if (!domain) {
    return <DomainNotClaimed />;
  }

  const profileData = await getProfileDataServer(domain);

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  return (
    <AboutClient
      initialProfile={profileData as Profile}
      hostname={host}
    />
  );
}
