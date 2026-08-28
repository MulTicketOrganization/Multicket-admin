"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import type { Banner } from "@/entities/banner";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { BannerForm } from "./banner-form";

/**
 * 배너 수정 다이얼로그.
 * 목록이 모든 필드를 담고 있어 상세를 다시 조회하지 않고 행 값으로 폼을 채운다.
 */
export function BannerEditButton({ banner }: { banner: Banner }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil />
        수정
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배너 수정</DialogTitle>
            <DialogDescription>
              전량 교체 방식이라 비운 항목은 지워집니다. 모든 필수 값을 다시 확인하세요.
            </DialogDescription>
          </DialogHeader>
          {/* 다이얼로그를 닫았다 열면 폼이 서버 값으로 다시 초기화되도록 key 를 준다 */}
          {open && (
            <BannerForm
              key={`${banner.id}-${banner.imageUrl}-${banner.exposureStartDate}`}
              banner={banner}
              onSaved={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
