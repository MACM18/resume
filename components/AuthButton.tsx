"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Wrench, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export const AuthButton = () => {
  const { session, supabase } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      {session ? (
        <Button
          onClick={handleLogout}
          className="rounded-full shadow-lg bg-destructive hover:bg-destructive/90"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      ) : (
        <Button asChild className="rounded-full shadow-lg bg-secondary hover:bg-secondary/90">
          <Link href="/login">
            <Wrench className="mr-2 h-4 w-4" />
            Modify
          </Link>
        </Button>
      )}
    </motion.div>
  );
};