import { LucideIcon } from "lucide-react";

interface MethodCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
}

export default function MethodCard({
  icon: Icon,
  title,
  subtitle,
  active,
  disabled,
  badge,
  onClick,
}: MethodCardProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`w-full text-left rounded-2xl p-3.5 mb-2.5 border-2 flex gap-3 items-start transition-colors ${
        active
          ? "border-sky-deep bg-[#EAF6FF]"
          : "border-line bg-white"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
          active ? "bg-coral" : "bg-sky-deep"
        } ${disabled ? "!bg-gray-300" : ""}`}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="font-bold text-xs text-ink flex items-center gap-1.5">
          {title}
          {badge && (
            <span className="text-[8px] font-extrabold bg-sun text-[#7a5300] px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </p>
        <p className="text-[10.5px] text-ink-soft mt-0.5 leading-snug">
          {subtitle}
        </p>
      </div>
    </button>
  );
}
