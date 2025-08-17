"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectsForCurrentUser, deleteProject, updateProject } from "@/lib/projects";
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
    mutationFn: ({ id, published }: { id: string, published: boolean }) => updateProject(id, { published }),
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">
          Manage Your Projects
        </h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2" size={20} /> Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/80 backdrop-blur-md border-glass-border">
            <DialogHeader>
              <DialogTitle className="text-primary">
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
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {projects?.map((project) => (
            <GlassCard key={project.id} className="p-4 flex flex-col justify-between bg-glass-bg/10">
              <div>
                <h3 className="font-bold text-lg">{project.title}</h3>
                <p className="text-sm text-foreground/70 truncate mb-4">
                  {project.description}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                    <Edit className="mr-2" size={16} /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash className="mr-2" size={16} /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your project.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(project.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`published-${project.id}`}
                    checked={project.published}
                    onCheckedChange={(checked) => {
                      toggleVisibilityMutation.mutate({ id: project.id, published: checked });
                    }}
                  />
                  <Label htmlFor={`published-${project.id}`}>Published</Label>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}