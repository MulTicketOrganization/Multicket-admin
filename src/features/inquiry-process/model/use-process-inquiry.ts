"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  INQUIRY_QUERY_KEYS,
  updateInquiry,
  type InquiryUpdateRequest,
} from "@/entities/inquiry";
import { MEMBER_QUERY_KEYS } from "@/entities/member";
import { PERFORMANCE_QUERY_KEYS } from "@/entities/performance";

/**
 * 문의 처리 mutation.
 * 문의 처리는 회원 상태나 공연을 함께 바꾸므로 관련 캐시를 모두 무효화한다.
 */
export function useProcessInquiry(inquiryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "inquiries", "process", inquiryId],
    mutationFn: (body: InquiryUpdateRequest) => updateInquiry(inquiryId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INQUIRY_QUERY_KEYS.detail(inquiryId) });
      queryClient.invalidateQueries({ queryKey: INQUIRY_QUERY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: MEMBER_QUERY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.list() });
    },
  });
}
