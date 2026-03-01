import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive";
}

export function Badge({ children, variant = "default" }: BadgeProps): JSX.Element {
  const styles =
    variant === "secondary"
      ? "bg-secondary/20 text-secondary"
      : variant === "destructive"
        ? "bg-destructive/20 text-destructive"
        : "bg-primary/20 text-primary";

  return <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", styles)}>{children}</span>;
}
