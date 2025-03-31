"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Loader2, ArrowRight, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "@/redux/features/users/usersSlice";
import { auth, db } from "@/lib/firebase/config";

export default function SignInPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Setup reCAPTCHA verifier
  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal",
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      }
    );
  };

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

        // Setup reCAPTCHA
        setupRecaptcha();

        // Send OTP
        const phoneNumber = `+91${values.phoneNo}`; // Assuming Indian phone numbers
        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          window.recaptchaVerifier
        );
        setConfirmationResult(confirmation);

        // Move to OTP verification step
        setStep("otp");
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Verify OTP
  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Verify OTP
      await confirmationResult.confirm(otp);

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
        console.log(user);

        // Dispatch action to store user in Redux
        dispatch(setCurrentUser(user));

        // Store user ID in localStorage for persistence
        localStorage.setItem("userId", userDoc.id);

        toast({
          title: "Sign In Successful",
          description: "You have been signed in successfully.",
        });

        // Redirect based on user role
        if (userData.role === "CUSTOMER") {
          router.push("/customer");
        } else if (userData.role === "DEALER") {
          router.push("/retailer");
        } else if (userData.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center  p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center">
            VITAL-E
          </CardTitle>
          <CardDescription className="text-lg font-semibold text-center">
            Sign In
          </CardDescription>
          <CardDescription className="text-center">
            {step === "phone" &&
              "Enter your phone number to sign in to your account"}
            {step === "otp" && "Enter the verification code sent to your phone"}
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

              <div id="recaptcha-container" className="mt-4"></div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
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

          {step === "otp" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center my-4">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  We sent a code to +91 {formik.values.phoneNo}
                </p>
              </div>

              <Button
                onClick={verifyOTP}
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="flex items-center justify-between">
                <Button
                  variant="link"
                  className="px-0"
                  onClick={() => setStep("phone")}
                  disabled={loading}
                >
                  Change phone number
                </Button>

                <Button
                  variant="link"
                  className="px-0"
                  onClick={() => {
                    // Resend OTP logic
                    setupRecaptcha();
                    const phoneNumber = `+91${formik.values.phoneNo}`;
                    signInWithPhoneNumber(
                      auth,
                      phoneNumber,
                      window.recaptchaVerifier
                    )
                      .then((confirmation) => {
                        setConfirmationResult(confirmation);
                        toast({
                          title: "OTP Resent",
                          description:
                            "A new verification code has been sent to your phone.",
                        });
                      })
                      .catch((error) => {
                        console.error("Error resending OTP:", error);
                        toast({
                          title: "Error",
                          description:
                            "Failed to resend OTP. Please try again.",
                          variant: "destructive",
                        });
                      });
                  }}
                  disabled={loading}
                >
                  Resend code
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {/* <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </div>
        </CardFooter> */}
      </Card>
    </div>
  );
}
