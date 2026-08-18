"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import {
  OPINION_MAX_LENGTH,
  ReportEvent,
  isValidOpinion,
  reportEventDescription,
  reportEventLabel,
  type ReportDetail,
} from "@/entities/report";
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
import { Textarea } from "@/shared/ui/textarea";

import { useProcessReport } from "../model/use-process-report";

interface ProcessReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportDetail;
}

export function ProcessReportDialog({
  open,
  onOpenChange,
  report,
}: ProcessReportDialogProps) {
  const [event, setEvent] = useState<ReportEvent | null>(null);
  const [opinion, setOpinion] = useState("");
  const [notifyCreator, setNotifyCreator] = useState(false);

  // 다이얼로그가 열릴 때마다 초기화 (effect 대신 렌더 중 상태 조정)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setEvent(null);
      setOpinion("");
      setNotifyCreator(false);
    }
  }

  const mutation = useProcessReport(report.id);
  const opinionValid = isValidOpinion(opinion);
  const canSubmit = Boolean(event) && opinionValid && !mutation.isPending;

  const handleSubmit = () => {
    if (!event || !opinionValid) return;
    mutation.mutate(
      { event, opinion: opinion.trim(), notifyCreator },
      {
        onSuccess: () => {
          toast.success(`신고를 "${reportEventLabel[event]}" 처리했습니다.`);
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "신고 처리에 실패했습니다.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신고 처리</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{report.performanceTitle}</span>
            {" 공연에 대한 신고를 처리합니다. 처리 후에는 되돌릴 수 없습니다."}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={event ?? ""}
          onValueChange={(v) => setEvent(v as ReportEvent)}
          className="gap-3"
        >
          {Object.values(ReportEvent).map((e) => (
            <Label
              key={e}
              htmlFor={`report-event-${e}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent"
            >
              <RadioGroupItem id={`report-event-${e}`} value={e} className="mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{reportEventLabel[e]}</div>
                <div className="text-xs text-muted-foreground">
                  {reportEventDescription[e]}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>

        <div className="space-y-1.5">
          <Label htmlFor="report-opinion">
            관리자 소견 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="report-opinion"
            rows={4}
            value={opinion}
            maxLength={OPINION_MAX_LENGTH}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="처리 판단의 근거를 남겨주세요. 신고자에게 발송되는 안내 메일에 함께 담깁니다."
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>필수 입력 항목입니다.</span>
            <span className="tabular-nums">
              {opinion.trim().length} / {OPINION_MAX_LENGTH}
            </span>
          </div>
        </div>

        <Label
          htmlFor="report-notify-creator"
          className="flex cursor-pointer items-start gap-3 rounded-md border bg-muted/30 p-3 hover:bg-accent"
        >
          <input
            id="report-notify-creator"
            type="checkbox"
            checked={notifyCreator}
            onChange={(e) => setNotifyCreator(e.target.checked)}
            className="mt-0.5 size-4 accent-foreground"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Mail className="size-3.5" />
              창작자에게도 결과 안내
            </div>
            <div className="text-xs text-muted-foreground">
              신고자에게는 항상 메일이 나갑니다. 같은 공연에 중복 신고가 쌓여 있으면
              창작자에게 같은 메일이 반복 발송되니 필요한 건에서만 켜세요.
            </div>
          </div>
        </Label>

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
            variant={event === ReportEvent.COMPLETE ? "default" : "outline"}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "처리 중..." : "처리하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
