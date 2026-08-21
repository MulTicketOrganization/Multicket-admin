"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  FailedEventStatus,
  FailedEventType,
  type FailedEventListFilters,
} from "@/entities/failed-event";

const KEY_STATUS = "status";
const KEY_TYPE = "type";

export const ALL_SENTINEL = "_all_";

function isStatus(v: string | null): v is FailedEventStatus {
  return v != null && (Object.values(FailedEventStatus) as string[]).includes(v);
}

function isType(v: string | null): v is FailedEventType {
  return v != null && (Object.values(FailedEventType) as string[]).includes(v);
}

interface Patch {
  status?: FailedEventStatus | null;
  eventType?: FailedEventType | null;
}

export function useFailedEventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusRaw = searchParams.get(KEY_STATUS);
  const typeRaw = searchParams.get(KEY_TYPE);

  const status = isStatus(statusRaw) ? statusRaw : null;
  const eventType = isType(typeRaw) ? typeRaw : null;

  const filters = useMemo<FailedEventListFilters>(
    () => ({ status: status ?? undefined, eventType: eventType ?? undefined }),
    [status, eventType],
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
      apply(KEY_TYPE, patch.eventType);

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { filters, status, eventType, update };
}
