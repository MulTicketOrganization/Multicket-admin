"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  REPORT_QUERY_KEYS,
  processReport,
  type ReportProcessRequest,
} from "@/entities/report";

/**
 * 신고 처리 mutation.
 * 처리 결과는 상세(처리자·소견·처리일시)와 목록 상태를 함께 바꾸므로 둘 다 무효화한다.
 */
export function useProcessReport(reportId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "reports", "process", reportId],
    mutationFn: (body: ReportProcessRequest) => processReport(reportId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.list() });
    },
  });
}
