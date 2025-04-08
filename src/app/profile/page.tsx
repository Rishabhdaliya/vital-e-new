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
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
            />
            <AvatarFallback className="text-2xl ">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2 text-center md:text-left">
            <div className="space-y-1">
              <h1 className="text-2xl [#f04d46] font-bold">
                {currentUser.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{currentUser.phoneNo}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{currentUser.city}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Member Since:&nbsp;
                {new Date(
                  currentUser.createdAt.seconds * 1000
                ).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              {currentUser.isVerified ? (
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
              <Badge variant="outline">{currentUser.role}</Badge>
            </div>
          </div>

          <div className="md:ml-auto">
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update your profile information below."
                : "View your profile information below."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing || isLoading}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-sm text-destructive">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Phone Number</Label>
                  <Input
                    id="phoneNo"
                    name="phoneNo"
                    disabled
                    placeholder="Your phone number"
                    value={formik.values.phoneNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {formik.touched.phoneNo && formik.errors.phoneNo && (
                    <p className="text-sm text-destructive">
                      {formik.errors.phoneNo}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Your city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing || isLoading}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="text-sm text-destructive">
                      {formik.errors.city}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formik.dirty || !formik.isValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Separator />
        {/* Voucher Metrics */}
        <Suspense fallback={<MetricsSkeleton />}>
          <VoucherMetrics data={metrics} />
        </Suspense>
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
