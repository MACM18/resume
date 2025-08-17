"use client";

import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const WelcomePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Account Verified!</h1>
          <p className="text-foreground/70 mb-8">
            Your account has been successfully created and verified. Welcome aboard!
          </p>
          <Button onClick={() => router.push('/admin')} size="lg">
            Go to Your Dashboard
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default WelcomePage;