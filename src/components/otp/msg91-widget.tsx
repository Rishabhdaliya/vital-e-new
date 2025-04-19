"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface MSG91WidgetProps {
  phoneNumber: string
  onVerificationSuccess: (token: string) => void
  onVerificationFailure?: (error: any) => void
  widgetId: string
  tokenAuth: string
  variables?: Record<string, string>
}

declare global {
  interface Window {
    initSendOTP: (config: any) => void
    sendOTP?: {
      getOtp: () => void
      verifyOtp: (otp: string) => void
      resendOtp: () => void
    }
  }
}

export function MSG91Widget({
  phoneNumber,
  onVerificationSuccess,
  onVerificationFailure,
  widgetId,
  tokenAuth,
  variables = {},
}: MSG91WidgetProps) {
  const { toast } = useToast()
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    // Only load the script once
    if (scriptRef.current) return

    // Create script element
    const script = document.createElement("script")
    script.src = "https://verify.msg91.com/otp-provider.js"
    script.async = true
    script.id = "msg91-otp-script"

    script.onload = () => {
      console.log("MSG91 OTP script loaded successfully")
      setIsScriptLoaded(true)
    }

    script.onerror = (err) => {
      console.error("Error loading MSG91 OTP script:", err)
      toast({
        title: "Error",
        description: "Failed to load verification service",
        variant: "destructive",
      })
      if (onVerificationFailure) onVerificationFailure(err)
    }

    document.body.appendChild(script)
    scriptRef.current = script

    // Cleanup function
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
        scriptRef.current = null
      }
    }
  }, [onVerificationFailure, toast])

  useEffect(() => {
    // Initialize the widget when script is loaded and we have a phone number
    if (isScriptLoaded && phoneNumber && !isInitialized) {
      // Format phone number if needed (remove spaces, add country code if missing)
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/\s/g, "")}`

      // Create configuration object
      const configuration = {
        widgetId,
        tokenAuth,
        identifier: formattedPhone,
        exposeMethods: true,
        success: (data: any) => {
          console.log("Verification successful:", data)
          toast({
            title: "Verification Successful",
            description: "Your phone number has been verified",
          })
          if (onVerificationSuccess) onVerificationSuccess(data.token || "")
        },
        failure: (error: any) => {
          console.error("Verification failed:", error)
          toast({
            title: "Verification Failed",
            description: error.message || "Failed to verify your phone number",
            variant: "destructive",
          })
          if (onVerificationFailure) onVerificationFailure(error)
        },
        ...variables,
      }

      // Initialize the widget
      if (window.initSendOTP) {
        window.initSendOTP(configuration)
        setIsInitialized(true)
      }
    }
  }, [
    isScriptLoaded,
    phoneNumber,
    isInitialized,
    widgetId,
    tokenAuth,
    variables,
    onVerificationSuccess,
    onVerificationFailure,
    toast,
  ])

  // The widget will be rendered by the script, so we don't need to return any JSX
  return null
}
