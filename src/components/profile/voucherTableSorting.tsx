"use client";

import type React from "react";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  sortField?: string;
  currentSortField?: string | null;
  currentSortDirection?: "asc" | "desc";
  onSort?: (field: string, direction: "asc" | "desc") => void;
  onHide?: () => void;
  canHide?: boolean;
  canSort?: boolean;
}

export function VoucherTableSorting({
  title,
  sortField,
  currentSortField,
  currentSortDirection,
  onSort,
  onHide,
  canHide = false,
  canSort = true,
  className,
}: DataTableColumnHeaderProps) {
  if (!canSort) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {currentSortField === sortField &&
            currentSortDirection === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : currentSortField === sortField &&
              currentSortDirection === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white" align="start">
          <DropdownMenuItem
            onClick={() => onSort && sortField && onSort(sortField, "asc")}
          >
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSort && sortField && onSort(sortField, "desc")}
          >
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          {canHide && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onHide && onHide()}>
                <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
