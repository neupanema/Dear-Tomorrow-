"use client";

import { Camera, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { FREE_PHOTO_LIMIT, validatePhoto } from "@/lib/photos";

interface PhotoDropProps {
  value: File[];
  onChange: (files: File[]) => void;
}

/**
 * Up to FREE_PHOTO_LIMIT photos, shown as a row of square tiles. Picking more
 * than that (either by re-tapping at the cap or selecting a batch that goes
 * over it) doesn't upload the extra ones — it explains why, once, and stops.
 */
export default function PhotoDrop({ value, onChange }: PhotoDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const atLimit = value.length >= FREE_PHOTO_LIMIT;

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const room = FREE_PHOTO_LIMIT - value.length;
    const picked = Array.from(files);
    const accepted: File[] = [];
    for (const file of picked) {
      if (accepted.length >= room) break;
      const problem = validatePhoto(file);
      if (problem) {
        toast(problem, { variant: "error" });
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) onChange([...value, ...accepted]);

    if (picked.length > room || (room === 0 && picked.length > 0)) {
      toast(`Up to ${FREE_PHOTO_LIMIT} photos for now — more is coming soon`, { variant: "info" });
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div role="list" aria-label="Photos" className="flex gap-2 flex-wrap">
        <AnimatePresence initial={false}>
          {value.map((file, i) => (
            <PhotoTile key={`${file.name}-${file.lastModified}-${i}`} file={file} onRemove={() => removeAt(i)} />
          ))}
        </AnimatePresence>

        {atLimit ? (
          <button
            type="button"
            onClick={() =>
              toast(`Up to ${FREE_PHOTO_LIMIT} photos for now — more is coming soon`, { variant: "info" })
            }
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-line-strong flex flex-col items-center justify-center gap-1 text-ink-soft text-micro font-bold text-center px-1"
          >
            <Icon as={Sparkles} size="sm" />
            Coming soon
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Add a photo"
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-accent flex flex-col items-center justify-center gap-1 text-accent text-micro font-bold bg-[repeating-linear-gradient(45deg,rgb(var(--tint))_0,rgb(var(--tint))_8px,rgb(var(--surface))_8px,rgb(var(--surface))_16px)]"
          >
            <Icon as={Camera} size="md" />
            Add
          </button>
        )}
      </div>

      <p className="text-caption text-ink-soft mt-2">
        {value.length}/{FREE_PHOTO_LIMIT} photos
        {value.length >= FREE_PHOTO_LIMIT && " · upgrade for more, coming soon"}
      </p>

      {/* Sibling, not a child: an <input> inside a <button> is invalid HTML. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = ""; // lets picking the same file again re-fire onChange
        }}
      />
    </div>
  );
}

function PhotoTile({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.18 }}
      role="listitem"
      className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-line bg-tint"
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-surface/90 flex items-center justify-center"
      >
        <Icon as={X} size="sm" className="text-ink" />
      </button>
    </motion.div>
  );
}
