import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Users } from "../issues/data/schema";

interface UserProfileHeaderProps {
  user: Users;
}

export default function UserProfileHeader({ user }: UserProfileHeaderProps) {
  // Use provided values or defaults for the new fields
  const city = user?.city || "San Francisco, CA";
  const phoneNo = user?.phoneNo || "+1 (555) 123-4567";
  const verified = user?.isVerified !== undefined ? user.isVerified : true;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex h-full w-full items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-400 dark:from-gray-800 dark:to-gray-700"></div>
                  <User
                    className="h-12 w-12 text-gray-500  relative z-10"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
            {verified && (
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div>
              <h1 className="text-2xl font-bold">
                {user?.name?.toUpperCase()}
              </h1>
              {verified && (
                <Badge
                  variant="outline"
                  className="mt-1 border-green-500 text-green-500"
                >
                  Verified Account
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4" />
                <span>{city}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4" />
                <span>{phoneNo}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
