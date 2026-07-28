"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  KEYWORD_QUERY_KEYS,
  updateKeywords,
  type KeywordUpdateRequest,
} from "@/entities/keyword";

export function useUpdateKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "keywords", "update"],
    mutationFn: (body: KeywordUpdateRequest) => updateKeywords(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYWORD_QUERY_KEYS.all() });
    },
  });
}
