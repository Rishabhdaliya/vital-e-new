"use client";

import ProtectedRoute from "@/components/auth-guard/protectedRoute";
import type { ReactNode } from "react";

export default function VouchersLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}
