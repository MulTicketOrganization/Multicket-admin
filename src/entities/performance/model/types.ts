/**
 * 공연 도메인 enum / 타입.
 * 출처: ADMIN_BACKEND.md §2.1 ~ §2.3, §3 Enum, 부록 A.
 */

import type { LoginType, MemberStatus, MemberType } from "@/entities/member";

export const Area = {
  SEOUL: "서울특별시",
  INCHEON: "인천광역시",
  DAEJEON: "대전광역시",
  DAEGU: "대구광역시",
  GWANGJU: "광주광역시",
  BUSAN: "부산광역시",
  ULSAN: "울산광역시",
  SEJONG: "세종특별자치시",
  GYEONGGI: "경기도",
  CHUNGBUK: "충청북도",
  CHUNGNAM: "충청남도",
  GYEONGBUK: "경상북도",
  GYEONGNAM: "경상남도",
  JEONBUK: "전북특별자치도",
  JEONNAM: "전라남도",
  GANGWON: "강원특별자치도",
  JEJU: "제주특별자치도",
  DAEHAKRO: "대학로",
  ETC: "기타",
} as const;
export type Area = (typeof Area)[keyof typeof Area];

/** Genre 는 백엔드가 한글 문자열을 그대로 사용 */
export const GENRES = [
  "연극",
  "뮤지컬",
  "서양음악(클래식)",
  "한국음악(국악)",
  "대중음악",
  "무용(서양/한국무용)",
  "대중무용",
  "서커스/마술",
  "복합",
  "아동",
  "오픈런",
  "기타",
] as const;
export type Genre = (typeof GENRES)[number];

export const CastStaff = {
  CAST: "CAST",
  STAFF: "STAFF",
} as const;
export type CastStaff = (typeof CastStaff)[keyof typeof CastStaff];

export const TicketType = {
  NORMAL: "NORMAL",
  PREMIUM: "PREMIUM",
  KID: "KID",
  ADULT: "ADULT",
  SENIOR: "SENIOR",
} as const;
export type TicketType = (typeof TicketType)[keyof typeof TicketType];

/** 공연 목록 쿼리 파라미터 */
export interface PerformanceListQuery {
  cursorId: number;
  genre?: Genre;
  area?: Area;
  deleted?: boolean;
  memberId?: number;
  title?: string;
}

/** 공연 목록 항목 */
export interface PerformanceListItem {
  id: number;
  title: string;
  venueName: string;
  startDate: string;
  endDate: string;
  genre: Genre | null;
  deleted: boolean;
  memberId: number | null;
  memberNickname: string | null;
}

export interface CrewInfo {
  name: string;
  imgUrl: string | null;
  castStaff: CastStaff;
}

export interface TicketDate {
  id: number;
  enableDate: string;
}

export interface TicketInfo {
  id: number;
  ticketType: TicketType;
  price: number;
}

/** 공연 상세 응답 (공연 + 티켓 + 작성자) */
export interface PerformanceDetail {
  // 공연
  performanceId: number;
  kopisId: string | null;
  title: string;
  venueName: string;
  startDate: string;
  endDate: string;
  runTime: string | null;
  ageLimit: number | null;
  price: number | null;
  posterUrl: string | null;
  synopsis: string | null;
  area: Area | null;
  genre: Genre | null;
  isOpenRun: boolean | null;
  isDaeHakRo: boolean | null;
  ticketLink: string | null;
  deleted: boolean;
  syncedAt: string | null;
  createDate: string;
  updateDate: string;
  crewInfos: CrewInfo[] | null;
  // 티켓
  ticketAccountId: number | null;
  amount: number | null;
  amountLeft: number | null;
  ticketDates: TicketDate[] | null;
  ticketInfos: TicketInfo[] | null;
  // 작성자
  memberId: number | null;
  memberNickname: string | null;
  memberEmail: string | null;
  memberType: MemberType | null;
  memberStatus: MemberStatus | null;
  memberLoginType?: LoginType | null;
}
