"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  ALLOWED_MEMBER_EVENTS,
  DESTRUCTIVE_MEMBER_EVENTS,
  memberEventDescription,
  memberEventLabel,
  memberStatusLabel,
  type MemberEvent,
  type MemberStatus,
} from "@/entities/member";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";

import { useChangeMemberStatus } from "../model/use-change-member-status";

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: number;
  memberNickname?: string | null;
  currentStatus: MemberStatus;
}

/**
 * 회원 상태 변경 다이얼로그.
 * 백엔드는 목표 상태가 아니라 "전이 이벤트"를 받으므로, 현재 상태에서
 * 허용되는 이벤트만 노출한다 (허용되지 않는 전이는 서버가 400 으로 거부).
 */
export function ChangeStatusDialog({
  open,
  onOpenChange,
  memberId,
  memberNickname,
  currentStatus,
}: ChangeStatusDialogProps) {
  const allowedEvents = ALLOWED_MEMBER_EVENTS[currentStatus] ?? [];
  const [selected, setSelected] = useState<MemberEvent | null>(null);

  // 다이얼로그가 새로 열릴 때 선택 초기화 (effect 대신 렌더 중 상태 조정)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSelected(null);
  }

  const mutation = useChangeMemberStatus();
  const isDestructive = selected != null && DESTRUCTIVE_MEMBER_EVENTS.includes(selected);

  const handleSubmit = () => {
    if (!selected) return;
    mutation.mutate(
      { memberId, event: selected },
      {
        onSuccess: () => {
          toast.success(`"${memberEventLabel[selected]}" 처리를 적용했습니다.`);
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>회원 상태 변경</DialogTitle>
          <DialogDescription>
            {memberNickname ? (
              <span className="font-medium text-foreground">{memberNickname}</span>
            ) : (
              "회원"
            )}
            {" 님의 현재 상태는 "}
            <span className="font-medium text-foreground">
              {memberStatusLabel[currentStatus]}
            </span>
            {" 입니다. 적용할 처리를 선택하세요."}
          </DialogDescription>
        </DialogHeader>

        {allowedEvents.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            현재 상태에서는 적용 가능한 처리가 없습니다.
          </p>
        ) : (
          <RadioGroup
            value={selected ?? ""}
            onValueChange={(v) => setSelected(v as MemberEvent)}
            className="gap-3"
          >
            {allowedEvents.map((e) => (
              <Label
                key={e}
                htmlFor={`event-${e}`}
                className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent"
              >
                <RadioGroupItem id={`event-${e}`} value={e} className="mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {memberEventLabel[e]}
                    {DESTRUCTIVE_MEMBER_EVENTS.includes(e) && (
                      <AlertTriangle className="size-3.5 text-destructive" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {memberEventDescription[e]}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        )}

        {isDestructive && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            되돌릴 수 없는 처리입니다. 대상 회원을 다시 확인하세요.
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={!selected || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "적용 중..." : "적용하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
