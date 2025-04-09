"use client";

import ProtectedRoute from "@/components/auth-guard/protectedRoute";
import type { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEALER"]}>
      {children}
    </ProtectedRoute>
  );
}
