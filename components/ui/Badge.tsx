// ABOUTME: Shared Badge for status indicators (active/inactive, completed/pending)
// ABOUTME: Replaces ad-hoc span+className patterns across pages

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  default: "bg-gray-100 text-gray-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-100 text-blue-700",
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
