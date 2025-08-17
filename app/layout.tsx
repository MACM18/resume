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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider>
                <div className='min-h-screen bg-background relative overflow-hidden'>
                  {/* Animated Background Elements */}
                  <div className='fixed inset-0 bg-gradient-to-br from-background via-background-secondary to-background' />
                  <div className='fixed top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-float opacity-60' />
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