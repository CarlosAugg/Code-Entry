param(
  [string]$ProjectDir = "",
  [switch]$NoBrowser,
  [switch]$ExitAfterReady
)

$ErrorActionPreference = "Stop"

try {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

function Write-Step([string]$Tag, [string]$Message, [ConsoleColor]$Color = [ConsoleColor]::Gray) {
  Write-Host "[$Tag] " -ForegroundColor $Color -NoNewline
  Write-Host $Message
}

function Test-CodeEntryHealth([string]$BaseUrl) {
  if ([string]::IsNullOrWhiteSpace($BaseUrl)) { return $false }
  try {
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get -TimeoutSec 2
    return ($null -ne $resp -and $resp.ok -eq $true -and $resp.service -eq "code-entry-api")
  } catch {
    return $false
  }
}

function Test-PageReachable([string]$BaseUrl) {
  try {
    $resp = Invoke-WebRequest -Uri "$BaseUrl/" -Method Get -UseBasicParsing -TimeoutSec 2
    return ($resp.StatusCode -eq 200)
  } catch {
    return $false
  }
}

function Test-BuildNeeded([string]$RootDir) {
  $distIndex = Join-Path $RootDir "dist\index.html"
  if (-not (Test-Path -LiteralPath $distIndex)) {
    return $true
  }
  $distTime = (Get-Item -LiteralPath $distIndex).LastWriteTimeUtc
  $watchRoots = @(
    (Join-Path $RootDir "src"),
    (Join-Path $RootDir "public")
  )
  foreach ($wr in $watchRoots) {
    if (Test-Path -LiteralPath $wr) {
      $newer = Get-ChildItem -LiteralPath $wr -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTimeUtc -gt $distTime } |
        Select-Object -First 1
      if ($null -ne $newer) { return $true }
    }
  }
  foreach ($f in @("index.html", "package.json", "vite.config.ts")) {
    $fp = Join-Path $RootDir $f
    if ((Test-Path -LiteralPath $fp) -and ((Get-Item -LiteralPath $fp).LastWriteTimeUtc -gt $distTime)) {
      return $true
    }
  }
  return $false
}

