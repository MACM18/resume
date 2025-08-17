"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResumesForCurrentUser, deleteResume } from "@/lib/resumes";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Loader2 } from "lucide-react";
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

  const { data: resumes, isLoading } = useQuery({
    queryKey: ["user-resumes"],
    queryFn: getResumesForCurrentUser,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      toast.success("Resume deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-resumes"] });
    },
    onError: () => {
      toast.error("Failed to delete resume.");
    },
  });

  const handleEdit = (resume: Resume) => {
    setSelectedResume(resume);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedResume(null);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">
          Manage Your Resumes
        </h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2" size={20} /> Add New Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/80 backdrop-blur-md border-glass-border">
            <DialogHeader>
              <DialogTitle className="text-primary">
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
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {resumes?.map((resume) => (
            <GlassCard key={resume.id} className="p-4 flex justify-between items-center bg-glass-bg/10">
              <div>
                <h3 className="font-bold text-lg">{resume.title}</h3>
                <p className="text-sm text-foreground/70">Role: {resume.role}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(resume)}>
                  <Edit size={16} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your resume for the '{resume.role}' role.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(resume.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}