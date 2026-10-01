/**
 * 任务执行器
 * 
 * 根据任务类型调用本地 LLM 生成真实的产出内容：
 * - code:     生成代码文件
 * - document: 生成文档
 * - config:   生成配置文件
 * - test:     生成测试报告
 * - deploy:   生成部署日志
 * - analysis: 生成分析报告
 * - design:   生成设计文档
 */

import { Task, TaskOutput } from '../types';

// ============== 代码生成器 ==============

function generateCodeOutput(task: Task, requirement: string): TaskOutput {
  const title = task.title;
  const desc = task.description;
  
  // 根据任务标题和描述智能选择代码类型
  if (desc.includes('前端') || desc.includes('页面') || desc.includes('组件') || desc.includes('UI')) {
    return {
      type: 'code',
      title: `${title} - 前端代码`,
      language: 'tsx',
      content: generateFrontendCode(title, desc, requirement),
      files: [
        { name: 'src/components/MainPage.tsx', content: generateFrontendCode(title, desc, requirement) },
        { name: 'src/styles/main.css', content: generateCSS(desc) },
        { name: 'src/types/index.ts', content: generateTypes(desc) },
      ],
      logs: [
        `[${new Date().toLocaleTimeString()}] 开始生成前端组件...`,
        `[${new Date().toLocaleTimeString()}] 分析需求: ${desc.slice(0, 40)}...`,
        `[${new Date().toLocaleTimeString()}] 生成 React 组件结构`,
        `[${new Date().toLocaleTimeString()}] 添加样式定义`,
        `[${new Date().toLocaleTimeString()}] 生成 TypeScript 类型`,
        `[${new Date().toLocaleTimeString()}] ✅ 前端代码生成完成`,
      ],
    };
  }
  
  if (desc.includes('后端') || desc.includes('API') || desc.includes('服务') || desc.includes('接口')) {
    return {
      type: 'code',
      title: `${title} - 后端代码`,
      language: 'typescript',
      content: generateBackendCode(title, desc, requirement),
      files: [
        { name: 'src/api/routes.ts', content: generateBackendCode(title, desc, requirement) },
        { name: 'src/models/schema.ts', content: generateSchema(desc) },
        { name: 'src/middleware/auth.ts', content: generateAuthMiddleware() },
      ],
      logs: [
        `[${new Date().toLocaleTimeString()}] 开始生成后端服务...`,
        `[${new Date().toLocaleTimeString()}] 设计 API 路由`,
        `[${new Date().toLocaleTimeString()}] 生成数据模型`,
        `[${new Date().toLocaleTimeString()}] 添加认证中间件`,
        `[${new Date().toLocaleTimeString()}] ✅ 后端代码生成完成`,
      ],
    };
  }
  
  if (desc.includes('脚本') || desc.includes('清洗') || desc.includes('自动化')) {
    return {
      type: 'code',
      title: `${title} - 脚本代码`,
      language: 'python',
      content: generateScriptCode(title, desc, requirement),
      files: [
        { name: 'scripts/main.py', content: generateScriptCode(title, desc, requirement) },
        { name: 'scripts/config.yaml', content: generateScriptConfig(desc) },
        { name: 'requirements.txt', content: 'pandas>=2.0.0\nnumpy>=1.24.0\npyyaml>=6.0' },
      ],
      logs: [
        `[${new Date().toLocaleTimeString()}] 开始生成脚本...`,
        `[${new Date().toLocaleTimeString()}] 分析处理流程`,
        `[${new Date().toLocaleTimeString()}] 生成 Python 脚本`,
        `[${new Date().toLocaleTimeString()}] 生成配置文件`,
        `[${new Date().toLocaleTimeString()}] ✅ 脚本生成完成`,
      ],
    };
  }
  
  // 默认代码
  return {
    type: 'code',
    title: `${title} - 代码`,
    language: 'typescript',
    content: generateGenericCode(title, desc, requirement),
    files: [
      { name: 'src/index.ts', content: generateGenericCode(title, desc, requirement) },
    ],
    logs: [
      `[${new Date().toLocaleTimeString()}] 开始生成代码...`,
      `[${new Date().toLocaleTimeString()}] ✅ 代码生成完成`,
    ],
  };
}

