"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { getDefaultPathForRole } from "@/lib/auth-utils";

interface PublicRouteProps {
  children: ReactNode;
  redirectAuthenticatedTo?: string; // Where to redirect if already authenticated
}

export default function PublicRoute({
  children,
  redirectAuthenticatedTo,
}: PublicRouteProps) {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state.users.currentUser);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (currentUser) {
      // If redirectAuthenticatedTo is provided, use that
      // Otherwise, redirect to the default path for the user's role
      const redirectPath =
        redirectAuthenticatedTo || getDefaultPathForRole(currentUser.role);
      router.push(redirectPath);
      return;
    }

    // Check localStorage as fallback
    const userId = currentUser?.id;
    if (userId) {
      // If we have a userId but no currentUser, we need to wait for the user data to load
      // This could happen during initial page load when Redux is being populated
      return;
    }

    // User is not authenticated, allow access to public route
    setIsChecking(false);
  }, [currentUser, router, redirectAuthenticatedTo]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Checking authentication..</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render children
  return <>{children}</>;
}
