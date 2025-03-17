import React from "react";
import { RegistrationForm } from "../../components/registration-form";

const page = () => {
  return (
    <div>
      <RegistrationForm
        heading={"Customer Registration Form"}
        className="w-sm mx-auto mt-20"
      />
    </div>
  );
};

export default page;
