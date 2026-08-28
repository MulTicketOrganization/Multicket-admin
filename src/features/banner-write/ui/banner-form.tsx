"use client";

import { useId, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { validateBannerDraft, type Banner, type BannerWriteRequest } from "@/entities/banner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toDateTimeLocalValue, toLocalDateTimeParam } from "@/shared/lib/format";

import { useCreateBanner, useUpdateBanner } from "../model/use-banner-write";

interface BannerFormProps {
  /** 넘기면 수정 모드 */
  banner?: Banner;
  /** 수정 다이얼로그에서 저장 후 닫기 */
  onSaved?: () => void;
}

/**
 * 배너 등록/수정 폼.
 *
 * 수정은 전량 교체(PATCH 가 모든 필수 필드를 요구)라 등록과 같은 폼을 쓴다.
 * 노출 순서(displayOrder)는 백엔드 스키마에 없어 여기서 정할 수 없다 —
 * TODO.md 1.10 참고.
 */
export function BannerForm({ banner, onSaved }: BannerFormProps) {
  const isEdit = Boolean(banner);
  // 등록 폼과 수정 다이얼로그가 한 화면에 같이 뜨므로 id 가 겹치면 안 된다
  const fieldId = useId();

  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? "");
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl ?? "");
  const [exposureStartDate, setExposureStartDate] = useState(
    toDateTimeLocalValue(banner?.exposureStartDate),
  );
  const [exposureEndDate, setExposureEndDate] = useState(
    toDateTimeLocalValue(banner?.exposureEndDate),
  );

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner(banner?.id ?? 0);
  const mutation = isEdit ? updateMutation : createMutation;

  const validationError = validateBannerDraft({
    imageUrl,
    linkUrl,
    exposureStartDate,
    exposureEndDate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError || mutation.isPending) return;

    const body: BannerWriteRequest = {
      imageUrl: imageUrl.trim(),
      exposureStartDate: toLocalDateTimeParam(exposureStartDate)!,
      exposureEndDate: toLocalDateTimeParam(exposureEndDate)!,
      ...(linkUrl.trim() ? { linkUrl: linkUrl.trim() } : {}),
    };

    mutation.mutate(body, {
      onSuccess: () => {
        toast.success(isEdit ? "배너를 수정했습니다." : "배너를 등록했습니다.");
        if (isEdit) {
          onSaved?.();
        } else {
          setImageUrl("");
          setLinkUrl("");
          setExposureStartDate("");
          setExposureEndDate("");
        }
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : isEdit
              ? "배너 수정에 실패했습니다."
              : "배너 등록에 실패했습니다.",
        );
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${fieldId}-image`}>
          이미지 URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${fieldId}-image`}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://cdn.multicket.com/banners/summer.png"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${fieldId}-link`}>링크 URL</Label>
        <Input
          id={`${fieldId}-link`}
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="비워두면 클릭해도 이동하지 않습니다."
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${fieldId}-start`}>
            노출 시작 <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${fieldId}-start`}
            type="datetime-local"
            value={exposureStartDate}
            onChange={(e) => setExposureStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${fieldId}-end`}>
            노출 종료 <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${fieldId}-end`}
            type="datetime-local"
            value={exposureEndDate}
            onChange={(e) => setExposureEndDate(e.target.value)}
          />
        </div>
      </div>

      {imageUrl && !validationError && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">미리보기</span>
          {/* 외부 CDN 이라 next/image 최적화 대상이 아니다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="배너 미리보기"
            className="max-h-40 w-full rounded-md border object-contain"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {validationError && (
          <span className="mr-auto text-xs text-destructive">{validationError}</span>
        )}
        <Button type="submit" disabled={Boolean(validationError) || mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : isEdit ? (
            <Save />
          ) : (
            <Plus />
          )}
          {mutation.isPending ? "저장 중..." : isEdit ? "수정 저장" : "배너 등록"}
        </Button>
      </div>
    </form>
  );
}
