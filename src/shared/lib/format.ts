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
