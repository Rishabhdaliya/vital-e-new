"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MSG91Widget } from "@/components/otp/msg91-widget";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CheckCircle, Smartphone } from "lucide-react";
import { useSelector } from "react-redux";

export default function VerifyPhonePage() {
  const router = useRouter();
  const { toast } = useToast();
  const currentUser = useSelector((state: any) => state.users.currentUser);
  const [step, setStep] = useState<"phone" | "verification" | "success">(
    "phone"
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  // Form validation schema
  const validationSchema = Yup.object({
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      phoneNumber: currentUser?.phoneNo || "",
    },
    validationSchema,
    onSubmit: (values) => {
      setPhoneNumber(values.phoneNumber);
      setStep("verification");
    },
  });

  // Handle verification success
  const handleVerificationSuccess = async (token: string) => {
    try {
      if (!currentUser?.id) {
        toast({
          title: "Error",
          description: "User not found. Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      // Update user in Firestore
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        isVerified: true,
        updatedAt: new Date(),
      });

      toast({
        title: "Verification Complete",
        description: "Your phone number has been verified successfully",
      });

      // Move to success step
      setStep("success");
    } catch (error: any) {
      console.error("Error updating user verification status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  // Handle verification failure
  const handleVerificationFailure = (error: any) => {
    console.error("Verification failed:", error);
    toast({
      title: "Verification Failed",
      description: error.message || "Failed to verify your phone number",
      variant: "destructive",
    });
  };

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card className="border-t-4 border-t-[#f04d46]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Phone Verification
          </CardTitle>
          <CardDescription className="text-center">
            {step === "phone" &&
              "Enter your phone number to verify your account"}
            {step === "verification" && "Complete the verification process"}
            {step === "success" && "Your phone number has been verified"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" && (
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter your 10-digit phone number"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <p className="text-sm text-red-500">
                    {typeof formik.errors.phoneNumber === "string" &&
                      formik.errors.phoneNumber}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#f04d46] hover:bg-[#f04d46]/90"
              >
                Continue
              </Button>
            </form>
          )}

          {step === "verification" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                <Smartphone className="h-12 w-12 text-[#f04d46] mb-4" />
                <p className="text-center mb-2">
                  Verification in progress for{" "}
                  <span className="font-medium">{phoneNumber}</span>
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Please complete the verification process in the widget below
                </p>
              </div>

              {/* MSG91 Widget */}
              <MSG91Widget
                phoneNumber={phoneNumber}
                onVerificationSuccess={handleVerificationSuccess}
                onVerificationFailure={handleVerificationFailure}
                widgetId="YOUR_WIDGET_ID" // Replace with your actual widget ID
                tokenAuth="YOUR_TOKEN_AUTH" // Replace with your actual token
                variables={{
                  VAR1: "VITAL-E Voucher System", // Custom variable for your app name
                }}
              />

              <div className="text-center">
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

          {step === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <h3 className="text-xl font-bold">Verification Complete</h3>

              <p className="text-center text-gray-600">
                Your phone number has been successfully verified. You can now
                access all features of the application.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {step === "success" && (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-[#f04d46] hover:bg-[#f04d46]/90"
            >
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
