"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useGetProductsQuery } from "@/redux/features/products/productApi";

export default function VoucherGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const { toast } = useToast();
  const { data: products = [], isLoading: isLoadingProducts } =
    useGetProductsQuery("");

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
        if (products.length === 0) {
          toast({
            title: "No Products Available",
            description: "Please add products before generating vouchers.",
            variant: "destructive",
          });
          return;
        }

        setIsGenerating(true);
        setGeneratedCount(0);

        // Generate vouchers
        const vouchersToGenerate = Number.parseInt(values.count.toString(), 10);
        let successCount = 0;

        for (let i = 0; i < vouchersToGenerate; i++) {
          // Generate a random 8-digit number
          const randomNum = Math.floor(10000000 + Math.random() * 90000000);
          const batchNo = `${values.prefix}-${randomNum}`;

          // Randomly select a product for this voucher
          const randomProductIndex = Math.floor(
            Math.random() * products.length
          );
          const selectedProduct = products[randomProductIndex];

          // Create voucher in Firestore
          await addDoc(collection(db, "vouchers"), {
            batchNo,
            status: "UNCLAIMED",
            createdAt: Timestamp.now(),
            productId: selectedProduct.id,
            productName: selectedProduct.name,
          });

          successCount++;
          setGeneratedCount(successCount);
        }

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
          className="w-full"
          disabled={isGenerating || isLoadingProducts || products.length === 0}
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
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Vouchers Generated Successfully
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  {generatedCount} vouchers have been generated with the prefix{" "}
                  {formik.values.prefix}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
