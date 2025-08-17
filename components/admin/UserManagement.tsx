"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  domain: string;
  created_at: string;
  email_confirmed_at: string;
}

async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.functions.invoke("get-all-users");
  if (error) throw error;
  return data;
}

export function UserManagement() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-users"],
    queryFn: getAllUsers,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.functions.invoke(
        "reset-password-for-user",
        {
          body: { email },
        }
      );
      if (error) throw error;
    },
    onSuccess: (_, email) => {
      toast.success(`Password reset link sent to ${email}`);
    },
    onError: (error: Error | { message: string }) => {
      toast.error(`Failed to send reset link: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-40'>
        <Loader2 className='animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-destructive'>
        Failed to load users: {error.message}
      </div>
    );
  }

  return (
    <div className='border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <code>{user.domain}</code>
              </TableCell>
              <TableCell>
                {user.email_confirmed_at ? (
                  <Badge
                    variant='default'
                    className='bg-green-500/20 text-green-400 border-green-500/30'
                  >
                    Verified
                  </Badge>
                ) : (
                  <Badge variant='secondary'>Invited</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => resetPasswordMutation.mutate(user.email!)}
                  disabled={
                    resetPasswordMutation.isPending &&
                    resetPasswordMutation.variables === user.email
                  }
                >
                  <KeyRound className='mr-2' size={16} />
                  Send Password Reset
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
