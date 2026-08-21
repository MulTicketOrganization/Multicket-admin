"use client";

import { useQuery } from "@tanstack/react-query";

import { getAppVersions } from "../api";
import type { AppPlatform } from "./types";

export const APP_VERSION_QUERY_KEYS = {
  all: () => ["admin", "app-versions"] as const,
  list: (platform?: AppPlatform) => ["admin", "app-versions", platform ?? "ALL"] as const,
};

export function useAppVersions(platform?: AppPlatform) {
  return useQuery({
    queryKey: APP_VERSION_QUERY_KEYS.list(platform),
    queryFn: () => getAppVersions(platform),
  });
}
