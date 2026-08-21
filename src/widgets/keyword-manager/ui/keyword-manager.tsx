"use client";

import { AlertTriangle } from "lucide-react";

import { KeywordType, useKeywords } from "@/entities/keyword";
import { KeywordEditor } from "@/features/keyword-edit";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function KeywordManager() {
  const { data, isPending, isError, error } = useKeywords();

  if (isPending) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <AlertTriangle className="size-6 text-destructive" />
          <p className="text-sm">
            {error instanceof Error ? error.message : "키워드를 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {Object.values(KeywordType).map((t) => (
        <KeywordEditor key={t} type={t} bucket={data?.[t]} />
      ))}
    </div>
  );
}
