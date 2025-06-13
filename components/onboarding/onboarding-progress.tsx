"use client";

import { Icons } from "@/components/icons";
import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: "phone" | "profile" | "success";
}

export default function OnboardingProgress({
  currentStep,
}: OnboardingProgressProps) {
  const steps = [
    { id: "phone", name: "Phone Verification", icon: Icons.phone },
    { id: "profile", name: "Profile Setup", icon: Icons.user },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : isActive
                      ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
                <div className="mt-2">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted || isActive
                        ? "text-slate-900 dark:text-slate-100"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`mx-4 h-0.5 w-16 origin-left ${
                    isCompleted
                      ? "bg-green-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
