"use client";

import { X } from "lucide-react";

import { NoticeType, noticeTypeLabel } from "@/entities/notice";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { ALL_SENTINEL, useNoticeFilters } from "../model/use-notice-filters";

export function NoticeListFilter() {
  const { type, expireDate, update } = useNoticeFilters();
  const hasAny = Boolean(type || expireDate);

  return (
    <div className="grid gap-3 sm:grid-cols-[240px_180px_auto]">
      <Select
        value={type ?? ALL_SENTINEL}
        onValueChange={(v) => update({ type: v === ALL_SENTINEL ? null : (v as NoticeType) })}
      >
        <SelectTrigger aria-label="공고 타입 필터">
          <SelectValue placeholder="공고 타입" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 타입</SelectItem>
          {Object.values(NoticeType).map((t) => (
            <SelectItem key={t} value={t}>
              {noticeTypeLabel[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={expireDate}
        onChange={(e) => update({ expireDate: e.target.value || null })}
        aria-label="만료일 필터"
      />

      {hasAny && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({ type: null, expireDate: null })}
        >
          <X />
          초기화
        </Button>
      )}
    </div>
  );
}
