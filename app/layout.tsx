import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Navigation } from "@/components/Navigation";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css"; // or your global styles
import AuthProvider from "@/components/providers/AuthProvider";
import { AuthButton } from "@/components/AuthButton";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ContactButton } from "@/components/ContactButton";
import { headers } from "next/headers";
import { getProfileDataServer } from "@/lib/profile.server";
import { getEffectiveDomain } from "@/lib/utils";
import { generateHomeMetadata } from "@/lib/seo";
import { Metadata } from "next";
import type { Profile } from "@/types/portfolio";

export async function generateMetadata(): Promise<Metadata> {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const protocol = hdr.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  const domain = getEffectiveDomain(host);
  const profileData = domain ? await getProfileDataServer(domain) : null;
  return generateHomeMetadata(profileData, domain || "", origin);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side: determine hostname and fetch profile data to get favicon_url
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);
  const profileData = domain ? await getProfileDataServer(domain) : null;
  const faviconUrl = profileData?.favicon_url ?? null;
  const profile = profileData as Profile | null;

  return (
    <html lang='en'>
      <head>
        {faviconUrl && (
          <>
            <link rel='icon' href={faviconUrl} />
            <link rel='shortcut icon' href={faviconUrl} />
          </>
        )}
      </head>
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider>
                <div className='min-h-screen bg-background relative'>
                  {/* Theme-aware gradient overlay */}
                  {profile?.selected_gradient &&
                    (() => {
                      const g = profile.selected_gradient;
                      const opacities = {
                        subtle: { start: 0.08, end: 0.04 },
                        medium: { start: 0.15, end: 0.08 },
                        bold: { start: 0.25, end: 0.12 },
                      };
                      const opacity =
                        opacities[g.intensity as keyof typeof opacities] ||
                        opacities.subtle;

                      const patterns: Record<string, string> = {
                        "primary-accent": `linear-gradient(${g.angle}deg, hsl(var(--primary) / ${opacity.start}) 0%, hsl(var(--accent) / ${opacity.end}) 100%)`,
                        "secondary-primary": `linear-gradient(${g.angle}deg, hsl(var(--secondary) / ${opacity.start}) 0%, hsl(var(--primary) / ${opacity.end}) 100%)`,
                        "accent-secondary": `linear-gradient(${g.angle}deg, hsl(var(--accent) / ${opacity.start}) 0%, hsl(var(--secondary) / ${opacity.end}) 100%)`,
                        warm: `linear-gradient(${g.angle}deg, hsl(25 85% 60% / ${opacity.start}) 0%, hsl(340 75% 55% / ${opacity.end}) 100%)`,
                        cool: `linear-gradient(${g.angle}deg, hsl(200 85% 60% / ${opacity.start}) 0%, hsl(260 75% 55% / ${opacity.end}) 100%)`,
                      };

                      const gradientStyle =
                        patterns[g.pattern] || patterns["primary-accent"];

                      return (
                        <div
                          className='fixed inset-0 pointer-events-none z-0'
                          style={{ background: gradientStyle }}
                        />
                      );
                    })()}
                  {/* Default subtle gradient overlay (fallback) */}
                  {!profile?.selected_gradient && (
                    <div className='fixed inset-0 pointer-events-none z-0'>
                      <div
                        className='absolute inset-0'
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.05) 100%)",
                        }}
                      />
                    </div>
                  )}

                  {/* Soft accent orbs (reduced intensity) */}
                  <div className='fixed top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float opacity-20 pointer-events-none z-0' />
                  <div
                    className='fixed bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float opacity-12 pointer-events-none z-0'
                    style={{ animationDelay: "3s" }}
                  />

                  <div className='relative z-10'>
                    <Toaster />
                    <Sonner />
                    <Navigation />
                    <PageTransition>{children}</PageTransition>
                    <AuthButton />
                    <ContactButton />
                  </div>
                </div>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
