import { User, Phone, MapPin, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  if (!registeredByUser) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-[#f04d46] flex items-center gap-2">
          <User className="h-5 w-5" />
          Registered By
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#f04d46]">
                {registeredByUser.name}
              </span>
              <Badge
                variant="outline"
                className="bg-blue-100 text-[#f04d46] border-blue-200"
              >
                {registeredByUser.role}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 " />
              <span>{registeredByUser.phoneNo}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 " />
              <span>{registeredByUser.city}</span>
            </div>
          </div>

          {registeredByUser.isVerified !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 " />
              <span>
                {registeredByUser.isVerified
                  ? "Verified Account"
                  : "Unverified Account"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
