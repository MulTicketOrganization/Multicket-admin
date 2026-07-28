"use client";

import { useQuery } from "@tanstack/react-query";

import { getJobInstances } from "../api";

export const BATCH_QUERY_KEYS = {
  all: () => ["admin", "batch"] as const,
  jobInstances: (onlyIncomplete: boolean) =>
    ["admin", "batch", "job-instances", onlyIncomplete] as const,
};

export function useJobInstances(onlyIncomplete: boolean) {
  return useQuery({
    queryKey: BATCH_QUERY_KEYS.jobInstances(onlyIncomplete),
    queryFn: () => getJobInstances(onlyIncomplete),
  });
}
