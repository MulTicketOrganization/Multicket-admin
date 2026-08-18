"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  NoticeType,
  noticeTypeDescription,
  noticeTypeLabel,
  requiresExpireDate,
} from "@/entities/notice";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
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
 * APP_UPDATE / URGENT 는 만료 시각을 함께 넣어야 앱 폴링 조회에 잡힌다.
 */
export function NoticeCreateForm({
  defaultType = NoticeType.CANCEL_REFUND_PAID,
}: NoticeCreateFormProps) {
  const [type, setType] = useState<NoticeType>(defaultType);
  const [content, setContent] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const mutation = useCreateNotice();

  const needsExpire = requiresExpireDate(type);
  const trimmed = content.trim();
  const canSubmit =
    trimmed.length > 0 && (!needsExpire || expireDate.length > 0) && !mutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate(
      {
        type,
        content: trimmed,
        // datetime-local 은 초가 없어 백엔드 LocalDateTime 포맷에 맞춰 보정한다
        ...(needsExpire ? { expireDate: `${expireDate}:00` } : {}),
      },
      {
        onSuccess: () => {
          toast.success(`"${noticeTypeLabel[type]}" 공고를 등록했습니다.`);
          setContent("");
          setExpireDate("");
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

      {needsExpire && (
        <div className="space-y-2">
          <Label htmlFor="notice-expire">
            노출 종료 시각 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="notice-expire"
            type="datetime-local"
            value={expireDate}
            onChange={(e) => setExpireDate(e.target.value)}
            className="sm:w-80"
          />
          <p className="text-xs text-muted-foreground">
            이 시각이 지나면 앱에서 자동으로 사라집니다. 공고를 지우는 API 가 없어
            <strong className="font-medium text-foreground"> 중간에 즉시 내릴 수는 없으니</strong>{" "}
            보수적으로 잡아주세요.
          </p>
        </div>
      )}

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
