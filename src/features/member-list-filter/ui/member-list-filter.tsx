"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import {
  MemberStatus,
  MemberType,
  memberStatusLabel,
  memberTypeLabel,
} from "@/entities/member";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { ALL_SENTINEL, useMemberFilters } from "../model/use-member-filters";

const KEYWORD_DEBOUNCE_MS = 300;

export function MemberListFilter() {
  const { keyword: urlKeyword, memberType, memberStatus, update } = useMemberFilters();

  // 입력 즉시 echo + 디바운스 후에만 URL push
  const [localKeyword, setLocalKeyword] = useState(urlKeyword);
  const debouncedKeyword = useDebouncedValue(localKeyword, KEYWORD_DEBOUNCE_MS);

  useEffect(() => {
    setLocalKeyword(urlKeyword);
  }, [urlKeyword]);

  useEffect(() => {
    if (debouncedKeyword === urlKeyword) return;
    update({ keyword: debouncedKeyword || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder="이메일 / 닉네임 검색"
          className="pl-9"
          aria-label="회원 검색"
        />
      </div>

      <Select
        value={memberType ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ memberType: v === ALL_SENTINEL ? null : (v as MemberType) })
        }
      >
        <SelectTrigger aria-label="회원 유형 필터">
          <SelectValue placeholder="회원 유형" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 유형</SelectItem>
          {Object.values(MemberType).map((t) => (
            <SelectItem key={t} value={t}>
              {memberTypeLabel[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={memberStatus ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ memberStatus: v === ALL_SENTINEL ? null : (v as MemberStatus) })
        }
      >
        <SelectTrigger aria-label="회원 상태 필터">
          <SelectValue placeholder="회원 상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 상태</SelectItem>
          {Object.values(MemberStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {memberStatusLabel[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
