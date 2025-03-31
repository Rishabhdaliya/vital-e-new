import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";

export async function POST(request) {
  try {
    // Parse request body
    const { phoneNo, batchNo } = await request.json();

    // Validate input
    if (!phoneNo || !batchNo) {
      return NextResponse.json(
        { message: "Phone number and batch number are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^[0-9]{10}$/.test(phoneNo)) {
      return NextResponse.json(
        { message: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Validate batch number format
    if (!/^RSV-[0-9]{8}$/.test(batchNo)) {
      return NextResponse.json(
        { message: "Batch number must be in format RSV-XXXXXXXX" },
        { status: 400 }
      );
    }

    // Check if user exists
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("phoneNo", "==", phoneNo));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return NextResponse.json(
        { message: "No account found with this phone number" },
        { status: 404 }
      );
    }

    // Check if user is a RETAILER
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.role !== "RETAILER") {
      return NextResponse.json(
        {
          message: "Only retailers can claim vouchers. You are not authorized.",
        },
        { status: 403 }
      );
    }

    // Check if voucher exists and is unclaimed
    const vouchersRef = collection(db, "vouchers");
    const voucherQuery = query(
      vouchersRef,
      where("batchNo", "==", batchNo),
      where("status", "==", "UNCLAIMED")
    );
    const voucherSnapshot = await getDocs(voucherQuery);

    if (voucherSnapshot.empty) {
      return NextResponse.json(
        { message: "This voucher doesn't exist or has already been claimed" },
        { status: 404 }
      );
    }

    // Get voucher and user documents
    const voucherDoc = voucherSnapshot.docs[0];
    const voucherData = voucherDoc.data();
    const voucherId = voucherDoc.id;
    const userId = userDoc.id;

    // Get product information from voucher
    const productName = voucherData.productName || "Unknown Product";
    const productId = voucherData.productId || "";

    // Update voucher status
    await updateDoc(doc(db, "vouchers", voucherId), {
      status: "CLAIMED",
      claimedBy: userId,
      claimedAt: Timestamp.now(),
    });

    // Add voucher to user's vouchers array
    await updateDoc(doc(db, "users", userId), {
      vouchers: arrayUnion(voucherId),
    });

    // Return success response with product information
    return NextResponse.json({
      message: "Voucher claimed successfully",
      data: {
        product: {
          name: productName,
          id: productId,
        },
        voucher: {
          id: voucherId,
          batchNo: batchNo,
        },
        user: {
          id: userId,
          phoneNo: phoneNo,
        },
      },
    });
  } catch (error) {
    console.error("Error claiming voucher:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred", error: error.message },
      { status: 500 }
    );
  }
}
