"use client";

import { useState } from "react";
import { AlertTriangle, Ban, Loader2 } from "lucide-react";
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

import { useCancelOrder } from "../model/use-order-actions";

/**
 * PENDING 주문 취소.
 * 결제가 완료된(SUCCESS) 주문은 이 버튼이 아니라 환불로 처리한다.
 */
export function OrderCancelButton({
  orderId,
  disabled = false,
}: {
  orderId: number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useCancelOrder();

  const handleCancel = () => {
    mutation.mutate(orderId, {
      onSuccess: () => {
        toast.success("주문을 취소했습니다.");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "주문 취소에 실패했습니다.");
      },
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        <Ban />
        주문 취소
      </Button>

      <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 취소</DialogTitle>
            <DialogDescription>
              결제 대기(PENDING) 상태인 주문 #{orderId} 을 취소합니다.
            </DialogDescription>
          </DialogHeader>

          <p className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            PortOne 에 결제 기록이 있으면 PortOne 취소 후 웹훅이 상태를 확정하고, 없으면
            즉시 실패로 확정합니다. 재고는 함께 복구됩니다.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              닫기
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "취소 중..." : "주문 취소"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
