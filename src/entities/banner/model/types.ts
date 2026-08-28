/**
 * 홈 배너(Banner) 도메인.
 * 출처: /admin/banner** (관리자 CRUD), GET /banner (앱 홈 하단 캐러셀)
 *
 * 앱은 현재 시각이 노출 기간에 걸리는 배너만 받아 캐러셀로 돌린다.
 * 관리자 목록은 기간과 무관하게 전부 내려온다 (커서 없이 전체).
 */

export interface Banner {
  id: number;
  imageUrl: string;
  /** 클릭 시 이동할 링크 — 없으면 클릭해도 아무 일이 없다 */
  linkUrl: string | null;
  exposureStartDate: string;
  exposureEndDate: string;
}

/** POST /admin/banner · PATCH /admin/banner/{id} body (동일 스키마, 수정은 전량 교체) */
export interface BannerWriteRequest {
  imageUrl: string;
  linkUrl?: string;
  /** ISO LocalDateTime */
  exposureStartDate: string;
  exposureEndDate: string;
}

/** 노출 기간 기준 상태 — 백엔드에 상태 필드가 없어 시각으로 계산한다 */
export const BannerExposure = {
  UPCOMING: "UPCOMING",
  ON_AIR: "ON_AIR",
  ENDED: "ENDED",
} as const;
export type BannerExposure = (typeof BannerExposure)[keyof typeof BannerExposure];

export function bannerExposure(banner: Banner, now: Date = new Date()): BannerExposure {
  const start = new Date(banner.exposureStartDate).getTime();
  const end = new Date(banner.exposureEndDate).getTime();
  const t = now.getTime();
  if (Number.isFinite(start) && t < start) return BannerExposure.UPCOMING;
  if (Number.isFinite(end) && t > end) return BannerExposure.ENDED;
  return BannerExposure.ON_AIR;
}

/** 앱이 지금 실제로 받아가는 배너 — GET /banner 를 흉내 낸 로컬 필터 */
export function onAirBanners(banners: readonly Banner[], now: Date = new Date()): Banner[] {
  return banners.filter((b) => bannerExposure(b, now) === BannerExposure.ON_AIR);
}

/** 이미지 URL 은 CDN 절대 경로만 받는다 (상대 경로를 넣으면 앱에서 깨진다) */
export function isValidImageUrl(url: string): boolean {
  return /^https?:\/\/\S+$/.test(url.trim());
}

/**
 * 폼 입력 검증. 백엔드가 400 을 내기 전에 버튼을 잠그는 용도.
 * 백엔드에는 기간 역전 검증이 없어 프론트에서 막는다.
 */
export function validateBannerDraft(draft: {
  imageUrl: string;
  linkUrl: string;
  exposureStartDate: string;
  exposureEndDate: string;
}): string | null {
  if (!draft.imageUrl.trim()) return "이미지 URL 을 입력하세요.";
  if (!isValidImageUrl(draft.imageUrl)) return "이미지 URL 은 http(s) 절대 경로여야 합니다.";
  if (draft.linkUrl.trim() && !isValidImageUrl(draft.linkUrl)) {
    return "링크 URL 은 http(s) 절대 경로여야 합니다.";
  }
  if (!draft.exposureStartDate) return "노출 시작 일시를 입력하세요.";
  if (!draft.exposureEndDate) return "노출 종료 일시를 입력하세요.";
  if (
    new Date(draft.exposureStartDate).getTime() >=
    new Date(draft.exposureEndDate).getTime()
  ) {
    return "노출 종료 일시는 시작 일시보다 뒤여야 합니다.";
  }
  return null;
}
