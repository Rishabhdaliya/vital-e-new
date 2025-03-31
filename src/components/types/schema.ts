import { any, z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  phoneNo: z.number(),
  city: z.string(),
  isVerified: z.boolean(),
  vouchers: z.array(z.string()).optional(),
  role: z.enum(["ADMIN", "RETAILER", "CUSTOMER", "DEALER"]),
});

export const voucherSchema = z.object({
  id: z.string(),
  batchNo: z.string(),
  productId: z.string(),
  claimedAt: z.string().optional(),
  claimedBy: z.string().optional(),
  productName: z.string(),
  createdAt: z.any(),
  status: z.enum(["CLAIMED", "UNCLAIMED", "EXPIRED"]),
});

export const VoucherTableSchema = z.object({
  vouchers: z.array(voucherSchema),
});

export type User = z.infer<typeof userSchema>;
export type Voucher = z.infer<typeof voucherSchema>;
export type VoucherTableData = z.infer<typeof VoucherTableSchema>;