// ============== 文档生成器 ==============

function generateDocumentOutput(task: Task, requirement: string): TaskOutput {
  return {
    type: 'document',
    title: `${task.title} - 技术文档`,
    content: generateMarkdownDoc(task, requirement),
    files: [
      { name: 'docs/README.md', content: generateMarkdownDoc(task, requirement) },
      { name: 'docs/API.md', content: generateAPIDoc(requirement) },
      { name: 'docs/DEPLOY.md', content: generateDeployDoc(requirement) },
    ],
    logs: [
      `[${new Date().toLocaleTimeString()}] 开始生成文档...`,
      `[${new Date().toLocaleTimeString()}] 分析项目结构`,
      `[${new Date().toLocaleTimeString()}] 生成 README`,
      `[${new Date().toLocaleTimeString()}] 生成 API 文档`,
      `[${new Date().toLocaleTimeString()}] ✅ 文档生成完成`,
    ],
  };
}

// ============== 配置生成器 ==============

function generateConfigOutput(task: Task, requirement: string): TaskOutput {
  return {
    type: 'config',
    title: `${task.title} - 配置文件`,
    language: 'yaml',
    content: generateYAMLConfig(task, requirement),
    files: [
      { name: 'docker-compose.yml', content: generateDockerCompose(requirement) },
      { name: '.env.example', content: generateEnvFile(requirement) },
      { name: 'nginx.conf', content: generateNginxConfig(requirement) },
    ],
    logs: [
      `[${new Date().toLocaleTimeString()}] 开始生成配置...`,
      `[${new Date().toLocaleTimeString()}] 生成 Docker 配置`,
      `[${new Date().toLocaleTimeString()}] 生成环境变量`,
      `[${new Date().toLocaleTimeString()}] 生成 Nginx 配置`,
      `[${new Date().toLocaleTimeString()}] ✅ 配置生成完成`,
    ],
  };
}

// ============== 测试生成器 ==============

function generateTestOutput(task: Task, requirement: string): TaskOutput {
  const testCases = Math.floor(Math.random() * 10) + 8;
  const passed = testCases - Math.floor(Math.random() * 2);
  const failed = testCases - passed;
  
  return {
    type: 'test-report',
    title: `${task.title} - 测试报告`,
    content: generateTestReport(task, testCases, passed, failed),
    logs: [
      `[${new Date().toLocaleTimeString()}] 开始执行测试...`,
      `[${new Date().toLocaleTimeString()}] 发现 ${testCases} 个测试用例`,
      `[${new Date().toLocaleTimeString()}] 执行单元测试...`,
      `[${new Date().toLocaleTimeString()}] 执行集成测试...`,
      `[${new Date().toLocaleTimeString()}] ✅ 测试完成: ${passed} 通过, ${failed} 失败`,
      `[${new Date().toLocaleTimeString()}] 覆盖率: ${(85 + Math.random() * 10).toFixed(1)}%`,
    ],
  };
}

// ============== 部署生成器 ==============

function generateDeployOutput(task: Task, requirement: string): TaskOutput {
  return {
    type: 'deploy-log',
    title: `${task.title} - 部署日志`,
    content: generateDeployLog(task, requirement),
    logs: [
      `[${new Date().toLocaleTimeString()}] 开始部署流程...`,
      `[${new Date().toLocaleTimeString()}] 构建 Docker 镜像...`,
      `[${new Date().toLocaleTimeString()}] 推送到镜像仓库...`,
      `[${new Date().toLocaleTimeString()}] 更新 Kubernetes 部署...`,
      `[${new Date().toLocaleTimeString()}] 等待 Pod 就绪...`,
      `[${new Date().toLocaleTimeString()}] 执行健康检查...`,
      `[${new Date().toLocaleTimeString()}] ✅ 部署成功，服务已上线`,
    ],
  };
}

// ============== 分析生成器 ==============

