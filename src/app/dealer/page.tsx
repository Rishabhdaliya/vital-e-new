"use client";

import { RegistrationForm } from "@/components/registration-form";
import { useToast } from "@/hooks/use-toast";
import { useAddUserMutation } from "@/redux/features/users/usersApi";

export default function Dealer() {
  const [addUser, { isLoading, isSuccess, isError, error }] =
    useAddUserMutation();

  const handleRegistrationForm = async (newUserDetails: any) => {
    const { toast } = useToast();
    try {
      await addUser(newUserDetails).unwrap(); // Use unwrap to get the response data
      // Handle success (e.g., redirect, show a message)
      toast({
        variant: "success",
        title: "Success",
        description: "The dealer has been registered successfully.",
      });
    } catch (err) {
      // Handle error (e.g., display an error message)
      console.error("Error creating post:", err);
    }
  };
  return (
    <>
      <RegistrationForm
        role="DEALER"
        handleRegistrationForm={handleRegistrationForm}
        heading={"Dealer Registration Form"}
        className="w-sm mx-auto mt-20"
      />
    </>
  );
}
