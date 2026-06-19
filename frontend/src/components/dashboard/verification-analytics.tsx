"use client";

import { TrendPoint, DocTypeCount } from "@/lib/types";

interface VerificationAnalyticsProps {
  trend: TrendPoint[];
  topTypes: DocTypeCount[];
  total: number;
}

export function VerificationAnalytics({
  trend,
  topTypes,
  total,
}: VerificationAnalyticsProps) {
  const maxCount = Math.max(...trend.map((p) => p.count), 1);
  const last7 = trend.slice(-7);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">
        Verification Analytics
      </h3>
      <p className="mt-0.5 text-xs text-text-secondary">Last 7 days</p>

      <div className="mt-4 flex flex-1 items-end gap-1.5">
        {last7.map((point) => {
          const height = point.count === 0 ? 4 : (point.count / maxCount) * 100;
          const day = new Date(point.date + "T00:00:00").toLocaleDateString(
            "en-US",
            { weekday: "short" }
          );
          return (
            <div
              key={point.date}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-[10px] font-medium text-text-secondary">
                {point.count}
              </span>
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              <span className="text-[10px] text-text-secondary">{day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs font-semibold text-text-primary">
          Top Document Types
        </p>
        {topTypes.length === 0 ? (
          <p className="mt-2 text-xs text-text-secondary">No documents yet</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {topTypes.map(({ doc_type, count }) => (
              <li key={doc_type} className="flex items-center justify-between">
                <span className="truncate text-xs text-text-primary">
                  {doc_type}
                </span>
                <span className="shrink-0 text-xs font-medium text-text-secondary">
                  {count}{" "}
                  <span className="text-[10px]">
                    ({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
