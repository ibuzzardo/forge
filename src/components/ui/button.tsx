import * as React from "react";
import { componentClasses } from "@/lib/constants/design-tokens";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, ...props }, ref) {
  return <button ref={ref} className={cn(componentClasses.button, className)} {...props} />;
});
