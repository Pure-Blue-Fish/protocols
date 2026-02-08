// ABOUTME: Shared Input component with consistent sizing and focus ring
// ABOUTME: Supports label, error state, and RTL via logical properties

"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  label?: string;
  error?: string;
}

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: "px-2.5 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-3 text-base rounded-lg",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = "md", label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm text-text-secondary mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full border transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus:border-brand-primary outline-none ${
            error ? "border-red-300" : "border-border-default"
          } ${SIZE_CLASSES[inputSize]} ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
