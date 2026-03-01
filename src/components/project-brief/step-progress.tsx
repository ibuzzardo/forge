import { componentClasses } from "@/lib/constants/design-tokens";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps): JSX.Element {
  return (
    <div className={componentClasses.stepProgress}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const state = step < currentStep ? "done" : step === currentStep ? "active" : "";
        return (
          <>
            <div key={`node-${step}`} className={cn("step-node", state)}>
              {step}
            </div>
            {step < totalSteps ? <div key={`line-${step}`} className="step-line" /> : null}
          </>
        );
      })}
    </div>
  );
}
