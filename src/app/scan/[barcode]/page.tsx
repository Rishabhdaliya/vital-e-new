"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Ticket,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Define types
interface Voucher {
  id: string;
  batchNo?: string;
  barcode?: string;
  barcodeImageUrl?: string;
  status?: "CLAIMED" | "UNCLAIMED" | "EXPIRED";
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  claimedAt?: {
    seconds: number;
    nanoseconds: number;
  };
  claimedBy?: string;
  productId?: string;
  productName?: string;
}

interface UserType {
  id: string;
  name: string;
  phoneNo: string;
  city: string;
  role: string;
  isVerified: boolean;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
}

export default function VoucherScanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const currentUser = useSelector((state: any) => state.users.currentUser);

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [claimedByUser, setClaimedByUser] = useState<UserType | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch voucher data
  useEffect(() => {
    async function fetchVoucherData() {
      if (!params?.barcode) return;

      try {
        setIsLoading(true);
        setError(null);

        const barcode = params.barcode as string;

        // First try to find voucher by barcode
        const vouchersRef = collection(db, "vouchers");
        const voucherQuery = query(
          vouchersRef,
          where("barcode", "==", barcode)
        );
        let voucherSnapshot = await getDocs(voucherQuery);

        // If not found by barcode, try batch number
        if (voucherSnapshot.empty) {
          const batchQuery = query(
            vouchersRef,
            where("batchNo", "==", barcode)
          );
          voucherSnapshot = await getDocs(batchQuery);
        }

        // If still not found, try by ID
        if (voucherSnapshot.empty) {
          try {
            const voucherDoc = await getDoc(doc(db, "vouchers", barcode));
            if (voucherDoc.exists()) {
              const voucherData = {
                id: voucherDoc.id,
                ...voucherDoc.data(),
              } as Voucher;
              setVoucher(voucherData);

              // Fetch related data
              await fetchRelatedData(voucherData);
            } else {
              setError("Voucher not found");
            }
          } catch (err) {
            setError("Voucher not found");
          }
        } else {
          // Voucher found by query
          const voucherData = {
            id: voucherSnapshot.docs[0].id,
            ...voucherSnapshot.docs[0].data(),
          } as Voucher;
          setVoucher(voucherData);

          // Fetch related data
          await fetchRelatedData(voucherData);
        }
      } catch (err: any) {
        console.error("Error fetching voucher:", err);
        setError(err.message || "Failed to fetch voucher details");
      } finally {
        setIsLoading(false);
      }
    }

    if (mounted) {
      fetchVoucherData();
    }
  }, [params, mounted]);

  // Fetch related data (user and product)
  async function fetchRelatedData(voucherData: Voucher) {
    try {
      // Fetch claimed by user if available
      if (voucherData.claimedBy) {
        const userDoc = await getDoc(doc(db, "users", voucherData.claimedBy));
        if (userDoc.exists()) {
          setClaimedByUser({
            id: userDoc.id,
            ...userDoc.data(),
          } as UserType);
        }
      }

      // Fetch product if available
      if (voucherData.productId) {
        const productDoc = await getDoc(
          doc(db, "products", voucherData.productId)
        );
        if (productDoc.exists()) {
          setProduct({
            id: productDoc.id,
            ...productDoc.data(),
          } as Product);
        }
      }
    } catch (err) {
      console.error("Error fetching related data:", err);
    }
  }

  // Handle status update
  const updateVoucherStatus = async (
    newStatus: "CLAIMED" | "UNCLAIMED" | "EXPIRED"
  ) => {
    if (!voucher) return;

    try {
      setIsUpdating(true);

      // Update voucher in Firestore
      const voucherRef = doc(db, "vouchers", voucher.id);
      await updateDoc(voucherRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setVoucher({
        ...voucher,
        status: newStatus,
      });

      toast({
        title: "Status Updated",
        description: `Voucher status has been updated to ${newStatus}`,
      });
    } catch (err: any) {
      console.error("Error updating voucher status:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update voucher status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date
  const formatDate = (seconds?: number) => {
    if (!seconds) return "N/A";
    return new Date(seconds * 1000).toLocaleString();
  };

  // If not mounted yet, show nothing to avoid hydration mismatch
  if (!mounted) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container max-w-md mt-20  mx-auto py-10 px-4">
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-center text-amber-700">
              Voucher Not Found
            </CardTitle>
            <CardDescription className="text-center">
              {error}. Please check the barcode or ID and try again.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show voucher details
  return (
    <div className="container max-w-3xl mt-15 mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-t-4 border-t-[#f04d46] shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#f04d46]/5 to-transparent">
            <div className="flex justify-between items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-muted-foreground cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Badge
                variant="outline"
                className={`
                  ${
                    voucher?.status === "CLAIMED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : voucher?.status === "EXPIRED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }
                `}
              >
                {voucher?.status === "CLAIMED" ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" /> Claimed
                  </>
                ) : voucher?.status === "EXPIRED" ? (
                  <>
                    <Clock className="mr-1 h-3 w-3" /> Expired
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" /> Unclaimed
                  </>
                )}
              </Badge>
            </div>

            <CardTitle className="text-2xl text-[#f04d46] font-bold text-center">
              Voucher Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 p-6">
            {/* Barcode Section */}
            {voucher?.barcodeImageUrl && (
              <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border">
                <img
                  src={voucher.barcodeImageUrl || "/placeholder.svg"}
                  alt={`Barcode for ${voucher.batchNo}`}
                  className="h-24 object-contain mb-2"
                />
                <div className="text-xs text-gray-500">{voucher.barcode}</div>
              </div>
            )}

            {/* Voucher Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#f04d46] flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Voucher Information
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Batch Number:</span>
                    <span className="text-sm font-medium">
                      {voucher?.batchNo || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created Date:</span>
                    <span className="text-sm font-medium">
                      {formatDate(voucher?.createdAt?.seconds)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span
                      className={`text-sm font-medium ${
                        voucher?.status === "CLAIMED"
                          ? "text-green-600"
                          : voucher?.status === "EXPIRED"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {voucher?.status || "UNCLAIMED"}
                    </span>
                  </div>

                  {voucher?.status === "CLAIMED" && voucher?.claimedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Claimed Date:
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(voucher.claimedAt.seconds)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#f04d46] flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Product Information
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Product Name:</span>
                    <span className="text-sm font-medium">
                      {product?.name || voucher?.productName || "N/A"}
                    </span>
                  </div>

                  {product && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Current Stock:
                      </span>
                      <span className="text-sm font-medium">
                        {product.quantity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Claimed By User Info */}
            {voucher?.status === "CLAIMED" && claimedByUser && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[#f04d46] flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Claimed By
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#f04d46]/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-[#f04d46]" />
                    </div>

                    <div>
                      <div className="font-medium">{claimedByUser.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {claimedByUser.phoneNo}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {claimedByUser.city}
                      </div>
                    </div>

                    <div className="ml-auto">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {claimedByUser.role === "ADMIN" ? (
                          <>
                            <ShieldCheck className="mr-1 h-3 w-3" /> ADMIN
                          </>
                        ) : claimedByUser.role === "DEALER" ? (
                          <>
                            <Building className="mr-1 h-3 w-3" /> DEALER
                          </>
                        ) : claimedByUser.role === "RETAILER" ? (
                          <>
                            <Store className="mr-1 h-3 w-3" /> RETAILER
                          </>
                        ) : (
                          <>
                            <User className="mr-1 h-3 w-3" /> CUSTOMER
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-3">
            {/* Status Update Actions */}
            {voucher?.status === "UNCLAIMED" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                    disabled={isUpdating}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Mark as Claimed
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Mark Voucher as Claimed?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the voucher as claimed. This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => updateVoucherStatus("CLAIMED")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {voucher?.status === "CLAIMED" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
                    disabled={isUpdating}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Mark as Expired
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Mark Voucher as Expired?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the voucher as expired. This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => updateVoucherStatus("EXPIRED")}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {voucher?.status === "EXPIRED" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-amber-300 text-amber-600 hover:bg-amber-50"
                    disabled={isUpdating}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reactivate Voucher
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reactivate Voucher?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the voucher as unclaimed again. Are you
                      sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => updateVoucherStatus("UNCLAIMED")}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* View User Profile Button */}
            {voucher?.status === "CLAIMED" && claimedByUser && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/user/${claimedByUser.id}`)}
              >
                <User className="mr-2 h-4 w-4" />
                View User Profile
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// Import the missing ShoppingBag icon
function ShoppingBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

// Import the missing Store icon
function Store(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
