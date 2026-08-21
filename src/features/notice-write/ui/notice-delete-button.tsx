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

import { useDeleteNotice } from "../model/use-notice-write";

interface NoticeDeleteButtonProps {
  noticeId: number;
  noticeTitle: string;
}

/**
 * 공고 삭제.
 * 백엔드가 **하드 삭제**라 복구 경로가 없어 한 단계 확인을 둔다.
 * (노출만 끊고 싶으면 만료 시각을 과거로 수정하는 편이 안전하다)
 */
export function NoticeDeleteButton({ noticeId, noticeTitle }: NoticeDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const mutation = useDeleteNotice();

  const handleDelete = () => {
    mutation.mutate(noticeId, {
      onSuccess: () => {
        toast.success("공고를 삭제했습니다.");
        setOpen(false);
        router.push("/notices");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "공고 삭제에 실패했습니다.");
      },
    });
  };

  return (
    <>
      <Button
        variant="outline"
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
            <DialogTitle>공고 삭제</DialogTitle>
            <DialogDescription>
              &ldquo;{noticeTitle}&rdquo; 공고를 삭제합니다.
            </DialogDescription>
          </DialogHeader>

          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            하드 삭제라 되돌릴 수 없습니다. 노출만 멈추려면 삭제 대신 만료 시각을 과거로
            수정하세요.
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
