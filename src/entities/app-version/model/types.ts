/**
 * 앱 버전(AppVersion) 도메인.
 * 출처: /admin/app-version** (등록·이력), /app-version/current (앱이 보는 값)
 *
 * append-only — 등록한 이력은 삭제할 수 없고, 수정도 `updateNote` 하나만 가능하다.
 * 앱은 플랫폼별로 "적용일자가 가장 최근인" 한 건을 현재 버전으로 본다.
 */

export const AppPlatform = {
  IOS: "IOS",
  ANDROID: "ANDROID",
} as const;
export type AppPlatform = (typeof AppPlatform)[keyof typeof AppPlatform];

/** GET /admin/app-version 응답 항목 */
export interface AppVersion {
  id: number;
  platform: AppPlatform;
  version: string;
  /** 이 버전이 적용되는 날짜 — 최신 것이 "현재 버전" 이 된다 */
  appliedDate: string;
  updateNote: string | null;
  createDate: string;
}

/** POST /admin/app-version body */
export interface AppVersionCreateRequest {
  platform: AppPlatform;
  version: string;
  /** yyyy-MM-dd */
  appliedDate: string;
  updateNote?: string;
}

/** PATCH /admin/app-version/{id} body — 업데이트 내역만 고칠 수 있다 */
export interface AppVersionUpdateRequest {
  updateNote: string;
}

/** `1.2.3` 형태만 허용 (백엔드에 형식 검증이 없어 프론트에서 막는다) */
const SEMVER_PATTERN = /^\d+\.\d+(\.\d+)?$/;

export function isValidVersion(version: string): boolean {
  return SEMVER_PATTERN.test(version.trim());
}

/**
 * 플랫폼별 "현재 적용 중인 버전".
 * 백엔드가 적용일자 최신순으로 주지만, 정렬을 신뢰하지 않고 여기서 다시 고른다.
 * 미래 날짜로 예약 등록한 건은 아직 현재 버전이 아니다.
 */
export function currentVersionOf(
  versions: readonly AppVersion[],
  platform: AppPlatform,
  now: Date = new Date(),
): AppVersion | null {
  const applied = versions
    .filter((v) => v.platform === platform)
    .filter((v) => {
      const d = new Date(v.appliedDate);
      return !Number.isNaN(d.getTime()) && d.getTime() <= now.getTime();
    })
    .sort(
      (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime(),
    );
  return applied[0] ?? null;
}

/** 적용일자가 미래인 예약 등록분 */
export function isScheduled(version: AppVersion, now: Date = new Date()): boolean {
  const d = new Date(version.appliedDate);
  return !Number.isNaN(d.getTime()) && d.getTime() > now.getTime();
}
