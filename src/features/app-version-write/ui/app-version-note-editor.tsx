"use client";

import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
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
import { Textarea } from "@/shared/ui/textarea";

import { useUpdateAppVersionNote } from "../model/use-app-version-write";

interface AppVersionNoteEditorProps {
  versionId: number;
  versionLabel: string;
  currentNote: string | null;
}

/** 업데이트 내역 수정 — 백엔드가 허용하는 유일한 수정 항목이다. */
export function AppVersionNoteEditor({
  versionId,
  versionLabel,
  currentNote,
}: AppVersionNoteEditorProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(currentNote ?? "");
  const mutation = useUpdateAppVersionNote();

  const handleSave = () => {
    mutation.mutate(
      { id: versionId, updateNote: note.trim() },
      {
        onSuccess: () => {
          toast.success("업데이트 내역을 수정했습니다.");
          setOpen(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "수정에 실패했습니다.");
        },
      },
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setNote(currentNote ?? "");
          setOpen(true);
        }}
      >
        <Pencil />
        내역 수정
      </Button>

      <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>업데이트 내역 수정</DialogTitle>
            <DialogDescription>
              {versionLabel} — 버전 번호와 적용일자는 수정할 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-32"
            placeholder="업데이트 내역"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
