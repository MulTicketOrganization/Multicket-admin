import { apiFetch } from "@/shared/api";
import type { Notice, NoticeCreateRequest, NoticeType } from "../model/types";

/**
 * POST /admin/notice — 공고 등록.
 * 저장할 때마다 이력이 쌓이며 기존 공고는 수정되지 않는다 (append-only).
 */
export async function createNotice(body: NoticeCreateRequest): Promise<void> {
  await apiFetch<void>("/admin/notice", { method: "POST", body });
}

/**
 * GET /notice?type=... — 해당 타입의 최신 공고.
 * admin 전용 조회 API 가 없어 공용 endpoint 를 사용한다.
 * SETTLEMENT_GUIDE 는 CREATOR 이상 권한이 필요한데 MASTER 는 통과한다.
 *
 * CANCEL_REFUND_* 는 `type` 쿼리로 직접 조회되지 않고 `performanceId` 로만
 * 분기되므로, 아직 등록된 공고가 없으면 null 이 돌아올 수 있다.
 */
export async function getLatestNotice(type: NoticeType): Promise<Notice | null> {
  // 등록된 공고가 없으면 백엔드가 data:null 을 주는데, apiFetch 는 그때 undefined 를
  // 돌려준다. react-query 는 undefined 를 거부하므로 null 로 좁혀서 넘긴다.
  return (await apiFetch<Notice | null>("/notice", { method: "GET", query: { type } })) ?? null;
}

/**
 * GET /notice/urgent — 앱이 폴링으로 가져가는 공고 (APP_UPDATE / URGENT).
 * 만료(expireDate)가 지나지 않은 건만 내려온다. 없으면 null.
 */
export async function getUrgentNotice(): Promise<Notice | null> {
  return (await apiFetch<Notice | null>("/notice/urgent", { method: "GET" })) ?? null;
}
