# 🍅 番茄记账

简洁好用的跨平台桌面记账应用，帮你轻松管理日常收支。

## ✨ 功能

- 💸 **快速记账** — 自定义数字键盘，3 秒完成一笔记账
- 📊 **统计分析** — 月度分类饼图 + 排行榜，一目了然
- 📋 **账单列表** — 按日期分组展示，支持编辑和删除
- ⚙️ **分类管理** — 12 大类 60+ 子类预设，支持自定义增删改
- 💾 **本地存储** — 数据完全保存在本地，安全可控
- 🖥️ **桌面应用** — 独立窗口运行，Windows / macOS 通用

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron |
| UI 框架 | React 19 + TypeScript |
| 组件库 | Ant Design 6 |
| 图表 | ECharts 6 |
| 数据存储 | Dexie.js (IndexedDB) |
| 构建工具 | Vite 8 |
| 日期处理 | dayjs |

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装与运行

```bash
# 安装依赖
npm install

# 浏览器模式（开发）
npm run dev

# 桌面模式（Electron 独立窗口）
npm run dev:electron
```
### 打包

```bash
# 打包 macOS DMG
npm run package:mac

# 打包 Windows NSIS 安装包
npm run package:win

# 同时打包两个平台
npm run package:all
```

打包产物在 `dist/` 目录下。

## 📂 项目结构

```
pj7.3/
├── electron/              # Electron 主进程
│   ├── main.ts
│   └── preload.ts
├── src/
│   ├── main.tsx           # 应用入口
│   ├── App.tsx            # 根组件（底部 Tab 导航）
│   ├── types/index.ts     # TypeScript 类型定义
│   ├── data/categories.ts # 预设分类数据
│   ├── db/index.ts        # Dexie.js 数据库操作
│   ├── pages/
│   │   ├── Dashboard.tsx   # 💰 总览
│   │   ├── AddExpense.tsx  # 💸 记账
│   │   ├── Statistics.tsx  # 📊 统计
│   │   ├── Bills.tsx       # 📋 账单
│   │   └── Settings.tsx    # 👤 我的
│   └── components/        # 通用组件
├── package.json
└── README.md
```

## 📄 许可

MIT License
