import { BannerExposure } from "./types";

export const bannerExposureLabel: Record<BannerExposure, string> = {
  [BannerExposure.UPCOMING]: "노출 예정",
  [BannerExposure.ON_AIR]: "노출중",
  [BannerExposure.ENDED]: "노출 종료",
};

export const bannerExposureVariant = {
  [BannerExposure.UPCOMING]: "warning",
  [BannerExposure.ON_AIR]: "success",
  [BannerExposure.ENDED]: "muted",
} as const satisfies Record<BannerExposure, string>;
