interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-colors ${
        active
          ? "bg-sky-deep text-white border-sky-deep"
          : "bg-white text-ink-soft border-line"
      }`}
    >
      {label}
    </button>
  );
}
