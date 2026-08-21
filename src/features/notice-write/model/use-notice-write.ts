"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  NOTICE_QUERY_KEYS,
  createNotice,
  deleteNotice,
  updateNotice,
  type NoticeWriteRequest,
} from "@/entities/notice";

/** 등록/수정/삭제 후 목록·상세·사용자 노출 미리보기를 모두 무효화한다. */
function useInvalidateNotices() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.all() });
}

export function useCreateNotice() {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationKey: ["admin", "notices", "create"],
    mutationFn: (body: NoticeWriteRequest) => createNotice(body),
    onSuccess: invalidate,
  });
}

export function useUpdateNotice(id: number) {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationKey: ["admin", "notices", "update", id],
    mutationFn: (body: NoticeWriteRequest) => updateNotice(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteNotice() {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationKey: ["admin", "notices", "delete"],
    mutationFn: (id: number) => deleteNotice(id),
    onSuccess: invalidate,
  });
}
