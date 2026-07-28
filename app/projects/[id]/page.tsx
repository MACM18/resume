import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProjectByIdServer } from "@/lib/projects.server";
import ProjectClient from "./ProjectClient";
import { getProfileDataServer } from "@/lib/profile.server";
import { generateProjectMetadata, generateProjectStructuredData, serializeJsonLd } from "@/lib/seo";
import { Metadata } from "next";
import { notFound } from "next/navigation";

async function getPageContext(id: string) {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const protocol = hdr.get("x-forwarded-proto") ?? "https";
  const domain = getEffectiveDomain(host);
  const profile = domain ? await getProfileDataServer(domain) : null;
  const project = domain ? await getProjectByIdServer(id, domain) : null;
  return { host, protocol, domain, profile, project };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { host, protocol, domain, profile, project } = await getPageContext((await params).id);
  return generateProjectMetadata(project, profile, domain || "", `${protocol}://${host}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, profile, domain } = await getPageContext(id);
  if (!project) {
    notFound();
  }

  const structuredData = generateProjectStructuredData(project, profile, domain || "");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <ProjectClient initialProject={project} />
    </>
  );
}
