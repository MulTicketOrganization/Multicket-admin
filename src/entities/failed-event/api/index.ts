import { apiFetch, type PagedResponse } from "@/shared/api";
import type {
  FailedEventDetail,
  FailedEventListItem,
  FailedEventListQuery,
} from "../model/types";

/** GET /admin/failed-event/list — cursor 페이지네이션 */
export async function getFailedEvents(
  query: FailedEventListQuery,
): Promise<PagedResponse<FailedEventListItem>> {
  return apiFetch<PagedResponse<FailedEventListItem>>("/admin/failed-event/list", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      status: query.status,
      eventType: query.eventType,
    },
  });
}

/** GET /admin/failed-event/{id} */
export async function getFailedEventDetail(id: number): Promise<FailedEventDetail> {
  return apiFetch<FailedEventDetail>(`/admin/failed-event/${id}`, { method: "GET" });
}

/**
 * PATCH /admin/failed-event/{id}/retry
 * 저장된 payload 로 원래 컨슈머 처리를 다시 수행한다.
 * 재실행 가능한 4개 타입 외에는 백엔드가 400 으로 거부한다.
 */
export async function retryFailedEvent(id: number): Promise<void> {
  await apiFetch<void>(`/admin/failed-event/${id}/retry`, { method: "PATCH" });
}

/**
 * PATCH /admin/failed-event/{id}/complete
 * 재실행 없이 "확인함" 으로만 종료한다. 이후에는 되돌릴 수 없다.
 */
export async function completeFailedEvent(id: number): Promise<void> {
  await apiFetch<void>(`/admin/failed-event/${id}/complete`, { method: "PATCH" });
}
