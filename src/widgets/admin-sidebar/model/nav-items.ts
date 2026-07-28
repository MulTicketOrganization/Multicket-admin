import {
  FileText,
  Inbox,
  LayoutDashboard,
  Server,
  Tags,
  Ticket,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** /dashboard 처럼 정확히 일치해야 active 로 간주할 경로 */
  exact?: boolean;
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
    title: "운영",
    items: [
      { href: "/members", label: "회원 관리", icon: Users },
      { href: "/performances", label: "공연 관리", icon: Ticket },
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
      { href: "/account", label: "내 계정", icon: UserCog },
    ],
  },
];

/** 평탄화된 전체 항목 — 라우트 가드/브레드크럼 등에서 사용 */
export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
