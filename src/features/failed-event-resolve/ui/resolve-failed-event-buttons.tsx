"use client";

import { CheckCheck, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";

import {
  isFailedEventClosed,
  isRetryable,
  type FailedEventDetail,
} from "@/entities/failed-event";
import { Button } from "@/shared/ui/button";

import {
  useCompleteFailedEvent,
  useRetryFailedEvent,
} from "../model/use-resolve-failed-event";

/**
 * 실패 이벤트 조치 버튼 묶음.
 * - 재실행: 안전하다고 확인된 4개 타입에만 열려 있다 (그 외는 백엔드가 400)
 * - 확인 처리: 재실행 없이 종료. 되돌릴 수 없다.
 */
export function ResolveFailedEventButtons({ event }: { event: FailedEventDetail }) {
  const retry = useRetryFailedEvent(event.id);
  const complete = useCompleteFailedEvent(event.id);

  const closed = isFailedEventClosed(event.status);
  const retryable = isRetryable(event);
  const busy = retry.isPending || complete.isPending;

  if (closed) {
    return (
      <span className="text-xs text-muted-foreground">
        확인 완료된 건은 더 이상 조작할 수 없습니다.
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {!retryable && (
        <span className="mr-auto text-xs text-muted-foreground">
          이 타입은 재실행을 지원하지 않습니다. 확인 처리만 가능합니다.
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => {
          if (!window.confirm("이 건을 확인 완료로 종료합니다. 되돌릴 수 없습니다.")) return;
          complete.mutate(undefined, {
            onSuccess: () => toast.success("확인 처리했습니다."),
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : "확인 처리에 실패했습니다."),
          });
        }}
      >
        {complete.isPending ? <Loader2 className="animate-spin" /> : <CheckCheck />}
        확인 처리
      </Button>
      <Button
        size="sm"
        disabled={busy || !retryable}
        onClick={() =>
          retry.mutate(undefined, {
            onSuccess: () => toast.success("재실행에 성공해 확인 완료로 바뀌었습니다."),
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : "재실행에 실패했습니다."),
          })
        }
      >
        {retry.isPending ? <Loader2 className="animate-spin" /> : <RotateCw />}
        재실행
      </Button>
    </div>
  );
}
