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

export async function GET(request, { params }) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user document
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    // Get vouchers for this user
    const vouchersRef = collection(db, "vouchers");
    let userVouchers = [];

    // If user has voucher IDs, fetch those vouchers
    if (
      userData.vouchers &&
      Array.isArray(userData.vouchers) &&
      userData.vouchers.length > 0
    ) {
      // Fetch each voucher by ID
      const voucherPromises = userData.vouchers.map(async (voucherId) => {
        const voucherDoc = await getDoc(doc(db, "vouchers", voucherId));
        if (voucherDoc.exists()) {
          return {
            id: voucherDoc.id,
            ...voucherDoc.data(),
          };
        }
        return null;
      });

      userVouchers = (await Promise.all(voucherPromises)).filter(Boolean);
    } else {
      // If no voucher IDs, check for vouchers claimed by this user
      const voucherQuery = query(vouchersRef, where("claimedBy", "==", userId));
      const voucherSnapshot = await getDocs(voucherQuery);

      voucherSnapshot.forEach((doc) => {
        userVouchers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }

    return NextResponse.json({
      message: "User data retrieved successfully",
      data: userData,
      vouchers: userVouchers,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
