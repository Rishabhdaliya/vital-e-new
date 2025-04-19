"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseMSG91WidgetOptions {
  onVerificationSuccess?: (token: string) => void
  onVerificationFailure?: (error: any) => void
}

export function useMSG91Widget(options: UseMSG91WidgetOptions = {}) {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [error, setError] = useState<any>(null)

  // Get widget configuration from environment variables
  const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || ""
  const tokenAuth = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || ""

  // Handle verification success
  const handleVerificationSuccess = (token: string) => {
    setVerificationToken(token)
    setIsVerified(true)
    setIsVerifying(false)
    setError(null)

    if (options.onVerificationSuccess) {
      options.onVerificationSuccess(token)
    }
  }

  // Handle verification failure
  const handleVerificationFailure = (err: any) => {
    setError(err)
    setIsVerifying(false)

    toast({
      title: "Verification Failed",
      description: err.message || "Failed to verify your phone number",
      variant: "destructive",
    })

    if (options.onVerificationFailure) {
      options.onVerificationFailure(err)
    }
  }

  // Start verification process
  const startVerification = (phone: string) => {
    setPhoneNumber(phone)
    setIsVerifying(true)
    setIsVerified(false)
    setVerificationToken(null)
    setError(null)
  }

  // Reset verification state
  const resetVerification = () => {
    setPhoneNumber("")
    setIsVerifying(false)
    setIsVerified(false)
    setVerificationToken(null)
    setError(null)
  }

  return {
    phoneNumber,
    isVerifying,
    isVerified,
    verificationToken,
    error,
    widgetId,
    tokenAuth,
    startVerification,
    resetVerification,
    handleVerificationSuccess,
    handleVerificationFailure,
  }
}
