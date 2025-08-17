"use client";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";

export default function RootPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard className="p-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to the Portfolio Platform
          </h1>
          <p className="text-lg text-foreground/80">
            To view a portfolio, please navigate to a user's page, for example:{" "}
            <code className="bg-glass-bg/20 px-2 py-1 rounded">/your-username</code>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}