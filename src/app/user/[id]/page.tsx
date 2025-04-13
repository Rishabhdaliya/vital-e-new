import { Suspense } from "react";
import UserProfileHeader from "@/components/profile/user-profile-header";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import VoucherTable from "@/components/profile/voucher-table";
import RegisteredByInfo from "@/components/profile/registered-by-user-info";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import ProfileForm from "@/components/profile/profile-form";

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

// Fetch user data directly from Firestore
async function fetchUserData(id: string): Promise<User | null> {
  try {
    console.log(`Fetching user data for ID: ${id} directly from Firestore`);

    // Get the user document from Firestore
    const userDoc = await getDoc(doc(db, "users", id));

    if (!userDoc.exists()) {
      console.error("User not found in Firestore");
      return null;
    }

    // Create the user object
    const userData = userDoc.data();
    const user = {
      id: userDoc.id,
      ...userData,
    } as User;

    // If the user has a registeredBy field, fetch that user's data too
    if (user.registeredBy) {
      try {
        const registeredByDoc = await getDoc(
          doc(db, "users", user.registeredBy)
        );

        if (registeredByDoc.exists()) {
          const registeredByData = registeredByDoc.data();
          user.registeredByUser = {
            id: registeredByDoc.id,
            ...registeredByData,
          } as User;
        }
      } catch (registeredByError) {
        console.error("Error fetching registeredBy user:", registeredByError);
        // Continue without registeredBy data if there's an error
      }
    }

    return user;
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    return null;
  }
}

// Fetch vouchers for a user - separated from user fetching
async function fetchUserVouchers(
  userId: string,
  voucherIds: string[] = []
): Promise<Voucher[]> {
  try {
    let userVouchers: Voucher[] = [];

    // If user has voucher IDs, fetch those vouchers
    if (voucherIds && voucherIds.length > 0) {
      // Fetch each voucher by ID
      const voucherPromises = voucherIds.map(async (voucherId: string) => {
        const voucherDoc = await getDoc(doc(db, "vouchers", voucherId));
        if (voucherDoc.exists()) {
          return {
            id: voucherDoc.id,
            ...voucherDoc.data(),
          } as Voucher;
        }
        return null;
      });

      userVouchers = (await Promise.all(voucherPromises)).filter(
        Boolean
      ) as Voucher[];
    } else {
      // If no voucher IDs, check for vouchers claimed by this user
      const vouchersRef = collection(db, "vouchers");
      const voucherQuery = query(vouchersRef, where("claimedBy", "==", userId));
      const voucherSnapshot = await getDocs(voucherQuery);

      voucherSnapshot.forEach((doc) => {
        userVouchers.push({
          id: doc.id,
          ...doc.data(),
        } as Voucher);
      });
    }

    return userVouchers;
  } catch (error) {
    console.error("Error fetching user vouchers:", error);
    return [];
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
  // Extract the user ID from params
  const { id } = await params;

  // Fetch user data directly from Firestore
  const user = await fetchUserData(id);

  if (!user) {
    notFound();
  }

  // Fetch vouchers separately
  const vouchers = await fetchUserVouchers(id, user.vouchers);

  // Calculate metrics
  const metrics = calculateVoucherMetrics(vouchers);

  return (
    <div className="container max-w-[90vw]  mt-18 mx-auto py-6 space-y-8">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md mx-auto border border-[#f04d46] text-gray-900">
          <TabsTrigger
            value="account"
            className=" data-[state=active]:text-[#f04d46] cursor-pointer  data-[state=active]:font-bold"
          >
            Account Details
          </TabsTrigger>

          <TabsTrigger
            value="voucher"
            className=" data-[state=active]:text-[#f04d46] cursor-pointer data-[state=active]:font-bold"
          >
            Vouchers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          {/* User Profile Header */}
          <ProfileForm user={user} />
          {/* Registered By Info */}
          {user.registeredByUser && (
            <RegisteredByInfo registeredByUser={user.registeredByUser} />
          )}
        </TabsContent>
        <TabsContent value="voucher">
          {/* Voucher Metrics */}
          {user?.role === "RETAILER" && (
            <Suspense fallback={<MetricsSkeleton />}>
              <VoucherMetrics data={metrics} />
            </Suspense>
          )}
          {/* Voucher Table */}
          <Suspense fallback={<TableSkeleton />}>
            <VoucherTable role={user.role} vouchers={vouchers} />
          </Suspense>{" "}
        </TabsContent>
      </Tabs>
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
