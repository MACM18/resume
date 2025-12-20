"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadProfileImage,
  getProfileImages,
  deleteProfileImage,
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
import { useAuth } from "@/components/providers/AuthProvider";
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

const MAX_IMAGES = 10;

export function ProfileImageManager() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
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
    queryKey: ["profileImages", session?.user.id],
    queryFn: () => getProfileImages(),
    enabled: !!session?.user.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (avatarUrl: string | null) =>
      updateCurrentUserProfile({ avatar_url: avatarUrl }),
    onSuccess: () => {
      toast.success("Profile picture updated!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to update profile picture: ${error.message}`);
      } else {
        toast.error("Failed to update profile picture.");
      }
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!session?.user.id) throw new Error("Not authenticated.");
      // If the image being deleted is the current avatar, clear it from profile
      if (profile?.avatar_url === imageUrl) {
        await updateCurrentUserProfile({ avatar_url: null });
      }
      return deleteProfileImage(imageUrl);
    },
    onSuccess: () => {
      toast.success("Image deleted successfully!");
      refetchImages(); // Re-fetch images to update the list
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] }); // Invalidate profile to reflect avatar_url change
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
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
      toast.error(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadProfileImage(file);
      toast.success("Image uploaded successfully!");
      refetchImages(); // Re-fetch images to show the new one
      // Optionally set the newly uploaded image as the avatar
      updateProfileMutation.mutate(publicUrl);
    } catch (error) {
      toast.error("Failed to upload image.");
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
      <h2 className='text-2xl font-bold text-primary'>Profile Picture</h2>
      <p className='text-foreground/70'>
        Upload and select your profile picture. You can store up to {MAX_IMAGES}{" "}
        images.
      </p>

      {/* Current Profile Picture */}
      {profile?.avatar_url && (
        <div className='flex items-center gap-4 p-4 border rounded-lg bg-glass-bg/10'>
          <div className='relative w-24 h-24 rounded-full overflow-hidden border border-primary/50 shrink-0'>
            <Image
              src={profile.avatar_url}
              alt='Current Profile'
              layout='fill'
              objectFit='cover'
            />
          </div>
          <div>
            <p className='font-medium'>Currently Selected:</p>
            <p className='text-sm text-foreground/70 truncate'>
              {profile.avatar_url.split("/").pop()}
            </p>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => updateProfileMutation.mutate(null)}
              disabled={updateProfileMutation.isPending}
              className='mt-2 text-destructive hover:bg-destructive/10'
            >
              Clear Profile Picture
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
          <label htmlFor='profile-image-upload' className='cursor-pointer'>
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
          id='profile-image-upload'
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
            Your Uploaded Images
          </h3>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
            {images.map((imageUrl) => (
              <div
                key={imageUrl}
                className='relative group aspect-square rounded-lg overflow-hidden border border-glass-border/30 hover:border-primary/50 transition-all duration-200'
              >
                <Image
                  src={imageUrl}
                  alt='Uploaded Profile Image'
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
                      profile?.avatar_url === imageUrl
                    }
                    className='mb-2'
                  >
                    {profile?.avatar_url === imageUrl ? (
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
                          delete this image.
                          {profile?.avatar_url === imageUrl && (
                            <p className='text-red-400 mt-2'>
                              Note: This is your current profile picture.
                              Deleting it will clear your profile picture.
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
          <p>No profile images uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
