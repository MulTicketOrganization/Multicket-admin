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

/**
 * 백엔드 LocalDateTime → `<input type="datetime-local">` 의 value.
 * 백엔드는 타임존 없는 로컬 시각을 주므로 Date 로 파싱하지 않고 문자열을 자른다
 * (Date 를 거치면 UTC 로 해석돼 9시간 틀어지는 브라우저가 있다).
 */
export function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]}T${m[2]}` : "";
}

/**
 * `<input type="datetime-local">` 의 value → 백엔드 LocalDateTime.
 * datetime-local 은 초가 없어 `:00` 을 붙인다. 빈 값이면 undefined.
 */
export function toLocalDateTimeParam(value: string): string | undefined {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}
