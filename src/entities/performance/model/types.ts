/**
 * 공연 도메인 enum / 타입.
 * 출처: https://multicket.duckdns.org/v3/api-docs (Admin 태그)
 */

import type { MemberStatus, MemberType } from "@/entities/member";
import type { Area, Region } from "@/entities/region";

/** GenreType — 예전에는 한글 문자열이었으나 enum 코드로 바뀌었다 */
export const Genre = {
  PLAY: "PLAY",
  MUSICAL: "MUSICAL",
  CHILDREN_FAMILY: "CHILDREN_FAMILY",
  EXPERIMENTAL: "EXPERIMENTAL",
  SCHOOL: "SCHOOL",
  FESTIVAL: "FESTIVAL",
} as const;
export type Genre = (typeof Genre)[keyof typeof Genre];

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
  genres: Genre[] | null;
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
  /** 할인명 (최대 50바이트) */
  discountName: string | null;
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
  genres: Genre[] | null;
  isOpenRun: boolean | null;
  isDaeHakRo: boolean | null;
  ticketLink: string | null;
  /** 예매 마감 시간 (분 단위) — 공연 시작 N분 전까지만 예매 가능. null 이면 제한 없음 */
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
