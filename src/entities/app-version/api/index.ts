import { apiFetch } from "@/shared/api";
import type {
  AppPlatform,
  AppVersion,
  AppVersionCreateRequest,
  AppVersionUpdateRequest,
} from "../model/types";

/**
 * GET /admin/app-version — 적용일자 최신순 이력.
 *
 * ⚠️ 스웨거는 응답을 단건 `AppVersionResponse` 로 표기했지만 설명은 "이력을
 * 최신순으로 조회" 다. 실제로는 배열이 오므로 양쪽을 모두 받아 배열로 정규화한다.
 * (BACKEND_REQUESTS.md — 스키마 정정 요청)
 */
export async function getAppVersions(platform?: AppPlatform): Promise<AppVersion[]> {
  const res = await apiFetch<AppVersion[] | AppVersion | null>("/admin/app-version", {
    method: "GET",
    query: { platform },
  });
  if (!res) return [];
  return Array.isArray(res) ? res : [res];
}

/** POST /admin/app-version — append-only 등록 */
export async function createAppVersion(body: AppVersionCreateRequest): Promise<void> {
  await apiFetch<void>("/admin/app-version", { method: "POST", body });
}

/** PATCH /admin/app-version/{id} — 업데이트 내역만 수정 가능 */
export async function updateAppVersionNote(
  id: number,
  body: AppVersionUpdateRequest,
): Promise<void> {
  await apiFetch<void>(`/admin/app-version/${id}`, { method: "PATCH", body });
}
