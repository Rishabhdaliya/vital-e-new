import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    // Extract the user ID from the URL parameters
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the URL search parameters
    const { searchParams } = new URL(request.url);

    // Check for authorization (optional - implement based on your auth strategy)
    const requesterId = searchParams.get("requesterId");
    const requesterRole = searchParams.get("requesterRole");

    // Basic authorization check - can be enhanced based on your requirements
    if (
      requesterId !== userId &&
      requesterRole !== "ADMIN" &&
      requesterRole !== "DEALER"
    ) {
      return NextResponse.json(
        { message: "Unauthorized access to user vouchers" },
        { status: 403 }
      );
    }

    // Check if the user exists
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const voucherIds = userData.vouchers || [];

    let userVouchers = [];

    // If user has voucher IDs, fetch those vouchers
    if (voucherIds && voucherIds.length > 0) {
      // Fetch each voucher by ID
      const voucherPromises = voucherIds.map(async (voucherId) => {
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
    }

    // Also check for vouchers claimed by this user (in case they're not in the user's vouchers array)
    const vouchersRef = collection(db, "vouchers");
    const voucherQuery = query(vouchersRef, where("claimedBy", "==", userId));
    const voucherSnapshot = await getDocs(voucherQuery);

    // Create a Set of existing voucher IDs to avoid duplicates
    const existingVoucherIds = new Set(userVouchers.map((v) => v.id));

    voucherSnapshot.forEach((doc) => {
      // Only add if not already in the array
      if (!existingVoucherIds.has(doc.id)) {
        userVouchers.push({
          id: doc.id,
          ...doc.data(),
        });
      }
    });

    // Get search parameters
    const search = searchParams.get("search") || "";
    const searchField = searchParams.get("searchField") || "all";

    // Apply search filtering if search term is provided
    if (search) {
      const searchLower = search.toLowerCase();
      userVouchers = userVouchers.filter((voucher) => {
        // Search in specific field or all fields
        if (searchField === "batchNo" || searchField === "all") {
          if (
            voucher.batchNo &&
            voucher.batchNo.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
        }

        if (searchField === "productName" || searchField === "all") {
          if (
            voucher.productName &&
            voucher.productName.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
        }

        if (searchField === "status" || searchField === "all") {
          if (
            voucher.status &&
            voucher.status.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
        }

        return false;
      });
    }

    // Optional: Add pagination
    const page = Number.parseInt(searchParams.get("page") || "1");
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Sort vouchers by creation date (newest first)
    userVouchers.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });

    const paginatedVouchers = userVouchers.slice(startIndex, endIndex);

    // Return the vouchers with pagination metadata
    return NextResponse.json({
      message: "Vouchers fetched successfully",
      data: paginatedVouchers,
      pagination: {
        page,
        pageSize,
        totalCount: userVouchers.length,
        totalPages: Math.ceil(userVouchers.length / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching user vouchers:", error);
    return NextResponse.json(
      {
        message: "Error fetching user vouchers",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
