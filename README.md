# 🧰 ToolDepot

> 开发者瑞士军刀 — 50+ 实用工具，CLI + 桌面端双模式。
> Developer swiss‑army knife — 50+ utility tools, CLI + Desktop dual mode.

<p align="center">
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node" />
  <img src="https://img.shields.io/badge/pnpm-%3E%3D11.11-orange" alt="pnpm" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tauri-2.0-purple" alt="Tauri" />
</p>

---

## 📖 中文介绍

### 这是什么？

**ToolDepot** 是一个开源的开发者工具集合。它把日常开发中常用的零碎功能——JSON 格式化、Base64 编解码、时区转换、正则测试、密码生成……——集中到一个统一入口，并提供 **CLI** 和 **桌面应用** 两种使用方式。

### 特性

- 🚀 **双模式**：命令行（`tooldepot <tool>`） + Tauri 桌面应用
- 🧩 **50+ 工具**：覆盖开发、工作、生活三大类
- 🎨 **深色/浅色主题** + 中文/英文界面切换
- 📦 **Monorepo** 架构，工具间完全解耦
- 🔌 **纯 TypeScript**，类型安全，无外部运行时依赖

### 工具列表

#### 🛠 开发类 (Dev)
| 工具 | CLI | 说明 |
|------|-----|------|
| JSON Formatter | `td-json-formatter` | JSON 美化、压缩与校验 |
| Base64 Encode/Decode | `td-base64` | Base64 编码与解码 |
| Base64 Image | `td-base64-image` | 图片与 Base64 Data URL 互转 |
| URL Encode/Decode | `td-url-codec` | URL 编码与解码 |
| URL Parser | `td-url-parser` | 解析 URL 各组成部分 |
| UUID Generator | `td-uuid-gen` | 生成 UUID v4 |
| Hash Calculator | `td-text-hash` | SHA-1/256/512 哈希 |
| Regex Tester | `td-regex-tester` | 实时高亮测试正则 |
| JWT Decoder | `td-jwt-decoder` | 解码查看 JWT 令牌 |
| HTTP Status Codes | `td-http-codes` | 查询 HTTP 状态码 |
| Cron Parser | `td-cron-parser` | 解析 Cron 表达式 |
| Case Converter | `td-case-convert` | 驼峰/蛇形/帕斯卡互转 |
| SQL Formatter | `td-sql-formatter` | SQL 查询格式化 |
| HTML Entity | `td-html-entity` | HTML 实体编解码 |
| Color Converter | `td-color-converter` | hex/rgb/hsl/hsv/cmyk 互转 |
| Markdown Preview | `td-markdown-preview` | Markdown 实时渲染 |
| Diff Tool | `td-diff-tool` | 文本行/字符级对比 |
| CSS/JS Minify | `td-css-js-minify` | CSS 与 JS 压缩 |
| GraphQL Builder | `td-graphql-builder` | 可视化构建 GraphQL 查询 |
| Equation Solver | `td-equation-solver` | 二分法求解方程 |
| Function Graph | — | 二维函数图像绘制 |
| CSV/TSV Tool | `td-csv-tsv` | CSV/TSV/JSON 互转 |
| SSL Decoder | `td-ssl-decoder` | 解码 SSL/TLS 证书 |
| Base Converter | `td-base-convert` | 2–36 进制转换 |
| XML/JSON | `td-xml-json` | XML ↔ JSON 转换 |

#### 💼 工作类 (Work)
| 工具 | CLI | 说明 |
|------|-----|------|
| Calculator | `td-calc` | 安全四则运算 |
| Timestamp Converter | `td-timestamp` | Unix 时间戳 ↔ 日期 |
| Timezone Converter | `td-timezone-converter` | 跨时区时间转换 |
| Unit Converter | `td-unit-converter` | 长度/质量/温度等单位转换 |
| Currency Exchange | `td-currency-exchange` | 汇率换算 |
| Invoice Tax | `td-invoice-tax` | 发票税额计算 |
| Mortgage Calculator | `td-mortgage` | 房贷/车贷计算 |
| Compound Interest | `td-compound-interest` | 复利计算（含定投） |
| Tip Split | `td-tip-split` | 小费/分账计算 |
| Dedup / Sort | `td-dedup-sort` | 文本行去重排序 |
| Text Stats | `td-text-stats` | 文本统计信息 |
| Reading Time | `td-reading-time` | 阅读时间估算 |
| Password Generator | `td-password-generator` | 安全随机密码生成 |
| Placeholder Text | `td-placeholder-text` | Lorem Ipsum 生成 |
| QR Code Generator | `td-qr-code` | 文本生成二维码 |
| Pomodoro Timer | `td-pomodoro` | 番茄工作/休息时间表 |

