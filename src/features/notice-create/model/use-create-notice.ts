"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  NOTICE_QUERY_KEYS,
  createNotice,
  type NoticeCreateRequest,
} from "@/entities/notice";

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "notices", "create"],
    mutationFn: (body: NoticeCreateRequest) => createNotice(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: NOTICE_QUERY_KEYS.latest(variables.type),
      });
    },
  });
}
