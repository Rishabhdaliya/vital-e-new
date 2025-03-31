import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, CheckCircle, Clock } from "lucide-react";

interface VoucherMetricsProps {
  data: {
    total: number;
    claimed: number;
    unclaimed: number;
  };
}

export default function VoucherMetrics({ data }: VoucherMetricsProps) {
  // Handle edge case where total is 0 to avoid division by zero
  const claimedPercentage =
    data.total > 0 ? ((data.claimed / data.total) * 100).toFixed(0) : "0";

  const unclaimedPercentage =
    data.total > 0 ? ((data.unclaimed / data.total) * 100).toFixed(0) : "0";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total}</div>
          <p className="text-xs text-muted-foreground">
            All vouchers available to this user
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Claimed Vouchers
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.claimed}</div>
          <p className="text-xs text-muted-foreground">
            {claimedPercentage}% of total vouchers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Unclaimed Vouchers
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.unclaimed}</div>
          <p className="text-xs text-muted-foreground">
            {unclaimedPercentage}% of total vouchers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
