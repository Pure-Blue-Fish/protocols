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
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-white border-gray-200 text-gray-700"
      }`}
    >
      <div className="font-medium truncate">{workerName}</div>
      <div className={`truncate ${completed ? "line-through opacity-60" : ""}`}>
        {protocolTitle}
      </div>
      {notes && (
        <div className="text-gray-400 truncate mt-0.5">{notes}</div>
      )}
    </div>
  );
}
