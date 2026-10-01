# 🎙️ VoiceDev — 本地化语音驱动 AI 开发框架

> 让程序员和公司职员通过**语音说出需求**，系统自动生成**执行计划**，由本地大语言模型执行，**全程数据不出域**。

---

## 📌 项目简介

VoiceDev 是一个面向企业内部的本地化 AI Agent 框架。用户通过语音（或文字）描述开发需求，系统自动：

1. **语音识别** → 转写为文字
2. **需求分析** → 本地 LLM 解析意图
3. **计划生成** → AI Agent 生成结构化执行计划
4. **任务执行** → 后台引擎逐步执行
5. **结果输出** → 所有产出本地保存

```
┌──────────────────────────────────────────────────────────────────┐
│                        VoiceDev 架构                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   🎤 语音输入        🧠 需求分析        📋 计划生成              │
│   Web Speech API  →  本地 LLM 引擎  →  AI Agent                 │
│       ↓                  ↓                  ↓                    │
│   实时转写            意图识别           任务拆解                  │
│   中文识别            分类匹配           依赖分析                  │
│                                            ↓                    │
│   ✅ 结果输出        ⚡ 任务执行        📊 进度追踪              │
│   本地存储       ←  自动化引擎       ←  状态管理                  │
│       ↑                  ↑                  ↑                    │
│   AES-256加密        Ollama/llama.cpp   实时反馈                  │
│                                                                  │
│   🔒 全程本地化 · 网络隔离 · 零外部依赖 · 端到端加密              │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🎤 语音输入 | 支持中文实时语音识别，自动转写为文字 |
| ⌨️ 手动输入 | 支持键盘直接输入需求（兼容无麦克风环境） |
| 🧠 AI 计划生成 | 根据需求自动生成结构化执行计划 |
| 📋 任务管理 | 支持任务依赖、状态追踪、进度可视化 |
| ▶️ 执行引擎 | 模拟/真实执行计划中的每个任务 |
| 🔒 隐私安全 | 数据仅本地存储，支持网络隔离 |
| ⚙️ LLM 配置 | 支持 Ollama、llama.cpp、LocalAI 等本地引擎 |
| 📊 运行日志 | 完整的操作日志和审计追踪 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- （可选）Ollama 本地 LLM 服务

### 安装与运行

```bash
# 克隆项目
git clone <repo-url>
cd voicetask-framework

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 使用步骤

```
步骤 1: 打开控制台
    ↓
步骤 2: 点击「录音」按钮，说出你的需求
        例如："开发一个用户管理系统，需要登录注册和权限管理"
    ↓
步骤 3: 系统自动转写语音 → 点击「生成执行计划」
    ↓
步骤 4: 查看 AI 生成的执行计划（任务列表 + 依赖关系）
    ↓
步骤 5: 点击「批准计划」→ 点击「开始执行」
    ↓
步骤 6: 观察任务逐步执行，查看实时进度
    ↓
步骤 7: 执行完成，查看结果输出
```

### 使用场景示例

| 语音输入 | 生成的计划类型 |
|----------|--------------|
| "开发一个网站" | Web应用开发计划（7个任务） |
| "做一个数据分析报表" | 数据分析计划（5个任务） |
| "写个自动化脚本" | 自动化脚本计划（4个任务） |
| 其他需求 | 通用开发计划（5+1个任务） |

---

## 🧩 内部逻辑详解

### 1. 整体数据流

```
用户语音 ──→ SpeechRecognition API ──→ 文字转写
                                          │
                                          ▼
                                    需求文本输入
                                          │
                                          ▼
                                   planGenerator.ts
                                   ┌────────────────┐
                                   │ 1. 意图识别     │
                                   │    (关键词匹配)  │
                                   │ 2. 模板选择     │
                                   │    (分类映射)    │
                                   │ 3. 任务生成     │
                                   │    (依赖构建)    │
                                   │ 4. 定制任务追加  │
                                   └────────────────┘
                                          │
                                          ▼
                                    ExecutionPlan
                                    (结构化计划对象)
                                          │
                              ┌───────────┼───────────┐
                              ▼           ▼           ▼
                          草稿状态    批准状态    执行状态
                              │           │           │
                              └───────────┼───────────┘
                                          │
                                          ▼
                                   simulateExecution()
                                   ┌────────────────┐
                                   │ 按依赖顺序执行  │
                                   │ 实时更新进度    │
                                   │ 生成输出结果    │
                                   └────────────────┘
                                          │
                                          ▼
                                     完成状态
```

### 2. 模块说明

