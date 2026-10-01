# 🦙 本地 LLM 部署指南

本文档详细说明本地大语言模型的**存放位置**、**运行方式**和**配置方法**。

---

## 📍 模型存放位置

### Ollama（推荐）

Ollama 会自动管理模型文件，存放在以下位置：

| 操作系统 | 默认路径 |
|---------|---------|
| **macOS** | `~/.ollama/models` |
| **Linux** | `/usr/share/ollama/.ollama/models` (systemd) 或 `~/.ollama/models` (用户) |
| **Windows** | `C:\Users\<用户名>\.ollama\models` |

**查看模型列表：**
```bash
ollama list
```

**输出示例：**
```
NAME              ID           SIZE     MODIFIED
qwen2.5:7b        a1b2c3d4e5   4.7 GB   2 hours ago
llama3.1:8b       f6g7h8i9j0   4.7 GB   1 day ago
```

### llama.cpp

llama.cpp 使用 GGUF 格式的模型文件，需要你手动下载并指定路径：

**推荐存放位置：**
```bash
# 在项目根目录创建 models 文件夹
mkdir -p models/

# 将下载的 GGUF 文件放到这里
models/
├── qwen2.5-7b-instruct.gguf
├── codellama-7b-instruct.gguf
└── llama-3.1-8b-instruct.gguf
```

