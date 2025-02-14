import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { filterByPerson } from "./image-gallery-actions";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";

interface ImageGalleryProps {
  onDragStart: (e: React.DragEvent<HTMLImageElement>, src: string) => void;
  images: string[];
  galleryName: string;
}

export function ImageGallery({
  onDragStart,
  images,
  galleryName,
}: ImageGalleryProps) {
  const [availableImages, setAvailableImages] = useState<string[]>(images);
  const [state, setState] = useState<"loading" | "idle">("idle");

  async function searchPerson(personName: string) {
    if (personName === "all") {
      setAvailableImages(images);
      return;
    }

    setState("loading");
    const foundImages = await filterByPerson({
      galleryName,
      personName,
    });
    setAvailableImages(foundImages);
    setState("idle");
  }

  return (
    <ScrollArea className="w-64 border-r p-4">
      <h2 className="text-lg font-semibold mb-4">Image Gallery</h2>
      <nav className="mb-4">
        <Select onValueChange={searchPerson}>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar formando" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="andre.JPG">Andre</SelectItem>
          </SelectContent>
        </Select>
      </nav>
      <div className="grid grid-cols-2 gap-4">
        {state === "loading" ? (
          <>
            <div className="col-span-2 flex items-center justify-center mt-8">
              <Loader2Icon className="w-8 h-8 animate-spin stroke-muted-foreground" />
            </div>
          </>
        ) : null}
        {state === "idle"
          ? availableImages.map((src, index) => (
              <img
                key={index}
                src={src || "/placeholder.svg"}
                alt={`Gallery image ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg border cursor-move hover:opacity-80 transition-opacity"
                draggable
                onDragStart={(e) => onDragStart(e, src)}
              />
            ))
          : null}
      </div>
    </ScrollArea>
  );
}
