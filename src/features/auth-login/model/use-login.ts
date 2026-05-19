"use client";

import { useMutation } from "@tanstack/react-query";

import type { LoginFormValues } from "./schema";

interface LoginApiResponse {
  ok: boolean;
  msg?: string;
}

async function postLogin(values: LoginFormValues): Promise<LoginApiResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = (await res.json().catch(() => null)) as LoginApiResponse | null;
  if (!res.ok || !data?.ok) {
    throw new Error(data?.msg ?? "로그인에 실패했습니다.");
  }
  return data;
}

/**
 * 로그인 mutation hook.
 * 성공 시 httpOnly 쿠키는 서버가 이미 설정한 상태.
 * 호출부에서 onSuccess 를 통해 라우팅 처리한다.
 */
export function useLogin() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: postLogin,
  });
}
