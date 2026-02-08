// ABOUTME: Shared Badge for status indicators (active/inactive, completed/pending)
// ABOUTME: Replaces ad-hoc span+className patterns across pages

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  default: "bg-surface-subtle text-text-secondary",
  success: "bg-brand-success-light text-brand-success",
  warning: "bg-brand-warning-light text-brand-warning",
  danger: "bg-brand-danger-light text-brand-danger",
  info: "bg-brand-primary-light text-brand-primary",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
