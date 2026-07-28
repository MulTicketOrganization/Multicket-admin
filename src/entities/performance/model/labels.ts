import { CastStaff, DiscountType, TicketType } from "./types";

export const castStaffLabel: Record<CastStaff, string> = {
  [CastStaff.CAST]: "출연진",
  [CastStaff.STAFF]: "스태프",
};

export const ticketTypeLabel: Record<TicketType, string> = {
  [TicketType.NORMAL]: "일반",
  [TicketType.PREMIUM]: "프리미엄",
  [TicketType.KID]: "어린이",
  [TicketType.ADULT]: "성인",
  [TicketType.SENIOR]: "경로",
};

export const discountTypeLabel: Record<DiscountType, string> = {
  [DiscountType.PERCENT]: "정률",
  [DiscountType.FIXED]: "정액",
};

/** 할인 값을 타입에 맞춰 표기 ("10%" / "3,000원") */
export function formatDiscountValue(type: DiscountType, value: string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return type === DiscountType.PERCENT ? `${n}%` : `${n.toLocaleString("ko-KR")}원`;
}
