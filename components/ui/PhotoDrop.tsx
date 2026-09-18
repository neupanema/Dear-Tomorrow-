"use client";

import { Camera, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { wait } from "@/lib/utils";

interface PhotoDropProps {
  onChange?: (file: File | null) => void;
}

export default function PhotoDrop({ onChange }: PhotoDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Release the blob URL when it's replaced or the component goes away.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFile(file: File | null) {
    onChange?.(file);
    if (!file) {
      setPreviewUrl(null);
      toast("Photo removed", { variant: "info" });
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    // TODO: once the backend exists, upload `file` to storage here instead
    // of (or in addition to) making a local preview. The wait() below only
    // stands in for that upload's latency.
    setUploading(true);
    await wait(700);
    setUploading(false);
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
        {uploading && (
          <div
            role="status"
            className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white text-body font-bold"
          >
            <Icon as={Loader2} className="animate-spin" />
            Adding photo...
          </div>
        )}
        <button
          type="button"
          onClick={() => handleFile(null)}
          disabled={uploading}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-surface/90 flex items-center justify-center disabled:opacity-0"
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
