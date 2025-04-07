"use client";

import { RegistrationForm } from "@/components/registration-form";
import { User } from "@/components/types/schema";
import { useToast } from "@/hooks/use-toast";
import { useAddUserMutation } from "@/redux/features/users/usersApi";
import { v4 as uuidv4 } from "uuid";

export default function Customer() {
  const [addUser, { isLoading, isSuccess, isError, error }] =
    useAddUserMutation();
  const { toast } = useToast();

  const handleRegistrationForm = async (newUserDetails: User) => {
    try {
      await addUser(newUserDetails).unwrap(); // Use unwrap to get the response data      // Handle success (e.g., redirect, show a message)
      toast({
        variant: "success",
        title: "Success",
        description: "The customer has been registered successfully.",
      });
    } catch (err) {
      // Handle error (e.g., display an error message)
      console.error("Error creating post:", err);
    }
  };
  return (
    <div className="flex justify-center items-center h-[calc(100vh)]">
      <RegistrationForm
        role="CUSTOMER"
        handleRegistrationForm={handleRegistrationForm}
        heading={"Customer Registration Form"}
        className="w-sm mx-auto mt-20"
      />
    </div>
  );
}
