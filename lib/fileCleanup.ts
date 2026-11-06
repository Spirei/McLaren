import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** 只清理导入流程留下的未保存草稿，不碰已登记车型和其它目录。 */
export function cleanupOrphanFiles(options: { scope?: "showcase-unsaved" } = {}): { removed: number; failed: number } {
  if (options.scope !== "showcase-unsaved") return { removed: 0, failed: 0 };
  const root = path.join(PUBLIC_DIR, "uploads", "mclaren");
  const models = path.join(root, "models");
  const saved = new Set<string>();
  try {
    const registry = JSON.parse(fs.readFileSync(path.join(root, "showroom.json"), "utf8"));
    if (!Array.isArray(registry.models)) return { removed: 0, failed: 1 };
    for (const model of registry.models) if (typeof model?.file === "string") saved.add(model.file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") return { removed: 0, failed: 1 };
  }
  let removed = 0;
  let failed = 0;
  if (!fs.existsSync(models)) return { removed, failed };
  for (const entry of fs.readdirSync(models, { withFileTypes: true })) {
    if (!entry.isFile() || !/^\.draft-.*\.(glb|part)$/.test(entry.name) || saved.has(entry.name)) continue;
    try { fs.unlinkSync(path.join(models, entry.name)); removed++; } catch { failed++; }
  }
  return { removed, failed };
}
