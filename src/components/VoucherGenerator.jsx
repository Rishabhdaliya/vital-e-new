"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VoucherGenerator() {
  const [count, setCount] = useState(5);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("single");
  const { toast } = useToast(); // Assuming you have a toast function for notifications

  const generateVouchers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine which endpoint to use based on the active tab
      const endpoint =
        activeTab === "bulk"
          ? "/api/vouchers/bulk-generation"
          : "/api/vouchers";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate vouchers");
      }

      setVouchers(data.vouchers);
      toast({
        title: "Success!",
        description: `${data.vouchers.length} vouchers generated successfully.`,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadVouchersAsCSV = () => {
    if (!vouchers.length) return;

    // Convert vouchers to CSV format
    const headers = ["id", "status", "batchNo", "createdAt"];

    let csvContent = headers.join(",") + "\n";

    vouchers.forEach((voucher) => {
      const createdDate = new Date(
        voucher.createdAt.seconds * 1000
      ).toISOString();
      const row = [voucher.id, voucher.status, voucher.batchNo, createdDate];
      csvContent += row.join(",") + "\n";
    });

    // Create and trigger download
    const encodedUri =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const exportFileDefaultName = `vouchers-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", encodedUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto mt-20 py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Voucher Generator</CardTitle>
          <CardDescription>
            Generate unique vouchers with specific format for March 21, 2025
          </CardDescription>
          {vouchers.length > 0 && (
            <Button
              variant="outline"
              onClick={downloadVouchersAsCSV}
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel (CSV)
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Generation</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of Vouchers</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) =>
                    setCount(Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-count">Bulk Count</Label>
                <Input
                  id="bulk-count"
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) =>
                    setCount(Number.parseInt(e.target.value) || 0)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Generate up to 1000 vouchers at once
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={generateVouchers}
            disabled={loading || count <= 0 || count > 1000}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Vouchers"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
