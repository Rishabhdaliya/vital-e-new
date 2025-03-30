import { NextResponse } from "next/server";
import { collection, doc, writeBatch } from "firebase/firestore";
import { generateVouchers } from "@/lib/voucherGenerator";
import { db } from "@/lib/firebase/config";

export async function POST(request) {
  console.log("POST request received for bulk voucher generation");

  try {
    const body = await request.json();
    const { count } = body;

    if (!count || count <= 0 || count > 1000) {
      return NextResponse.json(
        { error: "Count must be a positive number between 1 and 1000." },
        { status: 400 }
      );
    }

    // Step 1: Check the count from the request
    console.log(`Generating ${count} vouchers`);

    // Step 2: Call the voucher generator function to generate vouchers
    const vouchers = generateVouchers(count);

    // Step 3: Save vouchers to Firestore using batch operation
    try {
      const batch = writeBatch(db);
      const vouchersCollection = collection(db, "vouchers");

      // We don't need to check for existing vouchers as per your requirement
      for (const voucher of vouchers) {
        const voucherRef = doc(vouchersCollection, voucher.id);
        batch.set(voucherRef, {
          id: voucher.id,
          status: voucher.status,
          createdAt: voucher.createdAt,
          batchNo: voucher.batchNo,
        });
      }

      await batch.commit();
      console.log(
        `Successfully saved ${vouchers.length} vouchers to Firestore`
      );
    } catch (firestoreError) {
      console.error("Error saving vouchers to Firestore:", firestoreError);
      // Continue and return the generated vouchers even if Firestore save fails
    }

    // Return the generated vouchers
    return NextResponse.json({ vouchers });
  } catch (error) {
    console.error("Error generating vouchers:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