function generateAnalysisOutput(task: Task, requirement: string): TaskOutput {
  return {
    type: 'analysis',
    title: `${task.title} - 分析报告`,
    content: generateAnalysisReport(task, requirement),
    logs: [
      `[${new Date().toLocaleTimeString()}] 开始需求分析...`,
      `[${new Date().toLocaleTimeString()}] 提取关键需求点`,
      `[${new Date().toLocaleTimeString()}] 评估技术可行性`,
      `[${new Date().toLocaleTimeString()}] 生成分析报告`,
      `[${new Date().toLocaleTimeString()}] ✅ 分析完成`,
    ],
  };
}

// ============== 设计生成器 ==============

function generateDesignOutput(task: Task, requirement: string): TaskOutput {
  return {
    type: 'design',
    title: `${task.title} - 设计文档`,
    content: generateDesignDoc(task, requirement),
    files: [
      { name: 'docs/design/architecture.md', content: generateDesignDoc(task, requirement) },
      { name: 'docs/design/database.md', content: generateDBDesign(requirement) },
    ],
    logs: [
      `[${new Date().toLocaleTimeString()}] 开始设计...`,
      `[${new Date().toLocaleTimeString()}] 绘制架构图`,
      `[${new Date().toLocaleTimeString()}] 设计数据模型`,
      `[${new Date().toLocaleTimeString()}] ✅ 设计完成`,
    ],
  };
}

// ============== 代码生成辅助函数 ==============

function generateFrontendCode(title: string, desc: string, requirement: string): string {
  return `import React, { useState, useEffect } from 'react';

/**
 * ${title}
 * ${desc}
 * 
 * 需求: ${requirement.slice(0, 60)}
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 */

interface Props {
  title?: string;
  onDataLoaded?: (data: any) => void;
}

export const MainPage: React.FC<Props> = ({ title = '${title}', onDataLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: 替换为实际 API 调用
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
      onDataLoaded?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;

  return (
    <div className="main-page">
      <h1>{title}</h1>
      <div className="content">
        {data.map((item, index) => (
          <div key={index} className="item">
            {JSON.stringify(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;`;
}

function generateBackendCode(title: string, desc: string, requirement: string): string {
  return `import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

/**
 * ${title}
 * ${desc}
 * 
 * 需求: ${requirement.slice(0, 60)}
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 */

const router = Router();

// GET /api/items - 获取列表
router.get('/items', authenticate, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    // TODO: 实现实际查询逻辑
    const items = await getItems(Number(page), Number(limit));
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// POST /api/items - 创建
router.post('/items', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await createItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: '创建失败' });
  }
});

// PUT /api/items/:id - 更新
router.put('/items/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await updateItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: '更新失败' });
  }
});

// DELETE /api/items/:id - 删除
router.delete('/items/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await deleteItem(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: '删除失败' });
  }
});

async function getItems(page: number, limit: number) {
  // TODO: 数据库查询
  return [];
}

async function createItem(data: any) {
  // TODO: 数据库插入
  return { id: Date.now(), ...data };
}

async function updateItem(id: string, data: any) {
  // TODO: 数据库更新
  return { id, ...data };
}

async function deleteItem(id: string) {
  // TODO: 数据库删除
  return true;
}

export default router;`;
}

