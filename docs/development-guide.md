# @ouyangzhigang/web-replayer 开发指南

## 项目概述

`@ouyangzhigang/web-replayer` 是基于 [Stencil](https://stenciljs.com/) 构建的 Web Component 库，用于 rrweb 会话回放、交互热力图和行为统计分析。作为 `@ouyangzhigang/web-recorder` 录制器的配套组件，提供从数据解压到可视化呈现的完整回放体验。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Stencil | ^4.22.0 | Web Component 编译器（TSX → Custom Elements） |
| rrweb | ^2.0.0 | 会话回放引擎（Replayer API） |
| LZ-String | ^1.5.0 | LZ-String 压缩/解压（URI-safe, UTF-16, Base64） |
| pako | ^2.1.0 | gzip 压缩/解压（base64 编码的 gzip 数据） |
| Vite | ^6.0.0 | Playground 开发服务器 |
| React | ^19.0.0 | Playground UI 框架 |
| Vitest | ^3.0.0 | 单元测试 |

### 项目结构

```
web-replayer/
├── src/
│   ├── components/
│   │   ├── replayer/
│   │   │   ├── web-replayer.tsx       ← 主回放组件（入口）
│   │   │   ├── web-replayer.css
│   │   │   ├── replayer-controls.tsx  ← 播放控件组件
│   │   │   └── replayer-controls.css
│   │   ├── heatmap/
│   │   │   ├── web-heatmap.tsx        ← 热力图组件
│   │   │   ├── heatmap-canvas.tsx     ← 热力图 Canvas 渲染
│   │   │   ├── web-heatmap.css
│   │   │   └── heatmap-canvas.css
│   │   ├── stats-panel/
│   │   │   ├── web-stats-panel.tsx    ← 统计面板组件
│   │   │   ├── stats-chart.tsx        ← 柱状图组件
│   │   │   ├── web-stats-panel.css
│   │   │   └── stats-chart.css
│   │   └── shared/
│   │       ├── tooltip.tsx            ← 共享 Tooltip 组件
│   │       ├── tooltip.css
│   │       └── design-tokens.css      ← CSS 设计令牌（40+ 自定义属性）
│   ├── utils/
│   │   ├── decompress.ts              ← 压缩解压引擎（自动检测格式）
│   │   ├── event-parser.ts            ← 事件解析 + 验证 + 元数据提取
│   │   ├── analytics.ts               ← 热力图 + 统计数据计算
│   │   └── dom-helper.ts              ← DOM 操作辅助（销毁 Replayer 等）
│   ├── types/
│   │   ├── events.ts                  ← rrweb 事件类型定义
│   │   ├── analytics.ts               ← 分析数据类型定义
│   │   └── component-props.ts         ← 公共 API 类型契约
│   └── components.d.ts                ← Stencil 自动生成的类型声明
├── playground/                         ← 开发 Playground（Vite + React）
│   ├── src/
│   │   ├── App.tsx                    ← Playground 主页面
│   │   ├── demo-data.ts              ← 演示数据（多种压缩格式）
│   │   ├── style.css                 ← Playground 样式
│   │   └── custom-elements.d.ts      ← 组件类型声明（React JSX）
│   ├── vite.config.ts                 ← Vite 配置（alias + Stencil HMR 插件）
│   └── vite-plugin-stencil-watch.ts   ← 自定义 Vite 插件（处理 Stencil 重建）
├── register.js                        ← 顶层自动注册入口（side-effect import）
├── stencil.config.ts                  ← Stencil 构建配置
├── package.json                       ← npm 包配置
└── README.md                          ← 用户文档
```

---

## 开发环境搭建

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### Playground 也需安装依赖

```bash
cd playground && pnpm install && cd ..
```

---

## 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm build` | Stencil 生产构建 → 输出到 `dist/` |
| `pnpm dev` | 开发模式：Stencil watch + Vite Playground concurrently |
| `pnpm test` | 运行全部测试（Stencil spec/e2e + Vitest） |
| `pnpm test:unit` | 只运行 Vitest 单元测试 |
| `pnpm test:watch` | Vitest watch 模式 |
| `pnpm lint` | ESLint 检查 |
| `pnpm format` | Prettier 格式化 |
| `pnpm clean` | 清理构建产物（dist, www, .stencil） |

---

## 开发模式详解

### 运行流程

`pnpm dev` 使用 `concurrently` 同时运行两个进程：

1. **`stencil build --watch`** — 监听 src/ 变化，增量构建到 dist/components/
2. **`cd playground && pnpm dev`** — Vite 开发服务器（默认端口 4000）

### Stencil 重建 + Vite HMR

Stencil 的 `dist-custom-elements` 输出目标使用内容哈希 chunk 文件名（`p-DCtFCsuU.js` 等），每次重建所有哈希都变。Vite 默认缓存模块转换结果，导致引用旧哈希的缓存模块找不到已删除的旧文件 → `Failed to resolve import` 报错。

**解决方案**: 自定义 Vite 插件 `vite-plugin-stencil-watch.ts`：

1. 将 `../dist/components/` 加入 Vite 的 chokidar 监听器
2. 任何 dist/ 文件变化 → 立即失效所有 dist 相关模块（全量清理，不防抖）
3. 800ms 防抖后发送 `full-reload` 信号（合并一次重建的多文件变化）
4. 刷新前清除 Vite 的依赖优化缓存
5. 配置 `optimizeDeps.exclude: ['web-replayer']` 阻止预打包

### Playground 别名配置

Vite 通过 alias 将 `import 'web-replayer'` 映射到项目根的 `register.js`，后者导入所有 `dist/components/*.js` 并调用 `defineCustomElement()` 注册所有组件。

```
register.js → import { defineCustomElement } from './dist/components/web-replayer.js' → defineCustomElement()
```

---

## 构建输出

### Stencil 输出目标

`stencil.config.ts` 配置了两个输出目标：

| 目标 | 输出目录 | 说明 |
|------|---------|------|
| `dist` | `dist/` | 惰性加载 bundle（按需加载组件，适合 CDN） |
| `dist-custom-elements` | `dist/components/` | Custom Elements bundle（每个组件独立文件，适合 npm 包） |

**npm 包使用 `dist-custom-elements` 输出**。每个组件生成一个独立 JS 文件（web-replayer.js, replayer-controls.js 等）加上共享 chunk（p-*.js）。

### package.json exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs.js"
    },
    "./components/*": "./dist/components/*.js"
  }
}
```

用户可以通过 `import '@ouyangzhigang/web-replayer'`（惰性加载）或 `import '@ouyangzhigang/web-replayer/components/web-replayer.js'`（直接引用）两种方式导入。

---

## 组件架构深度解析

### 性能架构 — 消除 currentTime 重新渲染

核心问题：rrweb 播放时每帧更新 currentTime，如果 currentTime 是 `@State()`，每帧触发整个组件和子组件重新渲染。

**解决方案**:

| 属性 | 类型 | 作用 |
|------|------|------|
| `currentTime` | `private` (非 @State) | 不触发 Stencil 重新渲染 |
| `replayer.getCurrentTime()` | rAF 循环每帧调用 | 获取最新时间 |
| `updateTimeDisplay()` | `@Method()` on replayer-controls | 直接 DOM 更新（绕过 render cycle） |

数据流：

```
rAF loop → replayer.getCurrentTime() → this.currentTime (plain prop)
                                        ↓
                                   updateControlsDirect() → controls.updateTimeDisplay()
                                                              ↓ 直接 DOM 操作
                                                         slider.value / fill.style.width / time.textContent
