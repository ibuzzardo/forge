import * as React from "react";
import { componentClasses } from "@/lib/constants/design-tokens";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(componentClasses.input, className)} {...props} />;
});
