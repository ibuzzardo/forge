import * as React from "react";
import { componentClasses } from "@/lib/constants/design-tokens";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn(componentClasses.cardGlass, className)} {...props} />;
}
