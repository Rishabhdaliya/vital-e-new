"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { AccessDenied } from "../access-denied/access-denied";
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Optional array of roles that can access this route
  redirectTo?: string; // Where to redirect if not authenticated
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/sign-in",
}: ProtectedRouteProps) {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state.users.currentUser);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      // If no user in Redux store, check localStorage as fallback
      const userId = currentUser?.id;
      if (!userId) {
        router.push(redirectTo);
        return;
      }

      // If we have a userId but no currentUser, we need to wait for the user data to load
      // This could happen during initial page load when Redux is being populated
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    // If allowedRoles is empty, any authenticated user has access
    if (allowedRoles.length === 0) {
      setHasAccess(true);
      return;
    }

    // Check if user has one of the allowed roles
    const hasAllowedRole =
      allowedRoles.includes(currentUser.role) || allowedRoles.includes("*");
    setHasAccess(hasAllowedRole);
  }, [currentUser, router, redirectTo, allowedRoles]);

  // // Show loading state while checking authentication
  // if (isChecking) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="text-center">
  //         <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
  //         <p className="mt-4 text-lg">Checking authentication....</p>
  //       </div>
  //     </div>
  //   );
  // }

  // If user doesn't have access, show access denied component
  if (!hasAccess && currentUser && !isChecking) {
    return <AccessDenied userRole={currentUser.role} />;
  }

  // If user has access, render children
  return <>{children}</>;
}