#### 🏠 生活类 (Life)
| 工具 | CLI | 说明 |
|------|-----|------|
| Date Calculator | `td-date-calc` | 日期加减与差值计算 |
| BMI / BMR / BFR | `td-bmi-bfr-bmr` | BMI/基础代谢/体脂率 |
| Color Palette | `td-color-palette` | 配色方案生成 |
| Gradient Generator | `td-gradient-gen` | CSS 渐变生成 |
| Font Preview | `td-font-preview` | 字体预览 |
| Paint / Floor | `td-paint-floor` | 墙漆/地板用量 |
| Tile Calculator | `td-tile-calc` | 瓷砖铺贴计算 |
| Curtain Calculator | `td-curtain-calc` | 窗帘用量计算 |
| Electricity Cost | `td-electricity-cost` | 家电电费估算 |
| Personal Budget | `td-personal-budget` | 收入支出记账 |
| Random Picker | `td-random-picker` | 随机抽取/分组 |
| Password Strength | `td-password-strength` | 密码强度分析 |
| Screen Color Picker | `td-screen-color-picker` | 屏幕取色 |
| Life Unit Converter | `td-unit-converter-life` | 日常单位换算 |
| Countdown / Alarm | `td-countdown` | 倒计时与闹钟 |
| Lunar Calendar | `td-lunar-calendar` | 农历/节气查询 |

### 快速开始

```bash
# 克隆
git clone https://github.com/your-username/tooldepot.git
cd tooldepot

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动桌面应用（开发模式）
pnpm dev

# CLI 使用
node hub/cli/dist/cli.js json-formatter file.json
# 或通过 bin 命令（需全局链接）
tooldepot json-formatter file.json
```

**添加新工具**：参考 [`scripts/TOOL_IMPL_GUIDE.md`](scripts/TOOL_IMPL_GUIDE.md)。

### 项目架构

```
ToolDepot/
├── hub/                    # 中心枢纽
│   ├── cli/               # CLI 入口 — 派发到具体工具
│   ├── core/              # 工具注册表 + 动态加载
│   └── desktop/           # Tauri 桌面应用 (React)
├── packages/              # 共享库
│   ├── types/             # 类型定义 (Tool, ToolOutput...)
│   ├── cli-core/          # CLI 基础设施
│   └── math-core/         # 数学引擎
├── tools/                 # 所有工具
│   ├── _template/         # 新工具模板
│   └── <id>/              # 每个工具含 core/cli/desktop 三层
├── scripts/               # 辅助脚本
└── pnpm-workspace.yaml    # Workspace 配置
```

### 许可证

[Apache 2.0](LICENSE) © ToolDepot Contributors

### 贡献

欢迎贡献新工具或改进！请先阅读贡献指南（待创建）。

---

## 📖 English Introduction

### What is ToolDepot?

**ToolDepot** is an open‑source collection of developer utilities. It gathers those everyday small tools — JSON formatting, Base64 encoding, timezone conversion, regex testing, password generation, etc. — under a unified interface, available as a **CLI** and a **Desktop app** (powered by Tauri).

### Features

- 🚀 **Dual mode**: CLI (`tooldepot <tool>`) + Tauri desktop app
- 🧩 **50+ tools** across Dev, Work, and Life categories
- 🎨 **Dark/Light theme** with Chinese/English UI switching
- 📦 **Monorepo** — tools are fully decoupled packages
- 🔌 **Pure TypeScript**, type‑safe, zero external runtime

### Quick Start

```bash
# Clone
git clone https://github.com/your-username/tooldepot.git
cd tooldepot

# Install
pnpm install

# Build
pnpm build

# Launch desktop (dev mode)
pnpm dev

# Use CLI
node hub/cli/dist/cli.js json-formatter file.json
# Or via global bin link
tooldepot json-formatter file.json
```

**Adding a new tool**: See [`scripts/TOOL_IMPL_GUIDE.md`](scripts/TOOL_IMPL_GUIDE.md).

### Architecture

```
ToolDepot/
├── hub/                    # Hub
│   ├── cli/               # CLI entry — dispatches to tools
│   ├── core/              # Registry + dynamic loader
│   └── desktop/           # Tauri desktop app (React)
├── packages/              # Shared libs
│   ├── types/             # Type definitions (Tool, ToolOutput…)
│   ├── cli-core/          # CLI infrastructure
│   └── math-core/         # Math engine
├── tools/                 # All tools
│   ├── _template/         # New tool template
│   └── <id>/              # Each tool = core + cli + desktop
├── scripts/               # Helper scripts
└── pnpm-workspace.yaml    # Workspace config
```

### License

[Apache 2.0](LICENSE) © ToolDepot Contributors

### Contributing

Contributions are welcome! Please read the contribution guide (to be created) before starting.
