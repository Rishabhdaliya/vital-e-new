import { NextResponse } from "next/server";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";

// Function to fetch all users from Firestore
export async function GET() {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(
      { message: "Users fetched successfully", data: users },
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
    const { name, phoneNo, city, role, registeredBy, isVerified, vouchers } =
      await request.json();
    const newUser = {
      name,
      phoneNo,
      city,
      role,
      isVerified,
      vouchers,
      registeredBy,
      createdAt: new Date(),
    };

    // Check if a user with the same phone number already exists
    const usersRef = collection(db, "users");

    const querySnapshot = await getDocs(usersRef);
    const existingUser = querySnapshot.docs.find(
      (doc) => doc.data().phoneNo === phoneNo
    );

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this phone number already exists" },
        { status: 409 } // 409 Conflict status code
      );
    }

    const docRef = await addDoc(collection(db, "users"), newUser);

    return NextResponse.json(
      {
        message: "User added successfully",
        data: { id: docRef.id, ...newUser },
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
