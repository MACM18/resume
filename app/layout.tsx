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
import { getProfileDataServer, getThemeDataServer } from "@/lib/profile.server";
import { getEffectiveDomain } from "@/lib/utils";
import { generateHomeMetadata, buildMetaDescription } from "@/lib/seo";
import { generateCssVariables } from "@/lib/theme";
import Analytics from "@/components/Analytics";
import Script from "next/script";
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
  // Server-side: determine hostname and fetch profile and theme data (for favicon & background)
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);
  const profileData = domain ? await getProfileDataServer(domain) : null;
  const themeData = domain ? await getThemeDataServer(domain) : null;
  const faviconUrl = profileData?.favicon_url ?? null;

  // Analytics configuration (only enable in production when IDs are present)
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? null;
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null;
  const ENABLED_IN_PROD = process.env.NODE_ENV === "production";
  const ANALYTICS_ENABLED =
    ENABLED_IN_PROD &&
    (GTM_ID || GA_MEASUREMENT_ID) &&
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false";

  return (
    <html lang='en'>
      <head>
        {faviconUrl && (
          <>
            <link rel='icon' href={faviconUrl} />
            <link rel='shortcut icon' href={faviconUrl} />
          </>
        )}

        {/* Ensure a meta description is always present (prefer about card description) */}
        <meta name='description' content={buildMetaDescription(profileData)} />

        {/* Inject CSS variables server-side to avoid client fetch delays impacting LCP */}
        {themeData && (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: generateCssVariables(
                  themeData.theme || {},
                  themeData.background_image_url || null,
                ),
              }}
            />
            {themeData.background_image_url && (
              <link
                rel='preload'
                as='image'
                href={themeData.background_image_url}
                // hint the browser this is important for first paint
                fetchPriority='high'
              />
            )}
          </>
        )}

        {/* Google Tag Manager (GTM) and GA4 (gtag) - only injected in production when env vars are set */}
        {ANALYTICS_ENABLED && GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy='afterInteractive'
            />
            <Script id='gtag-init' strategy='afterInteractive'>
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`}
            </Script>
          </>
        )}

        {ANALYTICS_ENABLED && GTM_ID && (
          <Script id='gtm-init' strategy='afterInteractive'>
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
      </head>
      <body>
        {/* GTM noscript fallback (placed immediately after opening body tag) */}
        {ANALYTICS_ENABLED && GTM_ID && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        )}

        <ReactQueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider>
                <div
                  className='min-h-screen relative'
                  style={{
                    background: `
                    linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background-secondary)) 100%),
                    linear-gradient(135deg, transparent 0%, hsl(var(--primary) / 0.03) 50%, hsl(var(--secondary) / 0.02) 100%),
                    var(--background-image-url, none)
                  `,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
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

        {/* Client-side SPA pageview tracking (only load Analytics client when analytics is enabled) */}
        {ANALYTICS_ENABLED && <Analytics />}
      </body>
    </html>
  );
}
