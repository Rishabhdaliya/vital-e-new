"use client";

import { useGetUsersQuery } from "@/redux/features/users/usersApi";

import { columns } from "@/components/issues/columns";
import { DataTable } from "@/components/issues/data-table";

import { useGetAllIssuesQuery } from "@/redux/features/issues/issueApi";
import { useGetDefectStatusQuery } from "@/redux/features/defectStatus/defectStatusApi";
import { useGetConfigurationQuery } from "@/redux/features/configuration/configurationApi";
import { setAutoSync } from "@/redux/features/configuration/configurationSlice";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPersistedState } from "@/redux/resetPersistedState";
import { useToast } from "@/hooks/use-toast";
import SyncIcon from "@/lib/icons/syncIcon";
import { ResetIcon } from "@radix-ui/react-icons";
import { User } from "@/components/types/schema";

export default function Admin() {
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  const {
    data,
    isLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery(undefined);
  console.log(data);

  const handleRefetchData = async (type: string) => {
    try {
      setIsAnimating(type === "issues");
      let results: (User | unknown)[] = [];

      if (type === "all") {
        await resetPersistedState();
        results = await Promise.all([refetchUsers()]);
      }

      const allSuccess = results.every((result) => result !== undefined);
      if (type === "all") {
        toast({
          variant: allSuccess ? "success" : "destructive",
          title: allSuccess ? "Success" : "Error",
          description: allSuccess
            ? "All data (users) refetched successfully."
            : "Some data failed to refetch",
        });
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          (error instanceof Error && error.message) ||
          "Error resetting and refetching data",
      });
    } finally {
      if (type === "issues") {
        setTimeout(() => setIsAnimating(false), 3000); // Stop animation after 3 seconds
      }
    }
  };

  return (
    <>
      {" "}
      <div className="hidden h-full flex-1 flex-col space-y-2 px-8 py-4 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Welcome to Vital-E dashboard!
            </h2>
            <p className="text-muted-foreground text-sm">
              Here&apos;s a list of all registered Dealer, Retailers and
              Customers:
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className={
                isAnimating ? "bg-green-400 " : "bg-[#cb202d] cursor-pointer"
              }
              onClick={() => handleRefetchData("issues")}
            >
              <SyncIcon isAnimating={isAnimating} />
              Fetch users
            </Button>
          </div>
        </div>

        {/* Pass the actual issues to the DataTable */}
        <DataTable
          data={data?.data || []}
          isLoading={isLoading}
          columns={columns}
        />
      </div>
    </>
  );
}
