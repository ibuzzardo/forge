import { cn } from "@/lib/utils";
import { componentClasses } from "@/lib/constants/design-tokens";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps): JSX.Element {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cn(componentClasses.progressBar, className)}>
      <div data-slot="indicator" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
