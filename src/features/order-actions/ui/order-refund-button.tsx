"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { remainingAmount, type OrderDetail } from "@/entities/order";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { formatPrice } from "@/shared/lib/format";

import { useRefundOrder } from "../model/use-order-actions";

/**
 * SUCCESS 주문 환불.
 *
 * ⚠️ 백엔드가 `amount` 를 "관람일까지 남은 일수 기준 환불 정책으로 계산된 예상
 * 환불액" 과 대조해 검증하는데, **그 값을 조회할 API 가 없다.**
 * 그래서 운영자가 직접 입력해야 하고 틀리면 400 이 난다.
 * (BACKEND_REQUESTS.md §2 — 환불 견적 API 요청)
 */
export function OrderRefundButton({
  order,
  disabled = false,
}: {
  order: OrderDetail;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const mutation = useRefundOrder();

  const remaining = remainingAmount(order);
  const parsed = Number.parseInt(amount, 10);
  const amountOk = Number.isFinite(parsed) && parsed > 0 && parsed <= remaining;
  const canSubmit = amountOk && reason.trim().length > 0 && !mutation.isPending;

  const handleRefund = () => {
    if (!canSubmit) return;
    mutation.mutate(
      { orderId: order.orderId, body: { amount: parsed, reason: reason.trim() } },
      {
        onSuccess: () => {
          toast.success("환불을 요청했습니다. 상태는 PortOne 웹훅으로 확정됩니다.");
          setOpen(false);
          setAmount("");
          setReason("");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "환불에 실패했습니다.");
        },
      },
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => {
          setAmount(String(remaining));
          setReason("");
          setOpen(true);
        }}
        className="text-destructive hover:text-destructive"
      >
        <Undo2 />
        환불
      </Button>

      <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 환불</DialogTitle>
            <DialogDescription>
              {order.performanceTitle} · 주문 #{order.orderId} (결제{" "}
              {formatPrice(order.finalPaymentAmount)}
              {order.refundAmount > 0 && `, 기환불 ${formatPrice(order.refundAmount)}`})
            </DialogDescription>
          </DialogHeader>

          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            백엔드가 <strong>관람일 기준 환불 정책으로 계산한 금액과 일치하는지</strong>{" "}
            검증합니다. 예상 환불액을 조회하는 API 가 없어 금액이 다르면 400 으로
            거부됩니다 — 기본값은 남은 결제 금액이며 정책 금액에 맞게 고쳐 넣으세요.
          </p>

          <div className="space-y-2">
            <Label htmlFor="refund-amount">
              환불 금액 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="refund-amount"
              type="number"
              min={1}
              max={remaining}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              환불 가능 잔액 {formatPrice(remaining)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-reason">
              환불 사유 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="PortOne 취소 기록에 남습니다."
              className="min-h-20"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              닫기
            </Button>
            <Button variant="destructive" onClick={handleRefund} disabled={!canSubmit}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "환불 요청 중..." : "환불 요청"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
