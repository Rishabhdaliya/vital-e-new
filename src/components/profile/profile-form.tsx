"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/hooks/use-toast";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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
import { updateUser } from "@/redux/features/users/usersSlice";
import { getInitials } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { AutoSearch } from "../ui/autoSearch";
import { maharashtraCities } from "../constants/city";

// Define the validation schema with Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  phoneNo: Yup.string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits"),
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
  bio: string;
  email: string;
  preferences: {
    notifications: boolean;
    marketing: boolean;
    theme: "light" | "dark" | "system";
  };
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
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const currentUser = useSelector((state: any) => state.users.currentUser);

  // Function to check if phone number is unique
  const isPhoneNumberUnique = async (phoneNo: string): Promise<boolean> => {
    // If phone number hasn't changed, no need to check
    if (phoneNo === user.phoneNo) {
      return true;
    }

    setIsCheckingPhone(true);
    try {
      // Query Firestore for users with this phone number
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phoneNo", "==", phoneNo));
      const querySnapshot = await getDocs(q);

      // If no documents found, phone is unique
      if (querySnapshot.empty) {
        return true;
      }

      // If only one document found and it's the current user, phone is unique
      if (querySnapshot.size === 1 && querySnapshot.docs[0].id === user.id) {
        return true;
      }

      // Otherwise, phone is not unique
      return false;
    } catch (error) {
      console.error("Error checking phone number uniqueness:", error);
      // In case of error, we'll assume it's not unique to be safe
      return false;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Initialize formik
  const formik = useFormik<FormValues>({
    initialValues: {
      name: user?.name || "",
      phoneNo: user?.phoneNo || "",
      city: user?.city || "",
      bio: user?.bio || "",
      email: user?.email || "",
      preferences: user?.preferences || {
        notifications: true,
        marketing: false,
        theme: "system",
      },
    },
    enableReinitialize: true, // Important to update form when user changes
    validationSchema,
    onSubmit: async (values) => {
      if (readOnly) return;

      setIsSaving(true);

      try {
        // Check if phone number is unique before updating
        if (values.phoneNo !== user.phoneNo) {
          const isUnique = await isPhoneNumberUnique(values.phoneNo);
          if (!isUnique) {
            toast({
              title: "Phone Number Already Exists",
              description:
                "This phone number is already registered to another user.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
        }

        // Update user in Firestore
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          name: values.name,
          phoneNo: values.phoneNo,
          city: values.city,
          bio: values.bio,
          email: values.email,
          preferences: values.preferences,
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
        bio: user?.bio || "",
        email: user?.email || "",
        preferences: user?.preferences || {
          notifications: true,
          marketing: false,
          theme: "system",
        },
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
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
            {user.isVerified ? (
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
                <div className="relative">
                  <Input
                    id="phoneNo"
                    name="phoneNo"
                    placeholder="Your phone number"
                    value={formik.values.phoneNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength={10}
                    disabled={
                      !isEditing ||
                      isSaving ||
                      readOnly ||
                      isCheckingPhone ||
                      currentUser?.role !== "ADMIN"
                    }
                    className={!isEditing || readOnly ? "bg-muted" : ""}
                  />
                  {isCheckingPhone && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {formik.touched.phoneNo && formik.errors.phoneNo && (
                  <p className="text-sm text-destructive">
                    {formik.errors.phoneNo}
                  </p>
                )}
                {currentUser?.role !== "ADMIN" && isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reach out to us to update your phone number.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing || isSaving || readOnly}
                  className={!isEditing || readOnly ? "bg-muted" : ""}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-destructive">
                    {formik.errors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-3 ">
                <Label htmlFor="city">City</Label>
                <AutoSearch
                  disabled={
                    !isEditing || isSaving || readOnly || isCheckingPhone
                  }
                  defaultValue={formik.values.city}
                  cities={maharashtraCities}
                  onSelect={(value) => formik.setFieldValue("city", value)}
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
                  disabled={
                    isSaving ||
                    !formik.dirty ||
                    !formik.isValid ||
                    isCheckingPhone
                  }
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
    </div>
  );
}
