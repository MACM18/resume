"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/components/providers/AuthProvider";
import { toast } from "@/components/ui/sonner";
import { homePageData, aboutPageData, resumes as staticResumes, projects as staticProjects } from "@/data/portfolio";

async function seedDatabase(userId: string) {
    // 1. Seed Projects
    const projectsWithUserId = staticProjects.map(p => ({ ...p, user_id: userId }));
    const { error: projectsError } = await supabase.from('projects').insert(projectsWithUserId);
    if (projectsError) throw new Error(`Failed to seed projects: ${projectsError.message}`);

    // 2. Seed Resumes
    const resumesWithUserId = Object.values(staticResumes).map(r => ({ ...r, user_id: userId }));
    const { error: resumesError } = await supabase.from('resumes').insert(resumesWithUserId);
    if (resumesError) throw new Error(`Failed to seed resumes: ${resumesError.message}`);

    // 3. Seed Profile
    const { error: profileError } = await supabase.from('profiles').update({
        full_name: "Alex Chen", // Default name
        tagline: "Full Stack Developer & UI/UX Designer crafting digital experiences with modern technologies and beautiful design", // Default tagline
        home_page_data: homePageData,
        about_page_data: aboutPageData,
    }).eq('id', userId);
    if (profileError) throw new Error(`Failed to seed profile: ${profileError.message}`);

    return { success: true };
}

export function useSeedDatabase() {
    const { session } = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            if (!session?.user.id) throw new Error("User not authenticated");
            return seedDatabase(session.user.id);
        },
        onSuccess: () => {
            toast.success("Database seeded successfully!");
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['resumes'] });
            queryClient.invalidateQueries({ queryKey: ['user-projects'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}