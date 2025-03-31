"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";

// Define role-based access permissions
const rolePermissions = {
  ADMIN: ["*"], // Admin can access everything
  DEALER: ["/retailer", "/admin", "/vouchers"],
  RETAILER: ["/vouchers"],
  CUSTOMER: ["/vouchers", "/customer"],
};

// Helper function to check if a user has permission to access a path
const hasPermissionForPath = (role: string, path: string): boolean => {
  const permissions =
    rolePermissions[role as keyof typeof rolePermissions] || [];

  // Check if the user has permission to access this path
  return (
    permissions.includes("*") || // Admin can access everything
    permissions.some((perm) => path.startsWith(perm))
  );
};

// Helper function to get the default redirect path for a role
const getDefaultPathForRole = (role: string): string => {
  const permissions = rolePermissions[role as keyof typeof rolePermissions] || [
    "/",
  ];

  // Return the first allowed path, or home if no permissions
  if (permissions.includes("*")) return "/"; // Admin goes to home
  return permissions[0] || "/";
};

interface RouteGuardProps {
  children: ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useSelector((state: any) => state.users.currentUser);

  //   useEffect(() => {
  //     // If we don't have a user, redirect to signin
  //     if (currentUser && !currentUser) {
  //       router.push("/sign-in");
  //       return;
  //     }

  //     // Get the user's role
  //     const userRole = currentUser && currentUser?.role;

  //     // Check if the user has permission to access this path
  //     const hasAccess = hasPermissionForPath(userRole, pathname);

  //     if (!hasAccess) {
  //       // Redirect to the default path for their role
  //       const defaultPath = getDefaultPathForRole(userRole);
  //       router.push(defaultPath);
  //     }

  //     // Update the role cookie for middleware
  //     document.cookie = `userRole=${userRole}; path=/; max-age=2592000`; // 30 days
  //   }, [currentUser]);

  //   // If we're checking authentication, show loading
  //   if (!currentUser) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
  //           <p className="mt-4 text-lg">Checking permissions...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  // If the user doesn't have access, we'll redirect in the useEffect
  // For better UX, we could show a custom "Access Denied" page here instead of loading
  if (currentUser && !hasPermissionForPath(currentUser?.role, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Redirecting to authorized page...</p>
        </div>
      </div>
    );
  }

  // If the user has access, render the children
  return <>{children}</>;
}
