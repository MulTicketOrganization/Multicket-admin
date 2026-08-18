"use client";

import { X } from "lucide-react";

import { ReportStatus, reportStatusLabel } from "@/entities/report";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { ALL_SENTINEL, useReportFilters } from "../model/use-report-filters";

export function ReportListFilter() {
  const { status, createDate, performanceId, update } = useReportFilters();
  const hasAny = Boolean(status || createDate || performanceId);

  return (
    <div className="grid gap-3 sm:grid-cols-[180px_180px_180px_auto]">
      <Select
        value={status ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ status: v === ALL_SENTINEL ? null : (v as ReportStatus) })
        }
      >
        <SelectTrigger aria-label="처리 상태 필터">
          <SelectValue placeholder="처리 상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 상태</SelectItem>
          {Object.values(ReportStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {reportStatusLabel[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={createDate}
        onChange={(e) => update({ createDate: e.target.value || null })}
        aria-label="접수일 필터"
      />

      <Input
        type="number"
        min={1}
        inputMode="numeric"
        placeholder="공연 ID"
        value={performanceId ?? ""}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          update({ performanceId: Number.isFinite(n) && n > 0 ? n : null });
        }}
        aria-label="공연 ID 필터"
      />

      {hasAny && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({ status: null, createDate: null, performanceId: null })}
        >
          <X />
          초기화
        </Button>
      )}
    </div>
  );
}
