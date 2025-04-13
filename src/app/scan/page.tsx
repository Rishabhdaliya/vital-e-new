"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Barcode,
  Info,
  Keyboard,
  Camera,
  Smartphone,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HardwareScanner } from "@/components/barcode scanner/hardware-scanner";
import { CameraScanner } from "@/components/barcode scanner/camera-scanner";

export default function ScanPage() {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state.users.currentUser);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!barcodeValue.trim()) return;

    setIsSubmitting(true);

    // Navigate to the voucher detail page
    router.push(`/scan/${encodeURIComponent(barcodeValue.trim())}`);
  };

  // Handle barcode scan from any scanner component
  const handleScan = (barcode: string) => {
    setBarcodeValue(barcode);

    // Navigate to the voucher detail page after a short delay
    setTimeout(() => {
      router.push(`/scan/${encodeURIComponent(barcode.trim())}`);
    }, 1000);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container max-w-md mt-15 mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-t-4 border-t-[#f04d46] shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#f04d46]/5 to-transparent">
            <CardTitle className="text-2xl font-bold text-center">
              Scan Voucher
            </CardTitle>
            <CardDescription className="text-center">
              Scan a barcode or enter a batch number to view voucher details
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs
              defaultValue="scanner"
              className="w-full"
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="scanner"
                  className="flex items-center gap-2"
                >
                  <Barcode className="h-4 w-4" />
                  Scanner
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Manual
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scanner">
                <HardwareScanner
                  onScan={handleScan}
                  isActive={activeTab === "scanner"}
                />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>How to use</AlertTitle>
                  <AlertDescription>
                    Connect your barcode scanner to your device. When you scan a
                    barcode, it will be automatically detected and processed.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">
                      Barcode / Batch Number / Voucher ID
                    </Label>
                    <Input
                      id="barcode"
                      placeholder="Enter barcode or batch number"
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#f04d46] hover:bg-[#f04d46]/90"
                    disabled={isSubmitting || !barcodeValue.trim()}
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        View Voucher Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="camera">
                <CameraScanner
                  onScan={handleScan}
                  isActive={activeTab === "camera"}
                />

                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertTitle>Mobile Scanning</AlertTitle>
                  <AlertDescription>
                    For best results, ensure good lighting and hold the camera
                    steady over the barcode.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="bg-gray-50 p-6 flex flex-col">
            <p className="text-sm text-gray-500 text-center">
              Scan any voucher barcode or enter the batch number to view
              detailed information and manage its status.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
