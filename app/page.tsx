import { redirect } from "next/navigation";

/**
 * 루트는 진입점 역할만 한다.
 * 실제 인증 여부에 따른 분기는 proxy.ts 가 처리하므로
 * (토큰 없으면 /login, 있으면 /dashboard) 여기서는 /dashboard 로 넘긴다.
 */
export default function Home() {
  redirect("/dashboard");
}
