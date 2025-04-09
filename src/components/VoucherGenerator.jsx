"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Download, FileText } from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useGetAllProductsQuery } from "@/redux/features/products/productApi";

export default function VoucherGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generatedVouchers, setGeneratedVouchers] = useState([]);
  const { toast } = useToast();
  const { data: products = [], isLoading: isLoadingProducts } =
    useGetAllProductsQuery();

  // Function to generate a barcode from batch number
  // This is a simple implementation - in production you might use a proper barcode library
  const generateBarcode = (batchNo) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleanBatchNo = batchNo.replace(/[^A-Z0-9]/gi, "").toUpperCase();

    // Create a numeric representation by converting letters to their ASCII values
    let numericCode = "";
    for (let i = 0; i < cleanBatchNo.length; i++) {
      const char = cleanBatchNo.charAt(i);
      // If it's a number, use it directly
      if (!isNaN(Number.parseInt(char))) {
        numericCode += char;
      } else {
        // If it's a letter, use its ASCII code (A=65, B=66, etc.)
        numericCode += (char.charCodeAt(0) - 55).toString().padStart(2, "0");
      }
    }

    // Add a check digit (simple sum of all digits modulo 10)
    let sum = 0;
    for (let i = 0; i < numericCode.length; i++) {
      sum += Number.parseInt(numericCode.charAt(i));
    }
    const checkDigit = sum % 10;

    // Return the final barcode
    return numericCode + checkDigit;
  };

  // Form validation schema
  const validationSchema = Yup.object({
    prefix: Yup.string()
      .required("Prefix is required")
      .matches(/^[A-Z]{3}$/, "Prefix must be exactly 3 uppercase letters"),
    count: Yup.number()
      .required("Count is required")
      .integer("Count must be a whole number")
      .min(1, "Count must be at least 1")
      .max(100, "Maximum 100 vouchers can be generated at once"),
  });

  // Function to download vouchers as CSV
  const downloadVouchersAsCSV = () => {
    if (generatedVouchers.length === 0) return;

    // Create CSV header
    const csvHeader =
      "Batch Number,Product Name,Created Date,Barcode Value,Barcode Image URL\n";

    // Create CSV content
    const csvContent = generatedVouchers
      .map((voucher) => {
        // Generate a URL for a barcode image using a free barcode API
        const barcodeImageUrl = `https://barcodeapi.org/api/code128/${voucher.barcode}`;
        return `${voucher.batchNo},${voucher.productName.replace(/,/g, ";")},${
          voucher.createdAt
        },${voucher.barcode},${barcodeImageUrl}`;
      })
      .join("\n");

    // Combine header and content
    const csvData = csvHeader + csvContent;

    // Create a Blob with the CSV data
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `vouchers_${formik.values.prefix}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add this function to generate a printable HTML page with barcodes
  const openBarcodePrintPage = () => {
    if (generatedVouchers.length === 0) return;

    // Create a new window
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to view the printable barcodes.",
        variant: "destructive",
      });
      return;
    }

    // Generate HTML content with barcodes
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RSV Printable Barcodes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .barcode-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .barcode-card { border: 1px solid #ddd; padding: 15px; page-break-inside: avoid; }
          .barcode-title { font-size: 14px; margin-bottom: 5px; }
          .barcode-subtitle { font-size: 12px; color: #666; margin-bottom: 10px; }
          .barcode-image { width: 100%; height: 80px; object-fit: contain; background: white; }
          .barcode-number { font-size: 10px; text-align: center; margin-top: 5px; color: #666; }
          @media print {
            @page { margin: 0.5cm; }
            body { padding: 0; }
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="margin: 0;">RSV Printable Barcodes</h1>
          <button class="print-button" onclick="window.print()" style="padding: 8px 16px; background: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Barcodes</button>
        </div>
        <div class="barcode-container">
    `;

    // Add each barcode
    generatedVouchers.forEach((voucher) => {
      htmlContent += `
        <div class="barcode-card">
          <div class="barcode-title">${voucher.batchNo}</div>
          <img 
            src="https://barcodeapi.org/api/code128/${voucher.barcode}" 
            alt="Barcode for ${voucher.batchNo}" 
            class="barcode-image"
          />
          <div class="barcode-number">${voucher.barcode}</div>
        </div>
      `;
    });

    // Close HTML
    htmlContent += `
        </div>
      </body>
      </html>
    `;

    // Write to the new window and focus
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      prefix: "RSV",
      count: 10,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Check if products are available
        if (products.data.length === 0) {
          toast({
            title: "No Products Available",
            description: "Please add products before generating vouchers.",
            variant: "destructive",
          });
          return;
        }

        setIsGenerating(true);
        setGeneratedCount(0);
        setGeneratedVouchers([]);

        // Generate vouchers
        const vouchersToGenerate = Number.parseInt(values.count.toString(), 10);
        let successCount = 0;
        const newGeneratedVouchers = [];

        // Filter products with quantity > 0
        let availableProducts = products?.data?.filter(
          (product) => product.quantity > 0
        );

        if (availableProducts.length === 0) {
          toast({
            title: "No Products Available",
            description: "There are no products with available quantity.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        for (let i = 0; i < vouchersToGenerate; i++) {
          try {
            // Re-filter available products on each iteration
            availableProducts = availableProducts.filter(
              (product) => product.quantity > 0
            );

            if (availableProducts.length === 0) {
              toast({
                title: "Product Quantity Depleted",
                description: `Generated ${successCount} vouchers. All products are now out of stock.`,
              });
              break;
            }

            // Generate a random 8-digit number
            const randomNum = Math.floor(10000000 + Math.random() * 90000000);
            const batchNo = `${values.prefix}-${randomNum}`;

            // Generate barcode for this batch number
            const barcode = generateBarcode(batchNo);

            // Randomly select a product with available quantity
            const randomProductIndex = Math.floor(
              Math.random() * availableProducts.length
            );
            const selectedProduct = availableProducts[randomProductIndex];

            const now = new Date();
            const formattedDate = now.toISOString();

            // Create voucher in Firestore
            await addDoc(collection(db, "vouchers"), {
              batchNo,
              status: "UNCLAIMED",
              createdAt: Timestamp.now(),
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              barcode: barcode, // Store barcode in Firestore as well
              barcodeImageUrl: `https://barcodeapi.org/api/code128/${barcode}`, // Also store the image URL
            });

            // Add to generated vouchers list for CSV export
            newGeneratedVouchers.push({
              batchNo,
              productName: selectedProduct.name,
              createdAt: formattedDate,
              barcode: barcode,
            });

            // Update product quantity in Firestore
            const productRef = doc(db, "products", selectedProduct.id);
            await updateDoc(productRef, {
              quantity: increment(-1), // Decrement quantity by 1
            });

            // Update local product quantity
            availableProducts[randomProductIndex] = {
              ...selectedProduct,
              quantity: selectedProduct.quantity - 1,
            };

            successCount++;
            setGeneratedCount(successCount);
          } catch (error) {
            console.error(`Error generating voucher ${i + 1}:`, error);
            // Continue with the next voucher
          }
        }

        // Save generated vouchers for CSV export
        setGeneratedVouchers(newGeneratedVouchers);

        toast({
          title: "Success!",
          description: `Generated ${successCount} vouchers successfully.`,
        });
      } catch (error) {
        console.error("Error generating vouchers:", error);
        toast({
          title: "Error",
          description: `Failed to generate vouchers: ${
            error.message || "Unknown error"
          }`,
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    },
  });

  return (
    <div className="space-y-6 py-4">
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prefix">Voucher Prefix</Label>
          <Input
            id="prefix"
            name="prefix"
            placeholder="RSV"
            value={formik.values.prefix}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isGenerating}
          />
          {formik.touched.prefix && formik.errors.prefix && (
            <p className="text-sm text-red-500">{formik.errors.prefix}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="count">Number of Vouchers</Label>
          <Input
            id="count"
            name="count"
            type="number"
            placeholder="10"
            value={formik.values.count}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isGenerating}
          />
          {formik.touched.count && formik.errors.count && (
            <p className="text-sm text-red-500">{formik.errors.count}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="filled"
          className="w-full"
          disabled={
            isGenerating || isLoadingProducts || products.data.length === 0
          }
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating... ({generatedCount}/{formik.values.count})
            </>
          ) : (
            "Generate Vouchers"
          )}
        </Button>
      </form>

      {generatedCount > 0 && !isGenerating && (
        <>
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex flex-col md:flex-row">
              <div className="flex-shrink-0 mb-3 md:mb-0">
                <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="md:ml-3 flex-grow mb-3 md:mb-0">
                <h3 className="text-sm font-medium text-green-800">
                  Vouchers Generated Successfully
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    {generatedCount} vouchers have been generated with the
                    prefix {formik.values.prefix}.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-green-50 text-green-600 border-green-200"
                    onClick={downloadVouchersAsCSV}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-green-50 text-green-600 border-green-200"
                    onClick={openBarcodePrintPage}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Print Barcodes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
