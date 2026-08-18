"use client";

import { X } from "lucide-react";

import {
  FailedEventStatus,
  FailedEventType,
  failedEventStatusLabel,
  failedEventTypeLabel,
} from "@/entities/failed-event";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { ALL_SENTINEL, useFailedEventFilters } from "../model/use-failed-event-filters";

export function FailedEventListFilter() {
  const { status, eventType, update } = useFailedEventFilters();
  const hasAny = Boolean(status || eventType);

  return (
    <div className="grid gap-3 sm:grid-cols-[180px_220px_auto]">
      <Select
        value={status ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ status: v === ALL_SENTINEL ? null : (v as FailedEventStatus) })
        }
      >
        <SelectTrigger aria-label="처리 상태 필터">
          <SelectValue placeholder="처리 상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 상태</SelectItem>
          {Object.values(FailedEventStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {failedEventStatusLabel[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={eventType ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ eventType: v === ALL_SENTINEL ? null : (v as FailedEventType) })
        }
      >
        <SelectTrigger aria-label="이벤트 타입 필터">
          <SelectValue placeholder="이벤트 타입" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 타입</SelectItem>
          {Object.values(FailedEventType).map((t) => (
            <SelectItem key={t} value={t}>
              {failedEventTypeLabel[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasAny && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({ status: null, eventType: null })}
        >
          <X />
          초기화
        </Button>
      )}
    </div>
  );
}
