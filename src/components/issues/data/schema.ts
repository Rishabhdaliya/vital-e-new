import { z } from "zod";

export const taskSchema = z.object({
  ticket: z.string(),
  summary: z.string(),
  components: z.array(z.string()).optional(), // Optional, can be an empty array
  fixVersion: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  assignee: z.string(),
  reporter: z.string(),
  defectAging: z.number(),
  updateAging: z.number(),
  defectStatus: z.string().optional(),
  developmentManager: z.string().optional(),
  label: z.string().optional(),
  isNewIssue: z.boolean(),
});
export const defectStatusSchema = z.object({
  id: z.string(),
  poc: z.object({
    email: z.string().email(),
    name: z.string(),
  }),
  component: z.string(),
  supervisor: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  director: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  "work user vcg": z.string(),
  status: z.string(),
});

export const userSchema = z.object({
  name: z.string(),
  id: z.string(),
  isAvailable: z.boolean(),
  role: z.enum(["fe", "be", "lead"]), // Add role as an enum
});

export const configurationSchema = z.object({
  id: z.string(),
  autoSyncFreq: z.number(),
  defectAgingAmber: z.number(),
  defectAgingYellow: z.number(),
  defectStatusUpdateList: z.array(
    z.object({
      index: z.number(),
      field: z.string(),
    })
  ),
  defectUpdateAmber: z.number(),
  defectUpdateYellow: z.number(),
  label: z.string(),
  searchQuery: z.string(),
});

export type Task = z.infer<typeof taskSchema>;
export type DefectStatus = z.infer<typeof defectStatusSchema>;
export type Users = z.infer<typeof userSchema>;
export type Configuration = z.infer<typeof configurationSchema>;
