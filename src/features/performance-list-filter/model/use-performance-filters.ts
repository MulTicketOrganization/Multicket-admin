"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  Area,
  GENRES,
  type Genre,
  type PerformanceListFilters,
} from "@/entities/performance";

const KEY_TITLE = "title";
const KEY_GENRE = "genre";
const KEY_AREA = "area";
const KEY_DELETED = "deleted";

export const ALL_SENTINEL = "_all_";

/** deleted Select 의 옵션 값 (3-way). */
export const DELETED_VALUE = {
  ALL: "all",
  ACTIVE: "active",
  DELETED: "deleted",
} as const;
export type DeletedValue = (typeof DELETED_VALUE)[keyof typeof DELETED_VALUE];

function isGenre(v: string | null): v is Genre {
  return v != null && (GENRES as readonly string[]).includes(v);
}

function isArea(v: string | null): v is Area {
  return v != null && (Object.values(Area) as string[]).includes(v);
}

function parseDeletedParam(raw: string | null): boolean | undefined {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

function deletedToParam(v: boolean | undefined): string | null {
  if (v === true) return "true";
  if (v === false) return "false";
  return null;
}

function deletedToSelect(v: boolean | undefined): DeletedValue {
  if (v === true) return DELETED_VALUE.DELETED;
  if (v === false) return DELETED_VALUE.ACTIVE;
  return DELETED_VALUE.ALL;
}

function selectToDeleted(v: DeletedValue): boolean | undefined {
  if (v === DELETED_VALUE.DELETED) return true;
  if (v === DELETED_VALUE.ACTIVE) return false;
  return undefined;
}

interface Patch {
  title?: string | null;
  genre?: Genre | null;
  area?: Area | null;
  deleted?: boolean | undefined;
}

export function usePerformanceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const title = searchParams.get(KEY_TITLE) ?? "";
  const genreRaw = searchParams.get(KEY_GENRE);
  const areaRaw = searchParams.get(KEY_AREA);
  const deletedRaw = searchParams.get(KEY_DELETED);

  const genre = isGenre(genreRaw) ? genreRaw : null;
  const area = isArea(areaRaw) ? areaRaw : null;
  const deleted = parseDeletedParam(deletedRaw);

  const filters = useMemo<PerformanceListFilters>(
    () => ({
      title: title || undefined,
      genre: genre ?? undefined,
      area: area ?? undefined,
      deleted,
    }),
    [title, genre, area, deleted],
  );

  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());

      if (patch.title !== undefined) {
        if (patch.title) next.set(KEY_TITLE, patch.title);
        else next.delete(KEY_TITLE);
      }
      if (patch.genre !== undefined) {
        if (patch.genre) next.set(KEY_GENRE, patch.genre);
        else next.delete(KEY_GENRE);
      }
      if (patch.area !== undefined) {
        if (patch.area) next.set(KEY_AREA, patch.area);
        else next.delete(KEY_AREA);
      }
      if (patch.deleted !== undefined || "deleted" in patch) {
        const v = deletedToParam(patch.deleted);
        if (v == null) next.delete(KEY_DELETED);
        else next.set(KEY_DELETED, v);
      }

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return {
    filters,
    title,
    genre,
    area,
    deleted,
    deletedSelect: deletedToSelect(deleted),
    selectToDeleted,
    update,
  };
}
