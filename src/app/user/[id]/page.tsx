import { Suspense } from "react";
import { notFound } from "next/navigation";
import UserProfileHeader from "@/components/profile/user-profile-header";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import VoucherTable from "@/components/profile/voucher-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Define types inline to avoid import issues
interface User {
  id: string;
  name: string;
  phoneNo: string;
  city: string;
  isVerified: boolean;
  vouchers: string[];
  role: "CUSTOMER" | "RETAILER";
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

interface Voucher {
  id: string;
  batchNo: string;
  status: "CLAIMED" | "UNCLAIMED";
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  productId?: string;
  productName?: string;
}

// Fetch user data directly from Firestore
async function getUserData(id: string) {
  try {
    // Get user document
    const userDoc = await getDoc(doc(db, "users", id));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;

    // Get vouchers for this user
    const vouchersRef = collection(db, "vouchers");
    let userVouchers: Voucher[] = [];

    // If user has voucher IDs, fetch those vouchers
    if (
      userData.vouchers &&
      Array.isArray(userData.vouchers) &&
      userData.vouchers.length > 0
    ) {
      // Fetch each voucher by ID
      const voucherPromises = userData.vouchers.map(
        async (voucherId: string) => {
          const voucherDoc = await getDoc(doc(db, "vouchers", voucherId));
          if (voucherDoc.exists()) {
            return {
              id: voucherDoc.id,
              ...voucherDoc.data(),
            } as Voucher;
          }
          return null;
        }
      );

      userVouchers = (await Promise.all(voucherPromises)).filter(
        Boolean
      ) as Voucher[];
    } else {
      // If no voucher IDs, check for vouchers claimed by this user
      const voucherQuery = query(vouchersRef, where("claimedBy", "==", id));
      const voucherSnapshot = await getDocs(voucherQuery);

      voucherSnapshot.forEach((doc) => {
        userVouchers.push({
          id: doc.id,
          ...doc.data(),
        } as Voucher);
      });
    }

    return {
      user: userData,
      vouchers: userVouchers,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Calculate voucher metrics
function calculateVoucherMetrics(vouchers: Voucher[] = []) {
  const total = vouchers?.length || 0;
  const claimed = vouchers?.filter((v) => v.status === "CLAIMED").length || 0;
  const unclaimed = total - claimed;

  return {
    total,
    claimed,
    unclaimed,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch user data directly from Firestore
  const data = await getUserData(params.id);

  if (!data || !data.user) {
    notFound();
  }

  const { user, vouchers } = data;

  // Calculate metrics
  const metrics = calculateVoucherMetrics(vouchers);

  return (
    <div className="container max-w-[90vw] mt-18 mx-auto py-6 space-y-8">
      {/* User Profile Header */}
      <UserProfileHeader user={user} />

      <Separator className="my-8" />

      {/* Voucher Metrics */}
      <Suspense fallback={<MetricsSkeleton />}>
        <VoucherMetrics data={metrics} />
      </Suspense>

      {/* Voucher Table */}
      <Suspense fallback={<TableSkeleton />}>
        <VoucherTable vouchers={vouchers} />
      </Suspense>
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

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={`row-skeleton-${i}`}
            className="h-16 w-full rounded-md"
          />
        ))}
      </div>
    </div>
  );
}
