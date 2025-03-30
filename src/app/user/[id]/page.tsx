import { Suspense } from "react";
import { notFound } from "next/navigation";
import UserProfileHeader from "@/components/profile/user-profile-header";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import VoucherTable from "@/components/profile/voucher-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Users } from "@/components/issues/data/schema";
import { Voucher } from "@/components/types/schema";

async function getUser(id: string) {
  // Fetch user data from your API
  const res = await fetch(`http://localhost:3000/api/users/${id}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function UserProfilePage({ params }: { params: any }) {
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
