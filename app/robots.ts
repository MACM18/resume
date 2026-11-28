import type { MetadataRoute } from "next";
import { getConfiguredSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getConfiguredSiteUrl();
  const publicDisallow = ["/admin", "/api/", "/login", "/signup"];
  const publicAllow = ["/", "/api/ai/profile", "/api/og/avatar"];
  return {
    rules: [
      { userAgent: "*", allow: publicAllow, disallow: publicDisallow },
      { userAgent: ["OAI-SearchBot", "ChatGPT-User"], allow: publicAllow, disallow: publicDisallow },
      { userAgent: ["GPTBot", "Google-Extended", "ClaudeBot", "PerplexityBot"], allow: publicAllow, disallow: publicDisallow },
    ],
    sitemap: baseUrl + "/sitemap.xml",
  };
}
