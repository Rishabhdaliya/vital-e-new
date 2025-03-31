import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// GET handler to fetch all products
export async function GET() {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST handler to add a new product
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.name || body.quantity === undefined) {
      return NextResponse.json(
        { error: "Product name and quantity are required" },
        { status: 400 }
      );
    }

    // Prepare data for Firestore
    const productData = {
      name: body.name,
      quantity: Number(body.quantity),
      createdAt: Timestamp.now(),
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, "products"), productData);

    return NextResponse.json({
      id: docRef.id,
      ...productData,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}
