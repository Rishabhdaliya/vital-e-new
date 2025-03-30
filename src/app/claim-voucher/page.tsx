"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
  type ConfirmationResult,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";

export default function ClaimVoucher() {
  const [step, setStep] = useState(1);
  const [verificationId, setVerificationId] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Use refs instead of window properties
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    const initializeRecaptcha = () => {
      try {
        // Clear any existing recaptcha
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }

        if (recaptchaContainerRef.current) {
          recaptchaContainerRef.current.innerHTML = "";

          // Create new reCAPTCHA verifier
          const verifier = new RecaptchaVerifier(
            auth,
            recaptchaContainerRef.current,
            {
              size: "normal",
              callback: () => {
                console.log("reCAPTCHA verified");
              },
              "expired-callback": () => {
                toast({
                  title: "reCAPTCHA Expired",
                  description: "Please solve the reCAPTCHA again.",
                  variant: "destructive",
                });
              },
            }
          );

          recaptchaVerifierRef.current = verifier;

          // Render the reCAPTCHA
          verifier.render().then((widgetId) => {
            console.log("reCAPTCHA rendered with widget ID:", widgetId);
          });
        }
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
      }
    };

    // Initialize reCAPTCHA after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeRecaptcha();
    }, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (error) {
          console.error("Error clearing reCAPTCHA:", error);
        }
      }
    };
  }, [toast]);

  // Form validation schema
  const phoneFormSchema = Yup.object().shape({
    phoneNo: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    batchNo: Yup.string()
      .matches(/^RSV-[0-9]{8}$/, "Batch number must be in format RSV-XXXXXXXX")
      .required("Batch number is required"),
  });

  const otpFormSchema = Yup.object().shape({
    otp: Yup.string()
      .matches(/^[0-9]{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  // Phone and batch number form
  const phoneForm = useFormik({
    initialValues: {
      phoneNo: "",
      batchNo: "",
    },
    validationSchema: phoneFormSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Check if voucher exists and is unclaimed
        const vouchersRef = collection(db, "vouchers");
        const q = query(
          vouchersRef,
          where("batchNo", "==", values.batchNo),
          where("status", "==", "UNCLAIMED")
        );
        const voucherSnapshot = await getDocs(q);

        if (voucherSnapshot.empty) {
          toast({
            title: "Invalid Batch Number",
            description:
              "This voucher doesn't exist or has already been claimed.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!recaptchaVerifierRef.current) {
          toast({
            title: "reCAPTCHA Error",
            description: "Please refresh the page and try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Send OTP
        const phoneNumber = `+91${values.phoneNo}`;

        try {
          const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            recaptchaVerifierRef.current
          );

          // Store the confirmation result
          confirmationResultRef.current = confirmationResult;
          setVerificationId(confirmationResult.verificationId);
          setIsOtpSent(true);
          setStep(2);

          toast({
            title: "OTP Sent",
            description: "Please check your phone for the verification code",
          });
        } catch (error: any) {
          console.error("Error sending OTP:", error);

          // Handle specific Firebase error codes
          if (error.code === "auth/invalid-phone-number") {
            toast({
              title: "Invalid Phone Number",
              description: "Please enter a valid phone number.",
              variant: "destructive",
            });
          } else if (
            error.code === "auth/captcha-check-failed" ||
            error.code === "auth/argument-error"
          ) {
            toast({
              title: "reCAPTCHA Verification Failed",
              description:
                "Please solve the reCAPTCHA again and try once more.",
              variant: "destructive",
            });

            // Reset reCAPTCHA
            if (recaptchaVerifierRef.current) {
              try {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;

                // Reinitialize reCAPTCHA
                if (recaptchaContainerRef.current) {
                  recaptchaContainerRef.current.innerHTML = "";

                  const verifier = new RecaptchaVerifier(
                    auth,
                    recaptchaContainerRef.current,
                    {
                      size: "normal",
                      callback: () => {
                        console.log("reCAPTCHA verified");
                      },
                    }
                  );

                  recaptchaVerifierRef.current = verifier;
                  verifier.render();
                }
              } catch (err) {
                console.error("Error resetting reCAPTCHA:", err);
              }
            }
          } else {
            toast({
              title: "Error",
              description: `Failed to send OTP: ${
                error.message || "Unknown error"
              }`,
              variant: "destructive",
            });
          }
        }
      } catch (error: any) {
        console.error("Error in form submission:", error);
        toast({
          title: "Error",
          description: `An unexpected error occurred: ${
            error.message || "Unknown error"
          }`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // OTP verification form
  const otpForm = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: otpFormSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Verify OTP using the stored confirmation result
        if (confirmationResultRef.current) {
          try {
            await confirmationResultRef.current.confirm(values.otp);
          } catch (error: any) {
            console.error("Error confirming OTP:", error);
            toast({
              title: "Invalid OTP",
              description: "The verification code you entered is incorrect.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        } else {
          // Fallback to credential-based verification if confirmationResult is not available
          try {
            const credential = PhoneAuthProvider.credential(
              verificationId,
              values.otp
            );
            await signInWithCredential(auth, credential);
          } catch (error: any) {
            console.error("Error with credential verification:", error);
            toast({
              title: "Verification Failed",
              description:
                "Invalid OTP or verification failed. Please try again.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }

        // Check if user exists
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("phoneNo", "==", phoneForm.values.phoneNo)
        );
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
          toast({
            title: "User not found",
            description: "No account found with this phone number.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Check if user is a RETAILER
        const userData = userSnapshot.docs[0].data();
        if (userData.role !== "RETAILER") {
          toast({
            title: "Access Denied",
            description:
              "Only retailers can claim vouchers. You are not authorized.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get voucher
        const vouchersRef = collection(db, "vouchers");
        const vQuery = query(
          vouchersRef,
          where("batchNo", "==", phoneForm.values.batchNo),
          where("status", "==", "UNCLAIMED")
        );
        const voucherSnapshot = await getDocs(vQuery);

        if (voucherSnapshot.empty) {
          toast({
            title: "Voucher not available",
            description:
              "This voucher doesn't exist or has already been claimed.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const voucherDoc = voucherSnapshot.docs[0];
        const voucherId = voucherDoc.id;

        // Assign voucher to user
        const userDoc = userSnapshot.docs[0];
        const userId = userDoc.id;

        // Update voucher status
        await updateDoc(doc(db, "vouchers", voucherId), {
          status: "CLAIMED",
          claimedBy: userId,
          claimedAt: new Date(),
        });

        // Add voucher to user's vouchers array
        await updateDoc(doc(db, "users", userId), {
          vouchers: arrayUnion(voucherId),
        });

        setSuccess(true);
        toast({
          title: "Success!",
          description: "Voucher has been successfully claimed.",
        });
      } catch (error: any) {
        console.error("Error in verification process:", error);
        toast({
          title: "Verification Failed",
          description: `Error: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="container max-w-md mt-10 mx-auto py-10">
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle>Voucher Claimed!</CardTitle>
            <CardDescription>
              Your voucher has been successfully added to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                setStep(1);
                setSuccess(false);
                setIsOtpSent(false);
                phoneForm.resetForm();
                otpForm.resetForm();
              }}
            >
              Claim Another Voucher
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Claim Your Voucher</CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your phone number and voucher batch number"
                : "Enter the verification code sent to your phone"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={phoneForm.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Phone Number</Label>
                  <Input
                    id="phoneNo"
                    name="phoneNo"
                    placeholder="10-digit phone number"
                    value={phoneForm.values.phoneNo}
                    onChange={phoneForm.handleChange}
                    onBlur={phoneForm.handleBlur}
                  />
                  {phoneForm.touched.phoneNo && phoneForm.errors.phoneNo && (
                    <p className="text-sm text-red-500">
                      {phoneForm.errors.phoneNo}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNo">Batch Number</Label>
                  <Input
                    id="batchNo"
                    name="batchNo"
                    placeholder="RSV-XXXXXXXX"
                    value={phoneForm.values.batchNo}
                    onChange={phoneForm.handleChange}
                    onBlur={phoneForm.handleBlur}
                  />
                  {phoneForm.touched.batchNo && phoneForm.errors.batchNo && (
                    <p className="text-sm text-red-500">
                      {phoneForm.errors.batchNo}
                    </p>
                  )}
                </div>

                <div className="my-4">
                  <Label>Complete the reCAPTCHA</Label>
                  <div ref={recaptchaContainerRef} className="mt-2"></div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    name="otp"
                    placeholder="6-digit OTP"
                    value={otpForm.values.otp}
                    onChange={otpForm.handleChange}
                    onBlur={otpForm.handleBlur}
                  />
                  {otpForm.touched.otp && otpForm.errors.otp && (
                    <p className="text-sm text-red-500">{otpForm.errors.otp}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
