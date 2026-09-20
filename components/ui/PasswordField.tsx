"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Icon from "./Icon";

interface PasswordFieldProps {
  id: string;
  name: string;
  /** Accessible name — the visible label is the placeholder, like the other auth inputs. */
  label: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Inline error shown under the field, e.g. a password-mismatch message. */
  error?: string;
}

/**
 * Same look as the plain email/text inputs on the auth screens (bg-cream
 * border-2 border-line rounded-xl ...), plus a show/hide toggle. Used for
 * every password field so the eye icon behaves identically everywhere.
 */
export default function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  onBlur,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="relative">
        <Icon
          as={Lock}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
        />
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          name={name}
          autoComplete={autoComplete}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full bg-cream border-2 border-line rounded-xl pl-9 pr-11 py-3 text-lead text-ink focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
        >
          <Icon as={visible ? EyeOff : Eye} />
        </button>
      </div>
      {error && (
        <p id={errorId} className="text-caption text-coral mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}
