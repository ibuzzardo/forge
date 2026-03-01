import { ProjectBriefForm } from "@/components/project-brief/project-brief-form";
import { StepProgress } from "@/components/project-brief/step-progress";

export default function HomePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0b1020_45%,_#05070f_100%)] text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h1 className="text-2xl font-bold tracking-tight">Start Your Forge Build</h1>
            <p className="mt-2 text-sm text-slate-300">Tell us what to build in a guided brief.</p>
            <div className="mt-6">
              <StepProgress currentStep={1} totalSteps={3} />
            </div>
          </section>
          <section className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[0_10px_40px_-12px_rgba(2,6,23,0.85)] backdrop-blur-xl md:p-6">
            <ProjectBriefForm />
          </section>
        </div>
      </main>
    </div>
  );
}
