$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskFfmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
$taskMapping = Get-Content -Raw (Join-Path $taskRoot 'app/assets/audio.json') | ConvertFrom-Json
$taskPaths = @($taskMapping.PSObject.Properties.Value)
$taskResults = $taskPaths | ForEach-Object -Parallel {
 $taskPath = Join-Path (Join-Path $using:taskRoot 'app') $_
 $taskErrors = & $using:taskFfmpeg -hide_banner -v error -i $taskPath -f null NUL 2>&1
 [pscustomobject]@{path=$_;ok=($LASTEXITCODE -eq 0);errors=($taskErrors -join ' ')}
} -ThrottleLimit 4
$taskFailures = @($taskResults | Where-Object {!$_.ok})
if ($taskFailures.Count) {$taskFailures | Format-List; throw 'Audio decoder verification failed.'}
Write-Output ('Decoded all ' + $taskResults.Count + ' MP3 files successfully.')
