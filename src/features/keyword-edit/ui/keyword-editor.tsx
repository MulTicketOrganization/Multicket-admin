"use client";

import { useMemo } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import {
  ALLOWED_KEYWORDS,
  KeywordType,
  keywordTypeDescription,
  keywordTypeLabel,
  keywordValueLabel,
  isAllowedKeyword,
  type KeywordBucket,
} from "@/entities/keyword";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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
 * 모든 타입이 서버 화이트리스트를 가지므로 자유 입력 대신 허용값 토글로 고른다.
 * 백엔드는 "보낸 목록 = 최종 활성 상태" 규칙이라 부분 추가/삭제 API 가 없어,
 * 화면에서 목록 전체를 만든 뒤 한 번에 저장한다.
 */
export function KeywordEditor({ type, bucket }: KeywordEditorProps) {
  const serverActive = useMemo(() => bucket?.active ?? [], [bucket]);
  const allowed = ALLOWED_KEYWORDS[type] as readonly string[];

  // 서버 값이 갱신되면(저장 후 refetch 포함) 초안을 맞춘다
  const [draft, setDraft] = useSyncedState<string[]>(serverActive);

  const mutation = useUpdateKeywords();

  const isDirty =
    draft.length !== serverActive.length ||
    draft.some((k) => !serverActive.includes(k));

  /** 허용값 밖인데 서버에 남아 있는 값 — 그대로 두면 저장할 때 요청 전체가 400 이 난다 */
  const unknownActive = draft.filter((k) => !isAllowedKeyword(type, k));

  const toggle = (value: string) => {
    setDraft((prev) =>
      prev.includes(value) ? prev.filter((k) => k !== value) : [...prev, value],
    );
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
            활성 키워드 ({draft.length}/{allowed.length})
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {allowed.map((value) => {
              const on = draft.includes(value);
              return (
                <li key={value}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(value)}
                    className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                      on
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-dashed text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {keywordValueLabel(value)}
                    <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                      {value}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {draft.length === 0 && (
            <p className="text-xs text-muted-foreground">
              이대로 저장하면 이 타입의 키워드가 모두 비활성화됩니다.
            </p>
          )}
        </div>

        {unknownActive.length > 0 && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            서버가 더 이상 허용하지 않는 값이 활성 상태입니다 ({unknownActive.join(", ")}).
            저장하면 목록에서 빠져 비활성화됩니다.
          </p>
        )}

        {bucket && bucket.inactive.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">
              비활성(삭제됨) — 다시 켜면 복원됩니다
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bucket.inactive.map((k) => (
                <Badge key={k} variant="muted">
                  {keywordValueLabel(k)}
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
          <Button
            type="button"
            size="sm"
            onClick={save}
            disabled={!isDirty || mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {mutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
