"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Loader2, LogOut, Mail, ShieldCheck } from "lucide-react";
import { AdminSectionHeader } from "./AdminUI";

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({}));
  return typeof data.error === "string" ? data.error : fallback;
}

export function AccountSecurity() {
  const { session } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStep, setEmailStep] = useState<"request" | "verify">("request");
  const [emailLoading, setEmailLoading] = useState(false);

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) throw new Error(await readError(response, "Unable to update password."));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const requestEmailCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailLoading(true);
    try {
      const response = await fetch("/api/auth/email-change/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      if (!response.ok) throw new Error(await readError(response, "Unable to send verification code."));
      setEmailStep("verify");
      toast.success("Verification code sent to your new email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send verification code.");
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyEmailCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailLoading(true);
    try {
      const response = await fetch("/api/auth/email-change/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, code: emailCode }),
      });
      if (!response.ok) throw new Error(await readError(response, "Invalid or expired verification code."));
      toast.success("Email updated. Please sign in again with your new email.");
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminSectionHeader eyebrow="Account" title="Security settings" description="Manage the credentials used to access your portfolio workspace." />
      <section className="border border-foreground/10 bg-foreground/[0.02] p-5 md:p-7">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 text-primary" size={20} />
          <div>
            <h3 className="font-semibold">Current email</h3>
            <p className="mt-1 text-sm text-foreground/55">{session?.user?.email || "No email available"}</p>
          </div>
        </div>
        <form onSubmit={emailStep === "request" ? requestEmailCode : verifyEmailCode} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-new-email">New email address</Label>
            <Input id="account-new-email" type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required disabled={emailLoading || emailStep === "verify"} />
          </div>
          {emailStep === "verify" && <div className="space-y-2"><Label htmlFor="account-email-code">Verification code</Label><Input id="account-email-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={emailCode} onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, ""))} required disabled={emailLoading} /><p className="text-xs text-foreground/50">The code is valid for 15 minutes.</p></div>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={emailLoading}>{emailLoading && <Loader2 className="animate-spin" />}{emailStep === "request" ? "Send verification code" : "Confirm email"}</Button>
            {emailStep === "verify" && <Button type="button" variant="outline" onClick={() => { setEmailStep("request"); setEmailCode(""); }} disabled={emailLoading}>Use another email</Button>}
          </div>
        </form>
      </section>

      <section className="border border-foreground/10 bg-foreground/[0.02] p-5 md:p-7">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-primary" size={20} /><div><h3 className="font-semibold">Change password</h3><p className="mt-1 text-sm text-foreground/55">Use at least 8 characters and keep your password private.</p></div></div>
        <form onSubmit={updatePassword} className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required disabled={passwordLoading} /></div>
          <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required disabled={passwordLoading} /></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required disabled={passwordLoading} /></div>
          <div className="md:col-span-3"><Button type="submit" disabled={passwordLoading}>{passwordLoading && <Loader2 className="animate-spin" />}Update password</Button></div>
        </form>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 pt-6"><div><h3 className="font-semibold">Sign out</h3><p className="mt-1 text-sm text-foreground/55">End this session on the current device.</p></div><Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}><LogOut />Sign out</Button></section>
    </div>
  );
}
