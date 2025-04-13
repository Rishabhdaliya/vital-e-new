"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface VoucherMetricsProps {
  data: {
    total: number;
    claimed: number;
    unclaimed: number;
  };
}

export default function VoucherMetrics({ data }: VoucherMetricsProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle edge case where total is 0 to avoid division by zero
  const claimedPercentage =
    data.total > 0 ? (data.claimed / data.total) * 100 : 0;
  const unclaimedPercentage =
    data.total > 0 ? (data.unclaimed / data.total) * 100 : 0;

  // Ensure component is mounted before accessing theme (to avoid hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Determine colors based on theme
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Voucher Analytics</h2>

      {/* Summary Section */}
      {data.total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4"
        >
          <Card className="bg-gradient-to-r from-[#f04d46]/5 to-transparent border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#f04d46]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Voucher Utilization</p>
                    <p className="text-xs text-muted-foreground">
                      You've redeemed {claimedPercentage.toFixed(0)}% of your
                      total vouchers
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Redeemed</p>
                    <p className="text-lg font-bold text-green-500">
                      {data.claimed}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Unclaimed</p>
                    <p className="text-lg font-bold text-amber-500">
                      {data.unclaimed}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-[#f04d46]">
                      {data.total}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Vouchers Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-2 border-[#f04d46]/10 hover:border-[#f04d46]/30 transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 right-0 h-20 w-20 -translate-y-1/3 translate-x-1/3 rounded-full bg-[#f04d46]/10 blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                Total Vouchers
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                <Ticket className="h-4 w-4 text-[#f04d46]" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-baseline space-x-2">
                <motion.div
                  className="text-3xl font-bold text-[#f04d46]"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.1,
                  }}
                >
                  {data.total}
                </motion.div>
                <div className="text-sm text-muted-foreground">vouchers</div>
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-[#f04d46]/10">
                <motion.div
                  className="h-full rounded-full bg-[#f04d46]"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>

              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span>All vouchers available to this user</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Redeemed Vouchers Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-2 border-green-500/10 hover:border-green-500/30 transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 right-0 h-20 w-20 -translate-y-1/3 translate-x-1/3 rounded-full bg-green-500/10 blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                Redeemed Vouchers
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-baseline space-x-2">
                <motion.div
                  className="text-3xl font-bold text-green-500"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.2,
                  }}
                >
                  {data.claimed}
                </motion.div>
                <div className="text-sm text-muted-foreground">vouchers</div>
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-green-500/10">
                <motion.div
                  className="h-full rounded-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${claimedPercentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>

              <div className="mt-2 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  <CheckCircle className="inline mr-1 h-3 w-3" />
                  Redeemed
                </span>
                <span className="font-medium text-green-500">
                  {claimedPercentage.toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Unclaimed Vouchers Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-2 border-amber-500/10 hover:border-amber-500/30 transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 right-0 h-20 w-20 -translate-y-1/3 translate-x-1/3 rounded-full bg-amber-500/10 blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                Unclaimed Vouchers
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-baseline space-x-2">
                <motion.div
                  className="text-3xl font-bold text-amber-500"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.3,
                  }}
                >
                  {data.unclaimed}
                </motion.div>
                <div className="text-sm text-muted-foreground">vouchers</div>
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-amber-500/10">
                <motion.div
                  className="h-full rounded-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${unclaimedPercentage}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>

              <div className="mt-2 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  <Clock className="inline mr-1 h-3 w-3" />
                  Pending
                </span>
                <span className="font-medium text-amber-500">
                  {unclaimedPercentage.toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
