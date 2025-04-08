"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { roles } from "./data/data";
import { Users } from "./data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { AutoComplete } from "@/components/ui/autoComplete";
import { useUpdateIssueMutation } from "@/redux/features/issues/issueApi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  setSelectedIssues,
  setAllIssues,
  clearAllIssues,
} from "@/redux/features/issues/issueSlice";
import { MultiSelect } from "../ui/multiSelector";
import { User } from "../types/schema";
import Link from "next/link";
import { calculateVoucherMetrics } from "@/lib/utils/utils";
export const columns: ColumnDef<Users>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => {
  //     const dispatch = useDispatch();
  //     const selectedIssues = useSelector(
  //       (state: { issues: { selectedIssues: Users[] } }) =>
  //         state.issues.selectedIssues
  //     );

  //     const handleSelectAll = (isSelected: boolean) => {
  //       const allIssues = table.getRowModel().rows.map((row) => row.original);
  //       if (isSelected) {
  //         dispatch(setAllIssues(allIssues)); // Adds all issues to selectedIssues
  //       } else {
  //         dispatch(clearAllIssues()); // Clears selectedIssues
  //       }
  //       table.toggleAllPageRowsSelected(isSelected);
  //     };

  //     return (
  //       <Checkbox
  //         checked={selectedIssues.length === table.getRowModel().rows.length}
  //         onCheckedChange={(checked) => handleSelectAll(!!checked)}
  //         aria-label="Select all"
  //         className="translate-y-[2px]"
  //       />
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const dispatch = useDispatch();
  //     const selectedIssues = useSelector(
  //       (state: { issues: { selectedIssues: User[] } }) =>
  //         state.issues.selectedIssues
  //     );

  //     const handleRowSelect = (task: Users, isSelected: boolean) => {
  //       dispatch(setSelectedIssues({ task, selected: isSelected }));
  //       row.toggleSelected(isSelected);
  //     };

  //     return (
  //       <Checkbox
  //         checked={selectedIssues.some(
  //           (selectedIssue) => selectedIssue.id === row.original.id
  //         )}
  //         onCheckedChange={(checked) =>
  //           handleRowSelect(row.original, !!checked)
  //         }
  //         aria-label="Select row"
  //         className="translate-y-[2px]"
  //       />
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      // <Link href={`/user/${row.getValue("id")}`}>
      <span className="text-md font-normal max-w-[250px] line-clamp-custom">
        {row.getValue("name")}
      </span>
      // </Link>
    ),
  },
  {
    accessorKey: "phoneNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <span className="text-md font-normal   max-w-[250px] line-clamp-custom">
        {row.getValue("phoneNo")}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => (
      <span className="text-md font-normal max-w-[500px] truncate ">
        {row.getValue("city")}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <span className="text-md font-normal max-w-[500px] truncate ">
        {row.getValue("role")}
      </span>
    ),
  },
  {
    accessorKey: "isVerified",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="text-center"
        title="Verified"
      />
    ),
    cell: ({ row }) => (
      <span className="text-md font-normal max-w-[500px] text-center ">
        {row.getValue("isVerified") ? (
          <Badge
            variant="outline"
            className="mt-1 border-green-200 text-green-500 bg-green-50"
          >
            Verified
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="mt-1 border-red-200 text-red-500 bg-red-50"
          >
            unVerified
          </Badge>
        )}
      </span>
    ),
  },
  {
    accessorKey: "vouchers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vouchers" />
    ),
    cell: ({ row }) => {
      const {
        total: totalVouchers,
        claimed: claimedVouchers,
        unclaimed: unclaimedVouchers,
      } = calculateVoucherMetrics(row.getValue("vouchers"));
      return (
        <span className="text-md font-normal max-w-[500px] truncate ">
          Total: {totalVouchers} <br /> claimed: {claimedVouchers}, unclaimed :
          {unclaimedVouchers}
        </span>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="View" />
    ),
    cell: ({ row }) => (
      <Link href={`/user/${row.getValue("id")}`}>
        <span className="text-md text-[#f04d46] hover:bg-[#f04d46] hover:text-white border border-[#f04d46] p-2 rounded-sm cursor-pointer font-normal max-w-[500px] truncate ">
          Update
        </span>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
