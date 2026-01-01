"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectsForCurrentUser,
  deleteProject,
  updateProject,
} from "@/lib/projects";
// import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Project } from "@/types/portfolio";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ProjectManagement() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getProjectsForCurrentUser,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("Project deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
    },
    onError: () => {
      toast.error("Failed to delete project.");
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updateProject(id, { published }),
    onSuccess: () => {
      toast.success("Project visibility updated!");
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
    },
    onError: () => {
      toast.error("Failed to update visibility.");
    },
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6'>
        <div>
          <h2 className='text-2xl md:text-3xl font-bold mb-2'>Projects</h2>
          <p className='text-foreground/60'>Manage your portfolio projects</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} size='lg'>
              <Plus className='mr-2' size={20} /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-foreground/10'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold'>
                {selectedProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm
              project={selectedProject}
              onSuccess={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className='grid gap-4'>
          {projects?.map((project) => (
            <div
              key={project.id}
              className='border border-foreground/10 rounded-xl p-4 md:p-6 bg-foreground/5 hover:bg-foreground/10 transition-colors'
            >
              <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                <div className='flex-1'>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='font-bold text-lg md:text-xl'>
                      {project.title}
                    </h3>
                    <div className='flex items-center gap-2 ml-4'>
                      <Switch
                        id={`published-${project.id}`}
                        checked={project.published}
                        onCheckedChange={(checked) => {
                          toggleVisibilityMutation.mutate({
                            id: project.id,
                            published: checked,
                          });
                        }}
                      />
                      <Label
                        htmlFor={`published-${project.id}`}
                        className='text-xs'
                      >
                        {project.published ? "Published" : "Draft"}
                      </Label>
                    </div>
                  </div>
                  <p className='text-sm text-foreground/70 mb-3 line-clamp-2'>
                    {project.description}
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {project.tech.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className='px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20'
                      >
                        {tech}
                      </span>
                    ))}
                    {project.tech.length > 5 && (
                      <span className='px-2 py-1 text-xs text-foreground/60'>
                        +{project.tech.length - 5}
                      </span>
                    )}
                  </div>
                </div>
                <div className='flex md:flex-col gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleEdit(project)}
                    className='flex-1 md:flex-none'
                  >
                    <Edit className='mr-2' size={16} /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size='sm'
                        variant='destructive'
                        className='flex-1 md:flex-none'
                      >
                        <Trash className='mr-2' size={16} /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className='bg-background border-foreground/10'>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete <strong>{project.title}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(project.id)}
                          className='bg-destructive text-destructive-foreground'
                        >
                          Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='border border-dashed border-foreground/20 rounded-xl p-12 text-center'>
          <p className='text-foreground/60 mb-4'>No projects yet</p>
          <Button onClick={handleAddNew}>
            <Plus className='mr-2' size={20} /> Add Your First Project
          </Button>
        </div>
      )}
    </div>
  );
}
