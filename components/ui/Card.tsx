// ABOUTME: Shared Card container with consistent border, shadow, and hover
// ABOUTME: Used for category cards, task cards, mobile list items

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-card ${
        hover ? "hover:shadow-card-hover transition-shadow" : ""
      } ${PADDING[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
