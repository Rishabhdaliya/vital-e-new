"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "@/redux/features/users/usersSlice";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { MSG91Widget } from "@/components/otp/msg91-widget";
import Link from "next/link";

// Define role-based access permissions
const rolePermissions = {
  ADMIN: ["*"], // Admin can access everything
  DEALER: ["/retailer", "/admin", "/vouchers"],
  RETAILER: ["/vouchers"],
  CUSTOMER: ["/vouchers", "/customer"],
};

// Helper function to get the default redirect path for a role
const getDefaultPathForRole = (role: string): string => {
  const permissions = rolePermissions[role as keyof typeof rolePermissions] || [
    "/",
  ];

  // Return the first allowed path, or home if no permissions
  if (permissions.includes("*")) return "/"; // Admin goes to home
  return permissions[0] || "/";
};

export default function SignInPage() {
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Form validation schema
  const validationSchema = Yup.object({
    phoneNo: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      phoneNo: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Check if user exists
        const usersRef = collection(db, "users");
        const userQuery = query(
          usersRef,
          where("phoneNo", "==", values.phoneNo)
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          toast({
            title: "User Not Found",
            description: "No account found with this phone number.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Move to verification step
        setStep("verification");
      } catch (error) {
        console.error("Error checking user:", error);
        toast({
          title: "Error",
          description: "Failed to check user. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle verification success
  const handleVerificationSuccess = async (token: string) => {
    try {
      setLoading(true);

      // Get user data
      const usersRef = collection(db, "users");
      const userQuery = query(
        usersRef,
        where("phoneNo", "==", formik.values.phoneNo)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Store user data in Redux
        const user = {
          id: userDoc.id,
          ...userData,
        };

        // Dispatch action to store user in Redux
        dispatch(setCurrentUser(user));

        // Store user ID in localStorage for persistence
        localStorage.setItem("userId", userDoc.id);

        // Set userId and userRole in cookies for middleware
        document.cookie = `userId=${userDoc.id}; path=/; max-age=2592000`; // 30 days
        document.cookie = `userRole=${userData.role}; path=/; max-age=2592000`; // 30 days

        toast({
          title: "Sign In Successful",
          description: "You have been signed in successfully.",
        });

        // Redirect based on user role
        const defaultPath = getDefaultPathForRole(userData.role);
        router.push(defaultPath);
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign In Failed",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            {step === "phone" &&
              "Enter your phone number to sign in to your account"}
            {step === "verification" && "Verify your phone number to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" && (
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  name="phoneNo"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={formik.values.phoneNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="h-11"
                />
                {formik.touched.phoneNo && formik.errors.phoneNo && (
                  <p className="text-sm text-red-500">
                    {formik.errors.phoneNo}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {step === "verification" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-center mb-2">
                  Verifying phone number:{" "}
                  <span className="font-medium">{formik.values.phoneNo}</span>
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Complete the verification process below
                </p>
              </div>

              {/* MSG91 Widget */}
              <MSG91Widget
                phoneNumber={formik.values.phoneNo}
                onVerificationSuccess={handleVerificationSuccess}
                widgetId={process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || ""}
                tokenAuth={process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || ""}
                variables={{
                  VAR1: "VITAL-E Voucher System",
                }}
              />

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setStep("phone")}
                  className="mt-4"
                >
                  Change Phone Number
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
