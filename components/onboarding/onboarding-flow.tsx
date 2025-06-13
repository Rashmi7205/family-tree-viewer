"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import PhoneVerificationStep from "@/components/onboarding/phone-verification-step";
import ProfileCompletionStep from "@/components/onboarding/profile-completion-step";
import OnboardingProgress from "@/components/onboarding/onboarding-progress";
import OnboardingSuccess from "@/components/onboarding/onboarding-success";
import { useAuth } from "@/lib/auth/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { IUser } from "../../models/User";

interface OnboardingFlowProps {
  user: User;
  userProfile: IUser | null;
}

type OnboardingStep = "phone" | "profile" | "success";

export default function OnboardingFlow({
  user,
  userProfile,
}: OnboardingFlowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("phone");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePhoneVerified = async (verifiedPhone: string) => {
    await refreshUserProfile();
    setCurrentStep("profile");
  };

  const handleProfileCompleted = async () => {
    setCurrentStep("success");

    // Redirect to dashboard after success animation
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Just a few more steps to get you started
            </p>
          </motion.div>

          {/* Progress Indicator */}
          {currentStep !== "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <OnboardingProgress currentStep={currentStep} />
            </motion.div>
          )}

          {/* Step Content */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <AnimatePresence mode="wait">
              {currentStep === "phone" && (
                <motion.div
                  key="phone"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <PhoneVerificationStep onVerified={handlePhoneVerified} />
                </motion.div>
              )}

              {currentStep === "profile" && (
                <motion.div
                  key="profile"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <ProfileCompletionStep onCompleted={handleProfileCompleted} />
                </motion.div>
              )}

              {currentStep === "success" && (
                <motion.div
                  key="success"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <OnboardingSuccess />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
