"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  CONSENT_DOCUMENT_QUERY_KEYS,
  createConsentDocument,
  type ConsentDocumentCreateRequest,
} from "@/entities/consent-document";

/**
 * 약관 본문 등록(= 현재 버전 교체) mutation.
 * 회원 동의 상태까지 서버에서 초기화되므로 목록·현재 버전 캐시를 모두 무효화한다.
 */
export function useCreateConsentDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "consent-documents", "create"],
    mutationFn: (body: ConsentDocumentCreateRequest) => createConsentDocument(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CONSENT_DOCUMENT_QUERY_KEYS.all() }),
  });
}
