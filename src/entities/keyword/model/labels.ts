import { KeywordType } from "./types";

export const keywordTypeLabel: Record<KeywordType, string> = {
  [KeywordType.GENRE]: "장르 키워드",
  [KeywordType.ISDAEHAKRO]: "대학로 키워드",
  [KeywordType.OVERSEA]: "해외 키워드",
  [KeywordType.FREE]: "무료 키워드",
};

export const keywordTypeDescription: Record<KeywordType, string> = {
  [KeywordType.GENRE]: "GenreType 허용값만 등록할 수 있습니다.",
  [KeywordType.ISDAEHAKRO]: "대학로 필터 노출 여부를 결정합니다. DAEHAKRO 한 값만 씁니다.",
  [KeywordType.OVERSEA]: "해외 공연 국가 태그(CountryTag)입니다.",
  [KeywordType.FREE]:
    "무료 공연 필터 라벨입니다. 대응하는 필터 파라미터는 없고 앱이 price=0 으로 조회합니다.",
};

/** 키워드 코드의 한글 표기 — 코드 그대로 노출하면 운영자가 알아보기 어렵다 */
const KEYWORD_VALUE_LABEL: Record<string, string> = {
  PLAY: "연극",
  MUSICAL: "뮤지컬",
  CHILDREN_FAMILY: "아동·가족극",
  EXPERIMENTAL: "실험·창작극",
  SCHOOL: "학교공연",
  FESTIVAL: "축제",
  DAEHAKRO: "대학로",
  US: "미국",
  GB: "영국",
  EU: "유럽",
  ETC: "기타",
};

export function keywordValueLabel(value: string): string {
  return KEYWORD_VALUE_LABEL[value] ?? value;
}
