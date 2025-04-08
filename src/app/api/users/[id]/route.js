import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      console.error("User ID is missing");
      return NextResponse.json(
        { message: "User ID is missing in the request params" },
        { status: 400 }
      );
    }

    // Log the request body
    const { isAvailable } = await req.json();

    if (typeof isAvailable !== "boolean") {
      console.error("isAvailable should be a boolean");
      return NextResponse.json(
        { message: "Invalid isAvailable value" },
        { status: 400 }
      );
    }

    // Reference to the users collection in Firestore
    const usersCollection = collection(db, "users");
    const userRef = doc(usersCollection, id);

    const updateData = { isAvailable };

    // Perform the update
    try {
      await updateDoc(userRef, updateData);
    } catch (updateError) {
      return NextResponse.json(
        {
          message: "Error updating user document",
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    // Fetch the updated document
    let updatedUserDoc;
    try {
      updatedUserDoc = await getDoc(userRef);
    } catch (fetchError) {
      console.error("Error fetching document:", fetchError);
      return NextResponse.json(
        {
          message: "Error fetching updated user data",
          error: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (updatedUserDoc.exists()) {
      // Include the id in the response
      const userData = updatedUserDoc.data();
      return NextResponse.json({
        message: "User updated successfully",
        status: 200,
        data: {
          id: id, // Include the id here
          ...userData, // Spread the rest of the document data
        },
      });
    } else {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", error: error.message },
      { status: 500 }
    );
  }
}

// GET handler to fetch a specific user
export async function GET(request, { params }) {
  const { id } = await params;

  try {
    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user document
    const userDoc = await getDoc(doc(db, "users", id));

    if (!userDoc.exists()) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    return NextResponse.json({
      message: "User data retrieved successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
