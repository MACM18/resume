"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectsForCurrentUser, deleteProject } from "@/lib/projects";
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
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminPage = () => {
  const { session } = useSupabase();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [username, setUsername] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: async () => {
        if (!session?.user.id) return null;
        const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
        if (data?.username) {
          setUsername(data.username);
        }
        return data;
    },
    enabled: !!session,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getProjectsForCurrentUser,
    enabled: !!session,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("Project deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to delete project.");
    },
  });

  const handleSaveUsername = async () => {
    if (!session || !username) return;
    setIsSavingUsername(true);
    const { error } = await supabase.from('profiles').update({ username }).eq('id', session.user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Username saved!");
      queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
    }
    setIsSavingUsername(false);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen relative pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-secondary">Your Profile</h2>
          <div className="space-y-2">
            <Label htmlFor="username">Your Public Username</Label>
            <div className="flex gap-2">
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g., alex-chen"
              />
              <Button onClick={handleSaveUsername} disabled={isSavingUsername}>
                {isSavingUsername ? <Loader2 className="animate-spin" /> : "Save"}
              </Button>
            </div>
            {profile?.username && (
              <p className="text-sm text-foreground/70">
                Your portfolio is live at: <a href={`/${profile.username}`} className="text-primary underline">{`/${profile.username}`}</a>
              </p>
            )}
          </div>
        </GlassCard>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Manage Projects
          </h1>
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
              <GlassCard key={project.id} className="p-4">
                <h3 className="font-bold text-lg">{project.title}</h3>
                <p className="text-sm text-foreground/70 truncate">
                  {project.description}
                </p>
                <div className="flex gap-2 mt-4">
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
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;