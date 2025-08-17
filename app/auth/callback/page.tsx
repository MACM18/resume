"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { GlassCard } from "@/components/GlassCard";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

const AuthCallbackPage = () => {
  const { session } = useSupabase();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    }, 1500); // Wait for session to be established

    return () => clearTimeout(timer);
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <GlassCard className="p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
            <h1 className="text-2xl font-bold">Verifying Authentication...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Success!</h1>
            <p className="text-foreground/70">
              Authentication session was established correctly.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Authentication Failed</h1>
            <p className="text-foreground/70">
              Could not establish a session. The link may be invalid or expired.
            </p>
          </>
        )}
      </GlassCard>
    </div>
  );
};

export default AuthCallbackPage;