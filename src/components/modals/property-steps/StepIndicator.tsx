"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStepIndex: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStepIndex, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "h-1.5 w-8 rounded-full transition-all duration-500",
            i <= currentStepIndex ? "bg-blue-500 w-10" : "bg-slate-700"
          )} 
        />
      ))}
    </div>
  );
};