import { z } from "zod";

export const userSchema = z.object({
  name: z.string(),
  phoneNo: z.number(),
  id: z.string(),
  city: z.string(),
  role: z.enum(["ADMIN", "RETAILER", "CUSTOMER", "DEALER"]),
});

export type User = z.infer<typeof userSchema>;
