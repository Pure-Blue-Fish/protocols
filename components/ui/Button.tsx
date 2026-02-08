// ABOUTME: Shared Button component with variant/size system
// ABOUTME: Replaces inconsistent ad-hoc button styles across all pages

"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50",
  secondary: "bg-white text-text-primary border border-border-default hover:bg-surface-subtle disabled:opacity-50",
  danger: "text-brand-danger bg-brand-danger-light hover:bg-red-100 disabled:opacity-50",
  ghost: "text-text-secondary hover:bg-surface-subtle disabled:opacity-50",
  success: "bg-brand-success text-white hover:bg-brand-success-hover disabled:opacity-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-md gap-1",
  md: "px-4 py-2 text-sm rounded-lg gap-1.5",
  lg: "px-5 py-3 text-base rounded-lg gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium font-heading transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:ring-offset-2 outline-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
