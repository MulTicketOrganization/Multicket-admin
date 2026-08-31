/**
 * 약관 본문(ConsentDocument) 도메인.
 * 출처: /admin/consent-document** (관리자), GET /consent-document (앱 온보딩/마이페이지)
 *
 * 등록과 수정을 구분하지 않는 단일 API 다 — 같은 타입에 현재 버전이 있으면
 * 그 버전을 폐기(deleted=true)하고 새 버전(직전 + 0.1, 최초는 1.0)으로 교체한다.
 * **그 타입에 동의했던 회원 전원의 동의가 자동으로 해제된다** (재동의 필요).
 */

export const ConsentType = {
  SERVICE_TERMS: "SERVICE_TERMS",
  PRIVACY_POLICY: "PRIVACY_POLICY",
  AGE_OVER_14: "AGE_OVER_14",
  MARKETING: "MARKETING",
} as const;
export type ConsentType = (typeof ConsentType)[keyof typeof ConsentType];

/** 가입 시 반드시 받아야 하는 약관 — MARKETING 만 선택이다 */
export const REQUIRED_CONSENT_TYPES: readonly ConsentType[] = [
  ConsentType.SERVICE_TERMS,
  ConsentType.PRIVACY_POLICY,
  ConsentType.AGE_OVER_14,
];

export function isRequiredConsent(type: ConsentType): boolean {
  return REQUIRED_CONSENT_TYPES.includes(type);
}

/** GET /admin/consent-document 목록 항목 · GET /admin/consent-document/{id} 응답 */
export interface ConsentDocument {
  id: number;
  type: ConsentType;
  content: string;
  /** 같은 타입에서 등록될 때마다 서버가 직전 + 0.1 로 계산한다 */
  version: number;
  /** true 면 더 이상 현재 버전이 아니다 (감사 목적으로 조회만 가능) */
  deleted: boolean;
}

/** POST /admin/consent-document body */
export interface ConsentDocumentCreateRequest {
  type: ConsentType;
  content: string;
}

/** GET /admin/consent-document 쿼리 파라미터 */
export interface ConsentDocumentListQuery {
  cursorId: number;
}

/**
 * 타입 → 문서 맵.
 * `GET /consent-document` 는 타입당 현재 버전 한 건씩만 주므로 그대로 뒤집으면 된다.
 * 관리자 이력 목록에서 현재 버전을 골라내면 안 된다 — 커서 페이지네이션이라
 * 아직 안 불러온 페이지에 최신 버전이 있을 수 있다.
 */
export function byConsentType(
  documents: readonly ConsentDocument[],
): Partial<Record<ConsentType, ConsentDocument>> {
  const map: Partial<Record<ConsentType, ConsentDocument>> = {};
  for (const d of documents) {
    const prev = map[d.type];
    if (!prev || d.version > prev.version) map[d.type] = d;
  }
  return map;
}

/** 버전 표기 — 서버가 0.1 단위로 올리므로 소수 한 자리로 고정한다 */
export function formatConsentVersion(version: number | null | undefined): string {
  if (version == null || Number.isNaN(version)) return "-";
  return `v${version.toFixed(1)}`;
}

/**
 * 회원의 약관 동의 상태 (`GET /api/member/consent`, `GET /api/member/me` 의 `consents`).
 * 타입당 최대 1건이며, 관리자가 문서를 교체하면 `documentId` 가 최신 문서로 갱신되고
 * `agreed` 가 false 로 초기화된다.
 */
export interface ConsentHistoryItem {
  type: ConsentType;
  agreed: boolean;
  documentId: number | null;
  documentVersion: number | null;
  /**
   * 마지막으로 실제 동의한 시각.
   * 한 번도 동의한 적 없으면 null — agreed 가 false 여도 과거 이력이 있으면 값이 있다.
   */
  agreedAt: string | null;
}

export const CONSENT_CONTENT_MIN_LENGTH = 10;

export function validateConsentDraft(draft: { content: string }): string | null {
  const trimmed = draft.content.trim();
  if (!trimmed) return "약관 본문을 입력하세요.";
  if (trimmed.length < CONSENT_CONTENT_MIN_LENGTH) {
    return `약관 본문이 너무 짧습니다 (${CONSENT_CONTENT_MIN_LENGTH}자 이상).`;
  }
  return null;
}
