"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  APP_VERSION_QUERY_KEYS,
  createAppVersion,
  updateAppVersionNote,
  type AppVersionCreateRequest,
} from "@/entities/app-version";

export function useCreateAppVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "app-versions", "create"],
    mutationFn: (body: AppVersionCreateRequest) => createAppVersion(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: APP_VERSION_QUERY_KEYS.all() }),
  });
}

export function useUpdateAppVersionNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "app-versions", "update-note"],
    mutationFn: ({ id, updateNote }: { id: number; updateNote: string }) =>
      updateAppVersionNote(id, { updateNote }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: APP_VERSION_QUERY_KEYS.all() }),
  });
}
