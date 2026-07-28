"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, RotateCcw, Save, X } from "lucide-react";
import { toast } from "sonner";

import {
  ALLOWED_GENRE_KEYWORDS,
  KeywordType,
  keywordTypeDescription,
  keywordTypeLabel,
  type KeywordBucket,
} from "@/entities/keyword";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { useSyncedState } from "@/shared/hooks";

import { useUpdateKeywords } from "../model/use-update-keywords";

interface KeywordEditorProps {
  type: KeywordType;
  bucket: KeywordBucket | undefined;
}

/**
 * 한 KeywordType 의 활성 키워드 편집기.
 *
 * 백엔드는 "보낸 목록 = 최종 활성 상태" 규칙이라 부분 추가/삭제 API 가 없다.
 * 그래서 화면에서 목록 전체를 만든 뒤 한 번에 저장한다.
 */
export function KeywordEditor({ type, bucket }: KeywordEditorProps) {
  const serverActive = useMemo(() => bucket?.active ?? [], [bucket]);
  const inactive = bucket?.inactive ?? [];

  // 서버 값이 갱신되면(저장 후 refetch 포함) 초안을 맞춘다
  const [draft, setDraft] = useSyncedState<string[]>(serverActive);
  const [input, setInput] = useState("");

  const mutation = useUpdateKeywords();

  const isDirty =
    draft.length !== serverActive.length ||
    draft.some((k, i) => k !== serverActive[i]);

  const isGenre = type === KeywordType.GENRE;
  const suggestions = isGenre
    ? ALLOWED_GENRE_KEYWORDS.filter((g) => !draft.includes(g))
    : [];

  const add = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (draft.includes(value)) {
      toast.info("이미 목록에 있는 키워드입니다.");
      return;
    }
    if (isGenre && !(ALLOWED_GENRE_KEYWORDS as readonly string[]).includes(value)) {
      toast.error("장르 키워드는 서버가 허용하는 값만 등록할 수 있습니다.");
      return;
    }
    setDraft((prev) => [...prev, value]);
    setInput("");
  };

  const remove = (value: string) => {
    setDraft((prev) => prev.filter((k) => k !== value));
  };

  const save = () => {
    mutation.mutate(
      { keywords: { [type]: draft } },
      {
        onSuccess: () => {
          toast.success(`${keywordTypeLabel[type]} 를 저장했습니다.`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "키워드 저장에 실패했습니다.");
        },
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <header className="space-y-1">
          <h3 className="text-sm font-semibold">{keywordTypeLabel[type]}</h3>
          <p className="text-xs text-muted-foreground">{keywordTypeDescription[type]}</p>
        </header>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            활성 키워드 ({draft.length})
          </div>
          {draft.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
              활성 키워드가 없습니다. 이대로 저장하면 이 타입의 키워드가 모두 비활성화됩니다.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {draft.map((k) => (
                <li key={k}>
                  <span className="inline-flex items-center gap-1 rounded-md border bg-card py-1 pl-2.5 pr-1 text-sm">
                    {k}
                    <button
                      type="button"
                      onClick={() => remove(k)}
                      aria-label={`${k} 제거`}
                      className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(input);
              }
            }}
            placeholder={isGenre ? "허용된 장르값 입력" : "키워드 입력 후 Enter"}
            aria-label={`${keywordTypeLabel[type]} 추가`}
          />
          <Button type="button" variant="outline" onClick={() => add(input)}>
            <Plus />
            추가
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">추가 가능한 장르</div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {inactive.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">
              비활성(삭제됨) — 다시 추가하면 복원됩니다
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inactive.map((k) => (
                <Badge key={k} variant="muted">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDraft(serverActive)}
            disabled={!isDirty || mutation.isPending}
          >
            <RotateCcw />
            되돌리기
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={!isDirty || mutation.isPending}>
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {mutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
