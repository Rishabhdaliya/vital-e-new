"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Ticket, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";

export default function HeroSection() {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state.users.currentUser);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const handleRoute = () => {
    if (currentUser.role === "ADMIN" || currentUser.role === "DEALER") {
      router.push("/admin");
    } else if (currentUser.role === "RETAILER") {
      router.push("/claim-voucher");
    } else router.push("/");
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-40 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#f04d46] ring-1 ring-inset ring-red-200">
                <Sparkles className="mr-1 h-3 w-3" />
                Exclusive Offers
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 "
            >
              Claim Your{" "}
              <span className="text-[#f04d46]">Digital Vouchers</span> With Ease
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl"
            >
              Discover a seamless way to redeem and manage your vouchers. Our
              platform connects customers with retailers for a hassle-free
              experience.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              {currentUser ? (
                <Button
                  variant="filled"
                  size="lg"
                  onClick={handleRoute}
                  className="group"
                >
                  {currentUser.role === "RETAILER"
                    ? "Claim Voucher"
                    : "Go To Dashboard"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <Button
                  variant="filled"
                  size="lg"
                  onClick={() => router.push("/sign-in")}
                  className="group"
                >
                  {currentUser ? "Claim Voucher" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700"
                  ></div>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">1,000+</span> vouchers claimed
                this month
              </p>
            </motion.div>
          </motion.div>

          {/* Image/illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[500px] w-full">
              <div className="absolute top-0 right-0 w-full h-full">
                <div className="relative w-full h-full">
                  {/* Main image */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl transform rotate-2"></div>
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform -rotate-2">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 dark:bg-gray-700 rounded-t-2xl flex items-center px-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                    </div>

                    <div className="pt-12 px-6 pb-6 flex flex-col h-full">
                      {/* Voucher cards */}
                      <div className="space-y-4 flex-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 + i * 0.2 }}
                            className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex items-center"
                          >
                            <div className="h-10 w-10 rounded-full bg-[#f04d46]/10 flex items-center justify-center mr-4">
                              <Ticket className="h-5 w-5 text-[#f04d46]" />
                            </div>
                            <div className="flex-1">
                              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-500 rounded-full mb-2"></div>
                              <div className="h-2 w-32 bg-gray-100 dark:bg-gray-600 rounded-full"></div>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-[#f04d46] flex items-center justify-center">
                              <Gift className="h-4 w-4 text-white" />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Bottom stats */}
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {[
                          { label: "Claimed", value: "24" },
                          { label: "Available", value: "12" },
                          { label: "Expired", value: "8" },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center"
                          >
                            <p className="text-lg font-bold text-[#f04d46]">
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {stat.label}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="absolute -bottom-6 -left-6 h-16 w-16 bg-white dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center"
            >
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
