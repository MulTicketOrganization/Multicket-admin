"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { SettlementStatus, type SettlementListFilters } from "@/entities/settlement";

const KEY_STATUS = "status";
const KEY_DATE = "date";
const KEY_KEYWORD = "q";

export const ALL_SENTINEL = "_all_";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isStatus(v: string | null): v is SettlementStatus {
  return v != null && (Object.values(SettlementStatus) as string[]).includes(v);
}

interface Patch {
  status?: SettlementStatus | null;
  createDate?: string | null;
  keyword?: string | null;
}

export function useSettlementFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusRaw = searchParams.get(KEY_STATUS);
  const dateRaw = searchParams.get(KEY_DATE);

  const status = isStatus(statusRaw) ? statusRaw : null;
  const createDate = dateRaw && DATE_PATTERN.test(dateRaw) ? dateRaw : "";
  const keyword = searchParams.get(KEY_KEYWORD) ?? "";

  const filters = useMemo<SettlementListFilters>(
    () => ({
      status: status ?? undefined,
      createDate: createDate || undefined,
      keyword: keyword.trim() || undefined,
    }),
    [status, createDate, keyword],
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
      apply(KEY_KEYWORD, patch.keyword);

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { filters, status, createDate, keyword, update };
}
