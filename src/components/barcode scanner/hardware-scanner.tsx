"use client"

import { useState, useEffect, useRef } from "react"
import { Scan } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface HardwareScannerProps {
  onScan: (barcode: string) => void
  isActive?: boolean
}

export function HardwareScanner({ onScan, isActive = true }: HardwareScannerProps) {
  const { toast } = useToast()
  const [scannerMode, setScannerMode] = useState<"waiting" | "detected" | "received">("waiting")
  const [lastScanTime, setLastScanTime] = useState(0)
  const [scanBuffer, setScanBuffer] = useState("")
  const [scannedBarcode, setScannedBarcode] = useState("")
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input field when active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  // Handle scanner input
  useEffect(() => {
    if (!isActive) return

    // Function to handle keyboard events for scanner
    const handleScannerInput = (e: KeyboardEvent) => {
      // Ignore if in an input field other than our scanner input
      if (
        document.activeElement &&
        document.activeElement.tagName === "INPUT" &&
        document.activeElement !== inputRef.current
      ) {
        return
      }

      // Check if this might be from a scanner (rapid input)
      const currentTime = new Date().getTime()
      const timeDiff = currentTime - lastScanTime

      // If this is the first character or if the time between keystrokes is very short
      if (timeDiff > 500) {
        // Start of new scan
        setScanBuffer(e.key)
        setScannerMode("detected")
      } else {
        // Continue existing scan
        setScanBuffer((prev) => prev + e.key)
      }

      setLastScanTime(currentTime)

      // Reset the timeout for end of scan
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }

      scanTimeoutRef.current = setTimeout(() => {
        if (scanBuffer.length > 3) {
          // We consider this a complete scan if it has more than 3 characters
          setScannedBarcode(scanBuffer)
          setScannerMode("received")

          // Show toast notification
          toast({
            title: "Barcode Detected",
            description: `Scanned barcode: ${scanBuffer}`,
          })

          // Call the onScan callback
          onScan(scanBuffer)
        }

        // Reset scanner mode after processing
        setTimeout(() => {
          setScannerMode("waiting")
        }, 2000)
      }, 200) // End of scan is detected after 200ms of no input
    }

    // Add event listener for scanner input
    window.addEventListener("keypress", handleScannerInput)

    // Cleanup
    return () => {
      window.removeEventListener("keypress", handleScannerInput)
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [isActive, lastScanTime, scanBuffer, onScan, toast])

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-200">
        <div className="relative mb-4">
          <Scan
            className={`h-12 w-12 ${
              scannerMode === "waiting"
                ? "text-gray-400"
                : scannerMode === "detected"
                  ? "text-amber-500"
                  : "text-green-500"
            }`}
          />

          {scannerMode !== "waiting" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
            >
              <span className="text-white text-xs">✓</span>
            </motion.div>
          )}
        </div>

        <h3 className="text-lg font-medium mb-2">
          {scannerMode === "waiting"
            ? "Ready to Scan"
            : scannerMode === "detected"
              ? "Scanning..."
              : "Barcode Received!"}
        </h3>

        <p className="text-center text-gray-500 mb-4">
          {scannerMode === "waiting"
            ? "Connect your barcode scanner and scan a voucher"
            : scannerMode === "detected"
              ? "Reading barcode data..."
              : "Processing barcode..."}
        </p>

        {scannerMode === "received" && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            {scannedBarcode}
          </Badge>
        )}

        <input
          ref={inputRef}
          className="opacity-0 absolute h-0 w-0"
          value={scannedBarcode}
          onChange={(e) => setScannedBarcode(e.target.value)}
          autoFocus={isActive}
        />
      </div>
    </div>
  )
}
