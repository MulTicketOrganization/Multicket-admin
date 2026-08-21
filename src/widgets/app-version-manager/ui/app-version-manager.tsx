"use client";

import { Smartphone } from "lucide-react";

import {
  AppPlatform,
  appPlatformLabel,
  currentVersionOf,
  isScheduled,
  useAppVersions,
  type AppVersion,
} from "@/entities/app-version";
import { AppVersionCreateForm, AppVersionNoteEditor } from "@/features/app-version-write";
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
import { formatDate, formatDateTime } from "@/shared/lib/format";

const COLUMN_COUNT = 5;

export function AppVersionManager() {
  const { data, isPending, isError, error } = useAppVersions();
  const versions = data ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.values(AppPlatform).map((p) => (
          <CurrentVersionCard
            key={p}
            platform={p}
            version={currentVersionOf(versions, p)}
            loading={isPending}
          />
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 py-5">
          <header className="space-y-1">
            <h3 className="text-sm font-semibold">버전 등록</h3>
            <p className="text-xs text-muted-foreground">
              앱은 <code className="font-mono">GET /app-version/current</code> 로 플랫폼별
              최신 적용 버전을 가져갑니다.
            </p>
          </header>
          <AppVersionCreateForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">등록 이력</h3>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-28">플랫폼</TableHead>
                <TableHead className="w-32">버전</TableHead>
                <TableHead className="w-32">적용일자</TableHead>
                <TableHead>업데이트 내역</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <SkeletonRows count={4} />
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {error instanceof Error
                      ? error.message
                      : "버전 이력을 불러오지 못했습니다."}
                  </TableCell>
                </TableRow>
              ) : versions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    등록된 버전이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                versions.map((v) => <VersionRow key={v.id} version={v} />)
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function CurrentVersionCard({
  platform,
  version,
  loading,
}: {
  platform: AppPlatform;
  version: AppVersion | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="flex items-center gap-2">
          <Smartphone className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {appPlatformLabel[platform]} 현재 버전
          </span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {version?.version ?? "미등록"}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {version ? `${formatDate(version.appliedDate)} 적용` : "등록된 버전이 없습니다"}
        </span>
      </CardContent>
    </Card>
  );
}

function VersionRow({ version: v }: { version: AppVersion }) {
  const scheduled = isScheduled(v);

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">{v.id}</TableCell>
      <TableCell className="text-sm">{appPlatformLabel[v.platform]}</TableCell>
      <TableCell className="font-medium tabular-nums">
        {v.version}
        {scheduled && (
          <Badge variant="warning" className="ml-2">
            예정
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(v.appliedDate)}
        <span className="ml-2 opacity-60">{formatDateTime(v.createDate)} 등록</span>
      </TableCell>
      <TableCell className="text-sm">
        <div className="flex items-start justify-between gap-2">
          <span className="whitespace-pre-wrap text-muted-foreground">
            {v.updateNote?.trim() || "-"}
          </span>
          <AppVersionNoteEditor
            versionId={v.id}
            versionLabel={`${appPlatformLabel[v.platform]} ${v.version}`}
            currentNote={v.updateNote}
          />
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
