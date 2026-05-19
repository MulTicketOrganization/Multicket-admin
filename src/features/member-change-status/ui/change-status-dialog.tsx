"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  MemberStatus,
  memberStatusLabel,
  type MemberStatus as TMemberStatus,
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
  currentStatus: TMemberStatus;
}

const STATUS_DESCRIPTIONS: Record<TMemberStatus, string> = {
  [MemberStatus.PENDING]: "이메일 인증 완료 전. 로그인 등 일부 기능이 제한됩니다.",
  [MemberStatus.COMPLETE]: "정상 사용 가능 상태입니다.",
  [MemberStatus.FROZEN]: "로그인 차단. 운영 정책 위반 등에 사용하세요.",
};

export function ChangeStatusDialog({
  open,
  onOpenChange,
  memberId,
  memberNickname,
  currentStatus,
}: ChangeStatusDialogProps) {
  const [selected, setSelected] = useState<TMemberStatus>(currentStatus);

  // 다이얼로그가 새로 열릴 때 현재 상태로 reset
  useEffect(() => {
    if (open) setSelected(currentStatus);
  }, [open, currentStatus]);

  const mutation = useChangeMemberStatus();
  const isDirty = selected !== currentStatus;

  const handleSubmit = () => {
    if (!isDirty) {
      onOpenChange(false);
      return;
    }
    mutation.mutate(
      { memberId, memberStatus: selected },
      {
        onSuccess: () => {
          toast.success(`회원 상태를 "${memberStatusLabel[selected]}" 로 변경했습니다.`);
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "상태 변경에 실패했습니다.",
          );
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
            {memberNickname ? <span className="font-medium text-foreground">{memberNickname}</span> : "회원"}
            {" 의 상태를 변경합니다. 변경 후 즉시 적용됩니다."}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selected}
          onValueChange={(v) => setSelected(v as TMemberStatus)}
          className="gap-3"
        >
          {Object.values(MemberStatus).map((s) => (
            <Label
              key={s}
              htmlFor={`status-${s}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
            >
              <RadioGroupItem id={`status-${s}`} value={s} className="mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-medium">
                  {memberStatusLabel[s]}
                  {s === currentStatus && (
                    <span className="ml-2 text-xs text-muted-foreground">(현재)</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {STATUS_DESCRIPTIONS[s]}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>

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
            onClick={handleSubmit}
            disabled={!isDirty || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "변경 중..." : "변경하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