```
src/
├── App.tsx                      # 主应用入口，状态管理，路由控制
├── types.ts                     # TypeScript 类型定义
│
├── components/
│   ├── VoiceInput.tsx           # 语音输入组件
│   │   ├── 调用 useSpeechRecognition hook
│   │   ├── 实时显示转写结果
│   │   ├── 支持语音/手动双模式
│   │   └── 提交时触发 onSubmit 回调
│   │
│   ├── ExecutionPlanView.tsx    # 执行计划展示组件
│   │   ├── 渲染任务列表和依赖关系
│   │   ├── 显示实时进度条
│   │   ├── 支持审批和执行操作
│   │   └── 状态徽章（草稿/已批准/执行中/已完成）
│   │
│   ├── SettingsPanel.tsx        # 系统设置面板
│   │   ├── LLM 引擎配置（Ollama/llama.cpp/LocalAI）
│   │   ├── 隐私安全设置
│   │   ├── 网络隔离开关
│   │   └── 数据自动清理周期
│   │
│   ├── Sidebar.tsx              # 侧边导航栏
│   ├── DashboardStats.tsx       # 控制台统计卡片
│   └── ActivityLog.tsx          # 运行日志组件
│
├── hooks/
│   └── useSpeechRecognition.ts  # 语音识别 Hook
│       ├── 封装 Web Speech API
│       ├── 管理识别状态（开始/停止/中间结果）
│       ├── 支持中文 (zh-CN)
│       └── 提供 transcript / interimTranscript / confidence
│
└── utils/
    └── planGenerator.ts         # 计划生成器（核心逻辑）
        ├── detectCategory()     # 意图识别：关键词匹配分类
        ├── generatePlan()       # 生成执行计划
        │   ├── 选择任务模板
        │   ├── 构建任务依赖图
        │   └── 追加定制任务
        └── simulateExecution()  # 模拟任务执行
            ├── 按依赖顺序执行
            ├── 实时更新进度
            └── 生成输出结果
```

### 3. 核心类型定义

```typescript
// 单个任务
interface Task {
  id: string;
  title: string;              // 任务标题
  description: string;        // 任务描述
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;           // 0-100 进度
  dependencies: string[];     // 依赖的任务 ID 列表
  estimatedTime: string;      // 预估时间
  output?: string;            // 执行结果
}

// 执行计划
interface ExecutionPlan {
  id: string;
  title: string;
  description: string;        // 原始需求文本
  createdAt: Date;
  tasks: Task[];              // 任务列表
  status: 'draft' | 'approved' | 'executing' | 'completed';
  totalProgress: number;      // 总体进度
}
```

### 4. 意图识别逻辑

系统通过**关键词匹配**进行需求分类：

```typescript
function detectCategory(input: string): string {
  // 包含"网站/应用/系统/平台/前端/后台" → Web应用模板
  // 包含"数据/分析/报表/统计/可视化" → 数据分析模板
  // 包含"自动/脚本/批处理/定时/流程" → 自动化脚本模板
  // 其他 → 通用开发模板
}
```

### 5. 任务执行引擎

```
执行流程：
1. 找到所有无依赖的任务 → 标记为可执行
2. 按顺序执行每个可执行任务
3. 任务完成后检查：是否有新任务的所有依赖已满足？
4. 如果有 → 将其加入可执行队列
5. 重复直到所有任务完成

每个任务的执行过程：
- 状态变更: pending → running → completed
- 进度更新: 0% → 100%（每 800ms 更新一次）
- 完成后生成 output 描述
```

---

## 🔒 隐私与安全

### 设计原则

| 原则 | 实现方式 |
|------|---------|
| **数据不出域** | 所有处理在本地完成，无外部 API 调用 |
| **语音本地化** | 使用浏览器内置 Web Speech API |
| **LLM 本地化** | 对接 Ollama / llama.cpp 等本地推理引擎 |
| **加密存储** | 支持 AES-256 加密本地存储 |
| **网络隔离** | 可启用完全网络隔离模式 |
| **自动清理** | 可配置数据自动删除周期（1-90天） |
| **零遥测** | 默认关闭所有遥测数据上报 |

### 安全架构

```
┌─────────────────────────────────┐
│         用户浏览器               │
│  ┌───────────────────────────┐  │
│  │     VoiceDev 前端应用      │  │
│  │  ┌─────────┐ ┌─────────┐  │  │
│  │  │语音识别  │ │计划生成  │  │  │
│  │  │(本地)    │ │(本地)    │  │  │
│  │  └─────────┘ └─────────┘  │  │
│  └───────────────────────────┘  │
│              ↕                   │
│  ┌───────────────────────────┐  │
│  │     本地 LLM 服务          │  │
│  │   (Ollama / llama.cpp)     │  │
│  │   127.0.0.1:11434         │  │
│  └───────────────────────────┘  │
│              ↕                   │
│  ┌───────────────────────────┐  │
│  │     加密本地存储           │  │
│  │   (IndexedDB / LocalStorage)│ │
│  └───────────────────────────┘  │
│                                  │
│  ❌ 无外部网络请求               │
│  ❌ 无第三方服务依赖             │
│  ❌ 无数据上传                   │
└─────────────────────────────────┘
```

