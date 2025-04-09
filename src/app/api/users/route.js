import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Function to fetch users from Firestore with role-based access control, pagination, and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get the requesting user's ID and role
    const requesterId = searchParams.get("requesterId");
    const requesterRole = searchParams.get("requesterRole");

    // Get pagination parameters
    const page = Number.parseInt(searchParams.get("page") || "1");
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");

    // Get search parameters
    const searchTerm = searchParams.get("search") || "";
    const searchField = searchParams.get("searchField") || "all"; // all, name, phoneNo, city

    console.log("API received params:", {
      requesterId,
      requesterRole,
      page,
      pageSize,
      searchTerm,
      searchField,
    });

    // Validate requester information
    if (!requesterId || !requesterRole) {
      return NextResponse.json(
        { message: "Requester ID and role are required" },
        { status: 400 }
      );
    }

    // Check if the requester has permission to access user data
    if (requesterRole !== "ADMIN" && requesterRole !== "DEALER") {
      return NextResponse.json(
        {
          message:
            "Unauthorized access. Only ADMIN and DEALER roles can access user data",
        },
        { status: 403 }
      );
    }

    // If requester is a DEALER, verify they exist
    if (requesterRole === "DEALER") {
      try {
        const requesterDoc = await getDoc(doc(db, "users", requesterId));
        if (!requesterDoc.exists()) {
          return NextResponse.json(
            { message: "Unauthorized access. DEALER not found" },
            { status: 403 }
          );
        }

        const requesterData = requesterDoc.data();
        if (requesterData.role !== "DEALER") {
          return NextResponse.json(
            { message: "Unauthorized access. User is not a DEALER" },
            { status: 403 }
          );
        }

        console.log(`Verified DEALER ${requesterId} exists`);
      } catch (error) {
        console.error("Error verifying DEALER:", error);
        return NextResponse.json(
          {
            message: "Error verifying DEALER credentials",
            error: error.message,
          },
          { status: 500 }
        );
      }
    }

    // Create base query
    let usersQuery;
    let usersSnapshot;

    try {
      // If DEALER, only return users registered by this dealer
      if (requesterRole === "DEALER") {
        console.log(`Filtering users for DEALER ${requesterId}`);
        usersQuery = query(
          collection(db, "users"),
          where("registeredBy", "==", requesterId)
        );
      } else {
        // If ADMIN, return all users
        console.log("Returning all users for ADMIN");
        usersQuery = query(collection(db, "users"));
      }

      // Execute the query
      usersSnapshot = await getDocs(usersQuery);
      console.log(`Found ${usersSnapshot.docs.length} users in Firestore`);
    } catch (error) {
      console.error("Error querying Firestore:", error);
      return NextResponse.json(
        { message: "Error querying users database", error: error.message },
        { status: 500 }
      );
    }

    // Process the results
    let users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filtering if search term is provided
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      console.log(
        `Applying search filter: "${searchTerm}" in field "${searchField}"`
      );

      users = users.filter((user) => {
        if (searchField === "name" || searchField === "all") {
          if (user.name && user.name.toLowerCase().includes(searchTermLower)) {
            return true;
          }
        }

        if (searchField === "phoneNo" || searchField === "all") {
          if (user.phoneNo && user.phoneNo.includes(searchTerm)) {
            return true;
          }
        }

        if (searchField === "city" || searchField === "all") {
          if (user.city && user.city.toLowerCase().includes(searchTermLower)) {
            return true;
          }
        }

        return false;
      });

      console.log(`After search filtering: ${users.length} users match`);
    }

    // Sort users by createdAt (newest first)
    users.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });

    // Calculate pagination
    const totalCount = users.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Slice the results for pagination
    const paginatedUsers = users.slice(startIndex, endIndex);
    console.log(`Returning ${paginatedUsers.length} users for page ${page}`);

    // Add registered by user information for each user
    const usersWithRegisteredBy = await Promise.all(
      paginatedUsers.map(async (user) => {
        if (user.registeredBy) {
          try {
            const registeredByDoc = await getDoc(
              doc(db, "users", user.registeredBy)
            );
            if (registeredByDoc.exists()) {
              const registeredByData = registeredByDoc.data();
              return {
                ...user,
                registeredByUser: {
                  id: registeredByDoc.id,
                  name: registeredByData.name,
                  phoneNo: registeredByData.phoneNo,
                  role: registeredByData.role,
                },
              };
            }
          } catch (error) {
            console.error(
              `Error fetching registeredBy for user ${user.id}:`,
              error
            );
          }
        }
        return user;
      })
    );

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        data: usersWithRegisteredBy,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Error fetching users",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Function to add a new user to Firestore
export async function POST(request) {
  try {
    const {
      name,
      phoneNo,
      city,
      role,
      registeredBy,
      isVerified = false,
      vouchers = [],
    } = await request.json();

    // Validate required fields
    if (!name || !phoneNo || !city || !role) {
      return NextResponse.json(
        { message: "Name, phone number, city, and role are required fields" },
        { status: 400 }
      );
    }

    // If registeredBy is provided, verify the registering user exists and has appropriate role
    if (registeredBy) {
      const registererDoc = await getDoc(doc(db, "users", registeredBy));
      if (!registererDoc.exists()) {
        return NextResponse.json(
          { message: "The registering user does not exist" },
          { status: 400 }
        );
      }

      const registererData = registererDoc.data();
      // Only DEALER and ADMIN can register other users
      if (registererData.role !== "DEALER" && registererData.role !== "ADMIN") {
        return NextResponse.json(
          { message: "Only DEALER and ADMIN users can register other users" },
          { status: 403 }
        );
      }
    }

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
    const phoneQuery = query(usersRef, where("phoneNo", "==", phoneNo));
    const querySnapshot = await getDocs(phoneQuery);

    if (!querySnapshot.empty) {
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
    console.error("Error adding user:", error);
    return NextResponse.json(
      { message: "error", error: error.message },
      { status: 500 }
    );
  }
}
