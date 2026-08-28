"use client";

import { Loader2 } from "lucide-react";

import {
  ConsentType,
  byConsentType,
  consentTypeLabel,
  flattenConsentDocumentPages,
  formatConsentVersion,
  isRequiredConsent,
  useConsentDocumentList,
  useCurrentConsentDocuments,
  type ConsentDocument,
} from "@/entities/consent-document";
import { ConsentDocumentViewButton } from "@/features/consent-document-view";
import { ConsentDocumentPublishForm } from "@/features/consent-document-write";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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

const COLUMN_COUNT = 6;
const PREVIEW_LENGTH = 80;

export function ConsentDocumentManager() {
  const query = useConsentDocumentList();
  const documents = query.data ? flattenConsentDocumentPages(query.data.pages) : [];

  /**
   * 타입별 현재 버전은 앱이 실제로 받아가는 공개 endpoint 에서 가져온다.
   * 관리자 이력은 커서 페이지네이션이라 아직 안 불러온 페이지에 최신 버전이
   * 있을 수 있어 거기서 골라내면 안 된다.
   */
  const currentQuery = useCurrentConsentDocuments();
  const currentByType = byConsentType(currentQuery.data ?? []);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Object.values(ConsentType).map((t) => (
          <CurrentDocumentCard
            key={t}
            type={t}
            document={currentByType[t] ?? null}
            loading={currentQuery.isPending}
          />
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 py-5">
          <header className="space-y-1">
            <h3 className="text-sm font-semibold">새 버전 발행</h3>
            <p className="text-xs text-muted-foreground">
              등록과 수정을 구분하지 않는 단일 API 입니다. 저장하면 현재 버전이 폐기되고
              새 버전으로 교체됩니다.
            </p>
          </header>
          <ConsentDocumentPublishForm currentByType={currentByType} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">발행 이력</h3>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-44">약관 타입</TableHead>
                <TableHead className="w-20">버전</TableHead>
                <TableHead>본문 미리보기</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isPending ? (
                <SkeletonRows count={4} />
              ) : query.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {query.error instanceof Error
                      ? query.error.message
                      : "약관 이력을 불러오지 못했습니다."}
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    발행된 약관이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((d) => <DocumentRow key={d.id} document={d} />)
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              총 {documents.length}건 로드됨{query.hasNextPage ? " (더 있음)" : ""}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void query.fetchNextPage()}
              disabled={!query.hasNextPage || query.isFetchingNextPage}
            >
              {query.isFetchingNextPage && <Loader2 className="animate-spin" />}
              {query.hasNextPage
                ? query.isFetchingNextPage
                  ? "불러오는 중..."
                  : "더 보기"
                : "마지막"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CurrentDocumentCard({
  type,
  document,
  loading,
}: {
  type: ConsentType;
  document: ConsentDocument | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {consentTypeLabel[type]}
          </span>
          <Badge variant={isRequiredConsent(type) ? "secondary" : "outline"}>
            {isRequiredConsent(type) ? "필수" : "선택"}
          </Badge>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {document ? formatConsentVersion(document.version) : "미발행"}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {document ? `문서 #${document.id}` : "아직 발행된 본문이 없습니다"}
        </span>
      </CardContent>
    </Card>
  );
}

function DocumentRow({ document: d }: { document: ConsentDocument }) {
  const preview = d.content.replace(/\s+/g, " ").trim();

  return (
    <TableRow className={d.deleted ? "opacity-60" : undefined}>
      <TableCell className="font-mono text-xs text-muted-foreground">{d.id}</TableCell>
      <TableCell className="text-sm">{consentTypeLabel[d.type]}</TableCell>
      <TableCell className="font-medium tabular-nums">
        {formatConsentVersion(d.version)}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {preview.length > PREVIEW_LENGTH
          ? `${preview.slice(0, PREVIEW_LENGTH)}…`
          : preview || "-"}
      </TableCell>
      <TableCell>
        <Badge variant={d.deleted ? "muted" : "success"}>
          {d.deleted ? "폐기됨" : "현재 버전"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <ConsentDocumentViewButton document={d} />
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
