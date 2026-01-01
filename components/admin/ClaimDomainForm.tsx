"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { normalizeDomain } from "@/lib/utils";
import { useRouter } from "next/navigation";

const domainSchema = z.object({
  domain: z.string().min(3, "Domain must be at least 3 characters long."),
});

type DomainFormValues = z.infer<typeof domainSchema>;

export function ClaimDomainForm() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: DomainFormValues) => {
      if (!session) throw new Error("Not authenticated");

      // Normalize domain for consistent storage and lookup
      const normalizedDomain = normalizeDomain(data.domain);

      // Check if domain is already taken via API
      const checkResponse = await fetch(
        `/api/profile/by-domain?domain=${encodeURIComponent(normalizedDomain)}`
      );
      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        if (existing && existing.id) {
          throw new Error("This domain is already taken.");
        }
      }

      // Update profile with new domain via API
      const updateResponse = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: normalizedDomain }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || "Failed to claim domain");
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`Domain ${variables.domain} claimed successfully!`);
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      router.push("/admin");
    },
    onError: (error: Error) => {
      toast.error(`Failed to claim domain: ${error.message}`);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className='space-y-4'
      >
        <FormField
          control={form.control}
          name='domain'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>Domain</FormLabel>
              <FormControl>
                <Input placeholder='your-portfolio.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={mutation.isPending} className='w-full'>
          {mutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            "Claim Domain & Continue"
          )}
        </Button>
      </form>
    </Form>
  );
}
