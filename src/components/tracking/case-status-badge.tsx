import { CASE_STATUS_STYLES } from "@/lib/constants";
import type { CaseStatus } from "@/types";

interface CaseStatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export function CaseStatusBadge({ status, className = "" }: CaseStatusBadgeProps) {
  const styles = CASE_STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
    </span>
  );
}
