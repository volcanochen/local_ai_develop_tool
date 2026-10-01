@echo off
REM ============================================================
REM VoiceDev 本地 LLM 一键部署脚本 (Windows)
REM 
REM 功能：
REM   1. 检测并安装 Ollama
REM   2. 下载推荐模型
REM   3. 启动本地 LLM 服务
REM   4. 验证服务状态
REM
REM 用法：
REM   双击运行 scripts\setup-local-llm.bat
REM   或在命令行执行: scripts\setup-local-llm.bat
REM
REM 模型存放位置：
REM   C:\Users\<用户名>\.ollama\models
REM ============================================================

echo.
echo ==========================================
echo   VoiceDev 本地 LLM 部署工具 (Windows)
echo ==========================================
echo.

REM 检查 Ollama 是否安装
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Ollama 未安装
    echo.
    echo 请手动下载安装 Ollama:
    echo   下载地址: https://ollama.com/download/OllamaSetup.exe
    echo.
    echo 安装完成后，请重新运行此脚本。
    echo.
    pause
    exit /b 1
)

echo [OK] Ollama 已安装

REM 检查服务是否运行
curl -s http://localhost:11434/api/tags >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] 正在启动 Ollama 服务...
    start "" ollama serve
    timeout /t 5 /nobreak >nul
)

echo [OK] Ollama 服务已运行

REM 下载模型
echo [INFO] 检查模型: qwen2.5:7b
ollama list | findstr "qwen2.5:7b" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] 正在下载模型 qwen2.5:7b (约 4.7GB，需要几分钟)...
    echo [INFO] 模型将保存到: %%USERPROFILE%%\.ollama\models
    ollama pull qwen2.5:7b
) else (
    echo [OK] 模型已存在
)

REM 验证
echo.
echo [INFO] 已安装的模型:
ollama list

echo.
echo ==========================================
echo   部署完成！
echo ==========================================
echo.
echo 模型存储位置:
echo   %USERPROFILE%\.ollama\models
echo.
echo 常用命令:
echo   ollama serve              启动服务
echo   ollama list               查看已安装模型
echo   ollama pull ^<模型名^>       下载新模型
echo   ollama run ^<模型名^>        交互式对话
echo.
echo 推荐模型:
echo   qwen2.5:7b     中文能力优秀 (4.7GB)
echo   qwen2.5:3b     轻量版 (1.9GB)
echo   llama3.1:8b    英文能力强 (4.7GB)
echo   codellama:7b   代码专用 (3.8GB)
echo.
echo API 端点:
echo   http://localhost:11434
echo.
echo 启动 VoiceDev:
echo   npm run dev
echo.
echo ==========================================
echo.

pause