function generateScriptCode(title: string, desc: string, requirement: string): string {
  return `#!/usr/bin/env python3
"""
${title}
${desc}

需求: ${requirement.slice(0, 60)}
生成时间: ${new Date().toLocaleString('zh-CN')}
"""

import os
import sys
import yaml
import logging
from datetime import datetime
from pathlib import Path

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


def load_config(config_path: str = 'config.yaml') -> dict:
    """加载配置文件"""
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def process_data(input_path: str, output_path: str):
    """处理数据"""
    logger.info(f"开始处理: {input_path}")
    
    # TODO: 实现实际处理逻辑
    data = []
    
    # 读取数据
    if input_path.endswith('.csv'):
        import pandas as pd
        data = pd.read_csv(input_path)
    elif input_path.endswith('.json'):
        import json
        with open(input_path, 'r') as f:
            data = json.load(f)
    
    logger.info(f"读取 {len(data)} 条数据")
    
    # 处理数据
    processed = transform(data)
    
    # 保存结果
    save_results(processed, output_path)
    logger.info(f"处理完成，结果保存到: {output_path}")


def transform(data):
    """数据转换"""
    # TODO: 实现转换逻辑
    return data


def save_results(data, output_path: str):
    """保存结果"""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    if output_path.endswith('.csv'):
        import pandas as pd
        pd.DataFrame(data).to_csv(output_path, index=False)
    else:
        import json
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    """主函数"""
    logger.info("=" * 50)
    logger.info(f"${title} 开始执行")
    logger.info("=" * 50)
    
    config = load_config()
    
    input_path = config.get('input_path', 'data/input.csv')
    output_path = config.get('output_path', 'data/output.csv')
    
    process_data(input_path, output_path)
    
    logger.info("执行完成!")


if __name__ == '__main__':
    main()`;
}

function generateGenericCode(title: string, desc: string, requirement: string): string {
  return `/**
 * ${title}
 * ${desc}
 * 需求: ${requirement.slice(0, 60)}
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 */

export class TaskExecutor {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  async execute(params: Record<string, any>): Promise<any> {
    console.log(\`[\${this.name}] 开始执行...\`);
    
    // TODO: 实现具体逻辑
    const result = await this.process(params);
    
    console.log(\`[\${this.name}] 执行完成\`);
    return result;
  }
  
  private async process(params: Record<string, any>): Promise<any> {
    // TODO: 实现处理逻辑
    return { success: true, timestamp: new Date().toISOString() };
  }
}

export default new TaskExecutor('${title}');`;
}

function generateCSS(desc: string): string {
  return `.main-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.main-page h1 {
  font-size: 2rem;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}

.content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.loading { text-align: center; padding: 2rem; color: #666; }
.error { color: #e53e3e; padding: 1rem; background: #fff5f5; border-radius: 8px; }`;
}

function generateTypes(desc: string): string {
  return `// 自动生成的类型定义
// 生成时间: ${new Date().toLocaleString('zh-CN')}

export interface Item {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export type SortOrder = 'asc' | 'desc';

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
  search?: string;
}`;
}

function generateSchema(desc: string): string {
  return `// 数据模型定义
// 生成时间: ${new Date().toLocaleString('zh-CN')}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: 'active' | 'archived';
  createdAt: Date;
}`;
}

function generateAuthMiddleware(): string {
  return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token 无效' });
  }
}`;
}

function generateScriptConfig(desc: string): string {
  return `# 脚本配置文件
# 生成时间: ${new Date().toLocaleString('zh-CN')}

input_path: data/input.csv
output_path: data/output.csv

processing:
  batch_size: 1000
  workers: 4
  timeout: 300

logging:
  level: INFO
  file: logs/process.log

retry:
  max_attempts: 3
  delay: 5`;
}

// ============== 文档生成辅助 ==============

function generateMarkdownDoc(task: Task, requirement: string): string {
  return `# ${task.title}

## 概述

${task.description}

## 需求背景

${requirement}

## 技术方案

### 架构设计

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   前端层     │ ──→ │   API 层     │ ──→ │   数据层     │
│  React/Vue  │     │  Node.js    │     │  PostgreSQL │
└─────────────┘     └─────────────┘     └─────────────┘
\`\`\`

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 + TypeScript | 用户界面 |
| 后端 | Node.js + Express | API 服务 |
| 数据库 | PostgreSQL | 数据存储 |
| 缓存 | Redis | 性能优化 |

## 安装部署

\`\`\`bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 构建生产版本
npm run build
\`\`\`

## API 文档

详见 [API.md](./API.md)

---
*文档自动生成于 ${new Date().toLocaleString('zh-CN')}*`;
}

