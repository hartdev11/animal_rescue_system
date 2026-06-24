import { CASE_STATUS_STYLES, TREATMENT_REPORT_STYLES } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import type { CaseTimelineEvent } from "@/types";

interface CaseTimelineProps {
  events: CaseTimelineEvent[];
  title?: string;
  highlightLatest?: boolean;
}

export function CaseTimeline({
  events,
  title = "ความคืบหน้า",
  highlightLatest = false,
}: CaseTimelineProps) {
  const latestId = events.length > 0 ? events[events.length - 1].id : null;

  return (
    <div className="rounded-xl border p-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-0">
        {events.map((event, i) => {
          const styles = event.reportType
            ? TREATMENT_REPORT_STYLES[event.reportType]
            : CASE_STATUS_STYLES[event.status];
          const isLatest = highlightLatest && event.id === latestId;

          return (
            <div
              key={event.id}
              className={cn(
                "flex gap-3 rounded-lg transition-colors",
                isLatest && "bg-emerald-50/60 -mx-2 px-2 py-1 animate-in fade-in duration-500"
              )}
            >
              <div className="flex flex-col items-center pt-1">
                <div
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white",
                    styles.dot,
                    isLatest && "scale-125 shadow-sm"
                  )}
                />
                {i < events.length - 1 && (
                  <div className={cn("min-h-8 w-0.5 flex-1", styles.line)} />
                )}
              </div>
              <div className="pb-5">
                <p className={cn("font-medium", styles.title)}>{event.title}</p>
                {event.description && (
                  <p className="text-sm text-gray-600">{event.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(
                    event.createdAt instanceof Date
                      ? event.createdAt
                      : new Date(event.createdAt)
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
