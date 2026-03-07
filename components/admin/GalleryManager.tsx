"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  uploadGalleryImage,
  getGalleryImages,
  deleteGalleryImage,
} from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Loader2, FileUp, Trash, Image as ImageIcon } from "lucide-react";
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

const MAX_IMAGES = 50;

export function GalleryManager() {
  const { session } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: images,
    isLoading: isLoadingImages,
    refetch: refetchImages,
  } = useQuery({
    queryKey: ["galleryImages", session?.user.id],
    queryFn: () => getGalleryImages(),
    enabled: !!session?.user.id,
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return deleteGalleryImage(imageUrl);
    },
    onSuccess: () => {
      toast.success("Image deleted successfully!");
      refetchImages();
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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user.id) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a JPG, PNG, or WEBP image.",
      );
      return;
    }

    if (images && images.length >= MAX_IMAGES) {
      toast.error(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setIsUploading(true);
    try {
      await uploadGalleryImage(file);
      toast.success("Image uploaded successfully!");
      refetchImages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingImages) {
    return <Skeleton className='h-64 w-full' />;
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-primary'>Gallery Photos</h2>
      <p className='text-foreground/70'>
        Upload and manage photos for your public gallery. You can store up to{" "}
        {MAX_IMAGES} images.
      </p>

      {/* Image Upload */}
      <div className='flex items-center gap-4'>
        <Button
          asChild
          variant='outline'
          disabled={isUploading || (images && images.length >= MAX_IMAGES)}
        >
          <label htmlFor='gallery-image-upload' className='cursor-pointer'>
            {isUploading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <FileUp className='mr-2 h-4 w-4' />
            )}
            {isUploading
              ? "Uploading..."
              : `Upload New Photo (${images?.length || 0}/${MAX_IMAGES})`}
          </label>
        </Button>
        <input
          id='gallery-image-upload'
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
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
            {images.map((imageUrl) => (
              <div
                key={imageUrl}
                className='relative group aspect-square rounded-lg overflow-hidden border border-glass-border/30 hover:border-primary/50 transition-all duration-200'
              >
                <Image
                  src={imageUrl}
                  alt='Gallery Photo'
                  layout='fill'
                  objectFit='cover'
                  className='transition-all duration-500 group-hover:brightness-110'
                />
                <div className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
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
                        <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this photo.
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
          <p>No gallery photos uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
