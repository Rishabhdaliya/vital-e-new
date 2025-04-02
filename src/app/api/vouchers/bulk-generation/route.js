import { NextResponse } from "next/server";
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
  Timestamp,
  increment,
  updateDoc,
} from "firebase/firestore";
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
function generateBatchNo(prefix = "RSV") {
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}-${randomNum}`;
}

// Function to get available products from Firestore
async function getAvailableProducts() {
  try {
    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsRef);

    const products = [];
    productsSnapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      if (product.quantity > 0) {
        products.push(product);
      }
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch available products");
  }
}

export async function POST(request) {
  console.log("POST request received for voucher generation");

  try {
    const body = await request.json();
    const { prefix = "RSV", count } = body;

    if (!count || count <= 0 || count > 100) {
      return NextResponse.json(
        { error: "Count must be a positive number between 1 and 100." },
        { status: 400 }
      );
    }

    // Get available products
    const availableProducts = await getAvailableProducts();

    if (availableProducts.length === 0) {
      return NextResponse.json(
        { error: "No products available with quantity greater than 0." },
        { status: 400 }
      );
    }

    console.log(`Generating ${count} vouchers with prefix ${prefix}`);

    // Generate vouchers
    const generatedVouchers = [];
    const batch = writeBatch(db);
    const vouchersCollection = collection(db, "vouchers");

    // Track product quantities to update
    const productUpdates = {};

    // Generate vouchers
    for (let i = 0; i < count; i++) {
      // Filter products that still have quantity
      const productsWithQuantity = availableProducts.filter((product) =>
        productUpdates[product.id]
          ? product.quantity - productUpdates[product.id] > 0
          : product.quantity > 0
      );

      if (productsWithQuantity.length === 0) {
        console.log(`Stopped at ${i} vouchers - all products depleted`);
        break;
      }

      // Generate unique batch number and barcode
      let isUnique = false;
      let attempts = 0;
      let currentBatchNo = "";
      let currentBarcode = "";

      while (!isUnique && attempts < 5) {
        currentBatchNo = generateBatchNo(prefix);
        currentBarcode = generateBarcode(currentBatchNo);

        // Check if this combination already exists
        const checkResult = await checkExistingVoucher(
          currentBatchNo,
          currentBarcode
        );

        if (!checkResult.exists) {
          isUnique = true;
        } else {
          console.log(`Duplicate ${checkResult.field} found, retrying...`);
          attempts++;
        }
      }

      if (!isUnique) {
        console.warn(
          `Could not generate unique voucher after 5 attempts, skipping`
        );
        continue;
      }

      // Randomly select a product with available quantity
      const randomIndex = Math.floor(
        Math.random() * productsWithQuantity.length
      );
      const selectedProduct = productsWithQuantity[randomIndex];

      // Track product quantity update
      if (!productUpdates[selectedProduct.id]) {
        productUpdates[selectedProduct.id] = 1;
      } else {
        productUpdates[selectedProduct.id]++;
      }

      // Create barcode image URL
      const barcodeImageUrl = `https://barcodeapi.org/api/code128/${currentBarcode}`;

      // Create a unique ID for the voucher
      const voucherId = `${prefix}-${Date.now()}-${i}`;

      // Add to Firestore batch
      const voucherRef = doc(vouchersCollection, voucherId);
      const now = new Date();

      batch.set(voucherRef, {
        id: voucherId,
        status: "UNCLAIMED",
        createdAt: Timestamp.now(),
        batchNo: currentBatchNo,
        barcode: currentBarcode,
        barcodeImageUrl: barcodeImageUrl,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
      });

      // Add to generated vouchers list for response
      generatedVouchers.push({
        id: voucherId,
        batchNo: currentBatchNo,
        barcode: currentBarcode,
        barcodeImageUrl: barcodeImageUrl,
        productName: selectedProduct.name,
        createdAt: now.toISOString(),
        status: "UNCLAIMED",
      });
    }

    // Commit the batch write
    await batch.commit();
    console.log(
      `Successfully saved ${generatedVouchers.length} vouchers to Firestore`
    );

    // Update product quantities
    for (const [productId, quantityDecrement] of Object.entries(
      productUpdates
    )) {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        quantity: increment(-quantityDecrement),
      });
      console.log(
        `Updated product ${productId} quantity: -${quantityDecrement}`
      );
    }

    // Return the generated vouchers
    return NextResponse.json({
      vouchers: generatedVouchers,
      message: `Successfully generated ${generatedVouchers.length} vouchers`,
    });
  } catch (error) {
    console.error("Error generating vouchers:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
