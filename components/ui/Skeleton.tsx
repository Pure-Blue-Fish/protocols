// ABOUTME: Skeleton loading placeholder with pulse animation
// ABOUTME: Composable building block for skeleton screens

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 rounded-md animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
