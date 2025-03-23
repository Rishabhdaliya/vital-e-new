import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  phoneNo: z.number(),
  city: z.string(),
  role: z.enum(["ADMIN", "RETAILER", "CUSTOMER", "DEALER"]),
});

export type User = z.infer<typeof userSchema>;
