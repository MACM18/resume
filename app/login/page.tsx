"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/AuthProvider";
import { useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
import Link from "next/link";

const LoginPage = () => {
  const { session } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className='min-h-screen flex items-center justify-center pt-24 pb-32 px-6'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='w-full max-w-md'
      >
        <GlassCard className='p-8'>
          <h2 className='text-3xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent'>
            Admin Login
          </h2>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(var(--primary))",
                    brandAccent: "hsl(var(--primary-glow))",
                    brandButtonText: "hsl(var(--primary-foreground))",
                    defaultButtonBackground: "hsl(var(--card))",
                    defaultButtonBackgroundHover: "hsl(var(--muted))",
                    defaultButtonBorder: "hsl(var(--glass-border))",
                    defaultButtonText: "hsl(var(--foreground))",
                    inputBackground: "hsl(var(--background-secondary))",
                    inputBorder: "hsl(var(--glass-border))",
                    inputBorderHover: "hsl(var(--primary))",
                    inputText: "hsl(var(--foreground))",
                    inputLabelText: "hsl(var(--foreground))",
                    inputPlaceholder: "hsl(var(--muted-foreground))",
                    anchorTextColor: "hsl(var(--foreground))",
                    anchorTextHoverColor: "hsl(var(--primary))",
                  },
                  space: {
                    spaceSmall: "4px",
                    spaceMedium: "8px",
                    spaceLarge: "16px",
                  },
                  radii: {
                    borderRadiusButton: "0.5rem",
                    buttonBorderRadius: "0.5rem",
                    inputBorderRadius: "0.5rem",
                  },
                },
              },
            }}
            providers={[]}
            theme='dark'
            view='sign_in'
            showLinks={false}
          />
          <div className='mt-6 text-center'>
            <p className='text-muted-foreground'>
              Don&apos;t have an account?{" "}
              <Link
                href='/signup'
                className='text-primary hover:text-primary-glow transition-colors font-medium'
              >
                Sign up
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LoginPage;
