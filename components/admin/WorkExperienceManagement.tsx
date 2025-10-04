"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkExperiencesForCurrentUser,
  deleteWorkExperience,
  updateWorkExperience,
} from "@/lib/work-experiences";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
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
    mutationFn: (id: string) => updateWorkExperience(id, { is_current: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-work-experiences"] });
    },
    onError: (e: any) => {
      // unique index may throw conflict if another current exists; user should toggle others off first
      toast.error(e?.message || "Failed to mark as current");
    },
  });

  const current = (data as WorkExperience[]).find((w) => w.is_current);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-primary'>Work Experience</h2>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' /> Add Experience
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center p-12'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </div>
      ) : data.length === 0 ? (
        <GlassCard className='p-6 text-center text-foreground/70'>
          No work experiences yet. Add your first role.
        </GlassCard>
      ) : (
        <div className='space-y-3'>
          {(data as WorkExperience[]).map((exp) => (
            <GlassCard key={exp.id} className='p-4'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                <div>
                  <div className='flex items-center gap-2'>
                    <div className='font-semibold'>{exp.position}</div>
                    {exp.is_current && (
                      <span className='text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20'>
                        Current
                      </span>
                    )}
                    {!exp.visible && (
                      <span className='text-xs px-2 py-0.5 rounded bg-foreground/10 text-foreground/70 border border-glass-border/30'>
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className='text-sm text-foreground/70'>
                    {exp.company}
                    {exp.location ? ` • ${exp.location}` : ""}
                  </div>
                  <div className='text-xs text-foreground/60'>
                    {new Date(exp.start_date).toLocaleDateString()} -{" "}
                    {exp.is_current || !exp.end_date
                      ? "Present"
                      : new Date(exp.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className='flex gap-2'>
                  {!exp.is_current && (
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => markCurrentMutation.mutate(exp.id)}
                      title='Mark as current'
                    >
                      <Star size={16} />
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => {
                      setEditing(exp);
                      setOpen(true);
                    }}
                    title='Edit'
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() =>
                      visibilityMutation.mutate({
                        id: exp.id,
                        visible: !exp.visible,
                      })
                    }
                    title={exp.visible ? "Hide" : "Show"}
                  >
                    {exp.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    variant='destructive'
                    size='icon'
                    onClick={() => deleteMutation.mutate(exp.id)}
                    title='Delete'
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
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
        <div className='text-xs text-foreground/60'>
          Current role: <span className='font-medium'>{current.position}</span>{" "}
          at {current.company}
        </div>
      )}
    </div>
  );
}
