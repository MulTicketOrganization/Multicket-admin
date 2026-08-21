"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { ReportStatus, type ReportListFilters } from "@/entities/report";

const KEY_STATUS = "status";
const KEY_DATE = "date";
const KEY_PERFORMANCE = "performanceId";

export const ALL_SENTINEL = "_all_";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isStatus(v: string | null): v is ReportStatus {
  return v != null && (Object.values(ReportStatus) as string[]).includes(v);
}

function parsePerformanceId(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

interface Patch {
  status?: ReportStatus | null;
  createDate?: string | null;
  performanceId?: number | null;
}

export function useReportFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusRaw = searchParams.get(KEY_STATUS);
  const dateRaw = searchParams.get(KEY_DATE);

  const status = isStatus(statusRaw) ? statusRaw : null;
  const createDate = dateRaw && DATE_PATTERN.test(dateRaw) ? dateRaw : "";
  const performanceId = parsePerformanceId(searchParams.get(KEY_PERFORMANCE));

  const filters = useMemo<ReportListFilters>(
    () => ({
      status: status ?? undefined,
      createDate: createDate || undefined,
      performanceId,
    }),
    [status, createDate, performanceId],
  );

  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());
      const apply = (key: string, value: string | null | undefined) => {
        if (value === undefined) return;
        if (value) next.set(key, value);
        else next.delete(key);
      };
      apply(KEY_STATUS, patch.status);
      apply(KEY_DATE, patch.createDate);
      apply(
        KEY_PERFORMANCE,
        patch.performanceId === undefined
          ? undefined
          : patch.performanceId == null
            ? null
            : String(patch.performanceId),
      );

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { filters, status, createDate, performanceId, update };
}
