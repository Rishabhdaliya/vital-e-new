import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function PUT(req, { params }) {
  try {
    // Await the params object to get the id
    const { id } = await params;

    if (!id) {
      console.error("User ID is missing");
      return NextResponse.json(
        { message: "User ID is missing in the request params" },
        { status: 400 }
      );
    }

    // Clone the request to avoid "body already used" errors
    const clonedReq = req.clone();

    // Parse request body with error handling
    let updateData;
    try {
      updateData = await clonedReq.json();
      console.log("Update data received:", updateData);
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json(
        {
          message: "Invalid JSON in request body",
          error: jsonError.message,
        },
        { status: 400 }
      );
    }

    // Reference to the user document in Firestore
    const userRef = doc(db, "users", id);

    // Check if user exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Add updatedAt timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Perform the update
    try {
      await updateDoc(userRef, dataToUpdate);
    } catch (updateError) {
      console.error("Error updating document:", updateError);
      return NextResponse.json(
        {
          message: "Error updating user document",
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    // Fetch the updated document
    const updatedUserDoc = await getDoc(userRef);

    if (updatedUserDoc.exists()) {
      // Include the id in the response
      const userData = updatedUserDoc.data();
      return NextResponse.json({
        message: "User updated successfully",
        status: 200,
        data: {
          id: id,
          ...userData,
        },
      });
    } else {
      return NextResponse.json(
        { message: "User not found after update", status: 404 },
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
  try {
    // Await the params object to get the id
    const { id } = await params;

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
