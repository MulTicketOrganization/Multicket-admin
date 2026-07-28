/**
 * 문의(Inquiry) 도메인.
 * 출처: /admin/inquiry/* (Admin 태그)
 */

import type { MemberEvent } from "@/entities/member";

export const InquiryType = {
  MEMBER_STATUS: "MEMBER_STATUS",
  PERFORMANCE_CHECK: "PERFORMANCE_CHECK",
  PERFORMANCE_DUPLICATE: "PERFORMANCE_DUPLICATE",
  GENERAL: "GENERAL",
} as const;
export type InquiryType = (typeof InquiryType)[keyof typeof InquiryType];

export const InquiryStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
} as const;
export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

/** 문의에 적용할 처리 이벤트 */
export const InquiryEvent = {
  COMPLETE: "COMPLETE",
  REJECT: "REJECT",
} as const;
export type InquiryEvent = (typeof InquiryEvent)[keyof typeof InquiryEvent];

/** GET /admin/inquiry/list 응답 항목 */
export interface InquiryListItem {
  id: number;
  writerNickName: string;
  title: string;
  inquiryStatus: InquiryStatus;
  inquiryType: InquiryType;
  /** 연관 대상 ID (회원 ID 또는 공연 ID — 타입에 따라 다름) */
  inquiryRefId: number | null;
  createDate: string;
}

/** GET /admin/inquiry/{id} 응답 */
export interface InquiryDetail {
  id: number;
  writerId: number;
  writerNickName: string;
  writerEmail: string;
  title: string;
  description: string;
  inquiryStatus: InquiryStatus;
  inquiryType: InquiryType;
  inquiryRefId: number | null;
  createDate: string;
  updateDate: string;
  /**
   * 연관 객체.
   * MEMBER_STATUS → 회원 정보 / PERFORMANCE_* → 공연 정보 / GENERAL → null
   * 스키마가 타입별로 달라 백엔드가 free-form object 로 내려준다.
   */
  refDetail: Record<string, unknown> | null;
}

/** GET /admin/inquiry/list 쿼리 파라미터 */
export interface InquiryListQuery {
  cursorId: number;
  inquiryType?: InquiryType;
  inquiryStatus?: InquiryStatus;
  /** yyyy-MM-dd — 해당 날짜에 생성된 문의만 */
  createDate?: string;
}

/** PATCH /admin/inquiry/{id} body */
export interface InquiryUpdateRequest {
  event: InquiryEvent;
  /** MEMBER_STATUS 유형을 COMPLETE 로 처리할 때만 필수 */
  memberEvent?: MemberEvent;
}

/** 종료된 문의는 재처리 불가 (백엔드가 400 으로 거부) */
export function isInquiryClosed(status: InquiryStatus): boolean {
  return status !== InquiryStatus.PENDING;
}
