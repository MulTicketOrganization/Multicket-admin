"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { NoticeType, type NoticeListFilters } from "@/entities/notice";

const KEY_TYPE = "type";
const KEY_EXPIRE = "expire";

export const ALL_SENTINEL = "_all_";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isType(v: string | null): v is NoticeType {
  return v != null && (Object.values(NoticeType) as string[]).includes(v);
}

interface Patch {
  type?: NoticeType | null;
  expireDate?: string | null;
}

export function useNoticeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const typeRaw = searchParams.get(KEY_TYPE);
  const expireRaw = searchParams.get(KEY_EXPIRE);

  const type = isType(typeRaw) ? typeRaw : null;
  const expireDate = expireRaw && DATE_PATTERN.test(expireRaw) ? expireRaw : "";

  const filters = useMemo<NoticeListFilters>(
    () => ({ type: type ?? undefined, expireDate: expireDate || undefined }),
    [type, expireDate],
  );

  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());
      const apply = (key: string, value: string | null | undefined) => {
        if (value === undefined) return;
        if (value) next.set(key, value);
        else next.delete(key);
      };
      apply(KEY_TYPE, patch.type);
      apply(KEY_EXPIRE, patch.expireDate);

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { filters, type, expireDate, update };
}
