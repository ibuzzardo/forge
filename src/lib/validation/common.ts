import { z } from "zod";

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1, "projectId is required")
});

export const lastEventIdSchema = z.object({
  lastEventId: z.coerce.number().int().nonnegative().optional()
});
