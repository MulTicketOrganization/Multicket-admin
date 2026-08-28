"use client";

import { useState } from "react";
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

import { useDeleteBanner } from "../model/use-banner-write";

/**
 * 배너 삭제.
 * 백엔드가 하드 삭제라 복구 경로가 없어 한 단계 확인을 둔다.
 * (노출만 끊고 싶으면 종료 일시를 과거로 수정하는 편이 안전하다)
 */
export function BannerDeleteButton({ bannerId }: { bannerId: number }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeleteBanner();

  const handleDelete = () => {
    mutation.mutate(bannerId, {
      onSuccess: () => {
        toast.success("배너를 삭제했습니다.");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "배너 삭제에 실패했습니다.");
      },
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 />
        삭제
      </Button>

      <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배너 삭제</DialogTitle>
            <DialogDescription>
              #{bannerId} 배너를 삭제합니다.
            </DialogDescription>
          </DialogHeader>

          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            하드 삭제라 되돌릴 수 없습니다. 노출만 멈추려면 삭제 대신 노출 종료 일시를
            과거로 수정하세요.
          </p>

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
              disabled={mutation.isPending}
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
