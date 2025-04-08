import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays } from "date-fns";
import { User } from "@/components/types/schema";

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
