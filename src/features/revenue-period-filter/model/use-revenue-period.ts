"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const KEY_YEAR = "year";
const KEY_MONTH = "month";

/** 백엔드 매출 데이터가 존재할 수 있는 최소 연도 */
const MIN_YEAR = 2024;

function parseInt10(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * 매출 조회 기간(연/월) 을 URL 로 관리한다.
 * 파라미터가 없으면 현재 연월을 기본값으로 쓴다.
 */
export function useRevenuePeriod() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const now = new Date();
  const currentYear = now.getFullYear();

  const yearRaw = parseInt10(searchParams.get(KEY_YEAR));
  const monthRaw = parseInt10(searchParams.get(KEY_MONTH));

  const year =
    yearRaw != null && yearRaw >= MIN_YEAR && yearRaw <= currentYear + 1
      ? yearRaw
      : currentYear;
  const month = monthRaw != null && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : now.getMonth() + 1;

  const update = useCallback(
    (patch: { year?: number; month?: number }) => {
      const next = new URLSearchParams(searchParams.toString());
      if (patch.year != null) next.set(KEY_YEAR, String(patch.year));
      if (patch.month != null) next.set(KEY_MONTH, String(patch.month));
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  /** 이전/다음 달로 이동 (연도 경계 처리 포함) */
  const shiftMonth = useCallback(
    (delta: number) => {
      const d = new Date(year, month - 1 + delta, 1);
      update({ year: d.getFullYear(), month: d.getMonth() + 1 });
    },
    [year, month, update],
  );

  const years: number[] = [];
  for (let y = currentYear; y >= MIN_YEAR; y--) years.push(y);

  return { year, month, years, update, shiftMonth };
}
