"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";

interface PhotoDropProps {
  onChange?: (file: File | null) => void;
}

export default function PhotoDrop({ onChange }: PhotoDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFile(file: File | null) {
    onChange?.(file);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    // TODO: once the backend exists, upload `file` to storage here instead
    // of (or in addition to) making a local preview.
    setPreviewUrl(URL.createObjectURL(file));
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
          onClick={() => handleFile(null)}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center"
          aria-label="Remove photo"
        >
          <X size={14} className="text-ink" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="w-full h-16 rounded-2xl border-2 border-dashed border-sky flex flex-col items-center justify-center gap-1 text-sky-deep text-xs font-bold bg-[repeating-linear-gradient(45deg,#EAF6FF,#EAF6FF_8px,#F7FBFF_8px,#F7FBFF_16px)]"
    >
      <Camera size={18} />
      <span>Tap to add a photo</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </button>
  );
}
