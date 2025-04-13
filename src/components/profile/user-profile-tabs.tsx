"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UserProfileTabsProps {
  user: any;
  accountContent: ReactNode;
  voucherContent: ReactNode;
  metrics?: any;
}

export default function UserProfileTabs({
  user,
  accountContent,
  voucherContent,
  metrics,
}: UserProfileTabsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className="w-full">
      <Tabs
        defaultValue="account"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#f04d46]/10 to-transparent h-[120%] rounded-t-xl -z-10"></div>
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-1 shadow-md border border-gray-100 dark:border-gray-700">
            <TabsTrigger
              value="account"
              className={cn(
                "flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-all",
                "data-[state=active]:bg-[#f04d46] data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300",
                "hover:bg-gray-100/80 dark:hover:bg-gray-700/50 data-[state=active]:hover:bg-[#f04d46]/90"
              )}
            >
              <User className="h-4 w-4" />
              <span>Account Details</span>
              {activeTab === "account" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-full bg-[#f04d46] -z-10"
                  initial={false}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="voucher"
              className={cn(
                "flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-all",
                "data-[state=active]:bg-[#f04d46] data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300",
                "hover:bg-gray-100/80 dark:hover:bg-gray-700/50 data-[state=active]:hover:bg-[#f04d46]/90"
              )}
            >
              <Ticket className="h-4 w-4" />
              <span>Vouchers</span>
              {metrics && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white text-[#f04d46] text-xs font-bold h-5 min-w-5 px-1">
                  {metrics.total}
                </span>
              )}
              {activeTab === "voucher" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-full bg-[#f04d46] -z-10"
                  initial={false}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="account" className="mt-0 outline-none">
            {activeTab === "account" && (
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                {accountContent}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="voucher" className="mt-0 outline-none">
            {activeTab === "voucher" && (
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                {voucherContent}
              </motion.div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

// Skeleton components for loading states
export function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={`metric-skeleton-${i}`}
          className="h-32 w-full rounded-md"
        />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={`row-skeleton-${i}`}
            className="h-16 w-full rounded-md"
          />
        ))}
      </div>
    </div>
  );
}
