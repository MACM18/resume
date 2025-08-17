"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Wrench, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      className="fixed top-6 left-6 z-50"
    >
      {session ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleLogout}
              size="icon"
              className="rounded-full shadow-lg bg-destructive hover:bg-destructive/90"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" className="rounded-full shadow-lg bg-secondary hover:bg-secondary/90">
              <Link href="/login">
                <Wrench className="h-5 w-5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Modify</p>
          </TooltipContent>
        </Tooltip>
      )}
    </motion.div>
  );
};