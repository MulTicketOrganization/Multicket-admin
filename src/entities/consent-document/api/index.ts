import { apiFetch, type PagedResponse } from "@/shared/api";
import type {
  ConsentDocument,
  ConsentDocumentCreateRequest,
  ConsentDocumentListQuery,
} from "../model/types";

/**
 * GET /admin/consent-document — 폐기된 과거 버전까지 포함한 전체 이력 (cursor).
 * 현재 유효한 버전만 필요하면 `getCurrentConsentDocuments()` 를 쓴다.
 */
export async function getConsentDocuments(
  query: ConsentDocumentListQuery,
): Promise<PagedResponse<ConsentDocument>> {
  return apiFetch<PagedResponse<ConsentDocument>>("/admin/consent-document", {
    method: "GET",
    query: { cursorId: query.cursorId },
  });
}

/** GET /admin/consent-document/{id} — 폐기된 버전도 감사 목적으로 조회 가능 */
export async function getConsentDocumentDetail(id: number): Promise<ConsentDocument> {
  return apiFetch<ConsentDocument>(`/admin/consent-document/${id}`, { method: "GET" });
}

/**
 * POST /admin/consent-document — 등록 = 현재 버전 교체.
 *
 * ⚠️ 같은 타입에 현재 버전이 있으면 폐기하고 새 버전으로 갈아끼우며,
 * 그 타입에 동의했던 회원 전원의 `agreed` 가 false 로 초기화된다.
 */
export async function createConsentDocument(
  body: ConsentDocumentCreateRequest,
): Promise<void> {
  await apiFetch<void>("/admin/consent-document", { method: "POST", body });
}

/**
 * GET /consent-document — 앱이 온보딩에서 실제로 받아가는 "타입별 현재 버전".
 * 관리자 화면에서는 "지금 사용자에게 나가는 문서" 확인용으로 쓴다.
 */
export async function getCurrentConsentDocuments(): Promise<ConsentDocument[]> {
  const res = await apiFetch<{ data: ConsentDocument[] } | null>("/consent-document", {
    method: "GET",
  });
  return res?.data ?? [];
}
