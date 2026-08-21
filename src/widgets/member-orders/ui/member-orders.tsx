"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingCart } from "lucide-react";

import {
  canCancel,
  canRefund,
  flattenOrderPages,
  orderStatusLabel,
  orderStatusVariant,
  useMemberOrderList,
  useOrderDetail,
  type OrderListItem,
} from "@/entities/order";
import { OrderCancelButton, OrderRefundButton } from "@/features/order-actions";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatDateTime, formatPrice } from "@/shared/lib/format";

const COLUMN_COUNT = 5;

/**
 * 회원의 구매/주문 내역.
 *
 * 백엔드 목록 API 가 `memberId` 필수라 전역 주문 화면을 만들 수 없다 —
 * 주문은 회원 상세에서만 볼 수 있다. (BACKEND_REQUESTS.md §0-2)
 * 목록에는 금액·상태가 없어 상세를 열어야 확인·처리할 수 있다.
 */
export function MemberOrders({ memberId }: { memberId: number }) {
  const query = useMemberOrderList(memberId);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const rows = query.data ? flattenOrderPages(query.data.pages) : [];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">구매 / 주문 내역</h2>

      {query.isError ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            {query.error instanceof Error
              ? query.error.message
              : "주문 내역을 불러오지 못했습니다."}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">주문 ID</TableHead>
                <TableHead className="w-56">예매번호</TableHead>
                <TableHead className="w-40">예매일</TableHead>
                <TableHead className="w-32">결제수단</TableHead>
                <TableHead>예매자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isPending ? (
                <SkeletonRows count={3} />
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    <ShoppingCart className="mx-auto mb-2 size-5 opacity-50" />
                    구매 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((o) => (
                  <OrderRow key={o.orderId} order={o} onOpen={setSelectedOrderId} />
                ))
              )}
            </TableBody>
          </Table>

          {rows.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
              <span>
                총 {rows.length}건 로드됨{query.hasNextPage ? " (더 있음)" : ""}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void query.fetchNextPage()}
                disabled={!query.hasNextPage || query.isFetchingNextPage}
              >
                {query.isFetchingNextPage && <Loader2 className="animate-spin" />}
                {query.hasNextPage
                  ? query.isFetchingNextPage
                    ? "불러오는 중..."
                    : "더 보기"
                  : "마지막"}
              </Button>
            </div>
          )}
        </div>
      )}

      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </section>
  );
}

function OrderRow({
  order: o,
  onOpen,
}: {
  order: OrderListItem;
  onOpen: (id: number) => void;
}) {
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => onOpen(o.orderId)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(o.orderId);
      }}
      tabIndex={0}
    >
      <TableCell className="font-mono text-xs text-muted-foreground">{o.orderId}</TableCell>
      <TableCell className="font-mono text-xs">{o.paymentId}</TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(o.paidAt)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {o.paymentMethod ?? "-"}
      </TableCell>
      <TableCell className="text-sm">
        {o.buyerName ?? "-"}
        {o.buyerPhoneNumber && (
          <span className="ml-2 text-xs text-muted-foreground">{o.buyerPhoneNumber}</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function OrderDetailDialog({
  orderId,
  onClose,
}: {
  orderId: number | null;
  onClose: () => void;
}) {
  const { data, isPending, isError, error } = useOrderDetail(orderId);

  return (
    <Dialog open={orderId != null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>주문 상세</DialogTitle>
          <DialogDescription>주문 #{orderId}</DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "주문을 불러오지 못했습니다."}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={orderStatusVariant[data.ticketOrderStatus]}>
                {orderStatusLabel[data.ticketOrderStatus]}
              </Badge>
              <Link
                href={`/performances/${data.performanceId}`}
                className="text-sm font-medium hover:text-primary hover:underline underline-offset-4"
              >
                {data.performanceTitle}
              </Link>
            </div>

            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <Field label="예매번호" value={data.paymentId} mono />
              <Field label="회차" value={formatDateTime(data.enableDate)} />
              <Field label="예매일" value={formatDateTime(data.paidAt)} />
              <Field label="결제수단" value={data.paymentMethod ?? "-"} />
              <Field label="예매자" value={data.buyerName ?? "-"} />
              <Field label="연락처" value={data.buyerPhoneNumber ?? "-"} />
              <Field label="이메일" value={data.buyerEmail ?? "-"} />
            </dl>

            <Separator />

            <dl className="space-y-1.5 text-sm">
              <AmountRow label="할인금 (추정)" value={data.discountAmount} />
              <AmountRow label="최종 결제금액" value={data.finalPaymentAmount} />
              {data.refundAmount > 0 && (
                <AmountRow
                  label={`환불금${data.refundAt ? ` (${formatDateTime(data.refundAt)})` : ""}`}
                  value={-data.refundAmount}
                />
              )}
            </dl>

            <div className="flex justify-end gap-2">
              {canCancel(data.ticketOrderStatus) && (
                <OrderCancelButton orderId={data.orderId} />
              )}
              {canRefund(data.ticketOrderStatus) && <OrderRefundButton order={data} />}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={`min-w-0 break-words${mono ? " font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{formatPrice(value)}</dd>
    </div>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full max-w-32" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
