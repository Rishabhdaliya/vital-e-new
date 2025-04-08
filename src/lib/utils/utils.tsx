import { Voucher } from "@/components/types/schema";

// Calculate voucher metrics
export function calculateVoucherMetrics(vouchers: any[] = []) {
  const total = vouchers?.length || 0;
  const claimed = vouchers?.filter((v) => v.status === "CLAIMED").length || 0;
  const unclaimed = total - claimed;

  return {
    total,
    claimed,
    unclaimed,
  };
}
