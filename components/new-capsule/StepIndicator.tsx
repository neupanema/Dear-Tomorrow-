export default function StepIndicator({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div
      role="progressbar"
      aria-label="Capsule creation progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of ${total}`}
      className="flex gap-2 justify-center mb-4"
    >
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
