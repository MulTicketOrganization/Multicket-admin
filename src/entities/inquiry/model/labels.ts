import { InquiryEvent, InquiryStatus, InquiryType } from "./types";

export const inquiryTypeLabel: Record<InquiryType, string> = {
  [InquiryType.MEMBER_STATUS]: "회원 상태",
  [InquiryType.PERFORMANCE_CHECK]: "공연 검수",
  [InquiryType.PERFORMANCE_DUPLICATE]: "공연 중복",
  [InquiryType.GENERAL]: "일반 문의",
};

export const inquiryTypeDescription: Record<InquiryType, string> = {
  [InquiryType.MEMBER_STATUS]: "회원 가입 승인/상태 변경 요청. 승인 시 적용할 회원 이벤트를 함께 선택해야 합니다.",
  [InquiryType.PERFORMANCE_CHECK]: "공연 등록 검수 요청입니다.",
  [InquiryType.PERFORMANCE_DUPLICATE]: "중복 등록된 공연 신고입니다.",
  [InquiryType.GENERAL]: "일반 문의입니다. 별도 연관 대상이 없습니다.",
};

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  [InquiryStatus.PENDING]: "대기",
  [InquiryStatus.COMPLETED]: "처리 완료",
  [InquiryStatus.REJECTED]: "반려",
};

export const inquiryStatusVariant = {
  [InquiryStatus.PENDING]: "warning",
  [InquiryStatus.COMPLETED]: "success",
  [InquiryStatus.REJECTED]: "destructive",
} as const satisfies Record<InquiryStatus, string>;

export const inquiryEventLabel: Record<InquiryEvent, string> = {
  [InquiryEvent.COMPLETE]: "승인 처리",
  [InquiryEvent.REJECT]: "반려",
};

/**
 * 문의 유형별 연관 대상 링크.
 * refId 가 가리키는 대상이 유형마다 달라서 여기서 한 번에 결정한다.
 */
export function inquiryRefHref(type: InquiryType, refId: number | null): string | null {
  if (refId == null) return null;
  switch (type) {
    case InquiryType.MEMBER_STATUS:
      return `/members/${refId}`;
    case InquiryType.PERFORMANCE_CHECK:
    case InquiryType.PERFORMANCE_DUPLICATE:
      return `/performances/${refId}`;
    case InquiryType.GENERAL:
      return null;
  }
}
