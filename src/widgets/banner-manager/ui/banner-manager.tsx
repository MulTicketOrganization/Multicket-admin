"use client";

import { ExternalLink, Images } from "lucide-react";

import {
  bannerExposure,
  bannerExposureLabel,
  bannerExposureVariant,
  onAirBanners,
  useBanners,
  type Banner,
} from "@/entities/banner";
import { BannerDeleteButton, BannerEditButton, BannerForm } from "@/features/banner-write";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatDateTime } from "@/shared/lib/format";

const COLUMN_COUNT = 6;

export function BannerManager() {
  const { data, isPending, isError, error } = useBanners();
  const banners = data ?? [];
  const onAir = onAirBanners(banners);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-center gap-2">
            <Images className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              지금 앱 홈에 노출중인 배너
            </span>
          </div>
          {isPending ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className="text-2xl font-semibold tabular-nums tracking-tight">
              {onAir.length}건
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            전체 {banners.length}건 중 노출 기간에 걸린 건수입니다.
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 py-5">
          <header className="space-y-1">
            <h3 className="text-sm font-semibold">배너 등록</h3>
            <p className="text-xs text-muted-foreground">
              앱은 <code className="font-mono">GET /banner</code> 로 노출 기간에 걸린
              배너만 가져가 홈 하단 캐러셀로 돌립니다.
            </p>
          </header>
          <BannerForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">등록된 배너</h3>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-32">이미지</TableHead>
                <TableHead>링크</TableHead>
                <TableHead className="w-56">노출 기간</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <SkeletonRows count={3} />
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {error instanceof Error
                      ? error.message
                      : "배너를 불러오지 못했습니다."}
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    등록된 배너가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((b) => <BannerRow key={b.id} banner={b} />)
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function BannerRow({ banner: b }: { banner: Banner }) {
  const exposure = bannerExposure(b);

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">{b.id}</TableCell>
      <TableCell>
        {/* 외부 CDN 이라 next/image 최적화 대상이 아니다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.imageUrl}
          alt=""
          className="h-12 w-24 rounded border object-cover"
          loading="lazy"
        />
      </TableCell>
      <TableCell className="text-sm">
        {b.linkUrl ? (
          <a
            href={b.linkUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 break-all hover:text-primary hover:underline underline-offset-4"
          >
            {b.linkUrl}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">링크 없음</span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(b.exposureStartDate)}
        <br />~ {formatDateTime(b.exposureEndDate)}
      </TableCell>
      <TableCell>
        <Badge variant={bannerExposureVariant[exposure]}>
          {bannerExposureLabel[exposure]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <BannerEditButton banner={b} />
          <BannerDeleteButton bannerId={b.id} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full max-w-32" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