**下载 GGUF 模型：**
- [Qwen2.5-7B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF)
- [CodeLlama-7B-Instruct-GGUF](https://huggingface.co/TheBloke/CodeLlama-7B-Instruct-GGUF)
- [Llama-3.1-8B-Instruct-GGUF](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct-GGUF)

### LocalAI

LocalAI 的模型存放在：

| 操作系统 | 默认路径 |
|---------|---------|
| **macOS/Linux** | `~/.local/share/local-ai/models` |
| **Docker** | 挂载卷: `-v /path/to/models:/build/models` |

---

## 🚀 运行方式

### 方式一：一键部署（推荐）

使用我们提供的部署脚本，自动完成安装、下载、启动：

**macOS / Linux:**
```bash
chmod +x scripts/setup-local-llm.sh
./scripts/setup-local-llm.sh
```

**Windows:**
```cmd
scripts\setup-local-llm.bat
```

脚本会自动：
1. ✅ 检测并安装 Ollama
2. ✅ 下载推荐模型（qwen2.5:7b）
3. ✅ 启动本地服务
4. ✅ 验证服务状态

### 方式二：手动部署

#### 1. 安装 Ollama

**macOS:**
```bash
# 方法 1: 使用 Homebrew
brew install ollama

# 方法 2: 官方安装脚本
curl -fsSL https://ollama.com/install.sh | sh

# 方法 3: 下载应用
# 访问 https://ollama.com/download 下载 macOS 版本
```

**Linux:**
```bash
# 官方安装脚本
curl -fsSL https://ollama.com/install.sh | sh

# 验证安装
ollama --version
```

**Windows:**
1. 访问 https://ollama.com/download
2. 下载 `OllamaSetup.exe`
3. 双击安装
4. 安装完成后，Ollama 会自动启动

#### 2. 下载模型

```bash
# 下载推荐模型（中文能力强）
ollama pull qwen2.5:7b

# 或下载轻量版（适合低配机器）
ollama pull qwen2.5:3b

# 或下载代码专用模型
ollama pull codellama:7b
```

**模型大小参考：**

| 模型 | 大小 | 推荐配置 | 特点 |
|------|------|---------|------|
| qwen2.5:3b | 1.9 GB | 8GB RAM | 轻量，速度快 |
| qwen2.5:7b | 4.7 GB | 16GB RAM | **推荐**，中文优秀 |
| llama3.1:8b | 4.7 GB | 16GB RAM | 英文能力强 |
| codellama:7b | 3.8 GB | 16GB RAM | 代码生成专用 |
| deepseek-coder:6.7b | 3.8 GB | 16GB RAM | 代码能力强 |

#### 3. 启动服务

**使用启动脚本：**
```bash
chmod +x scripts/start-llm.sh
./scripts/start-llm.sh ollama      # 启动 Ollama（默认）
./scripts/start-llm.sh llama-cpp   # 启动 llama.cpp
./scripts/start-llm.sh local-ai    # 启动 LocalAI
```

**手动启动：**
```bash
# Ollama
ollama serve

# llama.cpp
./llama-server -m models/model.gguf --host 127.0.0.1 --port 8080

# LocalAI
local-ai run --address 127.0.0.1:8080
```

#### 4. 验证服务

```bash
# 检查服务状态
curl http://localhost:11434/api/tags

# 测试模型推理
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "你好",
  "stream": false
}'

# 交互式对话
ollama run qwen2.5:7b
```

---

## ⚙️ 配置 VoiceDev

本地 LLM 启动后，需要在 VoiceDev 中配置连接信息。

### 方法一：通过界面配置

1. 启动 VoiceDev: `npm run dev`
2. 点击侧边栏「系统设置」
3. 选择推理引擎（Ollama / llama.cpp / LocalAI）
4. 填写 API 端点（默认 `http://localhost:11434/api`）
5. 填写模型名称（如 `qwen2.5:7b`）
6. 调整温度和 Token 数

### 方法二：代码配置

在 `src/App.tsx` 中修改默认配置：

```typescript
const [llmConfig, setLLMConfig] = useState<LLMConfig>({
  provider: 'ollama',                    // 推理引擎
  endpoint: 'http://localhost:11434/api', // API 端点
  model: 'qwen2.5:7b',                   // 模型名称
  temperature: 0.7,                      // 温度参数
  maxTokens: 4096,                       // 最大 Token 数
  isLocal: true,                         // 本地运行
});
```

---

## 🔧 常见问题

### Q1: 模型下载很慢怎么办？

**解决方案：**

1. **使用国内镜像**（仅适用于 Ollama）
   ```bash
   # 设置环境变量
   export OLLAMA_MODELS=/path/to/custom/models
   
   # 或使用代理
   export https_proxy=http://127.0.0.1:7890
   ollama pull qwen2.5:7b
   ```

2. **手动下载模型文件**
   ```bash
   # 从 HuggingFace 镜像站下载
   wget https://hf-mirror.com/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf
   
   # 移动到 Ollama 模型目录
   mv qwen2.5-7b-instruct-q4_k_m.gguf ~/.ollama/models/
   ```

3. **使用轻量版模型**
   ```bash
   ollama pull qwen2.5:3b  # 只有 1.9GB
   ```

### Q2: 服务启动失败？

**检查清单：**

```bash
# 1. 检查端口是否被占用
lsof -i :11434  # macOS/Linux
netstat -ano | findstr :11434  # Windows

# 2. 检查 Ollama 进程
ps aux | grep ollama  # macOS/Linux
tasklist | findstr ollama  # Windows

# 3. 重启服务
pkill ollama
ollama serve
```

### Q3: 模型推理很慢？

**优化建议：**

1. **使用 GPU 加速**
   ```bash
   # Ollama 会自动使用 GPU（如果可用）
   # 检查 GPU 状态
   nvidia-smi  # NVIDIA GPU
   
   # llama.cpp 启用 GPU
   ./llama-server -m model.gguf -ngl 99  # 使用所有 GPU 层
   ```

2. **减小模型大小**
   ```bash
   ollama pull qwen2.5:3b  # 使用 3B 模型
   ```

3. **调整参数**
   ```typescript
   // 在 VoiceDev 设置中
   temperature: 0.5,    // 降低温度，减少计算
   maxTokens: 2048,     // 减少最大 Token 数
   ```

### Q4: 如何更换模型？

```bash
# 1. 下载新模型
ollama pull llama3.1:8b

# 2. 在 VoiceDev 中修改配置
# 系统设置 → 模型名称 → 输入 llama3.1:8b

# 3. 或删除旧模型
ollama rm qwen2.5:7b
```

### Q5: 如何查看模型占用空间？

```bash
# 查看所有模型大小
ollama list

# 查看具体目录大小
du -sh ~/.ollama/models  # macOS/Linux
```

---

## 📊 性能参考

### 硬件要求

| 配置 | 推荐模型 | 推理速度 |
|------|---------|---------|
| 8GB RAM, CPU | qwen2.5:3b | 5-10 tokens/s |
| 16GB RAM, CPU | qwen2.5:7b | 3-7 tokens/s |
| 16GB RAM, GPU (4GB) | qwen2.5:7b | 20-40 tokens/s |
| 32GB RAM, GPU (8GB+) | qwen2.5:7b | 40-80 tokens/s |

### 内存占用

| 模型 | RAM 占用 | VRAM 占用 (GPU) |
|------|---------|----------------|
| qwen2.5:3b | ~3 GB | ~2 GB |
| qwen2.5:7b | ~6 GB | ~5 GB |
| llama3.1:8b | ~6 GB | ~5 GB |

---

## 🔒 安全说明

### 数据隔离

✅ **所有数据都在本地处理**
- 语音识别：浏览器本地引擎
- 需求分析：本地 LLM
- 计划生成：本地 LLM
- 数据存储：本地文件系统

❌ **不会发送到任何外部服务器**
- 无云端 API 调用
- 无数据上传
- 无遥测数据

### 网络配置

```bash
# 完全离线模式（推荐）
# 1. 断开网络连接
# 2. 启动 Ollama
ollama serve

# 3. 启动 VoiceDev
npm run dev

# 所有功能正常运行，零网络依赖
```

---

## 🎯 快速开始

**3 步启动本地 LLM：**

```bash
# 1. 运行部署脚本
./scripts/setup-local-llm.sh

# 2. 启动 LLM 服务
./scripts/start-llm.sh

# 3. 启动 VoiceDev
npm run dev
```

**完成！** 现在可以通过语音输入需求，本地 LLM 会自动生成执行计划。

---

## 📚 相关文档

- [README.md](./README.md) - 项目主文档
- [TESTING.md](./TESTING.md) - 测试指南
- [LOCAL_LLM_DEPLOY.md](./LOCAL_LLM_DEPLOY.md) - 本文档

---

<p align="center">
  <strong>🦙 本地模型 · 完全离线 · 数据安全</strong>
</p>
