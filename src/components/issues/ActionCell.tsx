"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ActionCellProps {
  userId: string;
}

export function ActionCell({ userId }: ActionCellProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => {
        console.log("Navigating to user:", userId);
        router.push(`/user/${userId}`);
      }}
      size={"sm"}
    >
      Update
    </Button>
  );
}
