import type { Gender, LoginType, MemberStatus, MemberType } from "@/entities/member";
import type { ConsentHistoryItem } from "@/entities/consent-document";
import type { Region } from "@/entities/region";

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
  /** 선호 지역 — 공연 상세의 `area` 와 값 체계가 다르다 (광주·전남이 한 값) */
  region: Region | null;
  phoneNumber: string | null;
  /** 본인인증(개인) 완료 여부 */
  authCheck: boolean;
  /** 창작자 계좌·파트너 인증 완료 여부 — authCheck 와는 별개 플래그 */
  businessAuthCompleted: boolean;
  orderNotificationEnabled: boolean;
  emailNotificationEnabled: boolean;
  /** 약관 타입별 현재 동의 상태 — GET /api/member/me 에서만 채워진다 */
  consents: ConsentHistoryItem[];
}
