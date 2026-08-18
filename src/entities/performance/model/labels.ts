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

/**
 * 공연 진행 상태.
 *
 * 백엔드에 상태 필드가 없어 공연 기간(startDate ~ endDate)으로 계산한다.
 * 기획서의 "판매 상태(판매예정/판매중/판매종료)" 와는 다른 개념이다 —
 * 판매 상태는 백엔드에 데이터 자체가 없어 표현할 수 없다.
 */
export const RunState = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  ENDED: "ENDED",
} as const;
export type RunState = (typeof RunState)[keyof typeof RunState];

export const runStateLabel: Record<RunState, string> = {
  [RunState.UPCOMING]: "공연 예정",
  [RunState.ONGOING]: "공연중",
  [RunState.ENDED]: "공연 종료",
};

export const runStateVariant = {
  [RunState.UPCOMING]: "outline",
  [RunState.ONGOING]: "success",
  [RunState.ENDED]: "muted",
} as const satisfies Record<RunState, string>;

/** 날짜만 비교하도록 자정으로 내린다 (종료일 당일은 아직 "공연중") */
function atMidnight(value: string | null | undefined): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function performanceRunState(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  now: Date = new Date(),
): RunState | null {
  const start = atMidnight(startDate);
  const end = atMidnight(endDate);
  if (start == null && end == null) return null;

  const today = atMidnight(now.toISOString())!;
  if (start != null && today < start) return RunState.UPCOMING;
  if (end != null && today > end) return RunState.ENDED;
  return RunState.ONGOING;
}
