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
export const columns: ColumnDef<Users>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const dispatch = useDispatch();
      const selectedIssues = useSelector(
        (state: { issues: { selectedIssues: Users[] } }) =>
          state.issues.selectedIssues
      );

      const handleSelectAll = (isSelected: boolean) => {
        const allIssues = table.getRowModel().rows.map((row) => row.original);
        if (isSelected) {
          dispatch(setAllIssues(allIssues)); // Adds all issues to selectedIssues
        } else {
          dispatch(clearAllIssues()); // Clears selectedIssues
        }
        table.toggleAllPageRowsSelected(isSelected);
      };

      return (
        <Checkbox
          checked={selectedIssues.length === table.getRowModel().rows.length}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      );
    },
    cell: ({ row }) => {
      const dispatch = useDispatch();
      const selectedIssues = useSelector(
        (state: { issues: { selectedIssues: User[] } }) =>
          state.issues.selectedIssues
      );

      const handleRowSelect = (task: Users, isSelected: boolean) => {
        dispatch(setSelectedIssues({ task, selected: isSelected }));
        row.toggleSelected(isSelected);
      };

      return (
        <Checkbox
          checked={selectedIssues.some(
            (selectedIssue) => selectedIssue.id === row.original.id
          )}
          onCheckedChange={(checked) =>
            handleRowSelect(row.original, !!checked)
          }
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <Link href={`/user/${row.getValue("id")}`}>
        <span className="text-md text-blue-500 underline font-normal  max-w-[250px] line-clamp-custom">
          {row.getValue("name")}
        </span>
      </Link>
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
            className="mt-1 border-green-500 text-green-500"
          >
            Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="mt-1 border-red-500 text-red-500">
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
    cell: ({ row }) => (
      <span className="text-md font-normal max-w-[500px] truncate ">
        {Array.isArray(row.getValue("vouchers")) &&
          Array.isArray(row.getValue("vouchers")) &&
          "Vouchers"}
      </span>
    ),
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
        <span className="text-md text-indigo-500 underline cursor-pointer font-normal max-w-[500px] truncate ">
          View/Update
        </span>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
