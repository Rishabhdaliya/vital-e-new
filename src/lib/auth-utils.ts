// Define role-based access permissions
export const rolePermissions = {
  ADMIN: ["*"], // Admin can access everything
  DEALER: ["/retailer", "/user", "/dealer", "/admin", "/vouchers", "/products"],
  RETAILER: ["/retailer", "/vouchers", "/products", "/my-vouchers"],
  CUSTOMER: ["/customer", "/vouchers", "/claim-voucher"],
};

// Helper function to check if a user has permission to access a path
export const hasPermissionForPath = (role: string, path: string): boolean => {
  const permissions =
    rolePermissions[role as keyof typeof rolePermissions] || [];

  // Check if the user has permission to access this path
  return (
    permissions.includes("*") || // Admin can access everything
    permissions.some((perm) => path.startsWith(perm))
  );
};

// Helper function to get the default redirect path for a role
export const getDefaultPathForRole = (role: string): string => {
  const permissions = rolePermissions[role as keyof typeof rolePermissions] || [
    "/",
  ];

  // Return the first allowed path, or home if no permissions
  if (permissions.includes("*")) return "/admin"; // Admin goes to admin dashboard

  switch (role) {
    case "CUSTOMER":
      return "/";
    case "RETAILER":
      return "/";
    case "DEALER":
      return "/retailer";
    default:
      return "/";
  }
};

// Helper function to handle logout
export const logout = () => {
  // Clear localStorage
  localStorage.removeItem("userId");

  // Clear cookies
  document.cookie = "userId=; path=/; max-age=0";
  document.cookie = "userRole=; path=/; max-age=0";

  // Note: Redux logout action should be dispatched separately
};
