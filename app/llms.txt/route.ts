import { headers } from "next/headers";
import { getAgentProfile } from "@/lib/agent-profile.server";
import { getEffectiveDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function md(value: string): string { return value.replace(/[\r\n]+/g, " ").trim(); }

export async function GET() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const profile = await getAgentProfile(getEffectiveDomain(host) ?? undefined, protocol + "://" + host);
  if (!profile) return new Response("# Portfolio\n\nPublic profile data is currently unavailable.\n", {
    status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

  const siteUrl = profile.pages[0].url.replace(/\/$/, "");
  const projectLines = profile.projects.map((project) => {
    const links = [project.liveUrl ? "[Live](" + project.liveUrl + ")" : "", project.sourceUrl ? "[Source](" + project.sourceUrl + ")" : ""].filter(Boolean).join(" | ");
    return "- [" + md(project.name) + "](" + project.url + ")" + (project.featured ? " (Featured)" : "") + ": " + md(project.description) +
      "\n  - Technologies: " + (project.technologies.join(", ") || "Not listed") + (links ? "\n  - " + links : "");
  }).join("\n");
  const sections = [
    "# " + profile.name,
    "> " + profile.title + (profile.summary ? "\n>\n> " + profile.summary : ""),
    "## About\n" + (profile.about.join("\n\n") || profile.summary),
    "## Skills\n" + (profile.skills.map((group) => "- **" + group.category + ":** " + group.items.join(", ")).join("\n") || "See the profile and project pages for current skills."),
    "## Projects\n" + (projectLines || "No published projects are currently listed."),
    "## Pages\n" + profile.pages.map((page) => "- [" + page.label + "](" + page.url + ")").join("\n"),
    "## Contact\n[Contact page](" + profile.contact.page + ")" + (profile.contact.email ? " | [Email](mailto:" + profile.contact.email + ")" : "") + (profile.availability ? "\n\n" + profile.availability : ""),
    "## Structured data\n- Public profile JSON: " + siteUrl + "/api/ai/profile\n- Sitemap: " + siteUrl + "/sitemap.xml",
  ];
  return new Response(sections.join("\n\n") + "\n", { headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
    "X-Content-Type-Options": "nosniff",
  } });
}