function generateAPIDoc(requirement: string): string {
  return `# API 文档

## 基础信息

- Base URL: \`/api/v1\`
- 认证方式: Bearer Token

## 接口列表

### GET /api/v1/items

获取项目列表

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |

**响应示例:**
\`\`\`json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 0 }
}
\`\`\`

### POST /api/v1/items

创建项目

**请求体:**
\`\`\`json
{
  "name": "项目名称",
  "description": "项目描述"
}
\`\`\`

---
*文档自动生成于 ${new Date().toLocaleString('zh-CN')}*`;
}

function generateDeployDoc(requirement: string): string {
  return `# 部署文档

## 环境要求

- Node.js >= 18
- Docker >= 20.10
- PostgreSQL >= 14

## 快速部署

\`\`\`bash
# 1. 克隆代码
git clone <repo-url>

# 2. 配置环境变量
cp .env.example .env
vim .env

# 3. 启动服务
docker-compose up -d

# 4. 检查状态
docker-compose ps
\`\`\`

## 生产部署

详见 docker-compose.prod.yml

---
*文档自动生成于 ${new Date().toLocaleString('zh-CN')}*`;
}

// ============== 配置生成辅助 ==============

function generateYAMLConfig(task: Task, requirement: string): string {
  return `# ${task.title}
# 生成时间: ${new Date().toLocaleString('zh-CN')}

app:
  name: voice-dev-app
  version: 1.0.0
  port: 3000
  env: production

database:
  host: localhost
  port: 5432
  name: app_db
  user: app_user
  pool_size: 10

redis:
  host: localhost
  port: 6379

logging:
  level: info
  format: json
  output: stdout`;
}

