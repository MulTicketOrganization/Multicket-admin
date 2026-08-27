/**
 * 검색 키워드 도메인.
 * GET /admin/keyword → { [KeywordType]: { active: string[], inactive: string[] } }
 * POST /admin/keyword → { keywords: { [KeywordType]: string[] } }
 *
 * POST 로 보낸 목록이 그 타입의 "최종 활성 상태"가 된다:
 * 목록에서 빠진 기존 키워드는 soft delete, 새로 들어온 키워드는 저장/복원된다.
 *
 * 모든 타입이 허용값 화이트리스트를 가진다 — 대소문자·앞뒤 공백까지 정확히 일치해야 하고,
 * 하나라도 어긋나면 요청 전체가 400 으로 거부된다.
 */

export const KeywordType = {
  GENRE: "GENRE",
  ISDAEHAKRO: "ISDAEHAKRO",
  OVERSEA: "OVERSEA",
  FREE: "FREE",
} as const;
export type KeywordType = (typeof KeywordType)[keyof typeof KeywordType];

export interface KeywordBucket {
  active: string[];
  inactive: string[];
}

/** GET /admin/keyword 응답 — 타입 키가 늘어날 수 있어 Partial 로 둔다 */
export type KeywordMap = Partial<Record<KeywordType, KeywordBucket>>;

/** POST /admin/keyword body */
export interface KeywordUpdateRequest {
  keywords: Partial<Record<KeywordType, string[]>>;
}

/** 타입별 허용값 — 이 목록 밖의 값을 보내면 백엔드가 요청 전체를 거부한다 */
export const ALLOWED_KEYWORDS = {
  [KeywordType.GENRE]: [
    "PLAY",
    "MUSICAL",
    "CHILDREN_FAMILY",
    "EXPERIMENTAL",
    "SCHOOL",
    "FESTIVAL",
  ],
  [KeywordType.ISDAEHAKRO]: ["DAEHAKRO"],
  [KeywordType.OVERSEA]: ["US", "GB", "EU", "ETC"],
  [KeywordType.FREE]: ["무료"],
} as const satisfies Record<KeywordType, readonly string[]>;

export function isAllowedKeyword(type: KeywordType, value: string): boolean {
  return (ALLOWED_KEYWORDS[type] as readonly string[]).includes(value);
}

/**
 * 응답 정규화.
 * 관리자 API 는 `{ active, inactive }` 를 주지만 공개 `/keyword` 는 평평한 배열을 준다.
 * 백엔드 스웨거에 응답 스키마가 비어 있어 계약을 못 믿으므로 양쪽을 모두 받아 준다.
 */
export function normalizeKeywordMap(raw: unknown): KeywordMap {
  if (raw == null || typeof raw !== "object") return {};
  const out: KeywordMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      out[key as KeywordType] = { active: value.map(String), inactive: [] };
    } else if (value && typeof value === "object") {
      const bucket = value as { active?: unknown; inactive?: unknown };
      out[key as KeywordType] = {
        active: Array.isArray(bucket.active) ? bucket.active.map(String) : [],
        inactive: Array.isArray(bucket.inactive) ? bucket.inactive.map(String) : [],
      };
    }
  }
  return out;
}
