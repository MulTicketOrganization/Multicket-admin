"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { JobInstanceSummary } from "@/entities/batch";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { useRestartJob } from "../model/use-restart-job";

interface RestartJobButtonProps {
  job: JobInstanceSummary;
  disabled?: boolean;
}

/**
 * 배치 재실행.
 * 새 JobInstance 를 만드는 게 아니라 같은 인스턴스에 JobExecution 을 이어붙인다
 * (이전 실행의 ExecutionContext 를 복원해서 이어서 처리).
 */
export function RestartJobButton({ job, disabled = false }: RestartJobButtonProps) {
  const [open, setOpen] = useState(false);
  const mutation = useRestartJob();

  const handleRestart = () => {
    mutation.mutate(job.jobInstanceId, {
      onSuccess: (result) => {
        toast.success(
          `${result.jobName} 재실행을 시작했습니다. (execution #${result.jobExecutionId})`,
        );
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "배치 재실행에 실패했습니다.");
      },
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <RefreshCw />
        재실행
      </Button>

      <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배치 재실행</DialogTitle>
            <DialogDescription>
              <span className="font-mono text-foreground">{job.jobName}</span>
              {` (instance #${job.jobInstanceId}) 를 재실행합니다. 이전 실행 지점부터 이어서 처리됩니다.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button onClick={handleRestart} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "실행 중..." : "재실행"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
