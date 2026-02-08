// ABOUTME: Styled table primitives with sticky header and hover rows
// ABOUTME: Composable: Table, Thead, Tbody, Tr, Th (sortable), Td

"use client";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="bg-surface-card rounded-2xl border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${className}`}>{children}</table>
      </div>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface-subtle/80 border-b border-border-subtle sticky top-0 z-10">
      {children}
    </thead>
  );
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border-subtle">{children}</tbody>;
}

interface ThProps {
  children?: React.ReactNode;
  sortKey?: string;
  currentSort?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  className?: string;
}

export function Th({ children, sortKey, currentSort, sortDir, onSort, className = "" }: ThProps) {
  const sortable = !!sortKey && !!onSort;
  const isActive = sortKey === currentSort;

  return (
    <th
      className={`px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wide font-heading ${
        sortable ? "cursor-pointer select-none hover:text-text-secondary" : ""
      } ${className}`}
      onClick={sortable ? () => onSort(sortKey) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && isActive && sortDir === "asc" && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 3l4 6H2z"/></svg>
        )}
        {sortable && isActive && sortDir === "desc" && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 9l4-6H2z"/></svg>
        )}
        {sortable && !isActive && (
          <svg className="w-3 h-3 opacity-30" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2l3 4H3zm0 8L3 6h6z"/></svg>
        )}
      </span>
    </th>
  );
}

interface TdProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
  dir?: string;
}

export function Td({ children, className = "", colSpan, dir }: TdProps) {
  return <td className={`px-4 py-3 ${className}`} colSpan={colSpan} dir={dir}>{children}</td>;
}

export function Tr({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={`hover:bg-surface-subtle/50 transition-colors ${className}`}>{children}</tr>;
}
