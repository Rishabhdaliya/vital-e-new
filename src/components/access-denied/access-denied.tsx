"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldAlert, Home, ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { getDefaultPathForRole } from "@/lib/auth-utils";

interface AccessDeniedProps {
  userRole?: string;
  message?: string;
  showBackButton?: boolean;
}

export function AccessDenied({
  userRole,
  message = "You don't have permission to access this page.",
  showBackButton = true,
}: AccessDeniedProps) {
  const router = useRouter();
  const defaultPath = userRole ? getDefaultPathForRole(userRole) : "/";

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 relative"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-red-100 rounded-full scale-[0.8] animate-pulse"></div>
            <div className="relative z-10 h-24 w-24 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <ShieldAlert className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center"
          >
            <Lock className="h-5 w-5 text-amber-500" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>

          {userRole && (
            <p className="text-sm text-gray-500 mb-6">
              Your current role ({userRole}) doesn't have the necessary
              permissions to view this content.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push(defaultPath)}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Button>

            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
