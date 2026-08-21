"use client";

import { X } from "lucide-react";

import {
  InquiryStatus,
  InquiryType,
  inquiryStatusLabel,
  inquiryTypeLabel,
} from "@/entities/inquiry";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { ALL_SENTINEL, useInquiryFilters } from "../model/use-inquiry-filters";

export function InquiryListFilter() {
  const { inquiryType, inquiryStatus, createDate, update } = useInquiryFilters();
  const hasAny = Boolean(inquiryType || inquiryStatus || createDate);

  return (
    <div className="grid gap-3 sm:grid-cols-[180px_180px_180px_auto]">
      <Select
        value={inquiryType ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ inquiryType: v === ALL_SENTINEL ? null : (v as InquiryType) })
        }
      >
        <SelectTrigger aria-label="문의 유형 필터">
          <SelectValue placeholder="문의 유형" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 유형</SelectItem>
          {Object.values(InquiryType).map((t) => (
            <SelectItem key={t} value={t}>
              {inquiryTypeLabel[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={inquiryStatus ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ inquiryStatus: v === ALL_SENTINEL ? null : (v as InquiryStatus) })
        }
      >
        <SelectTrigger aria-label="처리 상태 필터">
          <SelectValue placeholder="처리 상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 상태</SelectItem>
          {Object.values(InquiryStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {inquiryStatusLabel[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={createDate}
        onChange={(e) => update({ createDate: e.target.value || null })}
        aria-label="생성일 필터"
      />

      {hasAny && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            update({ inquiryType: null, inquiryStatus: null, createDate: null })
          }
        >
          <X />
          초기화
        </Button>
      )}
    </div>
  );
}
