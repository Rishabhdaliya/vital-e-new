import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays } from "date-fns";
import { User, Voucher } from "@/components/types/schema";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDateDifference(timestamp: string) {
  const today = new Date();
  const dateFromTimestamp = new Date(timestamp);

  // Calculate and return the difference in days
  return differenceInDays(today, dateFromTimestamp);
}

export function transformUsersToOptions(usersOptions: User[] | null) {
  return (
    (usersOptions &&
      Array.isArray(usersOptions) &&
      usersOptions?.map((option: User) => ({
        value: option.name,
        label: option.name,
        id: option.id,
      }))) ||
    []
  );
}

// Add a function to determine product status based on quantity
export const getProductStatus = (quantity: number): string => {
  if (quantity === 0) return "Out of Stock";
  if (quantity < 10) return "Low Stock";
  return "In Stock";
};

// Add a function to get status color based on status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Out of Stock":
      return "text-red-500 border border-red-200 bg-red-50";
    case "Low Stock":
      return "text-amber-500 border border-amber-200 bg-amber-50";
    case "In Stock":
      return "text-green-500 border border-green-200 bg-green-50";
    default:
      return "text-gray-500 border border-gray-200 bg-gray-50";
  }
};

export // Get user initials for avatar
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Fetch vouchers for a user - separated from user fetching
export async function fetchUserVouchers(
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
