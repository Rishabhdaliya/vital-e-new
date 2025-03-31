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
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClaimVoucher() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

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

        // Check if voucher exists and is unclaimed
        const vouchersRef = collection(db, "vouchers");
        const voucherQuery = query(
          vouchersRef,
          where("batchNo", "==", values.batchNo),
          where("status", "==", "UNCLAIMED")
        );
        const voucherSnapshot = await getDocs(voucherQuery);

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

        // Get voucher and user documents
        const voucherDoc = voucherSnapshot.docs[0];
        const voucherId = voucherDoc.id;
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
        console.error("Error claiming voucher:", error);
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

  return (
    <div className="container max-w-md mt-10 mx-auto py-10">
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Voucher Claimed!</CardTitle>
            <CardDescription className="text-center">
              Your voucher has been successfully added to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                setSuccess(false);
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
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
