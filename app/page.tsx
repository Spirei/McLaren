import HomeShowcase from "@/components/showcase/HomeShowcase";
import { DEFAULT_SHOWCASE_MODEL } from "@/components/showcase/presets/models";
import { listShowcaseOptions } from "@/lib/showcaseModels";
import { parsePrefsCookie, PREFS_COOKIE } from "@/lib/prefsCookie";
import { readThemeFromCookieHeader } from "@/lib/theme";
import { cookies, headers } from "next/headers";

/**
 * 首页：整页是单屏 3D 展示台（章节导航 / 滚轮切换镜头）。
 *
 * 车型清单 = 内置（MCL35M 随仓库分发）+ 手动导入（uploads 卷里的 showroom.json）。
 * 素材缺失的车型直接不进清单，避免访客看到点不动的空车型。
 */
export default async function HomePage() {
  const all = listShowcaseOptions();
  const present = all.filter((item) => item.present);
  const models = present.map(({ id, label, note, config }) => ({
    id,
    label,
    note,
    config
  }));
  const headerList = await headers();
  const cookie = headerList.get("cookie") ?? "";
  const savedModel = parsePrefsCookie((await cookies()).get(PREFS_COOKIE)?.value)["fire:showcase:model"];
  const preferred = typeof savedModel === "string" && models.some((item) => item.id === savedModel)
    ? savedModel
    : models.some((item) => item.id === DEFAULT_SHOWCASE_MODEL) ? DEFAULT_SHOWCASE_MODEL : models[0]?.id;
  return (
    <HomeShowcase
      models={models}
      canImport
      defaultModelId={preferred}
      // 主题走服务端首帧：浅色用户刷新时不会再先渲染一屏深色（舞台自己只有挂载后才知道 localStorage）
      initialTheme={readThemeFromCookieHeader(cookie)}
    />
  );
}
