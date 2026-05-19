import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient 팩토리.
 * Next.js App Router 에서는 서버 컴포넌트마다 새 인스턴스를 만들고,
 * 클라이언트에서는 싱글톤으로 유지한다.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