```

### 数据处理管道 — processData()

`data` prop 支持三种格式，自动检测走最优路径：

```
processData(raw):
  │
  ├─ Array.isArray(raw)?
  │    YES → parseEvents(raw)          [路径1: 零解析开销]
  │    NO  ↓
  │
  ├─ raw.trimStart().startsWith('[')?
  │    YES → parseEvents(raw)          [路径2: JSON.parse → filter，零 decompress]
  │    NO  ↓
  │
  └─ decompress(raw) → parseEvents()  [路径3: 全流程]
```

### Interact 模式 — 安全的视觉探索

播放结束后用户可以视觉探索回放页面（滚动、hover），但不执行 JS：

| 状态 | pointer-events | iframe sandbox | 效果 |
|------|---------------|---------------|------|
| 播放中 | `none` | `allow-same-origin allow-scripts` | rrweb 正常回放 |
| 暂停/结束 | `auto` | `allow-same-origin`（去掉 allow-scripts） | 可视觉交互，不触发 JS |

`syncInteract()` 在所有 playing 状态变化处调用，同步管理 pointer-events + sandbox。修改 sandbox 属性在现有 iframe 上不会触发重载。

### Viewport 缩放 — 容器自适应

回放 iframe 保持原始录制的视口尺寸（如 1280×720），通过 `transform: scale()` 缩放到容器尺寸：

```
scaleReplayerToContainer():
  1. 获取容器实际尺寸（ResizeObserver）
  2. 计算 scale = min(containerWidth / viewportWidth, containerHeight / viewportHeight)  // contain 模式
  3. 应用 transform: scale(factor) + transformOrigin: 0 0
  4. 用 left/top 偏移居中
```

控件栏不参与缩放（flex-shrink: 0，占据固定 44px 高度）。

---

## CSS 设计令牌系统

所有组件通过 `@import '../shared/design-tokens.css'` 引入统一的 CSS 自定义属性体系。Shadow DOM 不共享 CSS，所以每个组件需独立引入。

### 令牌分类

| 分类 | 令牌前缀 | 示例 |
|------|---------|------|
| 颜色 | `--wr-color-*` | `--wr-color-primary: #4a90d9`, `--wr-color-text-dark: #ffffff` |
| 间距 | `--wr-space-*` | `--wr-space-sm: 8px`, `--wr-space-md: 12px` |
| 字体 | `--wr-font-*` | `--wr-font-family`, `--wr-font-size-sm: 12px` |
| 圆角 | `--wr-radius-*` | `--wr-radius-sm: 4px`, `--wr-radius-full: 50%` |
| 控件栏 | `--wr-controls-*` | `--wr-controls-height: 44px`, `--wr-controls-gap: 12px` |
| 动画 | `--wr-transition-*` | `--wr-transition-fast: 0.15s ease` |

