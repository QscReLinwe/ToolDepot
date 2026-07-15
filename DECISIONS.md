# ToolDepot 决策记录

记录项目开发过程中的关键决策，供我和开发者参考。

## 开源相关

| 决策 | 结论 | 日期 |
|------|------|------|
| 许可证 | **Apache 2.0** | 2026-07 |
| README | **中英双语**（已创建） | 2026-07 |
| 国际化（i18n） | 先不动。以后做成多语种版本（zh/en/ja），安装时选语言再装对应 tool 集合 | 2026-07 |
| 硬编码中文 | 认可现状（"算了，先不动"），不复制工具文件做英文版 | 2026-07 |

## 代码质量修复（已完成）

| 项目 | 状态 |
|------|------|
| LICENSE 文件 (Apache 2.0) | ✅ |
| 66 个 package.json 加 `license: "Apache-2.0"` | ✅ |
| alarm/countdown 包名目录互换 | ✅ |
| hub/core 版本 0.0.0 → 0.1.0 | ✅ |
| 缺 description 的加英文描述（hub/cli, hub/core, hub/desktop, packages/types） | ✅ |
| 12 个缺 build 脚本的 package.json 加 `"build": "tsc"` | ✅ |
| markdown-preview XSS 修复（DOMPurify.sanitize） | ✅ |
| 添加 ErrorBoundary 组件包裹 App | ✅ |
| toolViews.ts 重复 countdownTool.id key | ✅ |
| App.tsx useEffect 依赖错误 | ✅ |
| 3 个 setTimeout 未清理（gradient-gen/color-palette/color-converter） | ✅ |
| 65 个子包 TypeScript 版本统一 ^5.9.2 | ✅ |
| 5 个非 React 包移除多余 @types/react | ✅ |
| TSC 编译验证 | ✅ |

## 架构建议—用户决策

| 建议 | 决策 |
|------|------|
| 工具视图懒加载 | ✅ 改 |
| tool-registry 抽出独立包 | ❌ 不算隐患，不动 |
| CI 配置 | 😃 用户自己跑 |
| math-core 拆分 + 计算器改进 | ✅ 改 |
| `tsc --build` 全量 references | 当前 `pnpm build` 就行，不用改 |
| 依赖清理（无用依赖/版本对齐） | 先不动 |
| Tauri 升级 v2 | ✅ 改 |
| 移除未使用的 React Router | ❌ 留着 |
| App theme 跟随系统主题变化 | ✅ 改 |

## 当前待修（优先级顺序）

1. math-core 拆分（大文件 757 行） + 计算器改进
2. App theme 跟随系统主题
3. GitHub CI 配置（用户自己跑）

## 其他记录

- 项目根目录 `tsc --build` 的 references 只列了 15 个子项目，没有 40+ 工具包。当前 `pnpm build` 流程正确，无需改。
- 修改了 60+ 个 package.json，如果后续合并需要注意 diff。
