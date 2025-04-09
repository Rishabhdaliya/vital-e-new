"use client";

import PublicRoute from "@/components/auth-guard/publicRoute";
import type { ReactNode } from "react";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
