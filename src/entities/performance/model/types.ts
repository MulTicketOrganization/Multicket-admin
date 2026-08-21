/**
 * 공연 도메인 enum / 타입.
 * 출처: https://multicket.duckdns.org/v3/api-docs (Admin 태그)
 */

import type { MemberStatus, MemberType } from "@/entities/member";

/** 공연 상세 응답의 `area` — 시/도 단위 */
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

/**
 * 목록 조회 필터의 `region` — 시/도가 아니라 통합 "권역" 단위.
 * 상세 응답의 Area 와 값 체계가 다르므로 절대 섞어 쓰지 말 것.
 */
export const REGIONS = [
  "수도권",
  "충청권",
  "영남권",
  "호남권",
  "강원",
  "제주",
  "대학로",
  "기타",
] as const;
export type Region = (typeof REGIONS)[number];

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

export const DiscountType = {
  PERCENT: "PERCENT",
  FIXED: "FIXED",
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

/** GET /admin/performance/list 쿼리 파라미터 */
export interface PerformanceListQuery {
  cursorId: number;
  genre?: Genre;
  region?: Region;
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
  /** 장르는 배열 (단수 `genre` 아님) */
  genres: string[] | null;
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
  amountLeft: number | null;
  purchaseDisabled: boolean | null;
}

export interface TicketInfo {
  id: number;
  ticketType: TicketType;
  price: number;
}

export interface Discount {
  id: number;
  discountType: DiscountType;
  /** 백엔드가 문자열로 내려준다 (PERCENT 면 "10", FIXED 면 "3000") */
  discountValue: string;
}

/** GET /admin/performance/detail 응답 (공연 + 티켓 + 작성자) */
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
  genres: string[] | null;
  isOpenRun: boolean | null;
  isDaeHakRo: boolean | null;
  ticketLink: string | null;
  /** 예매 마감 시간 (시간 단위) */
  limitTime: number | null;
  deleted: boolean;
  syncedAt: string | null;
  createDate: string;
  updateDate: string;
  crewInfos: CrewInfo[] | null;
  // 티켓
  amount: number | null;
  amountLeft: number | null;
  ticketDates: TicketDate[] | null;
  ticketInfos: TicketInfo[] | null;
  discounts: Discount[] | null;
  // 작성자
  memberId: number | null;
  memberNickname: string | null;
  memberEmail: string | null;
  memberType: MemberType | null;
  memberStatus: MemberStatus | null;
}

/* ------------------------------------------------------------------ *
 * 공연 통계 (GET /admin/performance/{performanceId}/statistics)
 * 공연 상세와는 별개의 API — 상세 화면에서 필요할 때 추가 호출한다.
 * ------------------------------------------------------------------ */

export const SessionSaleStatus = {
  UPCOMING: "UPCOMING",
  ON_SALE: "ON_SALE",
  CLOSED: "CLOSED",
} as const;
export type SessionSaleStatus =
  (typeof SessionSaleStatus)[keyof typeof SessionSaleStatus];

/** 회차별 예매 현황 */
export interface SessionStatistics {
  ticketDateId: number;
  enableDate: string;
  capacity: number;
  /** 현재 SUCCESS 처리된 주문의 매수 총합 */
  totalSoldSeats: number;
  /** PENDING(결제 대기 포함) + SUCCESS 매수 총합 */
  currentReservationSeats: number;
  /** 정원 - 현재 예매 인원 */
  remainingSeats: number;
  reservationCount: number;
  cancelCount: number;
  /** SUCCESS/CANCEL 주문의 paidAmount 합계 — 취소분은 환불된 만큼 이미 빠져 있다 */
  revenue: number;
  occupancyRate: number;
  saleStatus: SessionSaleStatus;
}

export interface PerformanceStatistics {
  performanceId: number;
  performanceTitle: string;
  totalReservationCount: number;
  totalCancelCount: number;
  /** 총 취소 수 / (총 예매 수 + 총 취소 수) * 100 */
  cancelRate: number;
  totalRevenue: number;
  sessions: SessionStatistics[];
}
