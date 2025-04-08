import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Users } from "../issues/data/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/lib/utils";

interface UserProfileHeaderProps {
  user: any;
}

export default function UserProfileHeader({ user }: UserProfileHeaderProps) {
  // Use provided values or defaults for the new fields
  const city = user?.city || "NA";
  const phoneNo = user?.phoneNo || "NA";
  const verified = user?.isVerified !== undefined ? user.isVerified : true;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 rounded-full p-1 border-2 border-[#f04d46] shadow-lg">
            <AvatarImage
              className=" rounded-full "
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
            />
            <AvatarFallback className="text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2 text-center md:text-left">
            <div className="space-y-1">
              <h1 className="text-2xl text-[#f04d46] font-bold">{user.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{phoneNo}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{city}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Member Since:&nbsp;
                {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              {verified ? (
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
                  Not Verified
                </Badge>
              )}
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
