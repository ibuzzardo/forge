import * as React from "react";
import { componentClasses } from "@/lib/constants/design-tokens";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(componentClasses.select, className)} {...props}>
      {children}
    </select>
  );
});
