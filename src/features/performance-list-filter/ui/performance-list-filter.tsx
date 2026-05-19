"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Area, GENRES, type Area as TArea, type Genre } from "@/entities/performance";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import {
  ALL_SENTINEL,
  DELETED_VALUE,
  usePerformanceFilters,
  type DeletedValue,
} from "../model/use-performance-filters";

const TITLE_DEBOUNCE_MS = 300;

export function PerformanceListFilter() {
  const {
    title: urlTitle,
    genre,
    area,
    deletedSelect,
    selectToDeleted,
    update,
  } = usePerformanceFilters();

  const [localTitle, setLocalTitle] = useState(urlTitle);
  const debouncedTitle = useDebouncedValue(localTitle, TITLE_DEBOUNCE_MS);

  useEffect(() => {
    setLocalTitle(urlTitle);
  }, [urlTitle]);

  useEffect(() => {
    if (debouncedTitle === urlTitle) return;
    update({ title: debouncedTitle || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_160px_140px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="공연 제목 검색"
          className="pl-9"
          aria-label="공연 검색"
        />
      </div>

      <Select
        value={genre ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ genre: v === ALL_SENTINEL ? null : (v as Genre) })
        }
      >
        <SelectTrigger aria-label="장르 필터">
          <SelectValue placeholder="장르" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 장르</SelectItem>
          {GENRES.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={area ?? ALL_SENTINEL}
        onValueChange={(v) =>
          update({ area: v === ALL_SENTINEL ? null : (v as TArea) })
        }
      >
        <SelectTrigger aria-label="지역 필터">
          <SelectValue placeholder="지역" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>전체 지역</SelectItem>
          {Object.values(Area).map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={deletedSelect}
        onValueChange={(v) => update({ deleted: selectToDeleted(v as DeletedValue) })}
      >
        <SelectTrigger aria-label="활성 / 삭제 필터">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DELETED_VALUE.ALL}>전체</SelectItem>
          <SelectItem value={DELETED_VALUE.ACTIVE}>활성만</SelectItem>
          <SelectItem value={DELETED_VALUE.DELETED}>삭제됨만</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
