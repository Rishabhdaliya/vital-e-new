"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
  Mail,
  User,
  Calendar,
  Edit3,
  X,
  Shield,
  Bell,
  BellOff,
  Sun,
  Moon,
  Monitor,
  BadgeCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme (to avoid hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get role-specific colors and icons
  const getRoleStyles = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return {
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          borderColor: "border-purple-200",
          icon: <Shield className="h-4 w-4 text-purple-500" />,
        };
      case "DEALER":
        return {
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200",
          icon: <BadgeCheck className="h-4 w-4 text-blue-500" />,
        };
      case "RETAILER":
        return {
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-200",
          icon: <Store className="h-4 w-4 text-green-500" />,
        };
      case "CUSTOMER":
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-100",
          borderColor: "border-amber-200",
          icon: <User className="h-4 w-4 text-amber-500" />,
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
          icon: <User className="h-4 w-4 text-gray-500" />,
        };
    }
  };

  const roleStyles = getRoleStyles(user.role);

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

  if (!mounted) return null;

  // Determine if we're in dark mode
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-t-4 border-t-[#f04d46]   transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-[#f04d46] to-[#f04d46]/70 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* User Info */}
            <div className="space-y-3 text-center md:text-left flex-1">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`${roleStyles.bgColor} ${roleStyles.color} ${roleStyles.borderColor} flex items-center gap-1`}
                  >
                    {roleStyles.icon}
                    {user.role}
                  </Badge>

                  {user.isVerified ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Verified Account
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-[#f04d46]" />
                  </div>
                  <span>{user.phoneNo}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-[#f04d46]" />
                  </div>
                  <span>{user.city}</span>
                </div>

                {user.email && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <div className="h-7 w-7 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                      <Mail className="h-3.5 w-3.5 text-[#f04d46]" />
                    </div>
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                <div className="h-7 w-7 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-[#f04d46]" />
                </div>
                <span>
                  Registered on:
                  {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            {!readOnly && (
              <div className="md:ml-auto mt-4 md:mt-0">
                <Button
                  variant={isEditing ? "outline" : "filled"}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving}
                >
                  {isEditing ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-t-4 border-t-[#f04d46] shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#f04d46]/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-[#f04d46]" />
                  Edit Profile Information
                </CardTitle>
                <CardDescription>
                  Update your profile information below
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-[#f04d46]" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={!isEditing || isSaving || readOnly}
                        className={`${
                          !isEditing || readOnly ? "bg-muted" : ""
                        } border-gray-300 focus:border-[#f04d46] focus:ring-[#f04d46]/20 transition-all duration-300`}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive"
                        >
                          {formik.errors.name}
                        </motion.p>
                      )}
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNo"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-[#f04d46]" />
                        Phone Number
                      </Label>
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
                          className={`${
                            !isEditing || readOnly ? "bg-muted" : ""
                          } border-gray-300 focus:border-[#f04d46] focus:ring-[#f04d46]/20 transition-all duration-300`}
                        />
                        {isCheckingPhone && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-[#f04d46]" />
                          </div>
                        )}
                      </div>
                      {formik.touched.phoneNo && formik.errors.phoneNo && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive"
                        >
                          {formik.errors.phoneNo}
                        </motion.p>
                      )}
                      {currentUser?.role !== "ADMIN" && isEditing && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Reach out to us to update your phone number
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-[#f04d46]" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email address"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={!isEditing || isSaving || readOnly}
                        className={`${
                          !isEditing || readOnly ? "bg-muted" : ""
                        } border-gray-300 focus:border-[#f04d46] focus:ring-[#f04d46]/20 transition-all duration-300`}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive"
                        >
                          {formik.errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* City Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4 text-[#f04d46]" />
                        City
                      </Label>
                      <AutoSearch
                        disabled={
                          !isEditing || isSaving || readOnly || isCheckingPhone
                        }
                        defaultValue={formik.values.city}
                        cities={maharashtraCities}
                        onSelect={(value) =>
                          formik.setFieldValue("city", value)
                        }
                      />
                      {formik.touched.city && formik.errors.city && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive"
                        >
                          {formik.errors.city}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                    >
                      <X className="mr-2 h-4 w-4" />
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
                      className="bg-[#f04d46] hover:bg-[#f04d46]/90 text-white transition-all duration-300"
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
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Import the Store icon that was missing
function Store(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

// Import the Settings icon that was missing
function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
