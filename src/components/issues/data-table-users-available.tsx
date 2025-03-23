"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUpdateUsersMutation } from "@/redux/features/users/usersApi";
import { User } from "../types/schema";

interface DataTableUsersOptionsProps {
  users: User[];
}

export function DataTableUserAvailable({ users }: DataTableUsersOptionsProps) {
  const [updateUsers] = useUpdateUsersMutation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          Users Available
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel className=" text-sm font-medium ">
          Update Availability
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* {users.filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          ) */}
        {users &&
          Array.isArray(users) &&
          users?.map((item) => {
            return (
              <DropdownMenuCheckboxItem
                key={item.id}
                className="capitalize"
                checked={true}
                // onCheckedChange={() =>
                //   updateUsers({
                //     userId: item.id,
                //     updatedUserPayload: { isAvailable: !item.isAvailable }, // Correct payload structure
                //   })
                // }
              >
                {item.name}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
