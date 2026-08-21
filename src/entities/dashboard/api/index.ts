import { apiFetch } from "@/shared/api";
import type { DashboardSummary } from "../model/types";

/** GET /admin/dashboard */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/admin/dashboard", { method: "GET" });
}
