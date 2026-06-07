import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProjectByIdServer } from "@/lib/projects.server";
import ProjectClient from "./ProjectClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);
  
  const project = domain ? await getProjectByIdServer(id, domain) : null;

  return <ProjectClient initialProject={project} />;
}
