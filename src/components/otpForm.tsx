"use client";
import { FormEvent, useEffect, useState, MouseEvent } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { auth } from "@/lib/firebase/config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: any;
  }
}

interface OTPFormProps {
  phoneNumber: string;
}

export function OTPForm({ phoneNumber }: OTPFormProps) {
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (resendCount > 0) {
      timer = setTimeout(() => {
        setResendCount(resendCount - 1);
      }, 1000);
    }
  }, [resendCount]);

  // Initialize reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible", // Use "invisible" for better UX
          callback: (response: any) => {
            setRecaptchaLoaded(true);
          },
          "expired-callback": () => {
            setRecaptchaLoaded(false);
            resetRecaptcha();
          },
        }
      );

      window.recaptchaVerifier.render().catch((error) => {
        console.error("ReCAPTCHA render error:", error);
      });
    }
  }, []);

  // Function to reset reCAPTCHA
  const resetRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
        }
      );
      window.recaptchaVerifier.render();
    }
  };

  // Send OTP
  const sendOTP = async (e: MouseEvent) => {
    e.preventDefault();
    setResendCount(60);
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Enter a valid phone number");
      return;
    }

    if (!window.recaptchaVerifier) {
      alert("reCAPTCHA not initialized, please wait.");
      return;
    }

    setLoading(true);

    try {
      const formattedPhoneNumber = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const recaptchaToken = await window.recaptchaVerifier.verify(); // Explicit verification

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      alert("OTP has been sent");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setResendCount(0);

      alert("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert("Enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      alert("OTP not sent. Please request OTP again.");
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      setOtp("");
      alert("OTP Verified Successfully!");
    } catch (error) {
      console.error("OTP Verification Failed:", error);
      alert("Invalid OTP, please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-3 items-center">
      {!isOtpSent ? (
        <Button variant="outline" onClick={sendOTP} disabled={loading}>
          {loading ? "Sending..." : "Verify phone Number OTP"}
        </Button>
      ) : (
        <>
          <InputOTP maxLength={6} value={otp} onChange={(e) => setOtp(e)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            onClick={verifyOTP}
            className="w-full bg-green-600 text-white mt-2"
          >
            Verify OTP
          </Button>
        </>
      )}
      <div id="recaptcha-container" />
    </div>
  );
}