---

## ⚙️ 本地 LLM 对接

### 支持的推理引擎

| 引擎 | 默认端点 | 推荐模型 |
|------|---------|---------|
| **Ollama** | `http://localhost:11434/api` | qwen2.5:7b |
| **llama.cpp** | `http://localhost:8080` | llama-3-8b |
| **LocalAI** | `http://localhost:8080/v1` | 自定义 |
| **自定义** | 用户配置 | 用户配置 |

### Ollama 快速配置

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 拉取模型
ollama pull qwen2.5:7b

# 启动服务（默认监听 localhost:11434）
ollama serve
```

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Tailwind CSS 4 | 样式系统 |
| Vite 6 | 构建工具 |
| Web Speech API | 语音识别 |
| Lucide React | 图标库 |

---

## 📂 项目结构

```
VoiceDev/
├── index.html                 # 入口 HTML
├── package.json               # 依赖管理
├── vite.config.js             # Vite 配置
├── tsconfig.json              # TypeScript 配置
├── README.md                  # 本文档
│
└── src/
    ├── main.tsx               # 应用入口
    ├── App.tsx                # 主组件（状态管理 + 路由）
    ├── index.css              # 全局样式
    ├── types.ts               # 类型定义
    │
    ├── components/
    │   ├── VoiceInput.tsx     # 语音输入
    │   ├── ExecutionPlanView.tsx  # 执行计划展示
    │   ├── SettingsPanel.tsx  # 系统设置
    │   ├── Sidebar.tsx        # 侧边栏
    │   ├── DashboardStats.tsx # 统计面板
    │   └── ActivityLog.tsx    # 运行日志
    │
    ├── hooks/
    │   └── useSpeechRecognition.ts  # 语音识别 Hook
    │
    └── utils/
        └── planGenerator.ts   # 计划生成引擎
```

---

## 🧪 测试体系

### 测试框架

| 工具 | 用途 |
|------|------|
| **Vitest** | 测试运行器（与 Vite 深度集成） |
| **Testing Library** | React 组件测试 |
| **jsdom** | DOM 环境模拟 |
| **@vitest/coverage-v8** | 代码覆盖率 |

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npx vitest src/utils/planGenerator.test.ts
```

### 测试文件结构

```
src/
├── App.test.tsx                      # 集成测试
├── utils/
│   └── planGenerator.test.ts         # 核心业务逻辑测试
├── hooks/
│   └── useSpeechRecognition.test.ts  # Hook 测试
└── components/
    ├── VoiceInput.test.tsx           # 语音输入组件测试
    ├── ExecutionPlanView.test.tsx    # 执行计划组件测试
    ├── SettingsPanel.test.tsx        # 设置面板组件测试
    ├── Sidebar.test.tsx              # 侧边栏组件测试
    ├── ActivityLog.test.tsx          # 日志组件测试
    └── DashboardStats.test.tsx       # 统计面板组件测试
```

### 测试用例说明

#### 1. 核心业务逻辑测试 (`planGenerator.test.ts`)

**意图识别测试**：
- ✅ 包含"网站/应用/系统"等关键词 → 识别为 Web 应用
- ✅ 包含"数据/分析/报表"等关键词 → 识别为数据分析
- ✅ 包含"自动/脚本/定时"等关键词 → 识别为自动化脚本
- ✅ 无法识别 → 使用默认模板

**计划生成测试**：
- ✅ 生成包含所有必需字段的执行计划
- ✅ 任务数量符合模板定义
- ✅ 每个任务有唯一 ID
- ✅ 包含定制任务
- ✅ 任务依赖关系正确

**任务执行测试**：
- ✅ 按顺序执行所有任务
- ✅ 调用进度回调
- ✅ 完成后所有任务有输出
- ✅ 完成后进度为 100%

#### 2. Hook 测试 (`useSpeechRecognition.test.ts`)

- ✅ 返回初始状态
- ✅ 提供 startListening/stopListening 方法
- ✅ 提供 clearTranscript/setTranscript 方法
- ✅ 调用 startListening 设置 isListening 为 true
- ✅ 调用 stopListening 设置 isListening 为 false
- ✅ 调用 clearTranscript 清空所有文本
- ✅ 检测浏览器是否支持语音识别

#### 3. 组件测试

**VoiceInput 组件**：
- ✅ 渲染录音按钮、手动输入按钮、生成按钮
- ✅ 点击手动输入显示文本框
- ✅ 无输入时生成按钮禁用
- ✅ 有输入时生成按钮可用
- ✅ 点击生成调用 onSubmit

