"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { validatePhoto } from "@/lib/photos";

interface PhotoDropProps {
  onChange?: (file: File | null) => void;
}

export default function PhotoDrop({ onChange }: PhotoDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Release the blob URL when it's replaced or the component goes away.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // This only previews. The file itself is uploaded when the capsule is
  // sealed (see handleSeal in app/new-capsule/page.tsx).
  function handleFile(file: File | null) {
    if (!file) {
      onChange?.(null);
      setPreviewUrl(null);
      toast("Photo removed", { variant: "info" });
      return;
    }
    const problem = validatePhoto(file);
    if (problem) {
      toast(problem, { variant: "error" });
      return;
    }
    onChange?.(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast("Photo added");
  }

  if (previewUrl) {
    return (
      <div className="relative h-28 rounded-2xl overflow-hidden border-2 border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Selected photo"
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => handleFile(null)}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-surface/90 flex items-center justify-center"
          aria-label="Remove photo"
        >
          <Icon as={X} size="sm" className="text-ink" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full h-16 rounded-2xl border-2 border-dashed border-accent flex flex-col items-center justify-center gap-1 text-accent text-body font-bold bg-[repeating-linear-gradient(45deg,rgb(var(--tint))_0,rgb(var(--tint))_8px,rgb(var(--surface))_8px,rgb(var(--surface))_16px)]"
      >
        <Icon as={Camera} size="md" />
        <span>Tap to add a photo</span>
      </button>
      {/* Sibling, not a child: an <input> inside a <button> is invalid HTML.
          It stays hidden; the button above opens it. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </>
  );
}
