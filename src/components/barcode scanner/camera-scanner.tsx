"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CameraScannerProps {
  onScan: (barcode: string) => void;
  isActive?: boolean;
}

export function CameraScanner({ onScan, isActive = true }: CameraScannerProps) {
  const { toast } = useToast();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanComplete, setIsScanComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock function to simulate barcode detection
  // In a real app, you would use a library like zxing or dynamsoft
  const simulateBarcodeDetection = () => {
    if (!isActive || !isCameraActive) return;

    // Generate a random barcode after 3 seconds
    setTimeout(() => {
      const mockBarcode = `RSV-${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;
      setIsScanComplete(true);

      toast({
        title: "Barcode Detected",
        description: `Scanned barcode: ${mockBarcode}`,
      });

      // Call the onScan callback
      onScan(mockBarcode);

      // Reset after a delay
      setTimeout(() => {
        setIsScanComplete(false);
        setIsCameraActive(false);
      }, 2000);
    }, 3000);
  };

  // Initialize camera when active
  useEffect(() => {
    if (!isActive || !isCameraActive) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);

          // Start the mock barcode detection
          simulateBarcodeDetection();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access to scan barcodes",
          variant: "destructive",
        });
      }
    };

    initCamera();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, isCameraActive, toast]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-200 relative overflow-hidden">
        {!isCameraActive ? (
          <div className="flex flex-col items-center">
            <Camera className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-center text-gray-500 mb-4">
              Click the button below to activate your camera
            </p>
            <Button
              onClick={() => setIsCameraActive(true)}
              className="bg-[#f04d46] hover:bg-[#f04d46]/90"
            >
              Start Camera
            </Button>
          </div>
        ) : (
          <>
            {/* Camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-md"
            />

            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`
                w-64 h-64 border-2 ${
                  isScanComplete ? "border-green-500" : "border-white"
                } 
                rounded-lg opacity-70 flex items-center justify-center
              `}
              >
                {isScanComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-500 rounded-full p-2"
                  >
                    <CheckCircle className="h-8 w-8 text-white" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Close button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={() => setIsCameraActive(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {hasPermission === false && (
        <div className="text-center text-red-500 text-sm">
          Camera access denied. Please check your browser settings and allow
          camera access.
        </div>
      )}
    </div>
  );
}
