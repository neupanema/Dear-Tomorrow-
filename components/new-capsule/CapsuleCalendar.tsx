"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Icon from "@/components/ui/Icon";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

interface CapsuleCalendarProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

export default function CapsuleCalendar({
  value,
  onChange,
}: CapsuleCalendarProps) {
  const [viewDate, setViewDate] = useState(value ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  function isSelected(day: number) {
    return (
      value?.getFullYear() === year &&
      value?.getMonth() === month &&
      value?.getDate() === day
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <button onClick={() => changeMonth(-1)} aria-label="Previous month">
          <Icon as={ChevronLeft} size="sm" className="text-ink" />
        </button>
        <span className="font-bold text-xs text-ink">
          {viewDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button onClick={() => changeMonth(1)} aria-label="Next month">
          <Icon as={ChevronRight} size="sm" className="text-ink" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DOW.map((d, i) => (
          <div key={i} className="text-[9px] font-bold text-ink-soft pb-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => onChange(new Date(year, month, day))}
              className={`text-[11px] py-2 rounded-lg ${
                isSelected(day)
                  ? "bg-coral text-white font-bold"
                  : "text-ink hover:bg-line"
              }`}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
}
