"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

export default function OnboardingSuccess() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-16 text-center">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "easeOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 10,
          delay: 0.2,
        }}
        className="relative mb-8"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-500 p-1"
          >
            <div className="rounded-full bg-white dark:bg-slate-800 p-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </motion.div>
          <div className="rounded-full bg-white dark:bg-slate-800 p-6 m-1">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        </div>

        {/* Sparkles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -bottom-2 -left-2"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 max-w-md"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Aboard! 🎉
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your profile has been successfully completed. You're all set to
          explore your dashboard!
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <span>Redirecting to dashboard</span>
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        >
          <ArrowRight className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Loading Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 flex space-x-1"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
