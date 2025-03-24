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
import { AutoSearch } from "@/components/ui/autoSearch";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { maharashtraCities } from "./constants/city";
import { OTPForm } from "./otpForm";

interface RegistrationFormProps {
  className?: string;
  heading?: string;
  role: string;
  handleRegistrationForm: (newUserDetails: any) => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  phoneNo: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  city: Yup.string().required("City is required"),
});

export function RegistrationForm({
  className,
  heading,
  handleRegistrationForm,
  role,
  ...props
}: RegistrationFormProps) {
  return (
    <div
      className={cn(
        "flex flex-col border-[0.1px] rounded-[15px] border-[#ff3445] gap-6",
        className
      )}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#cb202d] text-center">
            {heading}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details below for registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              name: "",
              phoneNo: "",
              city: "",
              role: role,
              vouchers: [],
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              console.log("here", values);
              handleRegistrationForm({
                ...values,
                isVerified: false,
              });
            }}
          >
            {({ errors, touched, setFieldValue }) => (
              <Form className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                  />
                  {errors.name && touched.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="phoneNo">WhatsApp Number</Label>
                  <Field
                    as={Input}
                    id="phoneNo"
                    name="phoneNo"
                    type="tel"
                    placeholder="1234567890"
                  />
                  {errors.phoneNo && touched.phoneNo && (
                    <p className="text-red-500 text-sm">{errors.phoneNo}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="city">City</Label>
                  <AutoSearch
                    cities={maharashtraCities}
                    onSelect={(value) => setFieldValue("city", value)}
                  />
                  {errors.city && touched.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>
                {/* <div className="grid gap-3 mx-auto">
                  <Label htmlFor="otp">OTP</Label>
                  <OTPForm phoneNumber={"7066612777"} />
                </div> */}
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-[#cb202d] text-white"
                  >
                    Register
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