---

## rrweb Replayer API 使用

### 初始化配置

```ts
this.replayer = new Replayer(events, {
  root: container,            // 回放容器 DOM 元素
  speed: this.speed,          // 播放速度
  skipInactive: this.skipInactive, // 跳过静默时段
  showDebug: false,
  mouseTail: false,
  UNSAFE_replayCanvas: this.unsafeAllowScripts, // 控制 iframe sandbox
});
```

### 关键方法

| 方法 | 说明 |
|------|------|
| `replayer.play(timeOffset)` | 从指定时间开始播放 |
| `replayer.pause()` | 暂停 |
| `replayer.getCurrentTime()` | 获取当前播放时间（ms） |
| `replayer.setConfig({ speed })` | 动态修改配置 |
| `replayer.enableInteract()` | 设置 iframe pointer-events: auto |
| `replayer.disableInteract()` | 设置 iframe pointer-events: none |
| `replayer.on('finish', cb)` | 监听播放完成事件 |

### iframe sandbox

| 配置 | sandbox 属性 | 效果 |
|------|-------------|------|
| `UNSAFE_replayCanvas: true` | `allow-same-origin allow-scripts` | 可执行 JS，canvas 可回放 |
| `UNSAFE_replayCanvas: false` | `allow-same-origin` | 禁止 JS，出现 "Blocked script execution" 警告（正常） |

---

## 发布流程

### npm 发布脚本

`package.json` 中新增 `publish` 命令：

```bash
pnpm run publish
```

流程：
1. `pnpm build` — Stencil 生产构建
2. `npm version patch` — 自动升级版本号（0.0.1 → 0.0.2）
3. `npm publish` — 发布到 npm registry

### 手动发布

```bash
# 1. 构建
pnpm build

# 2. 验证构建产物
ls dist/components/

# 3. 升级版本（patch/minor/major）
npm version patch    # 0.0.1 → 0.0.2
npm version minor    # 0.0.1 → 0.1.0
npm version major    # 0.0.1 → 1.0.0

# 4. 发布
npm publish
```

### npm scope 配置

包名为 `@ouyangzhigang/web-replayer`，需要配置 npm registry 的 scope 权限：

```bash
# 如果 @ouyangzhigang scope 有自定义 registry
npm config set @ouyangzhigang:registry https://registry.npmjs.org/

# 或使用企业内部 registry
npm config set @ouyangzhigang:registry https://npm.company.com/
```

---

## 测试

### 单元测试 (Vitest)

测试文件位于 `src-tests/`：

```bash
pnpm test:unit       # 运行一次
pnpm test:watch      # watch 模式
```

### Stencil 测试

```bash
pnpm test            # Stencil spec + e2e + Vitest
```

---

## 常见问题

### "Blocked script execution" 控制台警告

当 `unsafe-allow-scripts=false` 时，iframe sandbox 禁止 JS 执行。这是**正常预期行为**——rrweb 通过 DOM mutations 重建页面，不执行录制的脚本。该警告可忽略。

### 开发模式 "Failed to resolve import" 报错

Stencil 重建后 Vite 缓存了旧的哈希文件引用。`vite-plugin-stencil-watch` 插件处理此问题——如果仍报错，重启 `pnpm dev` 即可。

### React 中 data 属性被截断

HTML attribute 有长度限制，大型压缩字符串不应通过 attribute 传递。使用 JS property 设置：

```jsx
// ❌ 错误：长字符串可能被截断
<web-replayer data={veryLongString} />

// ✅ 正确：通过 ref 设置 JS property
const ref = useRef(null);
useEffect(() => { ref.current.data = veryLongString; }, [veryLongString]);
<web-replayer ref={ref} />
```

### Interact 模式点击报错

interact 模式仅支持视觉探索（滚动、hover），不执行 iframe 内的 JS。如果点击触发了应用级 JS 报错，这是正常现象——回放页面在 sandbox iframe 中运行，跨窗口通信等操作会被限制。

---

## 参考链接

- [rrweb 官方文档](https://rrweb.com/docs/guide)
- [Stencil 组件文档](https://stenciljs.com/docs/components)
- [Stencil @Watch 机制](https://stenciljs.com/docs/reactive-props#watch-decorator) — 只监听 @Prop，不监听 @State
- [LZ-String](https://github.com/pieroxy/lz-string/)
- [pako](https://github.com/nicknisi/pako)
- [Custom Elements Everywhere](https://custom-elements-everywhere.com/) — Web Components 跨框架兼容性
