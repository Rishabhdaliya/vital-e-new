"use client";

import { RegistrationForm } from "@/components/registration-form";
import { useToast } from "@/hooks/use-toast";
import { useAddUserMutation } from "@/redux/features/users/usersApi";
import { v4 as uuidv4 } from "uuid";

export default function Retailer() {
  const { toast } = useToast();
  const [addUser, { isLoading, isSuccess, isError, error }] =
    useAddUserMutation();

  const handleRegistrationForm = async (newUserDetails: any) => {
    try {
      await addUser(newUserDetails).unwrap(); // Use unwrap to get the response data
      // Handle success (e.g., redirect, show a message)
      console.log("Post created successfully!");
      toast({
        variant: "success",
        title: "Success",
        description: "The retailer has been registered successfully.",
      });
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
