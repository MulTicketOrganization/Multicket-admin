"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import {
  consentTypeLabel,
  formatConsentVersion,
  useConsentDocumentDetail,
  type ConsentDocument,
} from "@/entities/consent-document";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

/**
 * 약관 전문 보기.
 *
 * 폐기된 과거 버전도 id 로 조회할 수 있다 — 회원이 그 시점에 실제로 동의한 문구를
 * 감사 목적으로 확인해야 하기 때문. 목록에도 본문이 실려 오지만 전문은 길어서
 * 표에는 요약만 두고 열 때 한 건만 다시 받는다.
 */
export function ConsentDocumentViewButton({ document }: { document: ConsentDocument }) {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError, error } = useConsentDocumentDetail(document.id, open);

  const shown = data ?? document;

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <FileText />
        전문 보기
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {consentTypeLabel[shown.type]}
              <Badge variant="secondary">{formatConsentVersion(shown.version)}</Badge>
              {shown.deleted && <Badge variant="muted">폐기됨</Badge>}
            </DialogTitle>
            <DialogDescription>
              문서 ID #{shown.id}
              {shown.deleted
                ? " — 더 이상 현재 버전이 아닙니다. 감사 목적의 조회입니다."
                : " — 지금 사용자에게 노출되는 본문입니다."}
            </DialogDescription>
          </DialogHeader>

          {isError ? (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "약관 본문을 불러오지 못했습니다."}
            </p>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-md border bg-muted/30 p-4">
              {open && isPending ? (
                <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {shown.content}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
