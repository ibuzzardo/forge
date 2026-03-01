"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { projectBriefSchema, type ProjectBriefInput } from "@/lib/validation/project-brief-schema";
import { createProject } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const steps = ["Contact", "Project", "Review"];

export function ProjectBriefForm(): JSX.Element {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const form = useForm<ProjectBriefInput>({
    resolver: zodResolver(projectBriefSchema),
    defaultValues: {
      contactName: "",
      email: "",
      company: "",
      projectName: "",
      targetUsers: "",
      goals: "",
      scope: "",
      constraints: "",
      timeline: "2-4 weeks",
      budgetRange: "$25k-$50k"
    }
  });

  const onSubmit = async (values: ProjectBriefInput): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError("");
      const project = await createProject(values);
      router.push(`/tracker/${project.id}`);
    } catch (submitError) {
      setError("Unable to submit brief. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="text-sm text-slate-300">Step {step} of {steps.length}: {steps[step - 1]}</div>
      {step === 1 ? (
        <>
          <Input placeholder="Contact name" {...form.register("contactName")} />
          <Input type="email" placeholder="Email" {...form.register("email")} />
          <Input placeholder="Company" {...form.register("company")} />
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Input placeholder="Project name" {...form.register("projectName")} />
          <Textarea placeholder="Target users" {...form.register("targetUsers")} />
          <Textarea placeholder="Goals" {...form.register("goals")} />
          <Textarea placeholder="Scope" {...form.register("scope")} />
          <Textarea placeholder="Constraints" {...form.register("constraints")} />
          <Select {...form.register("timeline")}>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="1-2 months">1-2 months</option>
            <option value="3+ months">3+ months</option>
          </Select>
          <Select {...form.register("budgetRange")}>
            <option value="$10k-$25k">$10k-$25k</option>
            <option value="$25k-$50k">$25k-$50k</option>
            <option value="$50k+">$50k+</option>
          </Select>
        </>
      ) : null}
      {step === 3 ? (
        <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-slate-300">
          Review your brief and submit to start the build tracker.
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="button" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
          Back
        </Button>
        {step < steps.length ? (
          <Button type="button" onClick={() => setStep((current) => Math.min(steps.length, current + 1))}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Brief"}</Button>
        )}
      </div>
    </form>
  );
}
