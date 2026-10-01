#!/bin/bash
# ============================================================
# 启动本地 LLM 服务
# 
# 用法：
#   ./scripts/start-llm.sh [provider]
#
# 示例：
#   ./scripts/start-llm.sh ollama      # 启动 Ollama (默认)
#   ./scripts/start-llm.sh llama-cpp   # 启动 llama.cpp
#   ./scripts/start-llm.sh local-ai    # 启动 LocalAI
# ============================================================

set -e

PROVIDER=${1:-ollama}

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }

case "$PROVIDER" in
    ollama)
        info "启动 Ollama 服务..."
        
        # 检查是否已运行
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            success "Ollama 已在运行"
        else
            # 启动服务
            if command -v ollama &> /dev/null; then
                ollama serve &
                OLLAMA_PID=$!
                echo $OLLAMA_PID > /tmp/ollama.pid
                success "Ollama 已启动 (PID: $OLLAMA_PID)"
                
                # 等待就绪
                for i in {1..10}; do
                    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
                        success "服务已就绪"
                        break
                    fi
                    sleep 1
                done
            else
                echo "错误: Ollama 未安装"
                echo "请运行: ./scripts/setup-local-llm.sh"
                exit 1
            fi
        fi
        
        echo ""
        echo "=========================================="
        echo "  Ollama 服务信息"
        echo "=========================================="
        echo "  端点: http://localhost:11434"
        echo "  模型: $(ollama list | tail -n +2 | head -1 | awk '{print $1}')"
        echo "  日志: ollama logs (如果支持)"
        echo ""
        echo "  停止服务: kill \$(cat /tmp/ollama.pid)"
        echo "  或: pkill ollama"
        echo "=========================================="
        ;;
        
    llama-cpp)
        info "启动 llama.cpp 服务..."
        
        # 检查 server 可执行文件
        if [ ! -f "./llama-server" ] && [ ! -f "./server" ]; then
            echo "错误: llama.cpp server 未找到"
            echo "请先编译 llama.cpp:"
            echo "  git clone https://github.com/ggerganov/llama.cpp"
            echo "  cd llama.cpp"
            echo "  make server"
            echo "  cp build/bin/server /path/to/voicetask-framework/"
            exit 1
        fi
        
        # 检查模型文件
        MODEL_PATH="./models/model.gguf"
        if [ ! -f "$MODEL_PATH" ]; then
            echo "错误: 模型文件未找到"
            echo "请将 GGUF 模型文件放到: $MODEL_PATH"
            echo ""
            echo "下载模型:"
            echo "  https://huggingface.co/TheBloke/CodeLlama-7B-Instruct-GGUF"
            exit 1
        fi
        
        # 启动服务
        SERVER_BIN="./llama-server"
        [ -f "./server" ] && SERVER_BIN="./server"
        
        $SERVER_BIN \
            -m "$MODEL_PATH" \
            --host 127.0.0.1 \
            --port 8080 \
            --ctx-size 4096 \
            --n-gpu-layers -1 \
            &
        
        LLAMA_PID=$!
        echo $LLAMA_PID > /tmp/llama-cpp.pid
        success "llama.cpp 已启动 (PID: $LLAMA_PID)"
        
        echo ""
        echo "=========================================="
        echo "  llama.cpp 服务信息"
        echo "=========================================="
        echo "  端点: http://localhost:8080"
        echo "  模型: $MODEL_PATH"
        echo ""
        echo "  停止服务: kill \$(cat /tmp/llama-cpp.pid)"
        echo "=========================================="
        ;;
        
    local-ai)
        info "启动 LocalAI 服务..."
        
        if ! command -v local-ai &> /dev/null; then
            echo "错误: LocalAI 未安装"
            echo "安装命令:"
            echo "  curl https://localai.io/install.sh | sh"
            exit 1
        fi
        
        local-ai run --address 127.0.0.1:8080 &
        LOCALAI_PID=$!
        echo $LOCALAI_PID > /tmp/local-ai.pid
        success "LocalAI 已启动 (PID: $LOCALAI_PID)"
        
        echo ""
        echo "=========================================="
        echo "  LocalAI 服务信息"
        echo "=========================================="
        echo "  端点: http://localhost:8080"
        echo "  Web UI: http://localhost:8080"
        echo ""
        echo "  停止服务: kill \$(cat /tmp/local-ai.pid)"
        echo "=========================================="
        ;;
        
    *)
        echo "错误: 不支持的 provider: $PROVIDER"
        echo "支持的选项: ollama, llama-cpp, local-ai"
        exit 1
        ;;
esac

echo ""
echo "启动 VoiceDev 开发服务器:"
echo "  npm run dev"
echo ""
