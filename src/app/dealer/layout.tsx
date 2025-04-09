"use client";

import ProtectedRoute from "@/components/auth-guard/protectedRoute";
import type { ReactNode } from "react";

export default function DealerLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}
