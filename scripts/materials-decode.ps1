$ErrorActionPreference='Stop'
$taskRoot=Split-Path $PSScriptRoot -Parent
$taskIndex=Get-Content -LiteralPath (Join-Path $taskRoot 'app/assets/audio.json') -Raw | ConvertFrom-Json -AsHashtable
$taskFiles=@($taskIndex.Values | Select-Object -Unique | ForEach-Object { Join-Path $taskRoot ('app/'+$_) })
$taskFfmpeg=(Get-Command ffmpeg -ErrorAction Stop).Source
$taskResults=@($taskFiles | ForEach-Object -Parallel {
 $taskFile=$_
 & $using:taskFfmpeg -hide_banner -loglevel error -i $taskFile -f null - 2>$null
 if($LASTEXITCODE -ne 0){$taskFile}
} -ThrottleLimit 6)
if($taskResults.Count){$taskResults | Write-Output;throw 'MP3 decoding failed'}
Write-Output ('Decoded all '+$taskFiles.Count+' unique MP3 files successfully.')
