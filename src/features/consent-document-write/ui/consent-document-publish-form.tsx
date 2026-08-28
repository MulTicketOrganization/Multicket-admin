"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  ConsentType,
  consentTypeDescription,
  consentTypeLabel,
  formatConsentVersion,
  validateConsentDraft,
  type ConsentDocument,
} from "@/entities/consent-document";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import { useCreateConsentDocument } from "../model/use-consent-document-write";

interface ConsentDocumentPublishFormProps {
  /** 타입별 현재 버전 — 몇 번째 버전으로 올라가는지 미리 보여주기 위해 받는다 */
  currentByType: Partial<Record<ConsentType, ConsentDocument>>;
}

/**
 * 약관 본문 등록 폼.
 *
 * 등록과 수정을 구분하지 않는 단일 API 라 "저장" 이 곧 **새 버전 발행**이다.
 * 해당 타입에 동의했던 회원 전원의 동의가 해제되므로 확인 다이얼로그를 한 단계 둔다.
 */
export function ConsentDocumentPublishForm({
  currentByType,
}: ConsentDocumentPublishFormProps) {
  const [type, setType] = useState<ConsentType>(ConsentType.SERVICE_TERMS);
  const [content, setContent] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = useCreateConsentDocument();

  const current = currentByType[type] ?? null;
  const nextVersion = current ? current.version + 0.1 : 1.0;
  const validationError = validateConsentDraft({ content });

  const publish = () => {
    mutation.mutate(
      { type, content: content.trim() },
      {
        onSuccess: () => {
          toast.success(
            `${consentTypeLabel[type]} ${formatConsentVersion(nextVersion)} 을 발행했습니다.`,
          );
          setContent("");
          setConfirmOpen(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "약관 발행에 실패했습니다.");
        },
      },
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!validationError) setConfirmOpen(true);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="consent-type">약관 타입</Label>
        <Select value={type} onValueChange={(v) => setType(v as ConsentType)}>
          <SelectTrigger id="consent-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ConsentType).map((t) => (
              <SelectItem key={t} value={t}>
                {consentTypeLabel[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{consentTypeDescription[type]}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consent-content">
          약관 본문 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="consent-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="사용자에게 그대로 노출될 약관 전문을 붙여 넣으세요."
          className="min-h-64 font-mono text-xs"
        />
        <p className="text-right text-[11px] text-muted-foreground">
          {content.length.toLocaleString("ko-KR")}자
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
        발행하면 {consentTypeLabel[type]} 의 현재 버전(
        {current ? formatConsentVersion(current.version) : "없음"})이 폐기되고{" "}
        {formatConsentVersion(nextVersion)} 으로 교체됩니다. 이 약관에 동의했던 회원
        전원의 동의가 해제되어 다시 동의를 받아야 합니다.
      </p>

      <div className="flex items-center justify-end gap-3">
        {validationError && (
          <span className="mr-auto text-xs text-destructive">{validationError}</span>
        )}
        <Button type="submit" disabled={Boolean(validationError) || mutation.isPending}>
          <Upload />
          {formatConsentVersion(nextVersion)} 발행
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => !mutation.isPending && setConfirmOpen(next)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{consentTypeLabel[type]} 새 버전 발행</DialogTitle>
            <DialogDescription>
              {formatConsentVersion(nextVersion)} 으로 발행합니다. 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            이 약관에 동의했던 회원 전원의 동의가 해제됩니다. 필수 약관이면 사용자는 앱
            재진입 시 다시 동의 절차를 거쳐야 합니다.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={publish} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "발행 중..." : "발행하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
