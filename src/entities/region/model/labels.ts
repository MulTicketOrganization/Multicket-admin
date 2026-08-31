import { Area, Region } from "./types";

export const areaLabel: Record<Area, string> = {
  [Area.SEOUL]: "서울특별시",
  [Area.INCHEON]: "인천광역시",
  [Area.DAEJEON]: "대전광역시",
  [Area.DAEGU]: "대구광역시",
  [Area.GWANGJU]: "광주광역시",
  [Area.BUSAN]: "부산광역시",
  [Area.ULSAN]: "울산광역시",
  [Area.SEJONG]: "세종특별자치시",
  [Area.GYEONGGI]: "경기도",
  [Area.CHUNGBUK]: "충청북도",
  [Area.CHUNGNAM]: "충청남도",
  [Area.GYEONGBUK]: "경상북도",
  [Area.GYEONGNAM]: "경상남도",
  [Area.JEONBUK]: "전북특별자치도",
  [Area.JEONNAM]: "전라남도",
  [Area.GANGWON]: "강원특별자치도",
  [Area.JEJU]: "제주특별자치도",
  [Area.DAEHAKRO]: "대학로",
  [Area.ETC]: "기타",
};

export const regionLabel: Record<Region, string> = {
  [Region.SEOUL]: "서울특별시",
  [Region.INCHEON]: "인천광역시",
  [Region.GYEONGGI]: "경기도",
  [Region.DAEJEON]: "대전광역시",
  [Region.SEJONG]: "세종특별자치시",
  [Region.CHUNGBUK]: "충청북도",
  [Region.CHUNGNAM]: "충청남도",
  [Region.DAEGU]: "대구광역시",
  [Region.BUSAN]: "부산광역시",
  [Region.ULSAN]: "울산광역시",
  [Region.GYEONGBUK]: "경상북도",
  [Region.GYEONGNAM]: "경상남도",
  [Region.GWANGJU_JEONNAM]: "광주 · 전남",
  [Region.JEONBUK]: "전북특별자치도",
  [Region.GANGWON]: "강원특별자치도",
  [Region.JEJU]: "제주특별자치도",
  [Region.DAEHAKRO]: "대학로",
  [Region.ETC]: "기타",
};

/** 백엔드가 코드를 추가해도 화면이 깨지지 않도록 미지의 값은 그대로 보여준다 */
export function formatArea(area: string): string {
  return areaLabel[area as Area] ?? area;
}

export function formatRegion(region: string): string {
  return regionLabel[region as Region] ?? region;
}
