import { collection, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { userId } = await params;
    if (!userId) {
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
    const userRef = doc(usersCollection, userId);

    const updateData = { isAvailable };

    // Perform the update
    try {
      await updateDoc(userRef, updateData);
      console.log("Users Document updated successfully");
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
    let updatedUserDoc;
    try {
      updatedUserDoc = await getDoc(userRef);
      console.log("Fetched updated document:", updatedUserDoc.data());
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
      // Include the userId in the response
      const userData = updatedUserDoc.data();
      return NextResponse.json({
        message: "User updated successfully",
        status: 200,
        data: {
          id: userId, // Include the userId here
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
