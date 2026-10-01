# 测试运行指南

## 快速开始

由于 package.json 中未配置测试脚本，请使用以下命令运行测试：

```bash
# 运行所有测试
npx vitest

# 监听模式（推荐开发时使用）
npx vitest --watch

# 生成覆盖率报告
npx vitest --coverage

# 运行特定测试文件
npx vitest src/utils/planGenerator.test.ts

# 运行特定测试用例（通过名称匹配）
npx vitest -t "意图识别"
```

## 测试命令说明

| 命令 | 说明 |
|------|------|
| `npx vitest` | 运行所有测试一次 |
| `npx vitest --watch` | 监听模式，文件变化时自动重新运行 |
| `npx vitest --coverage` | 生成代码覆盖率报告 |
| `npx vitest --ui` | 打开可视化测试界面 |
| `npx vitest src/path/to/test.ts` | 运行指定测试文件 |
| `npx vitest -t "测试名称"` | 运行匹配名称的测试用例 |

## 查看覆盖率报告

运行覆盖率命令后，会在 `coverage/` 目录生成报告：

```bash
npx vitest --coverage

# 查看 HTML 报告
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## 测试文件命名规范

- 测试文件应与源文件同目录
- 命名格式：`*.test.ts` 或 `*.test.tsx`
- 示例：`planGenerator.ts` → `planGenerator.test.ts`

## CI/CD 集成

在 CI 环境中运行测试：

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx vitest run
      - run: npx vitest run --coverage
```

## 常见问题

### Q: 为什么不用 `npm test`？
A: 当前 package.json 未配置 test 脚本，可以直接使用 `npx vitest`。

### Q: 测试失败怎么办？
A: 
1. 检查错误信息
2. 确认测试环境配置正确
3. 检查 mock 是否正确设置
4. 查看测试日志

### Q: 如何添加新的测试脚本到 package.json？
A: 在 package.json 的 scripts 中添加：
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

## 测试覆盖目标

- 核心业务逻辑：100%
- 组件渲染：90%+
- 用户交互：85%+
- 总体覆盖率：80%+
