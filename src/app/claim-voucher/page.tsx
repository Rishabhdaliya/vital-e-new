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
import {
  CheckCircle2,
  Loader2,
  Gift,
  SnowflakeIcon as Confetti,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClaimVoucherMutation } from "@/redux/features/vouchers/vouchersApi";

export default function ClaimVoucher() {
  const [success, setSuccess] = useState(false);
  const [claimedProduct, setClaimedProduct] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const { toast } = useToast();

  // Use the RTK Query mutation hook
  const [claimVoucher, { isLoading }] = useClaimVoucherMutation();

  // Form validation schema
  const formSchema = Yup.object().shape({
    phoneNo: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    batchNo: Yup.string()
      .matches(/^RSV-[0-9]{8}$/, "Batch number must be in format RSV-XXXXXXXX")
      .required("Batch number is required"),
  });

  // Form setup
  const formik = useFormik({
    initialValues: {
      phoneNo: "",
      batchNo: "",
    },
    validationSchema: formSchema,
    onSubmit: async (values) => {
      try {
        // Use the RTK Query mutation to claim the voucher
        const result = await claimVoucher({
          phoneNo: values.phoneNo,
          batchNo: values.batchNo,
        }).unwrap(); // unwrap() extracts the payload from the fulfilled action

        // Set claimed product for display
        if (result.data?.product) {
          setClaimedProduct({
            name: result.data.product.name,
            id: result.data.product.id,
          });
        }

        setSuccess(true);
        toast({
          title: "Success!",
          description: "Voucher has been successfully claimed.",
        });
      } catch (error: any) {
        console.error("Error claiming voucher:", error);
        toast({
          title: "Error",
          description: error.data?.message || "Failed to claim voucher",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <div className="container max-w-md h-[100vh] flex justify-center items-center mx-auto py-10">
      {success ? (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative overflow-hidden">
            {/* Animated confetti particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <span
                  key={i}
                  className="absolute block w-2 h-2 rounded-full opacity-70"
                  style={{
                    backgroundColor: [
                      "#FFD700",
                      "#FF3E4D",
                      "#22CAFC",
                      "#4EF6A5",
                      "#FFEB3B",
                    ][i % 5],
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `confetti-fall ${
                      2 + Math.random() * 3
                    }s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex justify-center mb-4">
              <div className="relative">
                {/* Animated sparkles around the gift */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3"
                    style={{
                      top: `${Math.sin((i * Math.PI * 2) / 5) * 40 + 50}%`,
                      left: `${Math.cos((i * Math.PI * 2) / 5) * 40 + 50}%`,
                      animation: `sparkle ${
                        1 + Math.random()
                      }s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  >
                    <Confetti className="h-full w-full text-yellow-300 animate-pulse" />
                  </div>
                ))}

                {/* Animated gift icon */}
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center relative z-10 animate-bounce-slow">
                  <div className="absolute inset-0 rounded-full bg-white/10 animate-ping-slow opacity-75"></div>
                  <Gift className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>
            </div>

            <CardTitle className="text-center text-2xl font-bold animate-fade-in">
              Congratulations!
            </CardTitle>
            <CardDescription className="text-center text-white/90 mt-2 animate-slide-up">
              You've successfully claimed your voucher
            </CardDescription>
          </div>

          <CardContent>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 animate-fade-in">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                You won:
              </h3>
              <p className="text-xl font-bold text-blue-900 animate-highlight">
                {claimedProduct?.name || "Product"}
              </p>
            </div>

            <div className="space-y-3 animate-fade-in-delayed">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Voucher Batch Number:
                </p>
                <p className="font-medium">{formik.values.batchNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Claimed By:</p>
                <p className="font-medium">{formik.values.phoneNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status:</p>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-1 animate-check" />
                  <span className="text-green-600 font-medium">Claimed</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              variant="filled"
              onClick={() => {
                setSuccess(false);
                setClaimedProduct(null);
                formik.resetForm();
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
              Enter your phone number and voucher batch number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  name="phoneNo"
                  placeholder="10-digit phone number"
                  value={formik.values.phoneNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phoneNo && formik.errors.phoneNo && (
                  <p className="text-sm text-red-500">
                    {formik.errors.phoneNo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNo">Batch Number</Label>
                <Input
                  id="batchNo"
                  name="batchNo"
                  placeholder="RSV-XXXXXXXX"
                  value={formik.values.batchNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.batchNo && formik.errors.batchNo && (
                  <p className="text-sm text-red-500">
                    {formik.errors.batchNo}
                  </p>
                )}
              </div>

              <Button variant="filled" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Claim Voucher"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
