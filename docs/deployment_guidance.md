你的理解基本正确，但有一个关键区别：

- Vercel 已经连接 GitHub，所以可以自动更新。
- 当前 GCP Cloud Run 没有连接 GitHub；你只是把 Cloud Shell 中当时那份代码手动交给 Cloud Build 构建。因此后端更新需要手动执行，除非后续配置自动部署。

现在的关系是：

```text
GitHub 仓库
  ├─ frontend/ ──自动构建──> Vercel
  │                            │
  │                            │ 浏览器加载前端
  │                            ▼
  │                          用户浏览器
  │                            │
  │                            │ HTTPS API 请求
  │                            ▼
  └─ backend/ ──目前手动──> Cloud Build
                               │
                               │ 构建 Docker 镜像
                               ▼
                        Artifact Registry
                               │
                               │ 部署镜像
                               ▼
                           Cloud Run
                         FastAPI :8000
                               │
                               ▼
                          Gemini API
```

## 各部分分别负责什么

### GitHub

它是源代码的保存位置，包含：

```text
frontend/
backend/
backend/Dockerfile
cloudbuild.yaml
```

GitHub 本身不运行你的应用。

### Vercel

Vercel 连接了 GitHub：

1. 你向 GitHub `main` 分支推送代码。
2. Vercel 检测到新 commit。
3. Vercel构建 `frontend/`。
4. 自动发布新版前端。

所以前端一般不需要手动操作。

Vercel 中的：

```text
NEXT_PUBLIC_BACKEND_URL
```

告诉浏览器后端位于哪个 Cloud Run 地址。

### Cloud Build

你运行：

```bash
gcloud builds submit ...
```

时，Cloud Build 会：

1. 上传 Cloud Shell 当前目录中的代码快照。
2. 根据 `cloudbuild.yaml` 执行构建。
3. 使用 `backend/Dockerfile` 创建 Docker 镜像。
4. 把镜像上传到 Artifact Registry。

它不会持续同步 GitHub。每次执行，只构建执行命令时的那份代码。

### Artifact Registry

它相当于 GCP 的 Docker 镜像仓库，保存：

```text
europe-west3-docker.pkg.dev/.../backend:latest
```

它只保存构建结果，不直接运行应用。

### Cloud Run

Cloud Run 从 Artifact Registry 取得 Docker 镜像，然后：

1. 启动 FastAPI 容器。
2. 让容器监听 8000 端口。
3. 对外提供 HTTPS 地址。
4. 将请求转发到容器的 8000 端口。
5. 无请求时可以缩容到 0。

浏览器直接请求 Cloud Run，不是 Vercel 服务器代为请求，所以 Cloud Run 需要正确配置 CORS。

---

# 以后怎么更新

## 情况一：只修改前端

例如修改：

```text
frontend/app/page.tsx
frontend/components/
frontend/app/globals.css
```

只需要提交并推送 GitHub：

```bash
git add .
git commit -m "update frontend"
git push origin main
```

Vercel 会自动重新部署。

Cloud Run 不需要更新。

## 情况二：修改后端

例如修改：

```text
backend/app/
backend/requirements.txt
requirements.txt
backend/Dockerfile
```

先把代码推送到 GitHub：

```bash
git add .
git commit -m "update backend"
git push origin main
```

然后打开 Cloud Shell。

### 1. 进入仓库

Cloud Shell 的 Home 目录通常会保留，因此之前 clone 的仓库可能仍在：

```bash
cd ~/ai-reading-workflow
```

拉取最新代码：

```bash
git pull origin main
```

确认最新 commit：

```bash
git log -1 --oneline
```

### 2. 重新设置变量

Cloud Shell 关闭后，变量可能消失：

```bash
PROJECT_ID="gen-lang-client-0283883707"
REGION="europe-west3"
REPOSITORY="ai-reading-images"
SERVICE="ai-reading-workflow"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/backend:latest"
```

确认项目：

```bash
gcloud config set project "$PROJECT_ID"
```

### 3. 重新构建镜像

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions="_IMAGE=$IMAGE" \
  .
```

等到显示：

```text
STATUS: SUCCESS
```

### 4. 更新 Cloud Run

```bash
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION"
```

现有的环境变量、Secret、端口和资源设置通常会被保留。Cloud Run 会创建一个新的 Revision，并将流量切换到新版。

部署后检查：

```bash
CLOUD_RUN_URL="$(gcloud run services describe "$SERVICE" \
  --region "$REGION" \
  --format='value(status.url)')"

curl "${CLOUD_RUN_URL}/health"
```

Cloud Run 地址一般不会改变，所以 Vercel 的 `NEXT_PUBLIC_BACKEND_URL` 不需要修改。

## 情况三：前后端都修改

流程是：

```text
提交并推送 GitHub
   ├─ Vercel 自动更新前端
   └─ 你在 Cloud Shell 手动构建并部署后端
```

---

# 当前后端更新命令汇总

以后打开 Cloud Shell，基本执行下面这一组：

```bash
cd ~/ai-reading-workflow
git pull origin main

PROJECT_ID="gen-lang-client-0283883707"
REGION="europe-west3"
REPOSITORY="ai-reading-images"
SERVICE="ai-reading-workflow"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/backend:latest"

gcloud config set project "$PROJECT_ID"

gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions="_IMAGE=$IMAGE" \
  .

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION"
```

## 是否要让 GCP 也自动部署

有三个选择：

| 方式 | 优点 | 缺点 |
|---|---|---|
| 当前手动部署 | 简单、可控、不容易误发版 | 每次要打开 Cloud Shell |
| Cloud Build GitHub Trigger | 推送后自动构建并部署，属于 GCP 原生方案 | 初次配置 IAM 稍复杂 |
| GitHub Actions | 前后端工作流集中在 GitHub | 需要配置 GCP 身份认证 |

目前建议先继续手动部署。等流程稳定后，再配置 Cloud Build Trigger，实现：

```text
git push main
  ├─ Vercel 自动部署前端
  └─ Cloud Build 自动部署后端到 Cloud Run
```

另外，前端部署更新和后端部署更新可能有几分钟时间差。如果以后修改了 API 请求或响应结构，最好先部署兼容新旧前端的后端，再更新前端，避免短时间内版本不兼容。