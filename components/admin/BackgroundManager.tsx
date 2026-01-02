"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadBackgroundImage,
  getBackgroundImages,
  deleteBackgroundImage,
} from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import {
  Loader2,
  FileUp,
  CheckCircle,
  Trash,
  Image as ImageIcon,
} from "lucide-react";
import { useSupabase } from "@/components/providers/AuthProvider";
import Image from "next/image";
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

const MAX_IMAGES = 5;

export function BackgroundManager() {
  const queryClient = useQueryClient();
  const { session } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
    enabled: !!session,
  });

  const {
    data: images,
    isLoading: isLoadingImages,
    refetch: refetchImages,
  } = useQuery({
    queryKey: ["backgroundImages", session?.user.id],
    queryFn: () => getBackgroundImages(),
    enabled: !!session?.user.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (backgroundUrl: string | null) =>
      updateCurrentUserProfile({ background_image_url: backgroundUrl }),
    onSuccess: () => {
      toast.success("Background image updated!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
      queryClient.invalidateQueries({ queryKey: ["theme"] }); // Invalidate theme to re-apply background
    },deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!session?.user.id) throw new Error("Not authenticated.");
      // If the image being deleted is the current background, clear it from profile
      if (profile?.background_image_url === imageUrl) {
        await updateCurrentUserProfile({ background_image_url: null });
      }
      return deleteBackgroundImage(imageUrl);
    },
    onSuccess: () => {
      toast.success("Background image deleted successfully!");
      refetchImages(); // Re-fetch images to update the list
    mutationFn: async (imageUrl: string) => {
      if (!session?.user.id) throw new Error("Not authenticated.");
      // If the image being deleted is the current background, clear it from profile
      if (profile?.background_image_url === imageUrl) {
        await updateCurrentUserProfile({ background_image_url: null });
      }
      return deleteBackgroundImage(imageUrl);
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

    if (images && images.length >= MAX_IMAGES) {
      toast.error(`You can only upload a maximum of ${MAX_IMAGES} background images.`);
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadBackgroundImage(file);
      toast.success("Image uploaded successfully!");
      refetchImages(); // Re-fetch images to show the new one
      // Set the newly uploaded image as the background
      updateProfileMutation.mutate(publicUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isLoadingProfile || isLoadingImages;

  if (isLoading) {
    return <Skeleton className='h-64 w-full' />;
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-primary'>Background Image</h2>
      <p className='text-foreground/70'>
        Upload and select your background image. You can store up to {MAX_IMAGES}{" "}
        images.
      </p>

      {/* Current Background Image */}
      {profile?.background_image_url && (
        <div className='flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-glass-bg/10'>
          <div className='relative w-32 h-20 rounded-md overflow-hidden border border-primary/50 shrink-0'>
            <Image
              src={profile.background_image_url}
              alt='Current Background'
              layout='fill'
              objectFit='cover'
            />
          </div>
          <div className='flex-1'>
            <p className='font-medium'>Currently Selected:</p>
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
        <Button
          asChild
          variant='outline'
          disabled={isUploading || (images && images.length >= MAX_IMAGES)}
        >
          <label htmlFor='background-image-upload' className='cursor-pointer'>
            {isUploading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <FileUp className='mr-2 h-4 w-4' />
            )}
            {isUploading
              ? "Uploading..."
              : `Upload New Image (${images?.length || 0}/${MAX_IMAGES})`}
          </label>
        </Button>
        <input
          id='background-image-upload'
          type='file'
          accept='.jpg,.jpeg,.png,.webp'
          className='hidden'
          onChange={handleFileUpload}
          disabled={isUploading || (images && images.length >= MAX_IMAGES)}
        />
        {images && images.length >= MAX_IMAGES && (
          <p className='text-sm text-destructive'>Maximum images reached.</p>
        )}
      </div>

      {/* Existing Images */}
      {images && images.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-secondary'>
            Your Uploaded Background Images
          </h3>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
            {images.map((imageUrl) => (
              <div
                key={imageUrl}
                className='relative group aspect-video rounded-lg overflow-hidden border border-glass-border/30 hover:border-primary/50 transition-all duration-200'
              >
                <Image
                  src={imageUrl}
                  alt='Uploaded Background Image'
                  layout='fill'
                  objectFit='cover'
                  className='transition-all duration-500 group-hover:brightness-110'
                />
                <div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <Button
                    size='sm'
                    onClick={() => updateProfileMutation.mutate(imageUrl)}
                    disabled={
                      updateProfileMutation.isPending ||
                      profile?.background_image_url === imageUrl
                    }
                    className='mb-2'
                  >
                    {profile?.background_image_url === imageUrl ? (
                      <>
                        <CheckCircle size={16} className='mr-1' /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='destructive'
                        size='sm'
                        disabled={deleteImageMutation.isPending}
                      >
                        <Trash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this background image.
                          {profile?.background_image_url === imageUrl && (
                            <p className='text-red-400 mt-2'>
                              Note: This is your current background image.
                              Deleting it will clear your background.
                            </p>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteImageMutation.mutate(imageUrl)}
                          className='bg-destructive hover:bg-destructive/90'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images && images.length === 0 && (
        <div className='text-center text-foreground/60 p-8 border rounded-lg bg-glass-bg/10'>
          <ImageIcon size={48} className='mx-auto mb-4 text-foreground/40' />
          <p>No background images uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
