"use client";

import { useState, useEffect } from "react";
import {
  User,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  Building,
  Award,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface RegisteredByUser {
  id: string;
  name: string;
  phoneNo: string;
  city: string;
  role: string;
  isVerified?: boolean;
}

interface RegisteredByInfoProps {
  registeredByUser: RegisteredByUser;
}

export default function RegisteredByInfo({
  registeredByUser,
}: RegisteredByInfoProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!registeredByUser || !mounted) return null;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role icon based on role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "DEALER":
        return <Building className="h-4 w-4" />;
      case "RETAILER":
        return <Award className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Get role color based on role
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DEALER":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "RETAILER":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden mt-10 ">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f04d46] via-red-400 to-[#f04d46]"></div>
        <CardTitle className="text-center text-lg font-semibold text-[#f04d46] dark:text-white mt-4">
          Registered By
        </CardTitle>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left section with avatar and main info */}
            <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${registeredByUser.name}`}
                      alt={registeredByUser.name}
                    />
                    <AvatarFallback className="bg-[#f04d46]/10 text-[#f04d46] text-lg">
                      {getInitials(registeredByUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {registeredByUser.name}
                    </h3>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant="outline"
                        className={`${getRoleColor(
                          registeredByUser.role
                        )} flex items-center gap-1`}
                      >
                        {getRoleIcon(registeredByUser.role)}
                        {registeredByUser.role}
                      </Badge>
                    </motion.div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-[#f04d46]" />
                    <span>Registered on {new Date().toLocaleDateString()}</span>
                  </div>

                  {registeredByUser.isVerified !== undefined && (
                    <div className="flex items-center mt-1">
                      {registeredByUser.isVerified ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Verified Account
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Unverified Account
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section with contact details */}
            <div className="p-6 flex-1 ">
              <h4 className="text-sm font-medium text-[#f04d46] mb-3 flex items-center">
                <User className="h-4 w-4 mr-1.5" />
                Contact Information
              </h4>

              <div className="space-y-3">
                <motion.div
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="h-7 w-7 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-[#f04d46]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Phone Number
                    </p>
                    <p className="font-medium">{registeredByUser.phoneNo}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="h-7 w-7 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-[#f04d46]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="font-medium">{registeredByUser.city}</p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#f04d46] text-[#f04d46] hover:bg-[#f04d46] hover:text-white"
                  onClick={() => router.push(`/user/${registeredByUser.id}`)}
                >
                  View Full Profile
                  <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
