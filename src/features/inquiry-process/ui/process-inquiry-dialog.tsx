"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  InquiryEvent,
  InquiryType,
  inquiryEventLabel,
  type InquiryDetail,
} from "@/entities/inquiry";
import {
  MemberEvent,
  memberEventDescription,
  memberEventLabel,
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

import { useProcessInquiry } from "../model/use-process-inquiry";

/** MEMBER_STATUS 문의를 승인할 때 고를 수 있는 회원 이벤트 (DELETE 는 REJECT 경로가 담당) */
const MEMBER_EVENT_CHOICES: MemberEvent[] = [
  MemberEvent.APPROVE,
  MemberEvent.FREEZE,
  MemberEvent.UNFREEZE,
  MemberEvent.BAN,
];

interface ProcessInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: InquiryDetail;
}

export function ProcessInquiryDialog({
  open,
  onOpenChange,
  inquiry,
}: ProcessInquiryDialogProps) {
  const [event, setEvent] = useState<InquiryEvent | null>(null);
  const [memberEvent, setMemberEvent] = useState<MemberEvent>(MemberEvent.APPROVE);

  // 다이얼로그가 열릴 때마다 선택 초기화 (effect 대신 렌더 중 상태 조정)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setEvent(null);
      setMemberEvent(MemberEvent.APPROVE);
    }
  }

  const mutation = useProcessInquiry(inquiry.id);

  const isMemberStatus = inquiry.inquiryType === InquiryType.MEMBER_STATUS;
  // MEMBER_STATUS + COMPLETE 일 때만 memberEvent 가 필수
  const needsMemberEvent = isMemberStatus && event === InquiryEvent.COMPLETE;
  const isDestructive =
    event === InquiryEvent.REJECT || (needsMemberEvent && memberEvent === MemberEvent.BAN);

  const handleSubmit = () => {
    if (!event) return;
    mutation.mutate(
      { event, ...(needsMemberEvent ? { memberEvent } : {}) },
      {
        onSuccess: () => {
          toast.success(`문의를 "${inquiryEventLabel[event]}" 했습니다.`);
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "문의 처리에 실패했습니다.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>문의 처리</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{inquiry.title}</span>
            {" 문의를 처리합니다. 처리 후에는 되돌릴 수 없습니다."}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={event ?? ""}
          onValueChange={(v) => setEvent(v as InquiryEvent)}
          className="gap-3"
        >
          {Object.values(InquiryEvent).map((e) => (
            <Label
              key={e}
              htmlFor={`inquiry-event-${e}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent"
            >
              <RadioGroupItem id={`inquiry-event-${e}`} value={e} className="mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{inquiryEventLabel[e]}</div>
                <div className="text-xs text-muted-foreground">
                  {e === InquiryEvent.COMPLETE
                    ? "요청을 수용하고 문의를 처리 완료로 종료합니다."
                    : rejectDescription(inquiry.inquiryType)}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>

        {needsMemberEvent && (
          <div className="space-y-2 rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium">적용할 회원 상태 처리</p>
            <RadioGroup
              value={memberEvent}
              onValueChange={(v) => setMemberEvent(v as MemberEvent)}
              className="gap-2"
            >
              {MEMBER_EVENT_CHOICES.map((me) => (
                <Label
                  key={me}
                  htmlFor={`member-event-${me}`}
                  className="flex cursor-pointer items-start gap-3 rounded-md border bg-card p-2.5 hover:bg-accent"
                >
                  <RadioGroupItem
                    id={`member-event-${me}`}
                    value={me}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{memberEventLabel[me]}</div>
                    <div className="text-xs text-muted-foreground">
                      {memberEventDescription[me]}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}

        {isDestructive && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {event === InquiryEvent.REJECT && isMemberStatus
              ? "반려 시 대상 회원 데이터가 완전히 삭제됩니다."
              : "되돌릴 수 없는 처리입니다."}
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
            disabled={!event || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "처리 중..." : "처리하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function rejectDescription(type: InquiryType): string {
  switch (type) {
    case InquiryType.MEMBER_STATUS:
      return "요청을 거절하고 대상 회원 데이터를 삭제합니다 (재신청 불가).";
    case InquiryType.PERFORMANCE_CHECK:
    case InquiryType.PERFORMANCE_DUPLICATE:
      return "요청을 거절하고 공연은 그대로 둡니다.";
    case InquiryType.GENERAL:
      return "요청을 거절하고 문의를 종료합니다.";
  }
}
