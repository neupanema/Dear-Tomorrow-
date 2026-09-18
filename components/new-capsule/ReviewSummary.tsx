interface ReviewSummaryProps {
  message: string;
  hasPhoto: boolean;
  unlockLabel: string;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-line last:border-0 text-[11px]">
      <span className="text-ink-soft">{k}</span>
      <span className="text-ink font-bold text-right max-w-[65%] truncate">
        {v}
      </span>
    </div>
  );
}

export default function ReviewSummary({
  message,
  hasPhoto,
  unlockLabel,
}: ReviewSummaryProps) {
  return (
    <div className="card">
      <Row
        k="Message"
        v={message ? `"${message.slice(0, 28)}${message.length > 28 ? "..." : ""}"` : "—"}
      />
      <Row k="Photo" v={hasPhoto ? "1 attached" : "None"} />
      <Row k="Unlocks" v={unlockLabel} />
      <Row k="Visibility" v="Private" />
    </div>
  );
}