$RootDir = if ([string]::IsNullOrWhiteSpace($ProjectDir)) {
  Split-Path -Parent $PSScriptRoot
} else {
  $ProjectDir.Trim().Trim('"').TrimEnd('\', '/')
}

if (-not (Test-Path -LiteralPath (Join-Path $RootDir "package.json"))) {
  Write-Step "ERRO" "Pasta do projeto invalida: $RootDir" ([ConsoleColor]::Red)
  exit 1
}

Set-Location -LiteralPath $RootDir
Write-Host ""
Write-Step "CODE ENTRY" "Inicializando aplicacao em $RootDir..." ([ConsoleColor]::Magenta)

# 1. Verifica Node.js e npm
Write-Step "INFO" "Verificando ambiente (Node.js e npm)..." ([ConsoleColor]::Cyan)
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($null -eq $npmCmd) { $npmCmd = Get-Command npm -ErrorAction SilentlyContinue }

if ($null -eq $nodeCmd -or $null -eq $npmCmd) {
  Write-Step "ERRO" "Node.js ou npm nao encontrados no PATH." ([ConsoleColor]::Red)
  Write-Host "      Instale o Node.js LTS (v22.5 ou superior) em https://nodejs.org e tente novamente."
  exit 2
}

$nodeVerRaw = (& $nodeCmd.Source -v).Trim()
if ($nodeVerRaw -match "^v?(\d+)\.(\d+)\.") {
  $maj = [int]$Matches[1]
  $min = [int]$Matches[2]
  if ($maj -lt 22 -or ($maj -eq 22 -and $min -lt 5)) {
    Write-Step "ERRO" "Versao do Node.js ($nodeVerRaw) incompativel. Necessario Node.js v22.5 ou superior." ([ConsoleColor]::Red)
    exit 2
  }
}
Write-Step "OK" "Ambiente verificado (Node $nodeVerRaw)." ([ConsoleColor]::Green)

# 2. Evita multiplas instancias simultaneas
$runtimeFile = Join-Path $RootDir "data\.server-runtime.json"
$existingUrl = $null

if (Test-Path -LiteralPath $runtimeFile) {
  try {
    $rt = Get-Content -LiteralPath $runtimeFile -Raw | ConvertFrom-Json
    if ($rt -and $rt.pid -and $rt.url) {
      $existingProc = Get-Process -Id ([int]$rt.pid) -ErrorAction SilentlyContinue
      if ($null -ne $existingProc -and (Test-CodeEntryHealth $rt.url)) {
        $existingUrl = [string]$rt.url
      } else {
        Remove-Item -LiteralPath $runtimeFile -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    Remove-Item -LiteralPath $runtimeFile -Force -ErrorAction SilentlyContinue
  }
}

if (-not $existingUrl -and (Test-CodeEntryHealth "http://127.0.0.1:3000")) {
  $existingUrl = "http://127.0.0.1:3000"
}

if ($existingUrl) {
  Write-Step "OK" "Code Entry ja esta em execucao em $existingUrl!" ([ConsoleColor]::Green)
  if (-not $NoBrowser) {
    Write-Step "INFO" "Abrindo navegador na instancia ativa..." ([ConsoleColor]::Cyan)
    Start-Process $existingUrl | Out-Null
  }
  Write-Host ""
  if (-not $ExitAfterReady) {
    Start-Sleep -Seconds 2
  }
  exit 0
}

# 3. Verifica e instala dependencias se necessario
$nodeModulesDir = Join-Path $RootDir "node_modules"
$reactPkgDir = Join-Path $nodeModulesDir "react"
if (-not (Test-Path -LiteralPath $nodeModulesDir) -or -not (Test-Path -LiteralPath $reactPkgDir)) {
  Write-Step "INFO" "Dependencias nao encontradas. Executando npm install..." ([ConsoleColor]::Yellow)
  & $npmCmd.Source install
  if ($LASTEXITCODE -ne 0) {
    Write-Step "ERRO" "Falha ao instalar dependencias com npm install." ([ConsoleColor]::Red)
    exit 3
  }
}
Write-Step "OK" "Dependencias disponiveis." ([ConsoleColor]::Green)

# 4. Verifica compilacao de producao
if (Test-BuildNeeded $RootDir) {
  Write-Step "INFO" "Compilando interface de producao (npm run build)..." ([ConsoleColor]::Cyan)
  & $npmCmd.Source run build
  if ($LASTEXITCODE -ne 0) {
    Write-Step "ERRO" "Falha ao compilar o frontend (npm run build)." ([ConsoleColor]::Red)
    exit 4
  }
}
Write-Step "OK" "Interface compilada e pronta." ([ConsoleColor]::Green)

# 5. Inicia o servidor Node em processo gerenciado
Write-Step "INFO" "Iniciando servidor local do Code Entry..." ([ConsoleColor]::Cyan)
$stamp = [Guid]::NewGuid().ToString("N").Substring(0, 8)
$tempOut = Join-Path $env:TEMP "code-entry-out-$stamp.log"
$tempErr = Join-Path $env:TEMP "code-entry-err-$stamp.log"

$serverProc = Start-Process `
  -FilePath $nodeCmd.Source `
  -ArgumentList "server/index.mjs" `
  -WorkingDirectory $RootDir `
  -RedirectStandardOutput $tempOut `
  -RedirectStandardError $tempErr `
  -NoNewWindow `
  -PassThru

$serverUrl = $null

try {
  Write-Step "INFO" "Aguardando servidor ficar disponivel..." ([ConsoleColor]::Cyan)
  $deadline = (Get-Date).AddSeconds(30)

  while ((Get-Date) -lt $deadline) {
    if ($serverProc.HasExited) {
      Write-Step "ERRO" "O servidor encerrou inesperadamente durante a inicializacao." ([ConsoleColor]::Red)
      if (Test-Path -LiteralPath $tempErr) {
        $errText = Get-Content -LiteralPath $tempErr -Raw -ErrorAction SilentlyContinue
        if (-not [string]::IsNullOrWhiteSpace($errText)) {
          Write-Host $errText -ForegroundColor Red
        }
      }
      exit 5
    }

    if (-not $serverUrl) {
      if (Test-Path -LiteralPath $tempOut) {
        $outText = Get-Content -LiteralPath $tempOut -Raw -ErrorAction SilentlyContinue
        if ($outText -match "(http://127\.0\.0\.1:\d+)") {
          $serverUrl = $Matches[1]
        }
      }
      if (-not $serverUrl -and (Test-Path -LiteralPath $runtimeFile)) {
        try {
          $rtNow = Get-Content -LiteralPath $runtimeFile -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
          if ($rtNow -and [int]$rtNow.pid -eq $serverProc.Id -and $rtNow.url) {
            $serverUrl = [string]$rtNow.url
          }
        } catch {}
      }
    }

    if ($serverUrl -and (Test-CodeEntryHealth $serverUrl) -and (Test-PageReachable $serverUrl)) {
      break
    }

    Start-Sleep -Milliseconds 250
  }

  if (-not $serverUrl -or -not (Test-CodeEntryHealth $serverUrl)) {
    Write-Step "ERRO" "Tempo esgotado aguardando o Code Entry responder em localhost." ([ConsoleColor]::Red)
    exit 6
  }

  Write-Step "OK" "Code Entry esta disponivel em $serverUrl!" ([ConsoleColor]::Green)

  if (-not $NoBrowser) {
    Write-Step "INFO" "Abrindo navegador padrao..." ([ConsoleColor]::Cyan)
    Start-Process $serverUrl | Out-Null
  }

  if ($ExitAfterReady) {
    exit 0
  }

  Write-Host ""
  Write-Host "  ================================================================" -ForegroundColor DarkCyan
  Write-Host "    CODE ENTRY em execucao!" -ForegroundColor White
  Write-Host "    Endereco local: $serverUrl" -ForegroundColor Green
  Write-Host ""
  Write-Host "    Mantenha esta janela aberta enquanto estiver usando a plataforma." -ForegroundColor Gray
  Write-Host "    Pressione [Q] ou [Ctrl+C] aqui para encerrar com seguranca." -ForegroundColor Yellow
  Write-Host "  ================================================================" -ForegroundColor DarkCyan
  Write-Host ""

  while (-not $serverProc.HasExited) {
    try {
      if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        if ($key.Key -eq [ConsoleKey]::Q) {
          Write-Step "INFO" "Encerrando Code Entry por solicitacao do usuario..." ([ConsoleColor]::Yellow)
          break
        }
      }
    } catch {
      # Ambiente sem console interativo: aguarda ate o processo filho encerrar
    }
    Start-Sleep -Milliseconds 300
  }
} finally {
  if ($null -ne $serverProc -and -not $serverProc.HasExited) {
    try {
      Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
      $serverProc.WaitForExit(3000) | Out-Null
    } catch {}
  }
  if ($null -ne $serverProc -and (Test-Path -LiteralPath $runtimeFile)) {
    try {
      $rtCleanup = Get-Content -LiteralPath $runtimeFile -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
      if ($rtCleanup -and [int]$rtCleanup.pid -eq $serverProc.Id) {
        Remove-Item -LiteralPath $runtimeFile -Force -ErrorAction SilentlyContinue
      }
    } catch {}
  }
  Remove-Item -LiteralPath $tempOut -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $tempErr -Force -ErrorAction SilentlyContinue
}
