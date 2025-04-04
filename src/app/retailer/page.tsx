"use client";

import { RegistrationForm } from "@/components/registration-form";
import { useToast } from "@/hooks/use-toast";
import { useAddUserMutation } from "@/redux/features/users/usersApi";

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
    } catch (err: any) {
      toast({
        variant: "success",
        title: "Error",
        description: err?.data?.message,
      });
      // Handle error (e.g., display an error message)
      console.log("Error creating post:", err);
    }
  };
  return (
    <div className="flex justify-center items-center h-[calc(100vh)] bg-gray-100">
      <RegistrationForm
        role="RETAILER"
        handleRegistrationForm={handleRegistrationForm}
        heading={"Retailer Registration Form"}
        className="w-sm mx-auto mt-20"
      />
    </div>
  );
}
