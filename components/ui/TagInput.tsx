"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

const MAX_TAGS = 5;

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

/** Chip-style add/remove tag input, capped at MAX_TAGS (matches capsules_tags_max5 in schema.sql). */
export default function TagInput({ value, onChange, suggestions = [] }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const atLimit = value.length >= MAX_TAGS;
  const visibleSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(draft.trim().toLowerCase())
  );

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (atLimit) {
      toast(`Up to ${MAX_TAGS} tags per capsule`, { variant: "info" });
      return;
    }
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div role="list" aria-label="Tags" className="flex gap-2 flex-wrap mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            role="listitem"
            className="inline-flex items-center gap-1 text-caption font-bold px-3 py-1.5 rounded-full bg-tint text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="-mr-0.5"
            >
              <Icon as={X} size="sm" />
            </button>
          </span>
        ))}
      </div>

      {!atLimit && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(draft);
              }
            }}
            placeholder="Add a tag and press Enter"
            className="w-full bg-surface border-2 border-line-strong rounded-xl px-3 py-2.5 text-body text-ink focus:border-accent"
          />
          {draft && visibleSuggestions.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {visibleSuggestions.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTag(s)}
                  className="text-caption font-bold px-2.5 py-1 rounded-full border border-line text-ink-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
