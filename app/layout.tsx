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
                  {/* Very subtle gradient overlay */}
                  {/* If the profile has a selected gradient, render it with low opacity.
                      If selectedGradientUseTheme is true, use CSS theme variables (HSL) where possible.
                  */}
                  {profile?.selected_gradient && (
                    <div
                      className='fixed inset-0 pointer-events-none'
                      style={{
                        // Use selected preset previewCss by default. If the profile opted to use theme colors,
                        // use theme variables (primary/accent HSL) for low impact overlays.
                        background: profile.selected_gradient_use_theme
                          ? `linear-gradient(${
                              profile.selected_gradient?.angle ?? 135
                            }deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--accent) / 0.03) 100%)`
                          : profile.selected_gradient?.preview_css ?? "",
                        opacity: 0.1,
                      }}
                    />
                  )}
                  {/* Default subtle gradient overlay (fallback) */}
                  {!profile?.selected_gradient && (
                    <div className='fixed inset-0 bg-linear-to-br from-background/10 via-background/5 to-secondary/10 pointer-events-none' />
                  )}

                  {/* Soft accent orbs (reduced intensity) */}
                  <div className='fixed top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float opacity-20' />
                  <div
                    className='fixed bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float opacity-12'
                    style={{ animationDelay: "3s" }}
                  />

                  <Toaster />
                  <Sonner />
                  <Navigation />
                  <PageTransition>{children}</PageTransition>
                  <AuthButton />
                  <ContactButton />
                </div>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
