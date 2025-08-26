"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GlassCard } from "./GlassCard";
import { Badge } from "@/components/ui/badge";

interface ContactNumber {
  id: string;
  number: string;
  label: string;
  isActive: boolean;
  isPrimary: boolean;
}

interface ContactNumbersDisplayProps {
  contactNumbers: ContactNumber[];
  className?: string;
}

export function ContactNumbersDisplay({
  contactNumbers,
  className = "",
}: ContactNumbersDisplayProps) {
  const [showNumbers, setShowNumbers] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Filter only active contact numbers
  const activeNumbers =
    contactNumbers?.filter((contact) => contact.isActive) || [];

  if (activeNumbers.length === 0) {
    return null;
  }

  const handleRevealNumbers = () => {
    setShowDialog(true);
  };

  const handleConfirmReveal = () => {
    setShowNumbers(true);
    setShowDialog(false);
  };

  const maskNumber = (number: string) => {
    // Show first 3 digits and last 2 digits, mask the middle
    if (number.length <= 5) return number;
    const start = number.substring(0, 3);
    const end = number.substring(number.length - 2);
    const middle = "•".repeat(Math.max(number.length - 5, 3));
    return `${start}${middle}${end}`;
  };

  return (
    <div className={className}>
      <GlassCard className='p-6' hover={false}>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 rounded-full bg-primary/10'>
            <Phone className='w-5 h-5 text-primary' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Contact Numbers</h3>
            <p className='text-sm text-muted-foreground'>
              {activeNumbers.length} number{activeNumbers.length > 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        <div className='space-y-3'>
          {activeNumbers.map((contact) => (
            <motion.div
              key={contact.id}
              className='flex items-center justify-between p-3 rounded-lg bg-background/50 border'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex items-center gap-3'>
                <div className='flex flex-col'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{contact.label}</span>
                    {contact.isPrimary && (
                      <Badge variant='secondary' className='text-xs'>
                        Primary
                      </Badge>
                    )}
                  </div>
                  <AnimatePresence mode='wait'>
                    {showNumbers ? (
                      <motion.span
                        key='revealed'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className='text-sm font-mono text-foreground/80'
                      >
                        {contact.number}
                      </motion.span>
                    ) : (
                      <motion.div
                        key='masked'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className='flex items-center gap-2'
                      >
                        <span className='text-sm font-mono text-muted-foreground'>
                          {maskNumber(contact.number)}
                        </span>
                        <div className='flex items-center gap-1'>
                          <Shield className='w-3 h-3 text-primary' />
                          <span className='text-xs text-primary'>
                            Protected
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {showNumbers && (
                <motion.a
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  href={`tel:${contact.number}`}
                  className='text-primary hover:text-primary/80 transition-colors'
                >
                  <Phone className='w-4 h-4' />
                </motion.a>
              )}
            </motion.div>
          ))}
        </div>

        {!showNumbers && (
          <motion.div
            className='mt-4 pt-4 border-t'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleRevealNumbers}
              variant='outline'
              className='w-full gap-2'
            >
              <Eye className='w-4 h-4' />
              Reveal Contact Numbers
            </Button>
            <p className='text-xs text-muted-foreground mt-2 text-center'>
              Click to view the complete phone numbers
            </p>
          </motion.div>
        )}

        {showNumbers && (
          <motion.div
            className='mt-4 pt-4 border-t'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              onClick={() => setShowNumbers(false)}
              variant='ghost'
              size='sm'
              className='w-full gap-2'
            >
              <EyeOff className='w-4 h-4' />
              Hide Numbers
            </Button>
          </motion.div>
        )}
      </GlassCard>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='bg-transparent border-none shadow-none p-0 max-w-md'>
          <GlassCard className='p-6' hover={false}>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-xl'>
                <Shield className='w-5 h-5 text-primary' />
                Privacy Notice
              </DialogTitle>
              <DialogDescription className='text-foreground/70 space-y-2'>
                <p>You are about to view contact numbers. Please ensure you:</p>
                <ul className='list-disc list-inside space-y-1 text-sm'>
                  <li>
                    Use these numbers for legitimate business inquiries only
                  </li>
                  <li>Respect privacy and call during appropriate hours</li>
                  <li>Do not share these numbers with others</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='flex-col gap-2 mt-6'>
              <Button onClick={handleConfirmReveal} className='w-full'>
                I Understand - Show Numbers
              </Button>
              <Button
                variant='ghost'
                onClick={() => setShowDialog(false)}
                className='w-full'
              >
                Cancel
              </Button>
            </DialogFooter>
          </GlassCard>
        </DialogContent>
      </Dialog>
    </div>
  );
}
