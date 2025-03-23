"use client";

import { RegistrationForm } from "@/components/registration-form";
import { useAddUserMutation } from "@/redux/features/users/usersApi";

export default function Retailer() {
  const [addUser, { isLoading, isSuccess, isError, error }] =
    useAddUserMutation();

  const handleRegistrationForm = async (newUserDetails: any) => {
    try {
      await addUser(newUserDetails).unwrap(); // Use unwrap to get the response data
      // Handle success (e.g., redirect, show a message)
      console.log("Post created successfully!");
    } catch (err) {
      // Handle error (e.g., display an error message)
      console.error("Error creating post:", err);
    }
  };
  return (
    <>
      <RegistrationForm
        role="RETAILER"
        handleRegistrationForm={handleRegistrationForm}
        heading={"Retailer Registration Form"}
        className="w-sm mx-auto mt-20"
      />
    </>
  );
}
