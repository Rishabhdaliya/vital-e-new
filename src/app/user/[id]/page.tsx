import { Suspense } from "react";
import { notFound } from "next/navigation";
import UserProfileHeader from "@/components/profile/user-profile-header";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import VoucherTable from "@/components/profile/voucher-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Users } from "@/components/issues/data/schema";
import { Voucher } from "@/components/types/schema";

// Mock function to fetch voucher data - replace with your actual data fetching logic
async function getUserVouchers(userId: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // This would be your actual data fetching logic
  return {
    total: 12,
    claimed: 5,
    unclaimed: 7,
    vouchers: [
      { id: "V001", issueDate: "2023-10-15", status: "Claimed" },
      { id: "V002", issueDate: "2023-10-20", status: "Claimed" },
      { id: "V003", issueDate: "2023-11-01", status: "Not Claimed" },
      { id: "V004", issueDate: "2023-11-05", status: "Not Claimed" },
      { id: "V005", issueDate: "2023-11-10", status: "Claimed" },
      { id: "V006", issueDate: "2023-11-15", status: "Expired" },
      { id: "V007", issueDate: "2023-11-20", status: "Claimed" },
      { id: "V008", issueDate: "2023-11-25", status: "Not Claimed" },
      { id: "V009", issueDate: "2023-12-01", status: "Claimed" },
      { id: "V010", issueDate: "2023-12-05", status: "Not Claimed" },
      { id: "V011", issueDate: "2023-12-10", status: "Not Claimed" },
      { id: "V012", issueDate: "2023-12-15", status: "Not Claimed" },
    ],
  };
}

async function getUser(id: string) {
  // Fetch user data from your API
  const res = await fetch(`http://localhost:3000/api/users/${id}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { data } = await getUser(params.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="container max-w-[90vw] mt-18 mx-auto py-6 space-y-8">
      <UserProfileHeader user={data?.data} />

      <Separator className="my-8" />

      <Suspense fallback={<MetricsSkeleton />}>
        <VoucherMetrics data={data?.vouchers} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <VoucherTableWrapper vouchers={data?.vouchers} userId={data?.id} />
      </Suspense>
    </div>
  );
}

async function VoucherTableWrapper({
  vouchers,
  userId,
}: {
  vouchers: Voucher[];
  userId: string;
}) {
  return <VoucherTable vouchers={vouchers} />;
}

// Skeleton loaders
function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
