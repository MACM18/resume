"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

interface JsonEditorProps {
  queryKey: string[];
  queryFn: () => Promise<any>;
  mutationFn: (data: any) => Promise<any>;
  dataKey: string;
  title: string;
  description: string;
}

export function JsonEditor({ queryKey, queryFn, mutationFn, dataKey, title, description }: JsonEditorProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey, queryFn });
  const [jsonString, setJsonString] = useState("");

  useEffect(() => {
    if (data && data[dataKey]) {
      setJsonString(JSON.stringify(data[dataKey], null, 2));
    }
  }, [data, dataKey]);

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(`${title} data updated successfully!`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update data: ${error.message}`);
    },
  });

  const handleSave = () => {
    try {
      const parsedJson = JSON.parse(jsonString);
      mutation.mutate({ [dataKey]: parsedJson });
    } catch (error) {
      toast.error("Invalid JSON format. Please check your syntax.");
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      <p className="text-foreground/70">{description}</p>
      <Textarea
        value={jsonString}
        onChange={(e) => setJsonString(e.target.value)}
        rows={25}
        className="font-mono bg-glass-bg/20"
      />
      <Button onClick={handleSave} disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="animate-spin" /> : "Save Changes"}
      </Button>
    </div>
  );
}