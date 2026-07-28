"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useRevenuePeriod } from "../model/use-revenue-period";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function RevenuePeriodFilter() {
  const { year, month, years, update, shiftMonth } = useRevenuePeriod();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => shiftMonth(-1)}
        aria-label="이전 달"
      >
        <ChevronLeft />
      </Button>

      <Select value={String(year)} onValueChange={(v) => update({ year: Number(v) })}>
        <SelectTrigger className="w-28" aria-label="연도 선택">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}년
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(month)} onValueChange={(v) => update({ month: Number(v) })}>
        <SelectTrigger className="w-24" aria-label="월 선택">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {m}월
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => shiftMonth(1)}
        aria-label="다음 달"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
