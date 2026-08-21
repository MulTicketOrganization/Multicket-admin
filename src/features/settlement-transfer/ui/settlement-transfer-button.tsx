"use client";

import { useState } from "react";
import { Banknote, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { useSettlementTransfer } from "../model/use-settlement-transfer";

interface SettlementTransferButtonProps {
  settlementId: number;
  /** 이미 SUCCESS 인 건은 재요청 대상이 아니다 */
  disabled?: boolean;
}

/**
 * PG사 정산 요청.
 *
 * ⚠️ 백엔드가 아직 실제 PG 를 호출하지 않는다 (PG 미확정 — 상태 확인만 수행).
 * 버튼을 눌러도 돈이 나가지 않는다는 점을 다이얼로그에 명시해 둔다.
 * PG 확정 후 백엔드가 실제 이체를 시작하면 이 문구부터 바꿔야 한다.
 */
export function SettlementTransferButton({
  settlementId,
  disabled = false,
}: SettlementTransferButtonProps) {
  const [open, setOpen] = useState(false);
  const mutation = useSettlementTransfer();

  const handleRequest = () => {
    mutation.mutate(settlementId, {
      onSuccess: () => {
        toast.success("PG사 정산 요청을 보냈습니다.");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "정산 요청에 실패했습니다.");
      },
    });
  };

  return (
    <>
      <Button size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        <Banknote />
        PG사 정산요청
      </Button>

      <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PG사 정산 요청</DialogTitle>
            <DialogDescription>
              정산 #{settlementId} 건을 PG사로 정산 요청합니다.
            </DialogDescription>
          </DialogHeader>

          <p className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            PG사가 확정되지 않아 백엔드는 아직 실제 이체를 호출하지 않고 이미 이체된
            건인지 상태만 확인합니다. 실제 송금은 일어나지 않습니다.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button onClick={handleRequest} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "요청 중..." : "정산 요청"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
