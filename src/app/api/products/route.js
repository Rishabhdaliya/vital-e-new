import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

// GET handler to fetch products with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search") || "";

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const productsRef = collection(db, "products");

    // Build the base query
    const baseQuery = query(productsRef, orderBy(sortBy, sortOrder));

    // Get all products for search filtering (Firestore doesn't support text search natively)
    const allProductsSnapshot = await getDocs(baseQuery);

    // Filter products by search term if provided
    const filteredProducts = [];
    allProductsSnapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      if (
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase())
      ) {
        filteredProducts.push(product);
      }
    });

    // Get total count after filtering
    const totalCount = filteredProducts.length;

    // Apply pagination to filtered results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedProducts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
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

// PUT handler to update an existing product
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, quantity } = body;

    // Validate request body
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!name || quantity === undefined) {
      return NextResponse.json(
        { error: "Product name and quantity are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      name,
      quantity: Number(quantity),
      updatedAt: Timestamp.now(),
    };

    // Update in Firestore
    await updateDoc(productRef, updateData);

    return NextResponse.json({
      id,
      ...updateData,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
