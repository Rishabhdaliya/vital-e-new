import SignInForm from "@/components/signInForm";
import React from "react";

const SignIn = () => {
  return (
    <div>
      <SignInForm skipOtp={process.env.NEXT_PUBLIC_SKIP_OTP !== "true"} />
    </div>
  );
};

export default SignIn;
