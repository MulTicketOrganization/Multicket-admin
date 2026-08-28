import { apiFetch } from "@/shared/api";
import type { Banner, BannerWriteRequest } from "../model/types";

/** 백엔드는 커서 없이 `{ data: Banner[] }` 로만 감싸 준다 */
interface BannerListResponse {
  data: Banner[];
}

/** GET /admin/banner — 노출 기간과 무관한 전체 목록 (displayOrder 오름차순) */
export async function getBanners(): Promise<Banner[]> {
  const res = await apiFetch<BannerListResponse | null>("/admin/banner", {
    method: "GET",
  });
  return res?.data ?? [];
}

/**
 * GET /admin/banner/{id}
 * 목록이 이미 모든 필드를 담고 있어 화면에서는 쓰지 않지만, 도메인 API 로는 열어 둔다.
 */
export async function getBannerDetail(id: number): Promise<Banner> {
  return apiFetch<Banner>(`/admin/banner/${id}`, { method: "GET" });
}

/** POST /admin/banner — 등록한 관리자가 작성자로 함께 저장된다 */
export async function createBanner(body: BannerWriteRequest): Promise<void> {
  await apiFetch<void>("/admin/banner", { method: "POST", body });
}

/** PATCH /admin/banner/{id} — 전량 교체 방식이라 모든 필수 필드를 다시 보낸다 */
export async function updateBanner(
  id: number,
  body: BannerWriteRequest,
): Promise<void> {
  await apiFetch<void>(`/admin/banner/${id}`, { method: "PATCH", body });
}

/** DELETE /admin/banner/{id} — **하드 삭제**. 복구 불가. */
export async function deleteBanner(id: number): Promise<void> {
  await apiFetch<void>(`/admin/banner/${id}`, { method: "DELETE" });
}
