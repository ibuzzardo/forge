export const designTokens = {
  colors: {
    primary: "#3B82F6",
    secondary: "#14B8A6",
    background: "#0B1020",
    foreground: "#E5E7EB",
    muted: "#1F2937",
    accent: "#8B5CF6",
    destructive: "#EF4444",
    chartStage1Light: "#3B82F6",
    chartStage2Light: "#14B8A6",
    chartStage3Light: "#8B5CF6",
    chartStage4Light: "#F59E0B",
    chartStage5Light: "#EC4899",
    chartStage6Light: "#22C55E",
    chartStage1Dark: "#60A5FA",
    chartStage2Dark: "#2DD4BF",
    chartStage3Dark: "#A78BFA",
    chartStage4Dark: "#FBBF24",
    chartStage5Dark: "#F472B6",
    chartStage6Dark: "#4ADE80"
  },
  typography: {
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
  },
  radius: {
    default: "rounded-xl",
    input: "rounded-lg",
    glass: "rounded-2xl"
  }
} as const;

export const componentClasses = {
  button:
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 bg-primary text-slate-50 hover:bg-primary/90",
  cardGlass:
    "rounded-2xl border border-white/20 bg-white/10 p-4 md:p-6 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/10",
  input:
    "h-11 w-full rounded-lg border border-slate-600/70 bg-slate-900/70 px-3 text-sm text-slate-100 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60",
  textarea:
    "min-h-[120px] w-full rounded-lg border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:border-primary/60",
  select:
    "h-11 w-full rounded-lg border border-slate-600/70 bg-slate-900/70 px-3 text-sm text-slate-100 transition-colors hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60",
  stepProgress:
    "flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-300 [&_.step-node]:flex [&_.step-node]:h-8 [&_.step-node]:w-8 [&_.step-node]:items-center [&_.step-node]:justify-center [&_.step-node]:rounded-full [&_.step-node]:border [&_.step-node]:transition-all [&_.step-node.active]:border-primary [&_.step-node.active]:bg-primary [&_.step-node.active]:text-white [&_.step-node.done]:border-secondary [&_.step-node.done]:bg-secondary [&_.step-node.done]:text-white [&_.step-line]:h-0.5 [&_.step-line]:flex-1 [&_.step-line]:bg-slate-300",
  pipelineStageCard:
    "relative overflow-hidden rounded-xl border border-slate-300/30 bg-white/60 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg data-[status=active]:border-primary/70 data-[status=active]:shadow-[0_0_0_1px_rgba(59,130,246,0.35)] data-[status=complete]:border-secondary/70 data-[status=failed]:border-destructive/70",
  progressBar:
    "h-2 w-full overflow-hidden rounded-full bg-slate-200/80 [&_[data-slot=indicator]]:h-full [&_[data-slot=indicator]]:bg-gradient-to-r [&_[data-slot=indicator]]:from-primary [&_[data-slot=indicator]]:to-accent [&_[data-slot=indicator]]:transition-all [&_[data-slot=indicator]]:duration-500",
  logFeed:
    "rounded-xl border border-slate-300/30 bg-slate-950/90 p-3 md:p-4 text-xs font-mono leading-5 text-slate-100 shadow-inner max-h-[420px] overflow-y-auto",
  statCard:
    "rounded-xl border border-slate-300/30 bg-white/70 p-4 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-white/80",
  dialog:
    "rounded-2xl border border-white/20 bg-white/85 p-6 shadow-2xl backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200"
} as const;
