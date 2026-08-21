import { apiFetch } from "@/shared/api";
import type { KeywordMap, KeywordUpdateRequest } from "../model/types";

/** GET /admin/keyword — 타입별 활성/비활성 키워드 */
export async function getKeywords(): Promise<KeywordMap> {
  return apiFetch<KeywordMap>("/admin/keyword", { method: "GET" });
}

/** POST /admin/keyword — 전달한 목록이 해당 타입의 최종 활성 상태가 된다 */
export async function updateKeywords(body: KeywordUpdateRequest): Promise<void> {
  await apiFetch<void>("/admin/keyword", { method: "POST", body });
}
