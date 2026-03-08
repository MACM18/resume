"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  uploadGalleryImage,
  getGalleryImages,
  deleteGalleryImage,
  updateGalleryImage,
  getGalleryAlbums,
  GalleryImage,
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
import { AlbumManagementPanel } from "@/components/admin/AlbumManagementPanel";

const MAX_IMAGES = 100;

export function GalleryManager() {
  const { session } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [albumInput, setAlbumInput] = useState("");
  const [albums, setAlbums] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | "All">("All");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const {
    data: images,
    isLoading: isLoadingImages,
    error: imagesError,
    refetch: refetchImages,
  } = useQuery<GalleryImage[], Error>({
    queryKey: ["galleryImages", session?.user.id],
    queryFn: () => getGalleryImages(),
    enabled: !!session?.user.id,
  });

  // log / toast manually since useQuery typings reject onError in this version
  useEffect(() => {
    if (imagesError) {
      console.error("gallery images query error", imagesError);
      toast.error("Failed to load gallery images");
    }
  }, [imagesError]);

  const albumsQuery = useQuery<string[], Error>({
    queryKey: ["galleryAlbums", session?.user.id],
    queryFn: () => getGalleryAlbums(),
    enabled: !!session?.user.id,
  });

  // keep albums state in sync when query completes
  useEffect(() => {
    if (albumsQuery.data) {
      setAlbums(albumsQuery.data);
    }
  }, [albumsQuery.data]);

  const toggleSelectMode = () => {
    if (isSelectMode) {
      setSelectedImages([]);
    }
    setIsSelectMode(!isSelectMode);
  };

  const updateGalleryImageMutation = useMutation({
    mutationFn: async (vars: { id: string; albumName: string | null }) => {
      return updateGalleryImage(vars.id, vars.albumName);
    },
    onSuccess: () => {
      toast.success("Image updated successfully!");
      refetchImages();
      albumsQuery.refetch();
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to update image: ${error.message}`);
      } else {
        toast.error("Failed to update image.");
      }
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return deleteGalleryImage(imageId);
    },
    onSuccess: () => {
      toast.success("Image deleted successfully!");
      refetchImages();
      albumsQuery.refetch();
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
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !session?.user.id) return;

    // Validate all files
    const validFormats = ["image/jpeg", "image/png", "image/webp"];
    const invalidFiles = files.filter((f) => !validFormats.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error(
        `${invalidFiles.length} file(s) have invalid type. Please use JPG, PNG, or WEBP.`,
      );
      return;
    }

    const totalWillBe = (images?.length || 0) + files.length;
    if (totalWillBe > MAX_IMAGES) {
      toast.error(
        `You can only store ${MAX_IMAGES} images total. Uploading ${files.length} files would exceed the limit.`,
      );
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const file of files) {
        try {
          await uploadGalleryImage(file, albumInput || undefined);
          successCount++;
        } catch (error) {
          failureCount++;
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(
          `Uploaded ${successCount} photo${successCount > 1 ? "s" : ""}${
            failureCount > 0 ? ` (${failureCount} failed)` : ""
          }`,
        );
        setAlbumInput("");
        refetchImages();
        albumsQuery.refetch();
      }
      if (failureCount > 0 && successCount === 0) {
        toast.error(`Failed to upload ${failureCount} photo(s)`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload images.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  if (isLoadingImages) {
    return <Skeleton className='h-64 w-full' />;
  }

  if (imagesError) {
    // display a single error message and log it for debugging
    console.error("GalleryManager fetch error", imagesError);
    return (
      <div className='text-center text-destructive p-8'>
        Unable to load gallery photos. Please make sure you are logged in and
        try again.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-primary'>Gallery Photos</h2>
        <p className='text-foreground/70 mt-2'>
          Upload and manage photos for your public gallery. You can store up to{" "}
          {MAX_IMAGES} images.
          <br />
          <a
            href='/gallery'
            target='_blank'
            rel='noreferrer'
            className='text-primary underline'
          >
            View public gallery ↗
          </a>
        </p>
      </div>

      {/* Image Upload Section */}
      <div className='border border-foreground/10 rounded-xl bg-background/50 backdrop-blur-sm p-6 space-y-4'>
        <div className='flex items-center gap-4'>
          <Button
            asChild
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
                : `Upload Photos (${images?.length || 0}/${MAX_IMAGES})`}
            </label>
          </Button>
          <input
            id='gallery-image-upload'
            type='file'
            accept='.jpg,.jpeg,.png,.webp'
            multiple
            className='hidden'
            onChange={handleFileUpload}
            disabled={isUploading || (images && images.length >= MAX_IMAGES)}
          />
          {images && images.length >= MAX_IMAGES && (
            <p className='text-sm text-destructive'>Maximum images reached.</p>
          )}
        </div>

        {/* Album Input */}
        <div className='flex items-center gap-4'>
          <input
            type='text'
            placeholder='Album name (optional)'
            value={albumInput}
            onChange={(e) => setAlbumInput(e.target.value)}
            list='album-list'
            className='px-3 py-2 border rounded-md flex-1 max-w-sm'
          />
          <datalist id='album-list'>
            {albums.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          <p className='text-xs text-foreground/60'>
            Photos uploaded to album: <strong>{albumInput || "None"}</strong>
          </p>
        </div>
      </div>

      {/* Main Content: Album Panel + Photos Grid */}
      {images && images.length > 0 && (
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Left Sidebar: Album Management */}
          <div className='lg:col-span-1'>
            <AlbumManagementPanel
              albums={albums}
              selectedAlbum={selectedAlbum}
              onSelectAlbum={setSelectedAlbum}
              onCreateAlbum={(name) => {
                setAlbumInput(name);
                toast.success(`Album "${name}" ready for uploads`);
              }}
              selectedPhotos={selectedImages}
              images={images}
              onRefresh={() => {
                refetchImages();
                albumsQuery.refetch();
              }}
            />
          </div>

          {/* Right Content: Photo Grid */}
          <div className='lg:col-span-3 space-y-4'>
            {/* Toolbar with Select Mode Toggle */}
            <div className='flex items-center justify-between bg-background/50 backdrop-blur-sm border border-foreground/10 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <p className='text-sm font-medium'>
                  {selectedAlbum === "All"
                    ? "All Photos"
                    : selectedAlbum === "No Album"
                      ? "Photos without album"
                      : `Album: ${selectedAlbum}`}
                </p>
                <p className='text-xs text-foreground/60'>
                  (
                  {images.filter((img) =>
                    selectedAlbum === "All"
                      ? true
                      : selectedAlbum === "No Album"
                        ? !img.albumName
                        : img.albumName === selectedAlbum,
                  ).length}
                  )
                </p>
              </div>
              <Button
                size='sm'
                variant={isSelectMode ? "default" : "outline"}
                onClick={toggleSelectMode}
              >
                {isSelectMode
                  ? `${selectedImages.length} Selected - Done`
                  : "Select Photos"}
              </Button>
            </div>

            {/* Photo Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
              {images
                .filter((img) =>
                  selectedAlbum === "All"
                    ? true
                    : selectedAlbum === "No Album"
                      ? !img.albumName
                      : img.albumName === selectedAlbum,
                )
                .map((img) => (
                  <div
                    key={img.id}
                    className={`relative group aspect-square rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                      isSelectMode &&
                      selectedImages.includes(img.id)
                        ? "border-primary bg-primary/10"
                        : "border-glass-border/30 hover:border-primary/50"
                    }`}
                    onClick={() => {
                      if (isSelectMode) {
                        if (selectedImages.includes(img.id)) {
                          setSelectedImages((prev) =>
                            prev.filter((id) => id !== img.id),
                          );
                        } else {
                          setSelectedImages((prev) => [
                            ...prev,
                            img.id,
                          ]);
                        }
                      }
                    }}
                  >
                    <Image
                      src={img.url}
                      alt='Gallery Photo'
                      layout='fill'
                      objectFit='cover'
                      className='transition-all duration-500 group-hover:brightness-110'
                    />
                    {isSelectMode && (
                      <div className='absolute top-2 right-2 z-10'>
                        <div
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedImages.includes(
                              img.id,
                            )
                              ? "bg-primary border-primary"
                              : "border-white/70"
                          }`}
                        >
                          {selectedImages.includes(
                            img.id,
                          ) && (
                            <span className='text-white text-xs'>✓</span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className='absolute top-2 left-2 bg-black/60 text-xs text-white px-2 py-1 rounded'>
                      {img.albumName || "No Album"}
                    </div>
                    <div className='absolute bottom-2 right-2 bg-black/60 text-xs text-white px-2 py-1 rounded'>
                      {new Date(img.createdAt).toLocaleDateString()}
                    </div>
                    {!isSelectMode && (
                      <div className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              const newAlbum = prompt(
                                "Enter new album name (empty for none):",
                                img.albumName || "",
                              );
                              if (newAlbum !== null) {
                                updateGalleryImageMutation.mutate({
                                  id: img.id,
                                  albumName: newAlbum || null,
                                });
                              }
                            }}
                            disabled={
                              updateGalleryImageMutation.isPending
                            }
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='destructive'
                                size='sm'
                                disabled={
                                  deleteImageMutation.isPending
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Trash size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Photo?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                  This will permanently delete
                                  this photo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteImageMutation.mutate(
                                      img.id,
                                    )
                                  }
                                  className='bg-destructive hover:bg-destructive/90'
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {images && images.length === 0 && (
        <div className='text-center text-foreground/60 p-8 border rounded-lg bg-glass-bg/10'>
          <ImageIcon size={48} className='mx-auto mb-4 text-foreground/40' />
          <p>No gallery photos uploaded yet.</p>
          <p className='mt-2 text-sm'>
            Use the uploader above to add your first photo.
          </p>
        </div>
      )}
    </div>
  );
}
