"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { NoticeType, noticeTypeDescription, noticeTypeLabel } from "@/entities/notice";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import { useCreateNotice } from "../model/use-create-notice";

interface NoticeCreateFormProps {
  /** 초기 선택 타입 */
  defaultType?: NoticeType;
}

/**
 * 공고 등록 폼.
 * 백엔드는 append-only — 저장할 때마다 새 이력이 쌓이고 최신 것이 노출된다.
 */
export function NoticeCreateForm({
  defaultType = NoticeType.CANCEL_REFUND_PAID,
}: NoticeCreateFormProps) {
  const [type, setType] = useState<NoticeType>(defaultType);
  const [content, setContent] = useState("");
  const mutation = useCreateNotice();

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && !mutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate(
      { type, content: trimmed },
      {
        onSuccess: () => {
          toast.success(`"${noticeTypeLabel[type]}" 공고를 등록했습니다.`);
          setContent("");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "공고 등록에 실패했습니다.");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notice-type">공고 타입</Label>
        <Select value={type} onValueChange={(v) => setType(v as NoticeType)}>
          <SelectTrigger id="notice-type" className="sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(NoticeType).map((t) => (
              <SelectItem key={t} value={t}>
                {noticeTypeLabel[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{noticeTypeDescription[type]}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notice-content">내용</Label>
        <Textarea
          id="notice-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="공고 내용을 입력하세요. 줄바꿈은 그대로 유지됩니다."
          className="min-h-40"
        />
        <p className="text-xs text-muted-foreground">
          기존 공고는 수정되지 않고 새 이력으로 쌓입니다. 사용자에게는 가장 최근 공고가
          노출됩니다.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send />}
          {mutation.isPending ? "등록 중..." : "공고 등록"}
        </Button>
      </div>
    </form>
  );
}
