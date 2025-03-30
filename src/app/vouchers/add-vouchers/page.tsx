"use client";

import { VoucherForm } from "@/components/addVouchers";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAddVoucherMutation } from "@/redux/features/vouchers/vouchersApi";

export default function Dealer() {
  const { toast } = useToast();
  const [addVouchers, { isLoading, isSuccess, isError, error }] =
    useAddVoucherMutation();

  const handleVoucherForm = async (newVoucherDetails: any) => {
    try {
      await addVouchers(newVoucherDetails).unwrap(); // Use unwrap to get the response data      // Handle success (e.g., redirect, show a message)
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
    <div className="flex justify-center items-center h-[calc(100vh)] bg-gray-100">
      <VoucherForm
        handleVoucherForm={handleVoucherForm}
        heading={" Vouchers Form"}
        className="w-sm mx-auto mt-20"
      />
    </div>
  );
}
