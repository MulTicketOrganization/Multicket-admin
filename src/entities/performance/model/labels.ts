import { CastStaff, TicketType } from "./types";

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
