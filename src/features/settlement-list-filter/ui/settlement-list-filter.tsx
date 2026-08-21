"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";

import { SettlementStatus, settlementStatusLabel } from "@/entities/settlement";
import { useDebouncedValue, useSyncedState } from "@/shared/hooks";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { ALL_SENTINEL, useSettlementFilters } from "../model/use-settlement-filters";

const KEYWORD_DEBOUNCE_MS = 300;

export function SettlementListFilter() {
  const { status, createDate, keyword: urlKeyword, update } = useSettlementFilters();

  // 입력 즉시 echo + 디바운스 후에만 URL push
  const [localKeyword, setLocalKeyword] = useSyncedState(urlKeyword);
  const debouncedKeyword = useDebouncedValue(localKeyword, KEYWORD_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedKeyword === urlKeyword) return;
    update({ keyword: debouncedKeyword || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const hasAny = Boolean(status || createDate || urlKeyword);

  return (
    <div className="grid gap-3 sm:grid-cols-[180px_180px_minmax(0,1fr)_auto]">
      <Select
        value={status ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ status: v === ALL_SENTINEL ? null : (v as SettlementStatus) })
        }
      >
        <SelectTrigger aria-label="정산 상태 필터">
          <SelectValue placeholder="정산 상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 상태</SelectItem>
          {Object.values(SettlementStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {settlementStatusLabel[s]}
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

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder="창작자 닉네임 / 이메일 검색"
          className="pl-9"
          aria-label="창작자 검색"
        />
      </div>

      {hasAny && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalKeyword("");
            update({ status: null, createDate: null, keyword: null });
          }}
        >
          <X />
          초기화
        </Button>
      )}
    </div>
  );
}
