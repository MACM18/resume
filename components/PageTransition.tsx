"use client";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      }}
      className='min-h-screen'
    >
      {children}
    </motion.div>
  );
}
