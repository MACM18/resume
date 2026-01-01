"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkExperiencesForCurrentUser,
  deleteWorkExperience,
  updateWorkExperience,
  setAsCurrent,
} from "@/lib/work-experiences";
import { Button } from "@/components/ui/button";
// import { GlassCard } from "@/components/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { WorkExperience } from "@/types/portfolio";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { formatDateRange } from "@/lib/utils";

export function WorkExperienceManagement() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["user-work-experiences"],
    queryFn: getWorkExperiencesForCurrentUser,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkExperience | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkExperience(id),
    onSuccess: () => {
      toast.success("Work experience deleted");
      queryClient.invalidateQueries({ queryKey: ["user-work-experiences"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      updateWorkExperience(id, { visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-work-experiences"] });
    },
    onError: () => toast.error("Failed to update visibility"),
  });

  const markCurrentMutation = useMutation({
    mutationFn: (id: string) => setAsCurrent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-work-experiences"] });
    },
    onError: (e: unknown) => {
      // unique index may throw conflict if another current exists; user should toggle others off first
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : "Failed to mark as current";
      toast.error(message);
    },
  });

  const current = (data as WorkExperience[]).find((w) => w.is_current);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
        <div>
          <h2 className='text-2xl md:text-3xl font-bold mb-2'>
            Work Experience
          </h2>
          <p className='text-foreground/60'>Manage your career history</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          size='lg'
        >
          <Plus className='mr-2 h-4 w-4' /> Add Experience
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center p-12'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </div>
      ) : data.length === 0 ? (
        <div className='border border-dashed border-foreground/20 rounded-xl p-12 text-center'>
          <p className='text-foreground/60 mb-4'>No work experiences yet</p>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' /> Add Your First Role
          </Button>
        </div>
      ) : (
        <div className='space-y-4'>
          {(data as WorkExperience[]).map((exp) => (
            <div
              key={exp.id}
              className='border border-foreground/10 rounded-xl p-4 md:p-6 bg-foreground/5 hover:bg-foreground/10 transition-colors'
            >
              <div className='flex flex-col gap-4'>
                <div className='flex-1'>
                  <div className='flex flex-wrap items-center gap-2 mb-2'>
                    <h3 className='font-bold text-lg'>{exp.position}</h3>
                    {exp.is_current && (
                      <span className='text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-500 border border-green-500/20 font-medium'>
                        ✓ Current Role
                      </span>
                    )}
                    {!exp.visible && (
                      <span className='text-xs px-2 py-1 rounded-md bg-foreground/10 text-foreground/70 border border-foreground/20'>
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className='text-sm text-foreground/70 mb-1'>
                    {exp.company}
                    {exp.location ? ` • ${exp.location}` : ""}
                  </div>
                  <div className='text-xs text-foreground/60'>
                    {formatDateRange(
                      exp.start_date,
                      exp.end_date || undefined,
                      exp.is_current
                    )}
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {!exp.is_current && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => markCurrentMutation.mutate(exp.id)}
                      title='Mark as current'
                      className='flex-1 md:flex-none'
                    >
                      <Star size={16} className='mr-2' />
                      Set Current
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setEditing(exp);
                      setOpen(true);
                    }}
                    title='Edit'
                    className='flex-1 md:flex-none'
                  >
                    <Pencil size={16} className='mr-2' />
                    Edit
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      visibilityMutation.mutate({
                        id: exp.id,
                        visible: !exp.visible,
                      })
                    }
                    title={exp.visible ? "Hide" : "Show"}
                    className='flex-1 md:flex-none'
                  >
                    {exp.visible ? (
                      <>
                        <EyeOff size={16} className='mr-2' />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye size={16} className='mr-2' />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => deleteMutation.mutate(exp.id)}
                    title='Delete'
                    className='flex-1 md:flex-none'
                  >
                    <Trash size={16} className='mr-2' />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-foreground/10'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold'>
              {editing ? "Edit Work Experience" : "Add Work Experience"}
            </DialogTitle>
          </DialogHeader>
          <WorkExperienceForm
            experience={editing}
            onSuccess={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {current && (
        <div className='text-sm text-foreground/60 px-4 py-3 bg-green-500/5 border border-green-500/20 rounded-lg'>
          Current role:{" "}
          <span className='font-medium text-green-500'>{current.position}</span>{" "}
          at {current.company}
        </div>
      )}
    </div>
  );
}
