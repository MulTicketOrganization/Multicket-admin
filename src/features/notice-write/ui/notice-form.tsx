"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";

import { appPlatformLabel, useAppVersions } from "@/entities/app-version";
import { MemberType, memberTypeLabel } from "@/entities/member";
import {
  NoticePlatform,
  NoticeType,
  UpdatePolicy,
  noticePlatformLabel,
  noticeTypeDescription,
  noticeTypeLabel,
  requiresMaintenanceStart,
  requiresTargetPlatforms,
  requiresUpdatePolicy,
  updatePolicyDescription,
  updatePolicyLabel,
  validateNoticeDraft,
  type NoticeDetail,
  type NoticeWriteRequest,
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
import { cn } from "@/shared/lib/utils";
import { toDateTimeLocalValue, toLocalDateTimeParam } from "@/shared/lib/format";

import { useCreateNotice, useUpdateNotice } from "../model/use-notice-write";

interface NoticeFormProps {
  /** 넘기면 수정 모드 */
  notice?: NoticeDetail;
  /** 저장 후 이동할 경로. 없으면 그 자리에 머문다 (등록 폼은 입력만 비운다) */
  redirectTo?: string;
}

/**
 * 공고 등록/수정 폼.
 *
 * 백엔드는 타입별로 필수 필드가 다르다 —
 * APP_UPDATE 는 `updatePolicy`, 점검/긴급/업데이트는 `targetPlatforms`,
 * MAINTENANCE 는 `maintenanceStartDate` 를 요구한다.
 * 조건을 못 채우면 400 이 나므로 제출 전에 막는다.
 */
export function NoticeForm({ notice, redirectTo }: NoticeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(notice);

  const [type, setType] = useState<NoticeType>(notice?.type ?? NoticeType.CANCEL_REFUND_PAID);
  const [title, setTitle] = useState(notice?.title ?? "");
  const [content, setContent] = useState(notice?.content ?? "");
  const [expireDate, setExpireDate] = useState(toDateTimeLocalValue(notice?.expireDate));
  const [maintenanceStartDate, setMaintenanceStartDate] = useState(
    toDateTimeLocalValue(notice?.maintenanceStartDate),
  );
  const [updatePolicy, setUpdatePolicy] = useState<UpdatePolicy | undefined>(
    notice?.updatePolicy ?? undefined,
  );
  const [platforms, setPlatforms] = useState<NoticePlatform[]>(
    notice?.targetPlatforms ?? [],
  );
  const [memberType, setMemberType] = useState<MemberType>(
    notice?.memberType ?? MemberType.AUDIENCE,
  );
  const [appVersionId, setAppVersionId] = useState<number | null>(
    notice?.appVersion?.id ?? null,
  );

  // appVersionId 는 모든 타입에 필수라 등록 폼에서 항상 이력을 불러온다
  const appVersionQuery = useAppVersions();
  const appVersions = appVersionQuery.data ?? [];

  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice(notice?.id ?? 0);
  const mutation = isEdit ? updateMutation : createMutation;

  const needsPolicy = requiresUpdatePolicy(type);
  const needsPlatforms = requiresTargetPlatforms(type);
  const needsMaintenanceStart = requiresMaintenanceStart(type);

  const draft = {
    type,
    title,
    content,
    expireDate,
    updatePolicy: needsPolicy ? updatePolicy : undefined,
    targetPlatforms: needsPlatforms ? platforms : undefined,
    maintenanceStartDate: needsMaintenanceStart ? maintenanceStartDate : undefined,
    appVersionId,
  };
  const validationError = validateNoticeDraft(draft);

  const togglePlatform = (p: NoticePlatform) => {
    setPlatforms((prev) => {
      // ALL 은 다른 값과 함께 쓸 이유가 없으므로 단독 선택으로 다룬다
      if (p === NoticePlatform.ALL) return prev.includes(p) ? [] : [NoticePlatform.ALL];
      const withoutAll = prev.filter((v) => v !== NoticePlatform.ALL);
      return withoutAll.includes(p)
        ? withoutAll.filter((v) => v !== p)
        : [...withoutAll, p];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError || mutation.isPending) return;

    const body: NoticeWriteRequest = {
      type,
      title: title.trim(),
      content: content.trim(),
      expireDate: toLocalDateTimeParam(expireDate)!,
      ...(needsPolicy && updatePolicy ? { updatePolicy } : {}),
      ...(needsPlatforms ? { targetPlatforms: platforms } : {}),
      ...(needsMaintenanceStart
        ? { maintenanceStartDate: toLocalDateTimeParam(maintenanceStartDate) }
        : {}),
      memberType,
      appVersionId: appVersionId!,
    };

    mutation.mutate(body, {
      onSuccess: () => {
        toast.success(
          isEdit
            ? `"${title.trim()}" 공고를 수정했습니다.`
            : `"${noticeTypeLabel[type]}" 공고를 등록했습니다.`,
        );
        if (redirectTo) {
          router.push(redirectTo);
          return;
        }
        if (!isEdit) {
          setTitle("");
          setContent("");
          setExpireDate("");
          setMaintenanceStartDate("");
          setPlatforms([]);
          setUpdatePolicy(undefined);
          setMemberType(MemberType.AUDIENCE);
          setAppVersionId(null);
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="notice-type">공고 타입</Label>
          <Select value={type} onValueChange={(v) => setType(v as NoticeType)}>
            <SelectTrigger id="notice-type">
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
          <Label htmlFor="notice-expire">
            {needsMaintenanceStart ? "점검 종료(만료) 시각" : "만료 시각"}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="notice-expire"
            type="datetime-local"
            value={expireDate}
            onChange={(e) => setExpireDate(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            이 시각이 지나면 사용자에게 노출되지 않습니다. 등록 후에도 수정·삭제할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="notice-member-type">
            공지 대상자 <span className="text-destructive">*</span>
          </Label>
          <Select value={memberType} onValueChange={(v) => setMemberType(v as MemberType)}>
            <SelectTrigger id="notice-member-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MemberType).map((m) => (
                <SelectItem key={m} value={m}>
                  {memberTypeLabel[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            AUDIENCE(관객)를 고르면 창작자·관리자를 포함한 전원이 대상입니다.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notice-app-version">
            연결할 앱 버전 <span className="text-destructive">*</span>
          </Label>
          <Select
            value={appVersionId != null ? String(appVersionId) : ""}
            onValueChange={(v) => setAppVersionId(Number(v))}
            disabled={appVersions.length === 0}
          >
            <SelectTrigger id="notice-app-version">
              <SelectValue
                placeholder={
                  appVersionQuery.isPending
                    ? "버전 목록 불러오는 중..."
                    : appVersions.length === 0
                      ? "등록된 앱 버전이 없습니다"
                      : "선택하세요"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {appVersions.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {appPlatformLabel[v.platform]} {v.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            이 공고가 요구하는 앱 최소 버전입니다. 모든 타입에 필수라 앱 버전 관리에
            먼저 한 건 이상 등록돼 있어야 합니다.
          </p>
        </div>
      </div>

      {needsMaintenanceStart && (
        <div className="space-y-2 sm:max-w-[calc(50%-0.5rem)]">
          <Label htmlFor="notice-maintenance-start">
            점검 시작 일시 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="notice-maintenance-start"
            type="datetime-local"
            value={maintenanceStartDate}
            onChange={(e) => setMaintenanceStartDate(e.target.value)}
          />
        </div>
      )}

      {needsPolicy && (
        <div className="space-y-2">
          <Label htmlFor="notice-policy">
            업데이트 강제 여부 <span className="text-destructive">*</span>
          </Label>
          <Select
            value={updatePolicy ?? ""}
            onValueChange={(v) => setUpdatePolicy(v as UpdatePolicy)}
          >
            <SelectTrigger id="notice-policy" className="sm:w-80">
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(UpdatePolicy).map((p) => (
                <SelectItem key={p} value={p}>
                  {updatePolicyLabel[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {updatePolicy && (
            <p className="text-xs text-muted-foreground">
              {updatePolicyDescription[updatePolicy]}
            </p>
          )}
        </div>
      )}

      {needsPlatforms && (
        <div className="space-y-2">
          <Label>
            대상 플랫폼 <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.values(NoticePlatform).map((p) => {
              const active = platforms.includes(p);
              return (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  onClick={() => togglePlatform(p)}
                  className={cn(!active && "text-muted-foreground")}
                >
                  {noticePlatformLabel[p]}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            앱은 User-Agent 로 플랫폼을 판별합니다. 여기서 고르지 않은 플랫폼에는 공고가
            내려가지 않습니다.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notice-title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="notice-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="공지 제목"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notice-content">
          내용 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="notice-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="공고 내용을 입력하세요. 줄바꿈은 그대로 유지됩니다."
          className="min-h-40"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {validationError && (
          <span className="text-xs text-muted-foreground">{validationError}</span>
        )}
        <Button type="submit" disabled={Boolean(validationError) || mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : isEdit ? (
            <Save />
          ) : (
            <Send />
          )}
          {mutation.isPending ? "저장 중..." : isEdit ? "수정 저장" : "공고 등록"}
        </Button>
      </div>
    </form>
  );
}
