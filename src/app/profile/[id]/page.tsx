"use client";

import { Suspense, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { updateUsers } from "@/redux/features/users/usersSlice";
import { Skeleton } from "@/components/ui/skeleton";
import VoucherMetrics from "@/components/profile/voucher-metrics";
import { calculateVoucherMetrics } from "@/lib/utils/utils";
import { getInitials } from "@/lib/utils";

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

// Define the user type
interface User {
  id: string;
  name: string;
  phoneNo: string;
  city: string;
  isVerified: boolean;
  role: string;
  vouchers?: string[];
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

// Define the form values type
interface FormValues {
  name: string;
  phoneNo: string;
  city: string;
  isVerified: boolean;
}

export default function ProfilePage({ params }: any) {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const { id } = await params;

      if (!id) return;

      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, "users", params?.id));

        if (!userDoc.exists()) {
          return;
        }

        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
        } as User;

        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [params, toast]);

  // Initialize formik
  const formik = useFormik<FormValues>({
    initialValues: {
      name: currentUser?.name || "",
      phoneNo: currentUser?.phoneNo || "",
      city: currentUser?.city || "",
      isVerified: currentUser?.isVerified || false,
    },
    enableReinitialize: true, // Important to update form when currentUser changes
    validationSchema,
    onSubmit: async (values) => {
      if (!currentUser) {
        toast({
          title: "Error",
          description: "User not found. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);

      try {
        // Update user in Firestore
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
          name: values.name,
          phoneNo: values.phoneNo,
          city: values.city,
          isVerified: values.isVerified,
          updatedAt: new Date(),
        });

        // Update user in Redux store
        dispatch(
          updateUsers({
            userId: currentUser.id,
            userData: values,
          })
        );

        // Update local state
        setCurrentUser({
          ...currentUser,
          ...values,
        });

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
      } finally {
        setIsSaving(false);
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              The requested user profile could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              disabled={isSaving}
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
                    disabled={!isEditing || isSaving}
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
                    disabled={!isEditing || isSaving}
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
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !formik.dirty || !formik.isValid}
                  >
                    {isSaving ? (
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
