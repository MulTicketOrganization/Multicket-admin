import { apiFetch } from "@/shared/api";

/**
 * DELETE /admin/performance/{id} — 공연 즉시 삭제.
 * 크리에이터의 삭제 "요청"(문의) 승인과는 별개로 조건 없이 삭제한다.
 */
export async function deletePerformance(id: number): Promise<void> {
  await apiFetch<void>(`/admin/performance/${id}`, { method: "DELETE" });
}
