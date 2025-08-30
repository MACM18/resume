"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadBackgroundImage,
  deleteBackgroundImage,
} from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Loader2, FileUp, Image as ImageIcon } from "lucide-react";
import { useSupabase } from "@/components/providers/AuthProvider";
import Image from "next/image";

export function BackgroundManager() {
  const queryClient = useQueryClient();
  const { session } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
    enabled: !!session,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (backgroundUrl: string | null) =>
      updateCurrentUserProfile({ background_image_url: backgroundUrl }),
    onSuccess: () => {
      toast.success("Background image updated!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
      queryClient.invalidateQueries({ queryKey: ["theme"] }); // Invalidate theme to re-apply background
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to update background image: ${error.message}`);
      } else {
        toast.error("Failed to update background image.");
      }
    },
  });

  const _deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!session?.user.id) throw new Error("Not authenticated.");
      // If the image being deleted is the current background, clear it from profile
      if (profile?.background_image_url === imageUrl) {
        await updateCurrentUserProfile({ background_image_url: null });
      }
      return deleteBackgroundImage(session.user.id, imageUrl);
    },
    onSuccess: () => {
      toast.success("Background image deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] }); // Invalidate profile to reflect background_image_url change
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
      queryClient.invalidateQueries({ queryKey: ["theme"] }); // Invalidate theme to re-apply background
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to delete image: ${error.message}`);
      } else {
        toast.error("Failed to delete image.");
      }
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user.id) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a JPG, PNG, or WEBP image."
      );
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadBackgroundImage(file, session.user.id);
      toast.success("Image uploaded successfully!");
      // Set the newly uploaded image as the background
      updateProfileMutation.mutate(publicUrl);
    } catch (error) {
      toast.error("Failed to upload image.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isLoadingProfile;

  if (isLoading) {
    return <Skeleton className='h-64 w-full' />;
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-primary'>Background Image</h2>
      <p className='text-foreground/70'>
        Upload a custom background image for your portfolio.
      </p>

      {/* Current Background Image */}
      {profile?.background_image_url && (
        <div className='flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-glass-bg/10'>
          <div className='relative w-32 h-20 rounded-md overflow-hidden border border-primary/50 flex-shrink-0'>
            <Image
              src={profile.background_image_url}
              alt='Current Background'
              layout='fill'
              objectFit='cover'
            />
          </div>
          <div className='flex-1'>
            <p className='font-medium'>Currently Active:</p>
            <p className='text-sm text-foreground/70 truncate'>
              {profile.background_image_url.split("/").pop()}
            </p>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => updateProfileMutation.mutate(null)}
              disabled={updateProfileMutation.isPending}
              className='mt-2 text-destructive hover:bg-destructive/10'
            >
              Clear Background Image
            </Button>
          </div>
        </div>
      )}

      {/* Image Upload */}
      <div className='flex items-center gap-4'>
        <Button asChild variant='outline' disabled={isUploading}>
          <label htmlFor='background-image-upload' className='cursor-pointer'>
            {isUploading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <FileUp className='mr-2 h-4 w-4' />
            )}
            {isUploading ? "Uploading..." : "Upload New Background"}
          </label>
        </Button>
        <input
          id='background-image-upload'
          type='file'
          accept='.jpg,.jpeg,.png,.webp'
          className='hidden'
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>

      {!profile?.background_image_url && !isUploading && (
        <div className='text-center text-foreground/60 p-8 border rounded-lg bg-glass-bg/10'>
          <ImageIcon size={48} className='mx-auto mb-4 text-foreground/40' />
          <p>No background image set yet.</p>
        </div>
      )}
    </div>
  );
}
