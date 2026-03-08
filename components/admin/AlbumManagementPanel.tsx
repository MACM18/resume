"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateGalleryImage } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Plus, FolderPlus } from "lucide-react";
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

interface AlbumManagementPanelProps {
  albums: string[];
  selectedAlbum: string | "All";
  onSelectAlbum: (album: string | "All") => void;
  onCreateAlbum: (name: string) => void;
  selectedPhotos: string[];
  images: { id: string; albumName?: string | null }[];
  onRefresh: () => void;
}

export function AlbumManagementPanel({
  albums,
  selectedAlbum,
  onSelectAlbum,
  onCreateAlbum,
  selectedPhotos,
  images,
  onRefresh,
}: AlbumManagementPanelProps) {
  const [newAlbumName, setNewAlbumName] = useState("");
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);

  // Count photos per album
  const albumCounts: Record<string, number> = { "No Album": 0 };
  albums.forEach((a) => {
    albumCounts[a] = 0;
  });

  images?.forEach((img) => {
    const key = img.albumName || "No Album";
    albumCounts[key] = (albumCounts[key] || 0) + 1;
  });

  const updateGalleryImageMutation = useMutation({
    mutationFn: async (vars: { id: string; albumName: string | null }) => {
      return updateGalleryImage(vars.id, vars.albumName);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddToAlbum = async (albumName: string | null) => {
    if (selectedPhotos.length === 0) {
      toast.error("No photos selected");
      return;
    }

    try {
      await Promise.all(
        selectedPhotos.map((id) =>
          updateGalleryImageMutation.mutateAsync({
            id,
            albumName: albumName,
          }),
        ),
      );
      const album = albumName || "No Album";
      toast.success(`Moved ${selectedPhotos.length} photo(s) to ${album}`);
      onRefresh();
    } catch {
      toast.error("Failed to move photos");
    }
  };

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) {
      toast.error("Album name cannot be empty");
      return;
    }
    onCreateAlbum(newAlbumName);
    setNewAlbumName("");
    setShowCreateAlbum(false);
    toast.success(`Album "${newAlbumName}" created`);
  };

  const refetch = onRefresh;

  return (
    <div className='border border-foreground/10 rounded-xl bg-background/50 backdrop-blur-sm p-6'>
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold'>Albums</h3>
          <AlertDialog open={showCreateAlbum} onOpenChange={setShowCreateAlbum}>
            <AlertDialogTrigger asChild>
              <Button size='sm' variant='ghost'>
                <FolderPlus size={16} className='mr-2' />
                New
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Album</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter a name for your new album.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <input
                type='text'
                placeholder='Album name'
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                className='px-3 py-2 border rounded-md w-full'
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateAlbum();
                  }
                }}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreateAlbum}>
                  Create
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Albums List */}
        <div className='space-y-2'>
          <button
            onClick={() => onSelectAlbum("All")}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 flex items-center justify-between ${
              selectedAlbum === "All"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-background/70"
            }`}
          >
            <span className='font-medium'>All Photos</span>
            <span className='text-xs'>{images?.length || 0}</span>
          </button>

          <button
            onClick={() => onSelectAlbum("No Album")}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 flex items-center justify-between ${
              selectedAlbum === "No Album"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-background/70"
            }`}
          >
            <span className='font-medium'>No Album</span>
            <span className='text-xs'>{albumCounts["No Album"] || 0}</span>
          </button>

          {albums.map((album) => (
            <button
              key={album}
              onClick={() => onSelectAlbum(album)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 flex items-center justify-between ${
                selectedAlbum === album
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-background/70"
              }`}
            >
              <span className='font-medium truncate'>{album}</span>
              <span className='text-xs flex-shrink-0 ml-2'>
                {albumCounts[album] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        {selectedPhotos.length > 0 && (
          <div className='border-t border-foreground/10 pt-4'>
            <p className='text-xs text-foreground/60 mb-3'>
              {selectedPhotos.length} photo(s) selected
            </p>
            <div className='space-y-2'>
              <Button
                size='sm'
                className='w-full'
                onClick={() => handleAddToAlbum(null)}
              >
                <Plus size={14} className='mr-2' />
                Move to No Album
              </Button>
              {albums.map((album) => (
                <Button
                  key={album}
                  size='sm'
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAddToAlbum(album)}
                >
                  <Plus size={14} className='mr-2' />
                  Move to {album}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
