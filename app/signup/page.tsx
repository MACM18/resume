"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/AuthProvider";
import { useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SignupPage = () => {
  const { session } = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      setIsLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Profile will be auto-created by AuthProvider when user logs in
        // We can optionally create it here too for immediate access
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            user_id: data.user.id, // Use user_id, not id
            full_name: formData.fullName,
            tagline: "Welcome to my portfolio",
            home_page_data: {
              name: formData.fullName,
              tagline: "Welcome to my portfolio",
              socialLinks: [],
              experienceHighlights: [],
              technicalExpertise: [],
              achievements: [],
              callToAction: {
                title: "Let's Connect",
                description: "I'm always open to discussing new opportunities.",
                email: formData.email,
              },
            },
            about_page_data: {
              title: "About Me",
              subtitle: "My Journey",
              story: ["Tell your story here..."],
              skills: [],
              callToAction: {
                title: "Get in Touch",
                description: "Let's work together!",
                email: formData.email,
              },
            },
            theme: {
              primary: "221 83% 53%",
              "primary-glow": "221 83% 63%",
              "primary-muted": "221 83% 23%",
              "primary-foreground": "0 0% 100%",
              accent: "280 80% 50%",
              "accent-glow": "280 80% 60%",
            },
          },
        ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't fail signup - AuthProvider will create profile on login
        }

        toast.success(
          "Account created! Please check your email to confirm your account."
        );
        router.push("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center pt-24 pb-32 px-6'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='w-full max-w-md'
      >
        <GlassCard className='p-8'>
          <h2 className='text-3xl font-bold text-center mb-2 bg-gradient-primary bg-clip-text text-transparent'>
            Create Account
          </h2>
          <p className='text-center text-muted-foreground mb-6'>
            Join us and build your portfolio
          </p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input
                id='fullName'
                name='fullName'
                type='text'
                placeholder='John Doe'
                value={formData.fullName}
                onChange={handleChange}
                required
                className='bg-background-secondary border-glass-border focus:border-primary'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='you@example.com'
                value={formData.email}
                onChange={handleChange}
                required
                className='bg-background-secondary border-glass-border focus:border-primary'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                placeholder='••••••••'
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className='bg-background-secondary border-glass-border focus:border-primary'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                placeholder='••••••••'
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className='bg-background-secondary border-glass-border focus:border-primary'
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-muted-foreground'>
              Already have an account?{" "}
              <Link
                href='/login'
                className='text-primary hover:text-primary-glow transition-colors font-medium'
              >
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default SignupPage;
