"use client";

import { useQuery } from "@tanstack/react-query";

import { getMonthlyRevenue } from "../api";

export const REVENUE_QUERY_KEYS = {
  all: () => ["admin", "revenue"] as const,
  monthly: (year: number, month: number) =>
    ["admin", "revenue", "monthly", year, month] as const,
};

export function useMonthlyRevenue(year: number, month: number) {
  return useQuery({
    queryKey: REVENUE_QUERY_KEYS.monthly(year, month),
    queryFn: () => getMonthlyRevenue(year, month),
  });
}
