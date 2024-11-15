"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import localFont from "next/font/local";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

const exemplarPro = localFont({
  src: "../../public/fonts/ExemplarPro.otf",
});

interface OTPWrapperProps {
  children: ReactNode;
}

export default function OTPWrapper({ children }: OTPWrapperProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleComplete = (value: string) => {
    const upperValue = value.toUpperCase();
    if (upperValue === "ORIONX") {
      setError(false);
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 120);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setValue("");
    }
  };

  const slotClassName = `
    w-11 h-11 
    text-[18px] text-[#4C4F69]/[0.81]
    bg-transparent
    border-[#FFFFFF]/[0.09]
    focus:border-[#FFFFFF]/[0.09]
    focus:ring-0 focus:ring-offset-0
  `;

  return (
    <>
      {children}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010101]"
          >
            <div
              className={`flex flex-col items-center scale-125 ${shake ? "animate-shake" : ""}`}
              style={exemplarPro.style}
            >
              <InputOTP
                value={value}
                onChange={(value: string) => {
                  const upperValue = value.toUpperCase();
                  setValue(upperValue);
                  if (value.length === 6) {
                    handleComplete(value);
                  }
                }}
                maxLength={6}
                className="group flex items-center gap-6"
              >
                <InputOTPGroup className="rounded-xl [&>div]:border-[#FFFFFF]/[0.09]">
                  <InputOTPSlot index={0} className={slotClassName} />
                  <InputOTPSlot index={1} className={slotClassName} />
                  <InputOTPSlot index={2} className={slotClassName} />
                </InputOTPGroup>

                <InputOTPSeparator className="text-[#FFFFFF]/[0.09]" />

                <InputOTPGroup className="rounded-xl [&>div]:border-[#FFFFFF]/[0.09]">
                  <InputOTPSlot index={3} className={slotClassName} />
                  <InputOTPSlot index={4} className={slotClassName} />
                  <InputOTPSlot index={5} className={slotClassName} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="mt-4 text-sm text-red-500/70 text-center">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
