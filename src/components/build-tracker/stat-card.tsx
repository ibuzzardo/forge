import { componentClasses } from "@/lib/constants/design-tokens";

interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps): JSX.Element {
  return (
    <article className={componentClasses.statCard}>
      <p className="text-xs text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
