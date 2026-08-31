/**
 * 지역 어휘.
 *
 * 백엔드가 **서로 다른 두 벌**을 쓴다 — 섞으면 안 된다.
 *
 * - `Area`: 공연 상세 응답(`AdminPerformanceDetailResponse.area`)의 시/도 코드.
 *   광주(`GWANGJU`)와 전남(`JEONNAM`) 이 따로 있다.
 * - `Region`: 공연 목록 필터(`?region=`)와 회원의 선호 지역(`region`).
 *   광주·전남이 `GWANGJU_JEONNAM` 하나로 합쳐져 있고 `GWANGJU`/`JEONNAM` 은 없다.
 *
 * 공연 상세의 `area` 를 그대로 목록 필터에 넘기면 광주/전남 두 값에서 400 이 난다.
 */

/** 공연 상세 응답의 `area` — 시/도 단위 코드 */
export const Area = {
  SEOUL: "SEOUL",
  INCHEON: "INCHEON",
  DAEJEON: "DAEJEON",
  DAEGU: "DAEGU",
  GWANGJU: "GWANGJU",
  BUSAN: "BUSAN",
  ULSAN: "ULSAN",
  SEJONG: "SEJONG",
  GYEONGGI: "GYEONGGI",
  CHUNGBUK: "CHUNGBUK",
  CHUNGNAM: "CHUNGNAM",
  GYEONGBUK: "GYEONGBUK",
  GYEONGNAM: "GYEONGNAM",
  JEONBUK: "JEONBUK",
  JEONNAM: "JEONNAM",
  GANGWON: "GANGWON",
  JEJU: "JEJU",
  DAEHAKRO: "DAEHAKRO",
  ETC: "ETC",
} as const;
export type Area = (typeof Area)[keyof typeof Area];

/**
 * 공연 목록 필터 `region` · 회원 선호 지역 `region`.
 * 백엔드가 노출하는 순서(수도권 → 충청 → 영남 → 호남 → 그 외)를 그대로 따른다.
 */
export const Region = {
  SEOUL: "SEOUL",
  INCHEON: "INCHEON",
  GYEONGGI: "GYEONGGI",
  DAEJEON: "DAEJEON",
  SEJONG: "SEJONG",
  CHUNGBUK: "CHUNGBUK",
  CHUNGNAM: "CHUNGNAM",
  DAEGU: "DAEGU",
  BUSAN: "BUSAN",
  ULSAN: "ULSAN",
  GYEONGBUK: "GYEONGBUK",
  GYEONGNAM: "GYEONGNAM",
  GWANGJU_JEONNAM: "GWANGJU_JEONNAM",
  JEONBUK: "JEONBUK",
  GANGWON: "GANGWON",
  JEJU: "JEJU",
  DAEHAKRO: "DAEHAKRO",
  ETC: "ETC",
} as const;
export type Region = (typeof Region)[keyof typeof Region];
