import { Suspense } from "react";
import UserProfileHeader from "@/components/profile/user-profile-header";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import VoucherTable from "@/components/profile/voucher-table";
import RegisteredByInfo from "@/components/profile/registered-by-user-info";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// Define types inline to avoid import issues
interface User {
  id: string;
  name: string;
  phoneNo: string;
  city: string;
  isVerified: boolean;
  vouchers: string[];
  role: "CUSTOMER" | "RETAILER" | "DEALER";
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  registeredBy?: string;
  registeredByUser?: User;
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

// Fetch user data from API
async function getUserData(id: string) {
  try {
    // Use absolute URL with origin for server-side fetching
    const origin =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        : window.location.origin;

    const response = await fetch(`${origin}/api/users/${id}`, {
      cache: "no-store", // Disable caching to always get fresh data
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const apiData = await response.json();

    if (!apiData.data) {
      console.error("API returned no data");
      return null;
    }

    const userData = apiData.data;
    console.log("API user data:", userData);

    // Get vouchers for this user
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
      const vouchersRef = collection(db, "vouchers");
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

export default async function UserProfilePage({ params }: any) {
  // Fetch user data from API
  const { id } = await params;
  const data = await getUserData(id);

  if (!data || !data.user) {
    notFound();
  }

  console.log("User data:", data);

  const { user, vouchers } = data;

  // Calculate metrics
  const metrics = calculateVoucherMetrics(vouchers);

  return (
    <div className="container max-w-[90vw] mt-18 mx-auto py-6 space-y-8">
      {/* User Profile Header */}
      {user && <UserProfileHeader user={user} />}

      {/* Registered By Info */}
      {user.registeredByUser && (
        <RegisteredByInfo registeredByUser={user.registeredByUser} />
      )}

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
