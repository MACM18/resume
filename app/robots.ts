import type { MetadataRoute } from "next";
import { getConfiguredSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getConfiguredSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og/avatar"],
        disallow: ["/admin", "/api", "/login", "/signup"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
