"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getUploadedResumesForCurrentUser,
  uploadResumePdf,
  deleteUploadedResume,
} from "@/lib/resumes";
import { useSupabase } from "@/components/providers/AuthProvider";
import { Loader2, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/GlassCard";
import { Progress } from "@/components/ui/progress";
import { UploadedResume } from "@/types/portfolio";
import { toast } from "@/components/ui/sonner";

export function ResumeManager() {
  const queryClient = useQueryClient();
  const { session } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: uploadedResumes = [], isLoading } = useQuery({
    queryKey: ["uploaded-resumes"],
    queryFn: getUploadedResumesForCurrentUser,
  });

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user.id) return;

    // enforce limit 20
    if (uploadedResumes.length >= 20) {
      toast.error("You can upload a maximum of 20 resumes.");
      return;
    }

    setIsUploading(true);
    setProgress(10);

    // Use file name as role if no role provided
    const role = file.name.replace(/\.pdf$/i, "");

    try {
      setProgress(50);
      const uploadedResume = await uploadResumePdf(file, session.user.id, role);
      setProgress(80);

      if (uploadedResume) {
        await queryClient.invalidateQueries({ queryKey: ["uploaded-resumes"] });
        toast.success("Resume uploaded successfully!");
        setProgress(100);
        setTimeout(() => setProgress(0), 600);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const success = await deleteUploadedResume(id);
      if (!success) throw new Error("Failed to delete");
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-resumes"] });
      toast.success("Resume deleted successfully!");
      setConfirmDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete resume");
    },
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Uploaded Resumes</h3>
        <div className='flex items-center gap-3'>
          <label className='cursor-pointer'>
            <input
              id='resume-manager-upload'
              type='file'
              accept='.pdf'
              onChange={handleUpload}
              className='hidden'
              disabled={isUploading}
            />
            <Button variant='outline' asChild disabled={isUploading}>
              <span>{isUploading ? "Uploading..." : "Upload PDF"}</span>
            </Button>
          </label>
          <div className='text-sm text-muted-foreground'>
            {uploadedResumes.length}/20
          </div>
        </div>
      </div>

      {isUploading && <Progress value={progress} />}

      <div className='grid gap-3'>
        {isLoading ? (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        ) : uploadedResumes.length === 0 ? (
          <div className='text-sm text-muted-foreground text-center py-8'>
            No uploaded resumes yet. Upload a PDF to get started.
          </div>
        ) : (
          uploadedResumes.map((uploadedResume: UploadedResume) => (
            <GlassCard
              key={uploadedResume.id}
              className='p-3 flex items-center justify-between'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-12 bg-glass-bg/20 rounded-md flex items-center justify-center text-xs'>
                  PDF
                </div>
                <div>
                  <div className='font-medium'>
                    {uploadedResume.original_filename}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {uploadedResume.file_size
                      ? `${Math.round(uploadedResume.file_size / 1024)} KB • `
                      : ""}
                    {new Date(uploadedResume.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <a
                  href={uploadedResume.public_url || uploadedResume.file_path}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary underline text-sm'
                >
                  View
                </a>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() =>
                    setConfirmDelete({
                      id: uploadedResume.id,
                      name: uploadedResume.original_filename,
                    })
                  }
                >
                  <Trash size={14} />
                </Button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {confirmDelete?.name}? This will
              also remove the file from storage and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className='flex gap-2 justify-end'>
              <Button variant='ghost' onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() =>
                  confirmDelete && deleteMutation.mutate(confirmDelete.id)
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : null}
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
