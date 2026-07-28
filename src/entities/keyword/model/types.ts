/**
 * 검색 키워드 도메인.
 * GET /admin/keyword → { [KeywordType]: { active: string[], inactive: string[] } }
 * POST /admin/keyword → { keywords: { [KeywordType]: string[] } }
 *
 * POST 로 보낸 목록이 그 타입의 "최종 활성 상태"가 된다:
 * 목록에서 빠진 기존 키워드는 soft delete, 새로 들어온 키워드는 저장/복원된다.
 */

export const KeywordType = {
  GENRE: "GENRE",
  ELSE: "ELSE",
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

/** GENRE 타입은 서버가 허용하는 값만 받는다 */
export const ALLOWED_GENRE_KEYWORDS = [
  "연극",
  "뮤지컬",
  "아동가족극",
  "실험창작극",
  "학교공연",
] as const;
