"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { roles } from "./data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useSelector } from "react-redux";
import { Users } from "./data/schema";
import { transformUsersToOptions } from "@/lib/utils";
import { DataTableUserAvailable } from "./data-table-users-available";
import { User } from "../types/schema";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const users = useSelector(
    (state: { users: { data: User[] } }) => state.users.data
  );

  const usersOptions = transformUsersToOptions(users);

  return (
    <div className="flex items-center  gap-1 justify-between">
      <div className="flex flex-1 gap-1  items-centerspace-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Role"
            options={roles}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableUserAvailable users={users} />
      <DataTableViewOptions table={table} />
    </div>
  );
}
