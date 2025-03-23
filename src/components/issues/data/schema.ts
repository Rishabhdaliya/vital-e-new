import { z } from "zod";

export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  phoneNo: z.number(),
  city: z.string(),
  role: z.enum(["ADMIN", "RETAILER", "CUSTOMER", "DEALER"]),
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
