/**
 * 회원 도메인 enum / 타입.
 * 출처: ADMIN_BACKEND.md §2.4 ~ §2.7, §3 Enum.
 * 모든 enum 은 `as const` 객체 + union type 패턴으로 정의 (tree-shake 친화적).
 */

export const MemberType = {
  AUDIENCE: "AUDIENCE",
  CREATOR: "CREATOR",
  MASTER: "MASTER",
} as const;
export type MemberType = (typeof MemberType)[keyof typeof MemberType];

export const MemberStatus = {
  PENDING: "PENDING",
  COMPLETE: "COMPLETE",
  FROZEN: "FROZEN",
} as const;
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  NONE: "NONE",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const LoginType = {
  LOCAL: "LOCAL",
  GOOGLE: "GOOGLE",
  KAKAO: "KAKAO",
  NAVER: "NAVER",
} as const;
export type LoginType = (typeof LoginType)[keyof typeof LoginType];

/** GET /admin/member/list 응답 항목 */
export interface MemberListItem {
  id: number;
  nickName: string;
  email: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  loginType: LoginType;
  deleted: boolean;
  createDate: string;
  lastLoginAt: string | null;
}

/** GET /admin/member/detail 응답 */
export interface MemberDetail {
  id: number;
  nickName: string;
  email: string;
  profileUrl: string | null;
  gender: Gender | null;
  loginType: LoginType;
  memberType: MemberType;
  memberStatus: MemberStatus;
  year: number | null;
  month: number | null;
  day: number | null;
  deleted: boolean;
  lastLoginAt: string | null;
  createDate: string;
  updateDate: string;
}

/** GET /admin/member/list 쿼리 파라미터 */
export interface MemberListQuery {
  cursorId: number;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  keyword?: string;
}

/** POST /admin/member/change body */
export interface MemberChangeRequest {
  memberId: number;
  memberStatus: MemberStatus;
}
