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
