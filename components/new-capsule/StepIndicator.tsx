export default function StepIndicator({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div className="flex gap-2 justify-center mb-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${
            i < step ? "bg-accent" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}
