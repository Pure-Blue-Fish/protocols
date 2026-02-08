// ABOUTME: Removable filter chip showing active filter
// ABOUTME: Used alongside filter selects to show what's active

"use client";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-brand-primary-light text-brand-primary rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-brand-primary-hover">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
