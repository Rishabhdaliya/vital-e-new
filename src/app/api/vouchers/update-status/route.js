import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const { voucherId, newStatus } = await request.json();

    // Validate input
    if (!voucherId || !newStatus) {
      return NextResponse.json(
        { error: "Voucher ID and new status are required" },
        { status: 400 }
      );
    }

    // Validate status value
    if (
      newStatus !== "CLAIMED" &&
      newStatus !== "UNCLAIMED" &&
      newStatus !== "EXPIRED"
    ) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Get current voucher data
    const voucherRef = doc(db, "vouchers", voucherId);
    const voucherSnap = await getDoc(voucherRef);

    if (!voucherSnap.exists()) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    const voucherData = voucherSnap.data();

    // Validate status change
    if (newStatus === "EXPIRED" && voucherData.status !== "CLAIMED") {
      return NextResponse.json(
        { error: "Only CLAIMED vouchers can be set to EXPIRED" },
        { status: 400 }
      );
    }

    // Update the voucher status
    await updateDoc(voucherRef, {
      status: newStatus,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: "Voucher status updated successfully",
      data: {
        id: voucherId,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Error updating voucher status:", error);
    return NextResponse.json(
      { error: "Failed to update voucher status" },
      { status: 500 }
    );
  }
}
