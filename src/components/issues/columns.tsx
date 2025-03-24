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
  setHiglighter,
} from "@/redux/features/issues/issueSlice";
import { MultiSelect } from "../ui/multiSelector";
import { User } from "../types/schema";
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
      <span className="text-xs font-normal   max-w-[250px] line-clamp-custom">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "phoneNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <span className="text-xs font-normal   max-w-[250px] line-clamp-custom">
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
      <span className="text-xs font-normal max-w-[500px] truncate ">
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
      <span className="text-xs font-normal max-w-[500px] truncate ">
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
      <span className="text-xs font-normal max-w-[500px] text-center ">
        {row.getValue("isVerified") ? (
          <span className="bg-transparent text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentcolor"
              className="w-5 h-5 "
            >
              <path
                fillRule="evenodd"
                d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        ) : (
          <span className="bg-transparent text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
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
      <span className="text-xs font-normal max-w-[500px] truncate ">
        {Array.isArray(row.getValue("vouchers")) &&
          Array.isArray(row.getValue("vouchers")) &&
          "Vouchers"}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
