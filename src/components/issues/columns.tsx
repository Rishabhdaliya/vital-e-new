"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { roles } from "./data/data";
import { Task, DefectStatus, Users, Configuration } from "./data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { AutoComplete } from "@/components/ui/autoComplete";
import { useUpdateIssueMutation } from "@/redux/features/issues/issueApi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  setSelectedIssues,
  setAllIssues,
  clearAllIssues,
  setHiglighter,
} from "@/redux/features/issues/issueSlice";
import { MultiSelect } from "../ui/multiSelector";
import { User } from "../types/schema";
export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const dispatch = useDispatch();
      const selectedIssues = useSelector(
        (state: { issues: { selectedIssues: Task[] } }) =>
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

      const handleRowSelect = (task: Task, isSelected: boolean) => {
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
];
