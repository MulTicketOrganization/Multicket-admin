"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  InquiryStatus,
  InquiryType,
  type InquiryListFilters,
} from "@/entities/inquiry";

const KEY_TYPE = "type";
const KEY_STATUS = "status";
const KEY_DATE = "date";

export const ALL_SENTINEL = "_all_";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isType(v: string | null): v is InquiryType {
  return v != null && (Object.values(InquiryType) as string[]).includes(v);
}

function isStatus(v: string | null): v is InquiryStatus {
  return v != null && (Object.values(InquiryStatus) as string[]).includes(v);
}

interface Patch {
  inquiryType?: InquiryType | null;
  inquiryStatus?: InquiryStatus | null;
  createDate?: string | null;
}

export function useInquiryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const typeRaw = searchParams.get(KEY_TYPE);
  const statusRaw = searchParams.get(KEY_STATUS);
  const dateRaw = searchParams.get(KEY_DATE);

  const inquiryType = isType(typeRaw) ? typeRaw : null;
  const inquiryStatus = isStatus(statusRaw) ? statusRaw : null;
  const createDate = dateRaw && DATE_PATTERN.test(dateRaw) ? dateRaw : "";

  const filters = useMemo<InquiryListFilters>(
    () => ({
      inquiryType: inquiryType ?? undefined,
      inquiryStatus: inquiryStatus ?? undefined,
      createDate: createDate || undefined,
    }),
    [inquiryType, inquiryStatus, createDate],
  );

  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());
      const apply = (key: string, value: string | null | undefined) => {
        if (value === undefined) return;
        if (value) next.set(key, value);
        else next.delete(key);
      };
      apply(KEY_TYPE, patch.inquiryType);
      apply(KEY_STATUS, patch.inquiryStatus);
      apply(KEY_DATE, patch.createDate);

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { filters, inquiryType, inquiryStatus, createDate, update };
}
