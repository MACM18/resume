"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/AuthProvider';
import { useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { session } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Admin Login
          </h2>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(186, 100%, 69%)',
                    brandAccent: 'hsl(186, 100%, 79%)',
                    brandButtonText: 'hsl(222, 47%, 7%)',
                    defaultButtonBackground: 'hsl(222, 47%, 11%)',
                    defaultButtonBackgroundHover: 'hsl(222, 47%, 15%)',
                    defaultButtonBorder: 'hsl(222, 40%, 25%)',
                    defaultButtonText: 'hsl(210, 40%, 98%)',
                    inputBackground: 'hsl(222, 47%, 9%)',
                    inputBorder: 'hsl(222, 40%, 25%)',
                    inputBorderHover: 'hsl(186, 100%, 69%)',
                    inputText: 'hsl(210, 40%, 98%)',
                    inputLabelText: 'hsl(210, 40%, 98%)',
                    inputPlaceholder: 'hsl(215, 20.2%, 65.1%)',
                    anchorTextColor: 'hsl(210, 40%, 98%)',
                    anchorTextHoverColor: 'hsl(186, 100%, 69%)',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
            }}
            providers={[]}
            theme="dark"
            view="sign_in"
            showLinks={false}
          />
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LoginPage;