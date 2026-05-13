import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProfileDataServer } from "@/lib/profile.server";
import AboutClient from "./AboutClient";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";

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
      initialProfile={profileData as any}
      hostname={host}
    />
  );
}
