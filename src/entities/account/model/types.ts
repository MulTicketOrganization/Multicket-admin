import type { Gender, LoginType, MemberStatus, MemberType } from "@/entities/member";

/** GET /api/member/me 응답 (로그인한 관리자 본인 정보) */
export interface AccountProfile {
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
  genres: string[] | null;
  area: string | null;
}
