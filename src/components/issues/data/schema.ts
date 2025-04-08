import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  phoneNo: z.number(),
  city: z.string(),
  isVerified: z.boolean(),
  vouchers: z.array(z.string()).optional(),
  registeredBy: z.string().optional(),
  role: z.enum(["ADMIN", "RETAILER", "CUSTOMER", "DEALER"]),
});

export type Users = z.infer<typeof userSchema>;
