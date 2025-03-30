import { NextResponse } from "next/server";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";

// Function to fetch all vouchers from Firestore
export async function GET() {
  try {
    const vouchersCollection = collection(db, "vouchers");
    const vouchersSnapshot = await getDocs(vouchersCollection);

    const vouchers = vouchersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(
      { message: "Vouchers fetched successfully", data: vouchers },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "error", error: error.message },
      { status: 500 }
    );
  }
}

// Function to add a new user to Firestore
export async function POST(request) {
  try {
    const { batchNo, status } = await request.json();
    const newVoucher = {
      batchNo,
      status,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "vouchers"), newVoucher);

    return NextResponse.json(
      {
        message: "Voucher added successfully",
        data: { id: docRef.id, ...newVoucher },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "error", error: error.message },
      { status: 500 }
    );
  }
}
