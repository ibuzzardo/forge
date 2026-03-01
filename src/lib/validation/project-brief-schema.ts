import { z } from "zod";

export const projectBriefSchema = z.object({
  contactName: z.string().min(2, "contactName must be at least 2 characters"),
  email: z.string().email("email must be a valid email"),
  company: z.string().min(2, "company must be at least 2 characters"),
  projectName: z.string().min(2, "projectName must be at least 2 characters"),
  targetUsers: z.string().min(10, "targetUsers must be at least 10 characters"),
  goals: z.string().min(10, "goals must be at least 10 characters"),
  scope: z.string().min(10, "scope must be at least 10 characters"),
  constraints: z.string().min(5, "constraints must be at least 5 characters"),
  timeline: z.string().min(3, "timeline is required"),
  budgetRange: z.string().min(3, "budgetRange is required")
});

export const startPipelineSchema = z.object({
  projectId: z.string().min(1, "projectId is required")
});

export type ProjectBriefInput = z.infer<typeof projectBriefSchema>;
