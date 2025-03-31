"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddProductMutation,
  useGetProductsQuery,
} from "@/redux/features/products/productApi";
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");

  // RTK Query hooks
  const [addProduct, { isLoading: isAddingProduct }] = useAddProductMutation();
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    refetch,
  } = useGetProductsQuery("");

  // Form validation schema
  const formSchema = Yup.object().shape({
    name: Yup.string()
      .required("Product name is required")
      .min(2, "Name must be at least 2 characters"),
    quantity: Yup.number()
      .required("Quantity is required")
      .integer("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1"),
  });

  // Form setup
  const formik = useFormik({
    initialValues: {
      name: "",
      quantity: "",
    },
    validationSchema: formSchema,
    onSubmit: async (values) => {
      try {
        // Convert quantity to number
        const productData = {
          name: values.name,
          quantity: Number.parseInt(values.quantity as string, 10),
          createdAt: new Date(),
          status: Math.random() > 0.5 ? "In Stock" : "Low Stock", // Random status for demo
        };

        // Add product using RTK Query mutation
        await addProduct(productData).unwrap();

        // Show success message
        toast({
          title: "Success!",
          description: "Product has been added successfully.",
        });

        // Reset form
        formik.resetForm();

        // Close dialog
        setIsDialogOpen(false);

        // Refetch products list
        refetch();
      } catch (error: any) {
        console.error("Error adding product:", error);
        toast({
          title: "Error",
          description: `Failed to add product: ${
            error.message || "Unknown error"
          }`,
          variant: "destructive",
        });
      }
    },
  });

  // Filter products based on status
  const filteredProducts =
    statusFilter === "all"
      ? products
      : products.filter((product: any) => product.status === statusFilter);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container mx-auto mt-20 py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the product details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-sm text-red-500">{formik.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={formik.values.quantity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.quantity && formik.errors.quantity && (
                    <p className="text-sm text-red-500">
                      {formik.errors.quantity}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isAddingProduct}>
                    {isAddingProduct ? "Adding..." : "Add Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Products</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) =>
                  setItemsPerPage(Number.parseInt(value))
                }
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <SelectValue placeholder="5 per page" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Product ID</th>
                <th className="text-left py-3 px-4 font-medium">
                  Product Name
                </th>
                <th className="text-left py-3 px-4 font-medium">Quantity</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : currentProducts.length > 0 ? (
                currentProducts.map((product: any, index: any) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-4 px-4 text-sm">
                      {product.id.substring(0, 12)}...
                    </td>
                    <td className="py-4 px-4">{product.name}</td>
                    <td className="py-4 px-4">{product.quantity}</td>
                    <td className="py-4 px-4">
                      {product.status === "In Stock" ? (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            In Stock
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Low Stock
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-stock">
                            Set as In Stock
                          </SelectItem>
                          <SelectItem value="low-stock">
                            Set as Low Stock
                          </SelectItem>
                          <SelectItem value="out-of-stock">
                            Set as Out of Stock
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div>
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </div>

            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === number
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
