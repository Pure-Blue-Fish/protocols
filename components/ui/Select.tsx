// ABOUTME: Shared Select component matching Input styling
// ABOUTME: Wraps native select with consistent appearance

"use client";

import { type SelectHTMLAttributes, forwardRef } from "react";

type SelectSize = "sm" | "md" | "lg";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  selectSize?: SelectSize;
  label?: string;
}

const SIZE_CLASSES: Record<SelectSize, string> = {
  sm: "px-2.5 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-3 text-base rounded-lg",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ selectSize = "md", label, className = "", id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="block text-sm text-gray-600 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full border border-gray-300 bg-white transition-colors focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none ${SIZE_CLASSES[selectSize]} ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
