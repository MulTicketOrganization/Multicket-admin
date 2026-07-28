import { KeywordType } from "./types";

export const keywordTypeLabel: Record<KeywordType, string> = {
  [KeywordType.GENRE]: "장르 키워드",
  [KeywordType.ELSE]: "기타 키워드",
};

export const keywordTypeDescription: Record<KeywordType, string> = {
  [KeywordType.GENRE]: "서버가 허용하는 장르값만 등록할 수 있습니다.",
  [KeywordType.ELSE]: "추천·인기 등 자유 키워드입니다.",
};
