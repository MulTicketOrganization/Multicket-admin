import { apiFetch, type PagedResponse } from "@/shared/api";
import type {
  NoticeDetail,
  NoticeListItem,
  NoticeListQuery,
  NoticeType,
  NoticeWriteRequest,
  PublicNotice,
} from "../model/types";

/* ------------------------------------------------------------------ *
 * 관리자 CRUD (/admin/notice**)
 * ------------------------------------------------------------------ */

/** GET /admin/notice — cursor 페이지네이션. 작성자(id/email) 포함. */
export async function getNotices(
  query: NoticeListQuery,
): Promise<PagedResponse<NoticeListItem>> {
  return apiFetch<PagedResponse<NoticeListItem>>("/admin/notice", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      type: query.type,
      expireDate: query.expireDate,
    },
  });
}

/** GET /admin/notice/{id} */
export async function getNoticeDetail(id: number): Promise<NoticeDetail> {
  return apiFetch<NoticeDetail>(`/admin/notice/${id}`, { method: "GET" });
}

/** POST /admin/notice — 등록. 등록한 관리자가 작성자로 저장된다. */
export async function createNotice(body: NoticeWriteRequest): Promise<void> {
  await apiFetch<void>("/admin/notice", { method: "POST", body });
}

/** PATCH /admin/notice/{id} — 기존 행을 그대로 수정 (이력을 새로 쌓지 않는다) */
export async function updateNotice(
  id: number,
  body: NoticeWriteRequest,
): Promise<void> {
  await apiFetch<void>(`/admin/notice/${id}`, { method: "PATCH", body });
}

/** DELETE /admin/notice/{id} — **하드 삭제**. 복구 불가. */
export async function deleteNotice(id: number): Promise<void> {
  await apiFetch<void>(`/admin/notice/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ *
 * 사용자에게 실제로 나가는 것 확인용 (공용 endpoint)
 * ------------------------------------------------------------------ */

/**
 * GET /notice?type=... — 해당 타입의 최신 공고.
 * CANCEL_REFUND_* 는 `performanceId` 로만 분기되므로 type 조회로는 비어 올 수 있다.
 */
export async function getLatestNotice(type: NoticeType): Promise<PublicNotice | null> {
  return (
    (await apiFetch<PublicNotice | null>("/notice", { method: "GET", query: { type } })) ??
    null
  );
}

/**
 * GET /notice/urgent — 앱이 폴링으로 가져가는 공고들.
 *
 * 만료되지 않았고 **요청자 플랫폼이 targetPlatforms 에 포함된** 건만 온다.
 * 어드민은 브라우저(WEB)로 호출하므로 iOS/Android 전용 공고는 여기 안 잡힌다 —
 * "지금 앱에 뭐가 떠 있는지" 의 근사치일 뿐이라는 점에 주의.
 */
export async function getUrgentNotices(): Promise<PublicNotice[]> {
  return (await apiFetch<PublicNotice[] | null>("/notice/urgent", { method: "GET" })) ?? [];
}
