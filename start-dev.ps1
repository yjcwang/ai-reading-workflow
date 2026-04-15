<#
What the script does:
- reuse existing `backend/.env` and `frontend/.env` if they already exist
- create `backend/.env` from `.env.example` if missing
- create `frontend/.env.local` with `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000` if neither frontend env file exists
- create `backend/.venv` automatically if missing
- start backend and frontend in separate PowerShell windows
- open `http://localhost:3000` automatically
#>

param(
    [switch]$Install,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$backendVenvPython = Join-Path $backendDir ".venv\Scripts\python.exe"
$backendEnvPath = Join-Path $backendDir ".env"
$backendEnvExamplePath = Join-Path $backendDir ".env.example"
$frontendEnvPath = Join-Path $frontendDir ".env"
$frontendEnvLocalPath = Join-Path $frontendDir ".env.local"

function Write-Step([string]$Message) {
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Ensure-Command([string]$CommandName, [string]$Hint) {
    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "$CommandName not found. $Hint"
    }
}

function Ensure-BackendEnv() {
    if (Test-Path $backendEnvPath) {
        return
    }

    if (Test-Path $backendEnvExamplePath) {
        Copy-Item $backendEnvExamplePath $backendEnvPath
        Write-Step "Created backend\.env from .env.example"
        return
    }

    Set-Content -Path $backendEnvPath -Value @(
        "LLM_PROVIDER_ANALYZER=mock"
        "LLM_PROVIDER_EXPLAINER=mock"
        "LLM_PROVIDER_TRANSLATOR=mock"
        "LLM_PROVIDER_TEXT_GENERATOR=mock"
        "ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000"
    )
    Write-Step "Created backend\.env with local defaults"
}

function Ensure-FrontendEnv() {
    $backendUrlLine = "NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000"

    if (Test-Path $frontendEnvPath) {
        return
    }

    if (Test-Path $frontendEnvLocalPath) {
        return
    }

    Set-Content -Path $frontendEnvLocalPath -Value $backendUrlLine
    Write-Step "Created frontend\.env.local with backend URL"
}

function Ensure-BackendVenv() {
    if (Test-Path $backendVenvPython) {
        return
    }

    Write-Step "Creating backend virtual environment"
    & python -m venv (Join-Path $backendDir ".venv")
}

function Install-BackendDeps() {
    Write-Step "Installing backend dependencies"
    & $backendVenvPython -m pip install -r (Join-Path $projectRoot "requirements.txt")
}

function Install-FrontendDeps() {
    Write-Step "Installing frontend dependencies"
    & npm install
}

function Start-Backend() {
    Write-Step "Starting backend at http://127.0.0.1:8000"
    $command = "Set-Location '$backendDir'; & '.\.venv\Scripts\Activate.ps1'; uvicorn app.main:app --reload"
    Start-Process powershell -WorkingDirectory $backendDir -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $command
    ) | Out-Null
}

function Start-Frontend() {
    Write-Step "Starting frontend at http://localhost:3000"
    $command = "Set-Location '$frontendDir'; npm run dev"
    Start-Process powershell -WorkingDirectory $frontendDir -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $command
    ) | Out-Null
}

Ensure-Command "python" "Install Python and ensure it is in PATH."
Ensure-Command "npm" "Install Node.js and ensure npm is in PATH."

Ensure-BackendEnv
Ensure-FrontendEnv
Ensure-BackendVenv

if ($Install) {
    Install-BackendDeps
    Push-Location $frontendDir
    try {
        Install-FrontendDeps
    }
    finally {
        Pop-Location
    }
}

Start-Backend
Start-Sleep -Seconds 2
Start-Frontend

if (-not $NoBrowser) {
    Write-Step "Opening browser"
    Start-Process "http://localhost:3000" | Out-Null
}

Write-Step "Dev environment launched"
