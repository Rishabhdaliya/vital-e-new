"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector } from "react-redux";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateVoucherMetrics } from "@/lib/utils/utils";
import VoucherTable from "@/components/profile/voucher-table";
import { Separator } from "@/components/ui/separator";
import type { Voucher } from "@/components/types/schema";
import { fetchUserVouchers } from "@/lib/utils";

export default function MyVouchers() {
  const currentUser = useSelector((state: any) => state.users.currentUser);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use useEffect to fetch vouchers
  useEffect(() => {
    async function loadVouchers() {
      if (currentUser?.id) {
        try {
          setIsLoading(true);
          const fetchedVouchers = await fetchUserVouchers(
            currentUser.id,
            currentUser.vouchers || []
          );
          setVouchers(fetchedVouchers);
        } catch (error) {
          console.error("Error fetching vouchers:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadVouchers();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate metrics based on the fetched vouchers
  const metrics = calculateVoucherMetrics(vouchers);

  return (
    <div className="container max-w-full mt-15 py-10 px-4 md:px-6">
      <div className="space-y-4">
        {/* Voucher Metrics */}
        {isLoading ? (
          <MetricsSkeleton />
        ) : (
          <>
            <VoucherMetrics data={metrics} />
            <Separator />
            <VoucherTable vouchers={vouchers} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}

// Skeleton components
function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={`metric-skeleton-${i}`}
          className="h-32 w-full rounded-md"
        />
      ))}
    </div>
  );
}
