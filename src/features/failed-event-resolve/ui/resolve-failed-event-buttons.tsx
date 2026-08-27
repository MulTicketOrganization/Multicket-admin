"use client";

import { CheckCheck, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";

import {
  isActionable,
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
 * 두 조치 모두 FAILED 상태에서만 열린다 — RECEIVED/DONE/IGNORED 는 백엔드가 400 으로 막는다.
 * - 재실행: 재호출이 안전하다고 확인된 타입에만 열려 있다. 성공하면 DONE.
 * - 확인 처리: 재실행 없이 IGNORED 로 닫는다. 되돌릴 수 없다.
 */
export function ResolveFailedEventButtons({ event }: { event: FailedEventDetail }) {
  const retry = useRetryFailedEvent(event.id);
  const complete = useCompleteFailedEvent(event.id);

  const actionable = isActionable(event.status);
  const retryable = isRetryable(event);
  const busy = retry.isPending || complete.isPending;

  if (!actionable) {
    return (
      <span className="text-xs text-muted-foreground">
        실패(FAILED) 상태의 이벤트만 재실행하거나 확인 처리할 수 있습니다.
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
          if (!window.confirm("이 건을 재실행 없이 확인 완료로 종료합니다. 되돌릴 수 없습니다.")) return;
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
            onSuccess: () => toast.success("재실행에 성공해 처리 완료로 바뀌었습니다."),
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
