import {
  FileText,
  Inbox,
  LayoutDashboard,
  Server,
  ShieldAlert,
  Siren,
  Tags,
  Ticket,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** 쿼리스트링을 포함한 전체 링크 */
  href: string;
  label: string;
  icon: LucideIcon;
  /** /dashboard 처럼 정확히 일치해야 active 로 간주할 경로 */
  exact?: boolean;
  /**
   * 같은 pathname 을 공유하는 항목(회원 목록의 관객/창작자 등)을 구분하는 조건.
   * 값이 null 이면 "해당 파라미터가 없어야 함" 을 뜻한다.
   */
  match?: ReadonlyArray<{ key: string; value: string | null }>;
}

export interface NavGroup {
  /** null 이면 구분선 없이 최상단에 붙는다 */
  title: string | null;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    title: null,
    items: [
      { href: "/dashboard", label: "대시보드", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "회원",
    items: [
      {
        href: "/members?type=AUDIENCE",
        label: "관객 회원",
        icon: Users,
        match: [{ key: "type", value: "AUDIENCE" }],
      },
      {
        href: "/members?type=CREATOR",
        label: "창작자 회원",
        icon: UserCheck,
        match: [
          { key: "type", value: "CREATOR" },
          { key: "status", value: null },
        ],
      },
      {
        href: "/members?type=CREATOR&status=PENDING",
        label: "창작자 승인",
        icon: ShieldAlert,
        match: [
          { key: "type", value: "CREATOR" },
          { key: "status", value: "PENDING" },
        ],
      },
    ],
  },
  {
    title: "운영",
    items: [
      { href: "/performances", label: "공연 관리", icon: Ticket },
      { href: "/reports", label: "신고 관리", icon: Siren },
      { href: "/inquiries", label: "문의 관리", icon: Inbox },
    ],
  },
  {
    title: "정산",
    items: [{ href: "/revenue", label: "매출 조회", icon: Wallet }],
  },
  {
    title: "콘텐츠",
    items: [
      { href: "/notices", label: "공고 관리", icon: FileText },
      { href: "/keywords", label: "검색 키워드", icon: Tags },
    ],
  },
  {
    title: "시스템",
    items: [
      { href: "/batch", label: "배치 관리", icon: Server },
      { href: "/failed-events", label: "실패 이벤트", icon: Siren },
      { href: "/account", label: "내 계정", icon: UserCog },
    ],
  },
];

/** 평탄화된 전체 항목 — 라우트 가드/브레드크럼 등에서 사용 */
export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

/** href 에서 쿼리를 뗀 pathname */
function pathnameOf(href: string): string {
  const q = href.indexOf("?");
  return q < 0 ? href : href.slice(0, q);
}

export function isNavItemActive(
  item: NavItem,
  pathname: string,
  searchParams?: URLSearchParams | null,
): boolean {
  const base = pathnameOf(item.href);
  const pathMatches = item.exact
    ? pathname === base
    : pathname === base || pathname.startsWith(`${base}/`);
  if (!pathMatches) return false;

  if (!item.match) return true;
  // 쿼리로 구분되는 항목은 상세 페이지(/members/12)에서는 어느 쪽도 활성화하지 않는다
  if (pathname !== base) return false;

  return item.match.every(({ key, value }) => {
    const actual = searchParams?.get(key) ?? null;
    return actual === value;
  });
}