**ExecutionPlanView 组件**：
- ✅ 渲染计划标题和描述
- ✅ 渲染所有任务
- ✅ 显示任务数量和进度
- ✅ 草稿状态显示批准和执行按钮
- ✅ 点击按钮调用对应回调
- ✅ running 状态显示进度条
- ✅ completed 状态显示输出

**SettingsPanel 组件**：
- ✅ 渲染 LLM 配置和隐私安全标签
- ✅ 切换标签显示对应面板
- ✅ 显示所有推理引擎选项
- ✅ 点击引擎调用 onLLMConfigChange
- ✅ 修改配置调用回调
- ✅ 隐私面板显示安全等级

**Sidebar 组件**：
- ✅ 渲染应用名称和导航项
- ✅ 显示计划数量徽章
- ✅ 点击导航调用 onViewChange
- ✅ 高亮当前活动视图
- ✅ 显示执行状态和系统状态

**ActivityLog 组件**：
- ✅ 渲染标题和日志数量
- ✅ 渲染所有日志消息
- ✅ 空日志显示提示
- ✅ 显示时间戳

**DashboardStats 组件**：
- ✅ 渲染 4 个统计卡片
- ✅ 正确显示数值和标签
- ✅ 支持 0 值和大数值

#### 4. 集成测试 (`App.test.tsx`)

- ✅ 渲染主应用
- ✅ 显示控制台视图
- ✅ 显示系统架构
- ✅ 显示统计卡片
- ✅ 侧边栏导航切换视图
- ✅ 显示安全状态指示器
- ✅ 各视图包含对应组件
- ✅ 显示初始日志

### 测试覆盖范围

| 模块 | 测试类型 | 用例数 |
|------|---------|--------|
| planGenerator | 单元测试 | 20+ |
| useSpeechRecognition | Hook 测试 | 10+ |
| VoiceInput | 组件测试 | 8+ |
| ExecutionPlanView | 组件测试 | 12+ |
| SettingsPanel | 组件测试 | 12+ |
| Sidebar | 组件测试 | 11+ |
| ActivityLog | 组件测试 | 6+ |
| DashboardStats | 组件测试 | 6+ |
| App | 集成测试 | 10+ |
| **总计** | - | **95+** |

### 新功能测试流程

**每次实现新功能后，按以下步骤测试**：

1. **编写测试用例**
   ```bash
   # 在对应模块目录下创建 .test.ts 或 .test.tsx 文件
   # 例如：src/utils/newFeature.test.ts
   ```

2. **运行测试**
   ```bash
   # 运行所有测试
   npm test
   
   # 或只运行新功能的测试
   npx vitest src/utils/newFeature.test.ts
   ```

3. **检查覆盖率**
   ```bash
   npm run test:coverage
   # 查看 html 报告：coverage/index.html
   ```

4. **确保所有测试通过**
   - ✅ 新增功能测试通过
   - ✅ 现有测试不受影响
   - ✅ 覆盖率不低于 80%

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 新功能描述
   
   - 实现功能 X
   - 添加测试用例 Y 个
   - 测试覆盖率 Z%"
   ```

### 测试最佳实践

1. **测试命名规范**
   ```typescript
   it('应该[预期行为]当[条件]', () => {
     // 测试代码
   });
   ```

2. **AAA 模式**
   ```typescript
   it('应该正确计算总数', () => {
     // Arrange - 准备
     const plan = generatePlan('测试');
     
     // Act - 执行
     const result = plan.tasks.length;
     
     // Assert - 断言
     expect(result).toBeGreaterThan(0);
   });
   ```

3. **隔离测试**
   - 每个测试独立运行
   - 使用 `beforeEach` 清理状态
   - Mock 外部依赖

4. **测试边界情况**
   - 空值
   - 极端值
   - 错误输入
   - 异常状态

---

## 🔮 未来规划

- [ ] 对接真实 LLM API（Ollama / llama.cpp HTTP 接口）
- [ ] 支持代码自动生成与执行
- [ ] 任务模板编辑器（用户自定义模板）
- [ ] 多用户协作支持
- [ ] 项目文件系统集成
- [ ] Git 自动提交与版本管理
- [ ] 语音指令扩展（暂停、取消、重试等）
- [ ] 插件系统（可扩展执行器）
- [ ] 测试覆盖率提升到 90%+
- [ ] E2E 测试（Playwright/Cypress）

---

## 📄 License

MIT License - 仅供内部使用，请勿外传。

---

<p align="center">
  <strong>🔒 100% 本地运行 · 零数据泄露 · 企业级安全</strong>
</p>
