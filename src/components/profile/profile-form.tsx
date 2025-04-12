"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getInitials } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/features/users/usersSlice";
import { Textarea } from "@headlessui/react";
import { current } from "@reduxjs/toolkit";

// Define the validation schema with Yup
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
  bio: Yup.string().max(200, "Bio must be at most 200 characters"),
  email: Yup.string().email("Invalid email address"),
});

// Define the user type
interface UserType {
  id: string;
  name: string;
  phoneNo: string;
  city: string;
  isVerified: boolean;
  role: string;
  bio?: string;
  email?: string;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    theme: "light" | "dark" | "system";
  };
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
}

interface ProfileFormProps {
  user: UserType;
  onUpdateSuccess?: (updatedUser: UserType) => void;
  readOnly?: boolean;
}

export default function ProfileForm({
  user,
  onUpdateSuccess,
  readOnly = false,
}: ProfileFormProps) {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize formik
  const formik = useFormik<FormValues>({
    initialValues: {
      name: user?.name || "",
      phoneNo: user?.phoneNo || "",
      city: user?.city || "",
    },
    enableReinitialize: true, // Important to update form when user changes
    validationSchema,
    onSubmit: async (values) => {
      if (readOnly) return;

      setIsSaving(true);

      try {
        // Update user in Firestore
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          name: values.name,
          phoneNo: values.phoneNo,
          city: values.city,
          updatedAt: new Date(),
        });

        // Update user in Redux store
        const updatedUser = {
          ...user,
          ...values,
        };

        dispatch(
          updateUser({
            userId: user.id,
            userData: values,
          })
        );

        // Call the success callback if provided
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedUser);
        }

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
        name: user?.name || "",
        phoneNo: user?.phoneNo || "",
        city: user?.city || "",
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
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
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2 text-center md:text-left">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{user.phoneNo}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.city}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Member Since:&nbsp;
                  {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                {!user.isVerified ? (
                  <Badge
                    variant="outline"
                    className="mt-1 border-green-200 text-green-600 bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Verified Account
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="mt-1 border-red-200 text-red-500 bg-red-50"
                  >
                    <XCircle className="h-3 w-3" />
                    Not Verified
                  </Badge>
                )}
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </div>

            {!readOnly && (
              <div className="md:ml-auto">
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving}
                >
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </div>
            )}
          </div>
          {!readOnly && isEditing && (
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing || isSaving || readOnly}
                    className={!isEditing || readOnly ? "bg-muted" : ""}
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
                    disabled={
                      !isEditing ||
                      isSaving ||
                      readOnly ||
                      user?.role !== "ADMIN"
                    }
                    maxLength={10}
                    placeholder="Your phone number"
                    value={formik.values.phoneNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="bg-muted"
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
                    disabled={!isEditing || isSaving || readOnly}
                    className={!isEditing || readOnly ? "bg-muted" : ""}
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="text-sm text-destructive">
                      {formik.errors.city}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && !readOnly && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
