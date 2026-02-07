// ABOUTME: Search input with magnifying glass icon and clear button
// ABOUTME: Debounced onChange for performance

"use client";

import { useState, useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  debounce?: number;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  debounce = 200,
  className = "",
}: SearchInputProps) {
  const [internal, setInternal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  const handleChange = (v: string) => {
    setInternal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), debounce);
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full ps-9 pe-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none"
      />
      {internal && (
        <button
          onClick={() => { setInternal(""); onChange(""); }}
          className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
