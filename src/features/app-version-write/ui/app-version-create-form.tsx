"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { AppPlatform, appPlatformLabel, isValidVersion } from "@/entities/app-version";
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
import { toDateParam } from "@/shared/lib/format";

import { useCreateAppVersion } from "../model/use-app-version-write";

/**
 * 앱 버전 등록.
 *
 * append-only 라 등록 후에는 `updateNote` 말고는 고칠 수 없고 삭제도 불가능하다 —
 * 버전 문자열·적용일자 오타를 되돌릴 방법이 없으므로 형식 검증을 앞단에서 건다.
 */
export function AppVersionCreateForm() {
  const [platform, setPlatform] = useState<AppPlatform>(AppPlatform.IOS);
  const [version, setVersion] = useState("");
  const [appliedDate, setAppliedDate] = useState(toDateParam(new Date()));
  const [updateNote, setUpdateNote] = useState("");
  const mutation = useCreateAppVersion();

  const versionOk = isValidVersion(version);
  const canSubmit = versionOk && appliedDate.length > 0 && !mutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate(
      {
        platform,
        version: version.trim(),
        appliedDate,
        ...(updateNote.trim() ? { updateNote: updateNote.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success(
            `${appPlatformLabel[platform]} ${version.trim()} 버전을 등록했습니다.`,
          );
          setVersion("");
          setUpdateNote("");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "버전 등록에 실패했습니다.");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="version-platform">플랫폼</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as AppPlatform)}>
            <SelectTrigger id="version-platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AppPlatform).map((p) => (
                <SelectItem key={p} value={p}>
                  {appPlatformLabel[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="version-number">
            버전 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="version-number"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.2.3"
            inputMode="decimal"
            autoComplete="off"
          />
          {version && !versionOk && (
            <p className="text-xs text-destructive">1.2.3 형식으로 입력하세요.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="version-applied">
            적용일자 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="version-applied"
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="version-note">업데이트 내역</Label>
        <Textarea
          id="version-note"
          value={updateNote}
          onChange={(e) => setUpdateNote(e.target.value)}
          placeholder="이번 버전에서 바뀐 내용을 적습니다. 등록 후에도 이 항목만은 수정할 수 있습니다."
          className="min-h-24"
        />
      </div>

      <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        등록한 이력은 삭제할 수 없고 버전·적용일자도 수정할 수 없습니다. 오타가 나면
        올바른 값으로 한 건 더 등록해 최신 이력으로 덮는 방법뿐입니다.
      </p>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          {mutation.isPending ? "등록 중..." : "버전 등록"}
        </Button>
      </div>
    </form>
  );
}
