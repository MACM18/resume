"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResumesForCurrentUser, deleteResume } from "@/lib/resumes";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/lib/profile";
// import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResumeForm } from "@/components/admin/ResumeForm";
import { Resume } from "@/types/portfolio";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ResumeManagement() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const { data: resumes, isLoading: isLoadingResumes } = useQuery({
    queryKey: ["user-resumes"],
    queryFn: getResumesForCurrentUser,
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  const setActiveMutation = useMutation({
    mutationFn: (role: string) =>
      updateCurrentUserProfile({ active_resume_role: role }),
    onSuccess: () => {
      toast.success("Active resume updated!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
    onError: () => toast.error("Failed to set active resume."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      toast.success("Resume deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-resumes"] });
    },
    onError: () => toast.error("Failed to delete resume."),
  });

  const handleEdit = (resume: Resume) => {
    setSelectedResume(resume);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedResume(null);
    setIsFormOpen(true);
  };

  const isLoading = isLoadingResumes || isLoadingProfile;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
        <div>
          <h2 className='text-2xl md:text-3xl font-bold mb-2'>Resumes</h2>
          <p className='text-foreground/60'>
            Create and manage different resume versions
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} size='lg'>
              <Plus className='mr-2' size={20} /> Add Resume
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-foreground/10'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold'>
                {selectedResume ? "Edit Resume" : "Add New Resume"}
              </DialogTitle>
            </DialogHeader>
            <ResumeForm
              resume={selectedResume}
              onSuccess={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : resumes && resumes.length > 0 ? (
        <div className='space-y-4'>
          {resumes?.map((resume) => {
            const isActive = profile?.active_resume_role === resume.role;
            return (
              <div
                key={resume.id}
                className='border border-foreground/10 rounded-xl p-4 md:p-6 bg-foreground/5 hover:bg-foreground/10 transition-colors'
              >
                <div className='flex flex-col gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='font-bold text-lg md:text-xl'>
                        {resume.title}
                      </h3>
                      {isActive && (
                        <CheckCircle className='h-5 w-5 text-green-500' />
                      )}
                    </div>
                    <p className='text-sm text-foreground/70'>
                      Role: <span className='font-medium'>{resume.role}</span>
                    </p>
                    {resume.pdf_source && (
                      <p className='text-xs text-foreground/60 mt-1'>
                        Source:{" "}
                        {resume.pdf_source === "generated"
                          ? "Auto-generated"
                          : "Uploaded PDF"}
                      </p>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      size='sm'
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setActiveMutation.mutate(resume.role)}
                      disabled={isActive || setActiveMutation.isPending}
                      className='flex-1 md:flex-none'
                    >
                      {isActive ? (
                        <>
                          <CheckCircle size={16} className='mr-2' />
                          Active
                        </>
                      ) : (
                        "Set Active"
                      )}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleEdit(resume)}
                      className='flex-1 md:flex-none'
                    >
                      <Edit size={16} className='mr-2' />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size='sm'
                          variant='destructive'
                          className='flex-1 md:flex-none'
                        >
                          <Trash size={16} className='mr-2' />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className='bg-background border-foreground/10'>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the{" "}
                            <strong>{resume.title}</strong> resume for the
                            &apos;{resume.role}&apos; role.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(resume.id)}
                            className='bg-destructive text-destructive-foreground'
                          >
                            Delete Resume
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='border border-dashed border-foreground/20 rounded-xl p-12 text-center'>
          <p className='text-foreground/60 mb-4'>No resumes yet</p>
          <Button onClick={handleAddNew}>
            <Plus className='mr-2' size={20} /> Create Your First Resume
          </Button>
        </div>
      )}
    </div>
  );
}
