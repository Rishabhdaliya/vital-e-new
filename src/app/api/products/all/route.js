import { NextResponse } from "next/server";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase/config";

// Function to fetch all products from Firestore
export async function GET() {
  try {
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(
      { message: "Products fetched successfully", data: products },
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

// Function to add a new product to Firestore
export async function POST(request) {
  try {
    const { name, phoneNo, city, role, isVerified, vouchers } =
      await request.json();
    const newProduct = {
      name,
      phoneNo,
      city,
      role,
      isVerified,
      vouchers,
      createdAt: new Date(),
    };

    // Check if a product with the same phone number already exists
    const productsRef = collection(db, "products");

    const querySnapshot = await getDocs(productsRef);
    const existingProduct = querySnapshot.docs.find(
      (doc) => doc.data().phoneNo === phoneNo
    );

    if (existingProduct) {
      return NextResponse.json(
        { message: "A product with this phone number already exists" },
        { status: 409 } // 409 Conflict status code
      );
    }

    const docRef = await addDoc(collection(db, "products"), newProduct);

    return NextResponse.json(
      {
        message: "Product added successfully",
        data: { id: docRef.id, ...newProduct },
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
