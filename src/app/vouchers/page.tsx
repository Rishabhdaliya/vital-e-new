"use client";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import VoucherTable from "@/components/profile/voucher-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGetVouchersQuery } from "@/redux/features/vouchers/vouchersApi";
import { log } from "console";
import VoucherGenerator from "@/components/VoucherGenerator";
import * as React from "react";

// import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

function DrawerDialogDemo() {
  const [open, setOpen] = React.useState(false);
  // const isDesktop = useMediaQuery("(min-width: 768px)");

  // if (isDesktop) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Upload Voucher</Button>
      </DialogTrigger>
      <Card>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Bulk Upload Voucher</DialogTitle>
          <VoucherGenerator />
        </DialogContent>
      </Card>
    </Dialog>
  );
}

export default function UserProfilePage({ params }: { params: any }) {
  const { data: vouchers, error, isLoading } = useGetVouchersQuery(params.id);
  const { toast } = useToast();

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    toast({ title: "Error", description: "Failed to load vouchers." });
    return null;
  }

  if (!vouchers) {
    notFound();
  }

  return (
    <div className="mt-20 md:px-8 py-4 mx-auto">
      <div className="mb-4 flex items-center justify-end space-x-2">
        <DrawerDialogDemo />
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <VoucherTable vouchers={vouchers?.data} />
      </Suspense>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
