"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import {
  remainingAmount,
  tierForDaysLeft,
  useRefundPolicy,
  type OrderDetail,
  type RefundPolicy,
  type RefundPolicyTier,
} from "@/entities/order";
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
import { daysUntil, formatPrice } from "@/shared/lib/format";

import { useRefundOrder } from "../model/use-order-actions";

/**
 * SUCCESS 주문 환불.
 *
 * 백엔드가 `amount` 를 "관람일까지 남은 일수 기준 환불 정책으로 계산된 예상
 * 환불액" 과 대조해 검증한다. 관리자용 예상액 조회 API 는 아직 없고
 * `GET /order/ticket/{paymentId}/cancel-amount` 는 본인 주문 전용이라 쓸 수 없어,
 * `GET /notice/refund-policy` 의 비율표와 관람일까지 남은 일수를 함께 띄워
 * 운영자가 금액을 맞출 수 있게 한다.
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

  // 다이얼로그를 연 뒤에만 정책을 불러온다 (목록에서 행마다 호출되지 않도록)
  const policyQuery = useRefundPolicy(open);
  const policy = policyQuery.data ?? null;

  const remaining = remainingAmount(order);
  const daysLeft = daysUntil(order.enableDate);
  const tier = policy && daysLeft != null ? tierForDaysLeft(policy, daysLeft) : null;
  const suggested =
    tier != null ? Math.floor((remaining * tier.refundPercent) / 100) : null;

  const parsed = Number.parseInt(amount, 10);
  const amountOk = Number.isFinite(parsed) && parsed > 0 && parsed <= remaining;
  const canSubmit = amountOk && reason.trim().length > 0 && !mutation.isPending;

  const handleRefund = () => {
    if (!canSubmit) return;
    mutation.mutate(
      { orderId: order.orderId, body: { amount: parsed, reason: reason.trim() } },
      {
        onSuccess: (result) => {
          toast.success(
            `${formatPrice(result.refundAmount)} 환불했습니다.` +
              (result.cancelFeeAmount > 0
                ? ` (취소 수수료 ${formatPrice(result.cancelFeeAmount)})`
                : "") +
              (result.expectedRefundPeriod ? ` ${result.expectedRefundPeriod}` : ""),
          );
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
            검증합니다. 관리자용 예상액 조회 API 가 없어 금액이 다르면 400 으로
            거부됩니다 — 아래 비율표로 확인하고 넣으세요.
          </p>

          <RefundPolicyHint
            loading={policyQuery.isPending}
            policy={policy}
            daysLeft={daysLeft}
            tier={tier}
            suggested={suggested}
            onApply={(v) => setAmount(String(v))}
          />

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

/**
 * 환불 비율표 안내.
 * 관람일까지 남은 일수에 해당하는 구간을 강조하고, 그 비율로 계산한 금액을
 * 한 번에 채울 수 있게 한다. 정책 조회에 실패해도 환불 자체는 막지 않는다.
 */
function RefundPolicyHint({
  loading,
  policy,
  daysLeft,
  tier,
  suggested,
  onApply,
}: {
  loading: boolean;
  policy: RefundPolicy | null;
  daysLeft: number | null;
  tier: RefundPolicyTier | null;
  suggested: number | null;
  onApply: (amount: number) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        환불 비율 정책을 불러오는 중...
      </div>
    );
  }
  if (!policy) {
    return (
      <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        환불 비율 정책을 불러오지 못했습니다. 금액을 직접 확인해 입력하세요.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border bg-muted/30 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium">환불 비율 정책</span>
        {daysLeft == null ? (
          <span className="text-muted-foreground">회차 정보가 없어 구간을 알 수 없습니다</span>
        ) : daysLeft < 0 ? (
          <span className="text-destructive">
            관람일이 지났습니다 (환불 {policy.afterPerformanceStartedPercent}%)
          </span>
        ) : (
          <span className="text-muted-foreground">관람일까지 {daysLeft}일 남음</span>
        )}
      </div>

      <ul className="space-y-0.5 text-xs">
        {policy.tiers.map((t) => {
          const active = tier != null && t.label === tier.label;
          return (
            <li
              key={t.label}
              className={
                active
                  ? "flex justify-between gap-3 rounded px-1.5 py-0.5 font-medium text-foreground ring-1 ring-primary"
                  : "flex justify-between gap-3 px-1.5 py-0.5 text-muted-foreground"
              }
            >
              <span className="min-w-0 truncate">{t.label}</span>
              <span className="shrink-0 tabular-nums">{t.refundPercent}%</span>
            </li>
          );
        })}
      </ul>

      {suggested != null && tier != null && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-2 text-xs">
          <span className="text-muted-foreground">
            잔액 기준 {tier.refundPercent}% = {formatPrice(suggested)}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-auto h-7"
            onClick={() => onApply(suggested)}
          >
            이 금액 넣기
          </Button>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {policy.description ??
          `예매 후 ${policy.gracePeriodHours}시간 이내이고 관람일까지 ${policy.gracePeriodMinDaysBeforePerformance}일 이상 남았으면 유예 예외가 적용됩니다.`}{" "}
        계산값은 참고용이며 최종 검증은 백엔드가 합니다.
      </p>
    </div>
  );
}
