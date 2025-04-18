"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  AlertTriangle,
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/redux/features/products/productApi";
import { getProductStatus, getStatusColor } from "@/lib/utils";

// Define interfaces for our data structures
interface Product {
  id: string;
  name: string;
  quantity: number;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

interface ProductFormValues {
  name: string;
  quantity: string;
}

// Update the QueryParams interface to include search
interface QueryParams {
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string;
  sortOrder?: string;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Define query parameters
  const queryParams: QueryParams = {
    page: currentPage,
    pageSize: itemsPerPage,
    search: debouncedSearchTerm,
  };

  // Update the useGetProductsQuery hook to include search parameter
  const {
    data: productsData = {
      data: [],
      pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    } as ProductsResponse,
    isLoading: isLoadingProducts,
    refetch,
  } = useGetProductsQuery({
    page: currentPage,
    pageSize: itemsPerPage,
    search: debouncedSearchTerm,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const products = productsData.data || [];
  const pagination = productsData.pagination || {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };

  const [addProduct, { isLoading: isAddingProduct }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] =
    useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] =
    useDeleteProductMutation();

  // Form validation schema
  const formSchema = Yup.object().shape({
    name: Yup.string()
      .required("Product name is required")
      .min(2, "Name must be at least 2 characters"),
    quantity: Yup.number()
      .required("Quantity is required")
      .integer("Quantity must be a whole number"),
  });

  // Form setup
  const formik = useFormik<ProductFormValues>({
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
          quantity: Number.parseInt(values.quantity, 10),
        };

        if (editingProduct) {
          // Update existing product
          await updateProduct({
            id: editingProduct.id,
            ...productData,
          }).unwrap();

          toast({
            title: "Success!",
            description: "Product has been updated successfully.",
          });
        } else {
          // Add new product
          await addProduct(productData).unwrap();

          toast({
            title: "Success!",
            description: "Product has been added successfully.",
          });
        }

        // Reset form and state
        formik.resetForm();
        setEditingProduct(null);
        setIsDialogOpen(false);

        // Refetch products list
        refetch();
      } catch (error: any) {
        console.error("Error with product:", error);
        toast({
          title: "Error",
          description: `Failed to ${
            editingProduct ? "update" : "add"
          } product: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      }
    },
  });

  // Handle edit button click
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    formik.setValues({
      name: product.name,
      quantity: product.quantity.toString(),
    });
    setIsDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id).unwrap();

      toast({
        title: "Success!",
        description: "Product has been deleted successfully.",
      });

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);

      // If we deleted the last item on the current page, go to previous page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Refetch products list
        refetch();
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: `Failed to delete product: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog is closed
      formik.resetForm();
      setEditingProduct(null);
    }
    setIsDialogOpen(open);
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number.parseInt(value, 10);
    setItemsPerPage(newPageSize);
    // Reset to first page when changing page size
    setCurrentPage(1);
  };

  // Update the handleSearchChange function to be more explicit
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Calculate visible page numbers for pagination
  const getVisiblePageNumbers = (): (number | string)[] => {
    const maxVisiblePages = 5;
    const pageNumbers: (number | string)[] = [];
    const totalPages = pagination.totalPages || 1;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of visible pages
      let startPage = Math.max(
        2,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 3) {
        startPage = Math.max(2, totalPages - maxVisiblePages + 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page if more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto py-6 px-4 mt-15">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingProduct(null);
              formik.resetForm();
              setIsDialogOpen(true);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      <>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            {/* Update the search input to use the handleSearchChange function */}
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="w-40">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <SelectValue placeholder="10 per page" />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <TableRow key={idx} className="skeleton-row">
                    {Array.from({ length: 4 }).map((_, columnIdx) => (
                      <TableCell key={columnIdx}>
                        <Skeleton className="h-4 bg-gray-200 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product: any) => {
                  const status = getProductStatus(product.quantity);
                  const statusColor = getStatusColor(status);

                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                        >
                          {status}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Update
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalCount > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <div className="mb-4 sm:mb-0">
              Showing {(pagination.page - 1) * pagination.pageSize + 1}-
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} products
            </div>

            <div className="flex items-center flex-wrap justify-center gap-1">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                size="sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex flex-wrap justify-center gap-1 max-w-[300px]">
                {getVisiblePageNumbers().map((number, index) =>
                  number === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 py-1">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={`page-${number}`}
                      onClick={() =>
                        typeof number === "number" && setCurrentPage(number)
                      }
                      variant={currentPage === number ? "outline" : "default"}
                      size={"sm"}
                    >
                      {number}
                    </Button>
                  )
                )}
              </div>

              <Button
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages)
                  )
                }
                disabled={currentPage === pagination.totalPages}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#f04d46] text-xl text-center">
              {editingProduct ? "Update Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 dark:text-gray-100">
              {editingProduct
                ? "Update the product details below"
                : "Enter the product details below"}
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
                <p className="text-sm text-red-500">{formik.errors.quantity}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="filled"
                className="w-full"
                type="submit"
                disabled={isAddingProduct || isUpdatingProduct}
              >
                {isAddingProduct || isUpdatingProduct
                  ? editingProduct
                    ? "Updating..."
                    : "Adding..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the product "
              {productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingProduct}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingProduct ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
