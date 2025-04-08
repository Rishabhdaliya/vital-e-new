"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

interface VoucherFormProps {
  className?: string;
  heading?: string;
  handleVoucherForm: (newVoucherDetails: any) => void;
}

const validationSchema = Yup.object({
  batchNo: Yup.string().required("batch number is required"),
});

export function VoucherForm({
  className,
  heading,
  handleVoucherForm,
  ...props
}: VoucherFormProps) {
  return (
    <div
      className={cn("flex flex-col rounded-[15px] gap-6", className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-black text-center">
            {heading}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details below for Voucher.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              batchNo: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleVoucherForm({
                ...values,
                status: "UNCLAIMED",
              });
            }}
          >
            {({ errors, touched, setFieldValue }) => (
              <Form className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="batchNo">Name</Label>
                  <Field
                    as={Input}
                    id="batchNo"
                    name="batchNo"
                    type="text"
                    placeholder="Enter your batchNo"
                  />
                  {errors.batchNo && touched.batchNo && (
                    <p className="text-red-500 text-sm">{errors.batchNo}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" variant="outline">
                    Add Voucher
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
