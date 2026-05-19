import { LayoutDashboard, Ticket, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** /dashboard 처럼 정확히 일치해야 active 로 간주할 경로 */
  exact?: boolean;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/members", label: "회원 관리", icon: Users },
  { href: "/performances", label: "공연 관리", icon: Ticket },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
