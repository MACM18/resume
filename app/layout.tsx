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
                <div className='min-h-screen bg-background relative overflow-hidden'>
                  {/* Base gradient background that's always visible */}
                  <div className='fixed inset-0 bg-gradient-to-br from-background via-background-secondary to-background z-0' />

                  {/* Animated gradient orbs */}
                  <div className='fixed top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-float opacity-60 z-0' />
                  <div
                    className='fixed bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-secondary/8 to-accent/8 rounded-full blur-3xl animate-float opacity-50 z-0'
                    style={{ animationDelay: "2s" }}
                  />

                  {/* Background Image Layer - only visible when image is set */}
                  <div
                    className='fixed inset-0 transition-opacity duration-700 z-0'
                    style={{
                      backgroundImage: "var(--background-image-url)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundAttachment: "fixed",
                      opacity: "calc(var(--has-background-image) * 0.7)",
                    }}
                  />

                  {/* Overlay gradient - slightly darker when image is present */}
                  <div
                    className='fixed inset-0 bg-gradient-to-br from-background/90 via-background-secondary/80 to-background/90 transition-opacity duration-700 z-0'
                    style={{
                      opacity: "var(--has-background-image)",
                    }}
                  />
                  <div
                    className='fixed bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-secondary/8 to-accent/8 rounded-full blur-3xl animate-float opacity-50'
                    style={{ animationDelay: "2s" }}
                  />
                  <div
                    className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-2xl animate-float opacity-40'
                    style={{ animationDelay: "4s" }}
                  />
                  <div
                    className='fixed top-1/4 right-1/4 w-32 h-32 border border-primary/20 rounded-lg rotate-45 animate-float opacity-30'
                    style={{ animationDelay: "1s" }}
                  />
                  <div
                    className='fixed bottom-1/3 left-1/4 w-24 h-24 border border-secondary/20 rounded-full animate-float opacity-25'
                    style={{ animationDelay: "3s" }}
                  />
                  <div className='fixed top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-pulse opacity-30' />
                  <div
                    className='fixed top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-secondary/10 to-transparent animate-pulse opacity-20'
                    style={{ animationDelay: "2s" }}
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
