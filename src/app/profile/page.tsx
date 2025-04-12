"use client";

import { Suspense, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  MapPin,
  Phone,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateVoucherMetrics } from "@/lib/utils/utils";
import { useUpdateUserDataMutation } from "@/redux/features/users/usersApi";
import UserProfileHeader from "@/components/profile/user-profile-header";
import ProfileForm from "@/components/profile/profile-form";

// Define the form schema with Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  phoneNo: Yup.string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  city: Yup.string()
    .required("City is required")
    .min(2, "City must be at least 2 characters"),
  isVerified: Yup.boolean(),
});

// Define the form values type
interface FormValues {
  name: string;
  phoneNo: string;
  city: string;
  isVerified: boolean;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const currentUser = useSelector((state: any) => state.users.currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [updateUserData, { isLoading }] = useUpdateUserDataMutation();

  // Initialize formik
  const formik = useFormik<FormValues>({
    initialValues: {
      name: currentUser?.name || "",
      phoneNo: currentUser?.phoneNo || "",
      city: currentUser?.city || "",
      isVerified: currentUser?.isVerified || false,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!currentUser) {
        toast({
          title: "Error",
          description: "User not found. Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log("Submitting form with values:", values);

        // Use the RTK Query mutation hook with the correct parameter structure
        const result = await updateUserData({
          id: currentUser.id,
          userData: {
            name: values.name,
            phoneNo: values.phoneNo,
            city: values.city,
            isVerified: values.isVerified,
          },
        }).unwrap();

        console.log("Update result:", result);

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });

        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Update Failed",
          description: "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Handle cancel editing
  const handleCancel = () => {
    formik.resetForm({
      values: {
        name: currentUser?.name || "",
        phoneNo: currentUser?.phoneNo || "",
        city: currentUser?.city || "",
        isVerified: currentUser?.isVerified || false,
      },
    });
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  const metrics = calculateVoucherMetrics(currentUser?.vouchers);

  return (
    <div className="container max-w-full mt-15 py-10 px-4 md:px-6">
      <div className="space-y-4">
        {/* Profile Form */}
        <ProfileForm user={currentUser} />

        {/* Account Information */}
        <Separator />
        {/* Voucher Metrics */}
        <VoucherMetrics data={metrics} />
      </div>
    </div>
  );
}

// Skeleton components
function MetricsSkeleton() {
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
