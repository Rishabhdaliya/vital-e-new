import { NextResponse } from "next/server";
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { generateVouchers } from "@/lib/voucherGenerator";
import { db } from "@/lib/firebase/config";

// Function to generate a barcode from batch number
function generateBarcode(batchNo) {
  // Remove any non-alphanumeric characters and convert to uppercase
  const cleanBatchNo = batchNo.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  // Create a numeric representation by converting letters to their ASCII values
  let numericCode = "";
  for (let i = 0; i < cleanBatchNo.length; i++) {
    const char = cleanBatchNo.charAt(i);
    // If it's a number, use it directly
    if (!isNaN(Number.parseInt(char))) {
      numericCode += char;
    } else {
      // If it's a letter, use its ASCII code (A=65, B=66, etc.)
      numericCode += (char.charCodeAt(0) - 55).toString().padStart(2, "0");
    }
  }

  // Add a check digit (simple sum of all digits modulo 10)
  let sum = 0;
  for (let i = 0; i < numericCode.length; i++) {
    sum += Number.parseInt(numericCode.charAt(i));
  }
  const checkDigit = sum % 10;

  // Return the final barcode
  return numericCode + checkDigit;
}

// Function to check if a batchNo or barcode already exists in Firestore
async function checkExistingVoucher(batchNo, barcode) {
  const vouchersRef = collection(db, "vouchers");

  // Check for existing batchNo
  const batchNoQuery = query(vouchersRef, where("batchNo", "==", batchNo));
  const batchNoSnapshot = await getDocs(batchNoQuery);

  if (!batchNoSnapshot.empty) {
    return { exists: true, field: "batchNo" };
  }

  // Check for existing barcode
  const barcodeQuery = query(vouchersRef, where("barcode", "==", barcode));
  const barcodeSnapshot = await getDocs(barcodeQuery);

  if (!barcodeSnapshot.empty) {
    return { exists: true, field: "barcode" };
  }

  return { exists: false };
}

// Function to generate a unique batch number
function generateUniqueBatchNo() {
  const prefix = "RSV";
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}-${randomNum}`;
}

export async function POST(request) {
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

    // Step 2: Call the voucher generator function to generate vouchers
    const vouchers = generateVouchers(count);
    const processedVouchers = [];

    // Step 3: Save vouchers to Firestore using batch operation
    try {
      const batch = writeBatch(db);
      const vouchersCollection = collection(db, "vouchers");

      // Process each voucher to ensure uniqueness
      for (const voucher of vouchers) {
        let isUnique = false;
        let attempts = 0;
        let currentBatchNo = voucher.batchNo;
        let currentBarcode = "";

        // Try up to 5 times to generate a unique combination
        while (!isUnique && attempts < 5) {
          // If this is not the first attempt, generate a new batchNo
          if (attempts > 0) {
            currentBatchNo = generateUniqueBatchNo();
          }

          // Generate barcode for this batch number
          currentBarcode = generateBarcode(currentBatchNo);

          // Check if this combination already exists
          const checkResult = await checkExistingVoucher(
            currentBatchNo,
            currentBarcode
          );

          if (!checkResult.exists) {
            isUnique = true;
          } else {
            attempts++;
          }
        }

        if (!isUnique) {
          console.warn(
            `Could not generate unique voucher after 5 attempts, skipping`
          );
          continue;
        }

        // Create a barcode image URL
        const barcodeImageUrl = `https://barcodeapi.org/api/code128/${currentBarcode}`;

        // Add to Firestore batch
        const voucherRef = doc(vouchersCollection, voucher.id);
        batch.set(voucherRef, {
          id: voucher.id,
          status: voucher.status,
          createdAt: voucher.createdAt,
          batchNo: currentBatchNo,
          barcode: currentBarcode,
          barcodeImageUrl: barcodeImageUrl,
        });

        // Add to processed vouchers list
        processedVouchers.push({
          ...voucher,
          batchNo: currentBatchNo,
          barcode: currentBarcode,
          barcodeImageUrl: barcodeImageUrl,
        });
      }

      await batch.commit();
    } catch (firestoreError) {
      console.error("Error saving vouchers to Firestore:", firestoreError);
      // Continue and return the generated vouchers even if Firestore save fails
    }

    // Return the processed vouchers
    return NextResponse.json({ vouchers: processedVouchers });
  } catch (error) {
    console.error("Error generating vouchers:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
