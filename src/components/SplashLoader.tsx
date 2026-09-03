"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChefHat } from "lucide-react";

interface Props {
  onFinish?: () => void;
  minDuration?: number;
}

export default function SplashLoader({ onFinish, minDuration = 1600 }: Props) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, minDuration / 20);

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 350);
    }, minDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [minDuration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-neutral-900 transition-opacity duration-300 select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xs animate-in zoom-in-95 duration-300">
        
        {/* Animated Logo Container */}
        <div className="relative mb-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-red-600 bg-white shadow-lg p-0.5 animate-pulse">
            <Image
              src="/logo.jpg"
              alt="Anu CiRENG Logo"
              fill
              priority
              className="object-cover rounded-full"
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-0.5 mb-5">
          <h1 className="text-xl font-black text-neutral-900">
            Anu <span className="text-red-600">CiRENG</span>
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Pre-Order Fresh Daily
          </p>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="w-40 bg-neutral-100 rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-red-600 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <p className="text-[11px] text-neutral-400 font-medium mt-3 flex items-center gap-1">
          <ChefHat className="w-3.5 h-3.5 text-red-500" />
          <span>Menyiapkan menu fresh...</span>
        </p>
      </div>
    </div>
  );
}
