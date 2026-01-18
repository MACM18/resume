"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadFavicon,
  deleteFavicon,
} from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Loader2, FileUp, Image as ImageIcon } from "lucide-react";
import { useSupabase } from "@/components/providers/AuthProvider";
import Image from "next/image";

export function FaviconManager() {
  const queryClient = useQueryClient();
  const { session } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
    enabled: !!session,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (faviconUrl: string | null) =>
      updateCurrentUserProfile({ favicon_url: faviconUrl }),
    onSuccess: () => {
      toast.success("Favicon updated!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update favicon";
      toast.error(message);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!session?.user.id) throw new Error("Not authenticated.");
      if (profile?.favicon_url === imageUrl) {
        await updateCurrentUserProfile({ favicon_url: null });
      }
      return deleteFavicon(imageUrl);
    },
    onSuccess: () => {
      toast.success("Favicon deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete favicon";
      toast.error(message);
    },
  });

  // Helper: resize image file using a safer approach
  const resizeImageFile = async (file: File, size: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image(); // Use new Image() constructor
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not found");

          const { width: iw, height: ih } = img;
          const aspect = iw / ih;
          let sx = 0, sy = 0, sWidth = iw, sHeight = ih;

          if (aspect > 1) {
            sWidth = ih;
            sx = (iw - ih) / 2;
          } else if (aspect < 1) {
            sHeight = iw;
            sy = (ih - iw) / 2;
          }

          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url); // Clean up immediately after use
              if (!blob) return reject(new Error("Blob creation failed"));
              
              const resizedFile = new File(
                [blob],
                `${file.name.replace(/\.[^/.]+$/, "")}-favicon.png`,
                { type: "image/png" }
              );
              resolve(resizedFile);
            },
            "image/png",
            0.9
          );
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      // Security Note: Assigning a blob URL is generally safe, 
      // but ensure 'url' is never user-provided text.
      img.src = url;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user.id) return;

    const allowedTypes = ["image/png", "image/x-icon", "image/vnd.microsoft.icon"];
    const isIcoByName = file.name.toLowerCase().endsWith(".ico");

    if (!allowedTypes.includes(file.type) && !isIcoByName) {
      toast.error("Invalid file type. Please upload a PNG or ICO file.");
      return;
    }

    setIsUploading(true);
    try {
      let fileToUpload: File = file;
      const isIco = isIcoByName || file.type.includes("icon");

      if (!isIco) {
        fileToUpload = await resizeImageFile(file, 64);
      }

      const publicUrl = await uploadFavicon(fileToUpload);
      updateProfileMutation.mutate(publicUrl);
    } catch (error) {
      toast.error("Failed to upload favicon.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProfile) return <Skeleton className='h-24 w-full' />;

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-primary'>Site Icon (Favicon)</h2>
      <p className='text-foreground/70'>
        Upload a favicon for your site. Accepted formats: .png, .ico
      </p>

      {profile?.favicon_url && (
        <div className='flex flex-col sm:flex-row items-center gap-4 p-3 border rounded-lg bg-glass-bg/10'>
          <div className='relative w-12 h-12 rounded-md overflow-hidden border shrink-0'>
            <Image
              src={profile.favicon_url}
              alt='Current Favicon'
              fill
              className="object-contain"
            />
          </div>
          <div className='flex-1'>
            <p className='font-medium'>Currently Active</p>
            <p className='text-sm text-foreground/70 truncate'>
              {profile.favicon_url.split("/").pop()}
            </p>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => deleteImageMutation.mutate(profile.favicon_url as string)}
              disabled={deleteImageMutation.isPending}
              className='mt-2 text-destructive hover:bg-destructive/10'
            >
              {deleteImageMutation.isPending ? "Clearing..." : "Clear Favicon"}
            </Button>
          </div>
        </div>
      )}

      <div className='flex items-center gap-4'>
        <Button asChild variant='outline' disabled={isUploading}>
          <label htmlFor='favicon-upload' className='cursor-pointer'>
            {isUploading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <FileUp className='mr-2 h-4 w-4' />
            )}
            {isUploading ? "Uploading..." : "Upload Favicon (.png/.ico)"}
          </label>
        </Button>
        <input
          id='favicon-upload'
          type='file'
          accept='.png,.ico'
          className='hidden'
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>

      {!profile?.favicon_url && !isUploading && (
        <div className='text-center text-foreground/60 p-6 border rounded-lg bg-glass-bg/10'>
          <ImageIcon size={28} className='mx-auto mb-2 text-foreground/40' />
          <p>No favicon set yet.</p>
        </div>
      )}
    </div>
  );
}