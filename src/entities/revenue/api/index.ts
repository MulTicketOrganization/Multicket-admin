import { apiFetch } from "@/shared/api";
import type { MonthlyCreatorRevenue } from "../model/types";

/** GET /admin/revenue/monthly — year/month 필수 */
export async function getMonthlyRevenue(
  year: number,
  month: number,
): Promise<MonthlyCreatorRevenue[]> {
  const res = await apiFetch<MonthlyCreatorRevenue[] | null>("/admin/revenue/monthly", {
    method: "GET",
    query: { year, month },
  });
  return res ?? [];
}
