"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useDeletePerformance } from "../model/use-delete-performance";

interface DeletePerformanceButtonProps {
  performanceId: number;
  performanceTitle?: string | null;
  /** 이미 삭제된 공연이면 버튼을 비활성화 */
  disabled?: boolean;
}

/**
 * 공연 즉시 삭제.
 * 조건 없이 삭제되는 파괴적 동작이라 제목 재입력을 요구한다.
 */
export function DeletePerformanceButton({
  performanceId,
  performanceTitle,
  disabled = false,
}: DeletePerformanceButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const mutation = useDeletePerformance();

  const expected = performanceTitle ?? String(performanceId);
  const canDelete = confirmText.trim() === expected.trim();

  const handleDelete = () => {
    if (!canDelete) return;
    mutation.mutate(performanceId, {
      onSuccess: () => {
        toast.success("공연을 삭제했습니다.");
        setOpen(false);
        router.push("/performances");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "공연 삭제에 실패했습니다.");
      },
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => {
          setConfirmText("");
          setOpen(true);
        }}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 />
        삭제
      </Button>

      <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공연 삭제</DialogTitle>
            <DialogDescription>
              이 공연을 즉시 삭제합니다. 크리에이터의 삭제 요청 승인과 달리 조건 없이
              바로 반영되며 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            확인을 위해 공연 제목을 그대로 입력하세요.
          </p>

          <div className="space-y-2">
            <Label htmlFor="confirm-title">
              <span className="font-mono text-xs">{expected}</span>
            </Label>
            <Input
              id="confirm-title"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="공연 제목 입력"
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "삭제 중..." : "삭제하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
