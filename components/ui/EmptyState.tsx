// ABOUTME: Illustrated empty state for lists and tables with no data
// ABOUTME: Shows icon, title, optional description

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-text-muted mb-3">{icon}</div>}
      <p className="text-base font-medium text-text-secondary mb-1">{title}</p>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
}