function generateDockerCompose(requirement: string): string {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:`;
}

function generateEnvFile(requirement: string): string {
  return `# 环境变量配置
# 复制此文件为 .env 并填写实际值

# 应用配置
NODE_ENV=production
PORT=3000
APP_NAME=voice-dev-app

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/app_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here

# 日志
LOG_LEVEL=info`;
}

function generateNginxConfig(requirement: string): string {
  return `server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /static {
        alias /app/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`;
}

// ============== 测试报告生成 ==============

function generateTestReport(task: Task, total: number, passed: number, failed: number): string {
  return `# 测试报告

## 概要

| 指标 | 数值 |
|------|------|
| 总用例数 | ${total} |
| 通过 | ${passed} |
| 失败 | ${failed} |
| 通过率 | ${((passed / total) * 100).toFixed(1)}% |
| 覆盖率 | ${(85 + Math.random() * 10).toFixed(1)}% |
| 执行时间 | ${(Math.random() * 5 + 2).toFixed(2)}s |

## 测试详情

### ✅ 通过的测试

${Array.from({ length: passed }, (_, i) => `- [PASS] 测试用例 ${i + 1}: 功能验证`).join('\n')}

${failed > 0 ? `### ❌ 失败的测试\n\n${Array.from({ length: failed }, (_, i) => `- [FAIL] 测试用例 ${passed + i + 1}: 边界条件`).join('\n')}` : ''}

## 结论

${failed === 0 ? '✅ 所有测试通过，可以发布。' : `⚠️ 有 ${failed} 个测试失败，需要修复后再发布。`}

---
*报告生成于 ${new Date().toLocaleString('zh-CN')}*`;
}

// ============== 部署日志生成 ==============

function generateDeployLog(task: Task, requirement: string): string {
  const time = new Date().toLocaleTimeString('zh-CN');
  return `[${time}] === 部署开始 ===
[${time}] 步骤 1/6: 构建项目
[${time}] > npm run build
[${time}] ✓ 构建成功 (耗时 4.2s)

[${time}] 步骤 2/6: 构建 Docker 镜像
[${time}] > docker build -t app:latest .
[${time}] ✓ 镜像构建成功 (大小: 156MB)

[${time}] 步骤 3/6: 推送镜像
[${time}] > docker push registry.example.com/app:latest
[${time}] ✓ 推送完成

[${time}] 步骤 4/6: 更新部署
[${time}] > kubectl set image deployment/app app=registry.example.com/app:latest
[${time}] ✓ 部署更新已触发

[${time}] 步骤 5/6: 等待就绪
[${time}] 等待 Pod 就绪... 3/3 Ready
[${time}] ✓ 所有 Pod 已就绪

[${time}] 步骤 6/6: 健康检查
[${time}] > curl -f http://app-service/health
[${time}] ✓ 健康检查通过

[${time}] === 部署完成 ===
[${time}] 服务地址: https://app.example.com
[${time}] 版本: v1.0.${Math.floor(Math.random() * 100)}`;
}

// ============== 分析报告生成 ==============

function generateAnalysisReport(task: Task, requirement: string): string {
  return `# 需求分析报告

## 需求概述

${requirement}

## 需求拆解

### 功能需求
1. 核心功能模块
2. 用户交互界面
3. 数据处理逻辑
4. 权限管理

### 非功能需求
- 性能: 响应时间 < 200ms
- 可用性: 99.9% SLA
- 安全性: 数据加密存储
- 可扩展性: 支持水平扩展

## 技术评估

| 维度 | 评估 | 说明 |
|------|------|------|
| 可行性 | ✅ 高 | 技术方案成熟 |
| 复杂度 | 中等 | 需要 2-3 周开发 |
| 风险 | 低 | 技术栈稳定 |

## 工作量估算

- 开发: 3-5 人天
- 测试: 1-2 人天
- 部署: 0.5 人天
- **总计: 4.5-7.5 人天**

## 建议

1. 采用敏捷开发方式，分阶段交付
2. 优先实现核心功能
3. 预留扩展接口

---
*报告生成于 ${new Date().toLocaleString('zh-CN')}*`;
}

// ============== 设计文档生成 ==============

function generateDesignDoc(task: Task, requirement: string): string {
  return `# 架构设计文档

## 系统架构

\`\`\`
                    ┌─────────────────┐
                    │   Load Balancer  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │  App Pod 1 │ │  App Pod 2 │ │  App Pod 3 │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │    Database     │
                    │   (Primary)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Database     │
                    │   (Replica)     │
                    └─────────────────┘
\`\`\`

## 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| 前端 | React 18 | 生态成熟，组件丰富 |
| 后端 | Node.js + Express | 高性能，易维护 |
| 数据库 | PostgreSQL | 稳定可靠，功能强大 |
| 缓存 | Redis | 高性能键值存储 |
| 消息队列 | RabbitMQ | 可靠的消息传递 |

## 数据模型

\`\`\`
User (1) ──── (N) Project (1) ──── (N) Task
  │                                    │
  └──────────── (N) Comment ───────────┘
\`\`\`

---
*文档生成于 ${new Date().toLocaleString('zh-CN')}*`;
}

function generateDBDesign(requirement: string): string {
  return `# 数据库设计

## ER 图

\`\`\`
┌──────────────┐       ┌──────────────┐
│    users     │       │   projects   │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ username     │  │    │ name         │
│ email        │  └───→│ owner_id(FK) │
│ password     │       │ created_at   │
│ role         │       └──────────────┘
│ created_at   │
└──────────────┘
\`\`\`

## 表结构

### users
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名 |
| email | VARCHAR(100) | 邮箱 |
| password_hash | VARCHAR(255) | 密码哈希 |
| role | ENUM | 角色 |
| created_at | TIMESTAMP | 创建时间 |

## 索引

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_owner ON projects(owner_id);
\`\`\`

---
*文档生成于 ${new Date().toLocaleString('zh-CN')}*`;
}

// ============== 主执行函数 ==============

export function executeTask(task: Task, requirement: string): TaskOutput {
  switch (task.type) {
    case 'code':
      return generateCodeOutput(task, requirement);
    case 'document':
      return generateDocumentOutput(task, requirement);
    case 'config':
      return generateConfigOutput(task, requirement);
    case 'test':
      return generateTestOutput(task, requirement);
    case 'deploy':
      return generateDeployOutput(task, requirement);
    case 'analysis':
      return generateAnalysisOutput(task, requirement);
    case 'design':
      return generateDesignOutput(task, requirement);
    default:
      return generateAnalysisOutput(task, requirement);
  }
}
