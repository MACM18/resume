"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const LoginPage = () => {
  const { session, status } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      } else {
        toast.success("Logged in successfully!");
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestResetCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to send a reset code.");
      setForgotStep("verify");
      toast.success("If an account exists, a verification code has been sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send a reset code.");
    } finally {
      setForgotLoading(false);
    }
  };

  const verifyResetCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (forgotPassword !== forgotConfirm) {
      toast.error("The new passwords do not match.");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, newPassword: forgotPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Invalid or expired verification code.");
      toast.success("Password reset successfully. You can now sign in.");
      setForgotOpen(false);
      setForgotStep("request");
      setForgotCode("");
      setForgotPassword("");
      setForgotConfirm("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

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
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <button type='button' className='mt-4 w-full text-sm text-primary hover:underline' onClick={() => setForgotOpen((open) => !open)}>
            Forgot your password?
          </button>
          {forgotOpen && (
            <form onSubmit={forgotStep === "request" ? requestResetCode : verifyResetCode} className='mt-5 space-y-4 border-t border-foreground/10 pt-5'>
              <div><Label htmlFor='forgot-email'>Account email</Label><Input id='forgot-email' type='email' value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} required disabled={forgotLoading || forgotStep === "verify"} /></div>
              {forgotStep === "verify" && <><div><Label htmlFor='forgot-code'>Six-digit code</Label><Input id='forgot-code' inputMode='numeric' pattern='[0-9]{6}' maxLength={6} value={forgotCode} onChange={(event) => setForgotCode(event.target.value.replace(/\D/g, ""))} required disabled={forgotLoading} /><p className='mt-1 text-xs text-muted-foreground'>The code is valid for 15 minutes.</p></div><div><Label htmlFor='forgot-password'>New password</Label><Input id='forgot-password' type='password' minLength={8} value={forgotPassword} onChange={(event) => setForgotPassword(event.target.value)} required disabled={forgotLoading} /></div><div><Label htmlFor='forgot-confirm'>Confirm new password</Label><Input id='forgot-confirm' type='password' minLength={8} value={forgotConfirm} onChange={(event) => setForgotConfirm(event.target.value)} required disabled={forgotLoading} /></div></>}
              <div className='flex gap-2'><Button type='submit' className='flex-1' disabled={forgotLoading}>{forgotLoading && <Loader2 className='animate-spin' />}{forgotStep === "request" ? "Send code" : "Reset password"}</Button>{forgotStep === "verify" && <Button type='button' variant='outline' onClick={() => setForgotStep("request")} disabled={forgotLoading}>Back</Button>}</div>
            </form>
          )}
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
