/**
 * 백엔드 LocalDateTime ISO 문자열 (예: "2026-05-19T13:00:00") 을 한국어 표시 포맷으로 변환.
 * 유효하지 않은 입력은 "-" 반환.
 */
export function formatDateTime(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", opts).format(d);
}

/** 시간 제외, 날짜만 (yyyy.MM.dd) */
export function formatDate(iso: string | null | undefined): string {
  return formatDateTime(iso, { year: "numeric", month: "2-digit", day: "2-digit" });
}

/**
 * 가격 → ko-KR 천 단위 콤마 + 원.
 * null/undefined → "-"
 */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}

/** 단위 없는 천 단위 콤마. 표의 금액 열처럼 단위를 헤더에 둘 때 사용. */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "-";
  return value.toLocaleString("ko-KR");
}

/** yyyy-MM-dd — 백엔드 date 쿼리 파라미터 포맷 */
export function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
