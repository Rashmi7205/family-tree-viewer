"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth/auth-context";

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, {
    message:
      "Please enter a valid phone number in international format (e.g., +1234567890)",
  }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

interface PhoneVerificationStepProps {
  onVerified: (phoneNumber: string) => void;
}

export default function PhoneVerificationStep({
  onVerified,
}: PhoneVerificationStepProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  async function onPhoneSubmit(data: PhoneFormValues) {
    if (!user) return;

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/onboarding/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: data.phoneNumber }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send OTP");
      }

      setPhoneNumber(data.phoneNumber);
      setShowOtpForm(true);
      startCooldown();

      toast.success("A verification code has been sent to your phone.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function onOtpSubmit(data: OtpFormValues) {
    if (!user) return;

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/onboarding/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: data.otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invalid OTP");
      }

      toast.success("Your phone number has been verified successfully.");
      onVerified(phoneNumber);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function resendOtp() {
    if (!user) return;

    setIsResending(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/onboarding/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend OTP");
      }

      startCooldown();

      toast.success("A new verification code has been sent to your phone.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to resend OTP. Please try again later."
      );
    } finally {
      setIsResending(false);
    }
  }

  function startCooldown() {
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <div className="space-y-6">
      {!showOtpForm ? (
        <form
          onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+1234567890"
              disabled={isLoading}
              {...phoneForm.register("phoneNumber")}
            />
            {phoneForm.formState.errors.phoneNumber && (
              <p className="text-sm text-red-500">
                {phoneForm.formState.errors.phoneNumber.message}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your phone number in international format (e.g.,
              +1234567890)
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send Verification Code
          </Button>
        </form>
      ) : (
        <form
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              placeholder="123456"
              maxLength={6}
              disabled={isLoading}
              {...otpForm.register("otp")}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-sm text-red-500">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Verify
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={resendOtp}
              disabled={isResending || cooldown > 0}
            >
              {isResending && (
                <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
              )}
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
