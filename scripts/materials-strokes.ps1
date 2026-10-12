$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskAssets = Join-Path $taskRoot 'app/assets'
$taskSvg = Join-Path $taskAssets 'kanjivg'
New-Item -ItemType Directory -Path $taskSvg -Force | Out-Null
$taskCodes = Get-Content -Raw (Join-Path $taskAssets 'stroke-codes.json') | ConvertFrom-Json
$taskCommit = '70a0b7ae0c18ceb5cb358274b029cce0234a43bc'
$taskResults = $taskCodes | ForEach-Object -Parallel {
 $taskCode = $_
 $taskFile = Join-Path $using:taskSvg ($taskCode + '.svg')
 $taskUrl = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/' + $using:taskCommit + '/kanji/' + $taskCode + '.svg'
 try {
  if (!(Test-Path -LiteralPath $taskFile)) {Invoke-WebRequest -Uri $taskUrl -OutFile $taskFile -TimeoutSec 30}
  [pscustomobject]@{ code=$taskCode; status='ok'; url=$taskUrl; sha256=(Get-FileHash -LiteralPath $taskFile).Hash }
 } catch { [pscustomobject]@{code=$taskCode;status='unavailable';url=$taskUrl;error=$_.Exception.Message} }
} -ThrottleLimit 8
$taskResults | Sort-Object code | ConvertTo-Json -Depth 4 | Set-Content -Encoding utf8 (Join-Path $taskAssets 'stroke-manifest.json')
Write-Output ('Downloaded ' + @($taskResults | Where-Object status -eq 'ok').Count + '/' + $taskCodes.Count + ' SVGs at ' + $taskCommit)
node (Join-Path $PSScriptRoot 'materials-extract.mjs')
