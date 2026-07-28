/**
 * 공고(Notice) 도메인.
 * 등록은 POST /admin/notice, 조회는 공용 GET /notice 를 쓴다 —
 * admin 쪽에 공고 조회 endpoint 가 없기 때문.
 */

export const NoticeType = {
  CANCEL_REFUND_FREE: "CANCEL_REFUND_FREE",
  CANCEL_REFUND_PAID: "CANCEL_REFUND_PAID",
  SETTLEMENT_GUIDE: "SETTLEMENT_GUIDE",
} as const;
export type NoticeType = (typeof NoticeType)[keyof typeof NoticeType];

/** GET /notice 응답 */
export interface Notice {
  id: number;
  type: NoticeType;
  content: string;
  createDate: string;
}

/** POST /admin/notice body */
export interface NoticeCreateRequest {
  type: NoticeType;
  content: string;
}
