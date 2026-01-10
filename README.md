# JP Reading Assistant

开箱即跑的日语阅读助手：把日文文本解析为可学习的词汇与语法（含解释与示例）。

## 依赖
- Python 3.10+（推荐 3.11）
- Node.js 18+（Next.js 16）
- 可选：Ollama（本地模型）

## 一键运行（本地）
1) 后端依赖
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2) 配置环境变量（必须）
```bash
copy backend\.env.example backend\.env
```
然后编辑 `backend\.env`，按需设置：
```bash
LLM_PROVIDER_ANALYZER=ollama
LLM_PROVIDER_EXPLAINER=ollama
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
OLLAMA_MODEL=qwen2.5:7b
```

3) 启动后端
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
浏览器打开：`http://127.0.0.1:8000/docs`

4) 启动前端
```bash
cd frontend
npm install
npm run dev
```
浏览器打开：`http://localhost:3000`

## 使用 Ollama（可选）
如果你把 `LLM_PROVIDER_*` 设置为 `ollama`，请确保本机 Ollama 已安装并拉取模型：
```bash
ollama pull qwen2.5:7b
```
Ollama 默认地址是 `http://127.0.0.1:11434`。

## 常见问题
- 启动后端报缺包：确认已在项目根目录执行 `pip install -r requirements.txt`
- 前端无法请求后端：确保后端在 `8000`，前端在 `3000`，或调整 `backend/app/main.py` 的 CORS 配置
- LLM 无响应：检查 `backend\.env` 的 Provider 和 API Key 是否正确

