// ABOUTME: Small card showing a worker-protocol assignment in the calendar
// ABOUTME: Color-coded by completion status

"use client";

interface AssignmentCardProps {
  workerName: string;
  protocolTitle: string;
  completed: boolean;
  notes: string | null;
}

export default function AssignmentCard({
  workerName,
  protocolTitle,
  completed,
  notes,
}: AssignmentCardProps) {
  return (
    <div
      className={`px-2 py-1.5 rounded-md text-xs border transition-colors ${
        completed
          ? "bg-brand-success-light border-brand-success/20 text-brand-success"
          : "bg-surface-card border-border-default text-text-secondary"
      }`}
    >
      <div className="font-medium truncate">{workerName}</div>
      <div className={`truncate ${completed ? "line-through opacity-60" : ""}`}>
        {protocolTitle}
      </div>
      {notes && (
        <div className="text-text-muted truncate mt-0.5">{notes}</div>
      )}
    </div>
  );
}
