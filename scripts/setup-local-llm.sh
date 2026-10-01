#!/bin/bash
# ============================================================
# VoiceDev 本地 LLM 一键部署脚本
# 
# 功能：
#   1. 检测并安装 Ollama
#   2. 下载推荐模型
#   3. 启动本地 LLM 服务
#   4. 验证服务状态
#
# 用法：
#   chmod +x scripts/setup-local-llm.sh
#   ./scripts/setup-local-llm.sh
#
# 模型存放位置（Ollama 默认）：
#   macOS:   ~/.ollama/models
#   Linux:   /usr/share/ollama/.ollama/models 或 ~/.ollama/models
#   Windows: C:\Users\<用户名>\.ollama\models
# ============================================================

set -e

# ============== 颜色输出 ==============
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# ============== 配置 ==============
RECOMMENDED_MODEL="qwen2.5:7b"
FALLBACK_MODEL="qwen2.5:3b"
OLLAMA_ENDPOINT="http://localhost:11434"

# ============== 检测系统 ==============
detect_os() {
    case "$(uname -s)" in
        Darwin*)  echo "macos";;
        Linux*)   echo "linux";;
        CYGWIN*|MINGW*|MSYS*) echo "windows";;
        *)        echo "unknown";;
    esac
}

OS=$(detect_os)
info "检测到操作系统: $OS"

# ============== 检查 Ollama ==============
check_ollama() {
    if command -v ollama &> /dev/null; then
        success "Ollama 已安装: $(ollama --version)"
        return 0
    else
        warn "Ollama 未安装"
        return 1
    fi
}

# ============== 安装 Ollama ==============
install_ollama() {
    info "正在安装 Ollama..."
    
    case "$OS" in
        macos)
            info "macOS: 使用官方安装脚本"
            curl -fsSL https://ollama.com/install.sh | sh
            ;;
        linux)
            info "Linux: 使用官方安装脚本"
            curl -fsSL https://ollama.com/install.sh | sh
            ;;
        windows)
            error "Windows 用户请手动下载安装："
            echo "  下载地址: https://ollama.com/download/OllamaSetup.exe"
            echo "  安装后重新运行此脚本"
            exit 1
            ;;
    esac
    
    success "Ollama 安装完成"
}

# ============== 启动 Ollama 服务 ==============
start_ollama_service() {
    info "检查 Ollama 服务状态..."
    
    if curl -s "$OLLAMA_ENDPOINT/api/tags" > /dev/null 2>&1; then
        success "Ollama 服务已在运行"
        return 0
    fi
    
    info "正在启动 Ollama 服务..."
    
    case "$OS" in
        macos)
            # macOS 上 Ollama 通常作为应用运行
            if [ -d "/Applications/Ollama.app" ]; then
                open -a Ollama
            else
                ollama serve &
            fi
            ;;
        linux)
            # Linux 上检查 systemd
            if systemctl is-active --quiet ollama 2>/dev/null; then
                success "Ollama 服务已通过 systemd 启动"
            else
                ollama serve &
                sleep 2
            fi
            ;;
    esac
    
    # 等待服务就绪
    info "等待服务就绪..."
    for i in {1..30}; do
        if curl -s "$OLLAMA_ENDPOINT/api/tags" > /dev/null 2>&1; then
            success "Ollama 服务已启动"
            return 0
        fi
        sleep 1
    done
    
    error "Ollama 服务启动超时"
    return 1
}

# ============== 下载模型 ==============
download_model() {
    local model=$1
    
    info "检查模型: $model"
    
    # 检查模型是否已下载
    if ollama list 2>/dev/null | grep -q "$model"; then
        success "模型已存在: $model"
        return 0
    fi
    
    info "正在下载模型: $model (这可能需要几分钟)"
    info "模型将保存到: $(get_model_path)"
    
    ollama pull "$model"
    
    if [ $? -eq 0 ]; then
        success "模型下载完成: $model"
    else
        error "模型下载失败: $model"
        return 1
    fi
}

# ============== 获取模型存储路径 ==============
get_model_path() {
    case "$OS" in
        macos)
            echo "~/.ollama/models"
            ;;
        linux)
            if [ -d "/usr/share/ollama/.ollama/models" ]; then
                echo "/usr/share/ollama/.ollama/models"
            else
                echo "~/.ollama/models"
            fi
            ;;
        windows)
            echo "C:\\Users\\%USERNAME%\\.ollama\\models"
            ;;
    esac
}

# ============== 验证服务 ==============
verify_service() {
    info "验证服务状态..."
    
    # 检查 API 是否可访问
    if curl -s "$OLLAMA_ENDPOINT/api/tags" | grep -q "models"; then
        success "API 端点可访问: $OLLAMA_ENDPOINT"
    else
        error "API 端点不可访问"
        return 1
    fi
    
    # 列出已安装的模型
    echo ""
    info "已安装的模型:"
    ollama list
    echo ""
    
    # 测试模型是否能运行
    info "测试模型推理..."
    local test_result=$(curl -s "$OLLAMA_ENDPOINT/api/generate" \
        -d "{\"model\": \"$RECOMMENDED_MODEL\", \"prompt\": \"hi\", \"stream\": false}" \
        --max-time 60 2>/dev/null)
    
    if [ -n "$test_result" ]; then
        success "模型推理正常"
    else
        warn "模型推理测试超时（可能是首次加载，属正常现象）"
    fi
}

# ============== 输出使用指南 ==============
print_usage() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}  ✅ 本地 LLM 环境部署完成！${NC}"
    echo "=========================================="
    echo ""
    echo "📁 模型存储位置:"
    echo "   $(get_model_path)"
    echo ""
    echo "🔧 常用命令:"
    echo "   ollama serve              # 启动服务"
    echo "   ollama list               # 查看已安装模型"
    echo "   ollama pull <模型名>       # 下载新模型"
    echo "   ollama run <模型名>        # 交互式对话"
    echo "   ollama rm <模型名>         # 删除模型"
    echo ""
    echo "📡 API 端点:"
    echo "   $OLLAMA_ENDPOINT"
    echo ""
    echo "🌐 推荐模型:"
    echo "   qwen2.5:7b     - 中文能力优秀，推荐 (4.7GB)"
    echo "   qwen2.5:3b     - 轻量版，适合低配机器 (1.9GB)"
    echo "   llama3.1:8b    - 英文能力强 (4.7GB)"
    echo "   codellama:7b   - 代码专用 (3.8GB)"
    echo "   deepseek-coder:6.7b - 代码生成 (3.8GB)"
    echo ""
    echo "🚀 启动 VoiceDev:"
    echo "   npm run dev"
    echo ""
    echo "=========================================="
}

# ============== 主流程 ==============
main() {
    echo ""
    echo "=========================================="
    echo "  VoiceDev 本地 LLM 部署工具"
    echo "=========================================="
    echo ""
    
    # 1. 检查/安装 Ollama
    if ! check_ollama; then
        install_ollama
    fi
    
    # 2. 启动服务
    start_ollama_service
    
    # 3. 下载模型
    if ! download_model "$RECOMMENDED_MODEL"; then
        warn "推荐模型下载失败，尝试轻量版..."
        download_model "$FALLBACK_MODEL"
    fi
    
    # 4. 验证
    verify_service
    
    # 5. 输出指南
    print_usage
}

main "$@"
