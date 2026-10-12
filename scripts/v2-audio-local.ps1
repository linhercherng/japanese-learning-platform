param([int]$Limit=0)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path $PSScriptRoot -Parent
$taskAssets=Join-Path $taskRoot 'app/assets'
$taskAudio=Join-Path $taskAssets 'audio'
$taskScratch=Join-Path $taskRoot 'temp/audio'
$taskRecords=Get-Content -LiteralPath (Join-Path $taskAssets 'audio-records-v2.json') -Raw | ConvertFrom-Json
if($Limit -gt 0){$taskRecords=@($taskRecords | Select-Object -First $Limit)}
$taskFfmpeg=(Get-Command ffmpeg -ErrorAction Stop).Source
New-Item -ItemType Directory -Force -Path $taskAudio,$taskScratch | Out-Null
$taskResults=[Collections.Generic.List[object]]::new()
Add-Type -AssemblyName System.Speech
$taskSynth=[System.Speech.Synthesis.SpeechSynthesizer]::new()
$taskSynth.SelectVoice('Microsoft Haruka Desktop')
$taskSynth.Rate=-1
try { foreach($taskRecord in $taskRecords) {
 $taskHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes("Haruka-v2`n"+$taskRecord.text+"`n"+$taskRecord.speech))).ToLowerInvariant().Substring(0,24)
 $taskMp3=Join-Path $taskAudio ($taskHash+'.mp3')
 $taskWav=Join-Path $taskScratch ($taskHash+'.wav')
 if(!(Test-Path -LiteralPath $taskMp3) -or (Get-Item -LiteralPath $taskMp3).Length -lt 512){
  $taskSynth.SetOutputToWaveFile($taskWav)
  $taskSynth.Speak($taskRecord.speech)
  $taskSynth.SetOutputToNull()
  & $taskFfmpeg -hide_banner -loglevel error -y -i $taskWav -codec:a libmp3lame -q:a 4 $taskMp3
  if($LASTEXITCODE -ne 0 -or (Get-Item -LiteralPath $taskMp3).Length -lt 512){throw 'Instructional MP3 conversion failed'}
  Remove-Item -LiteralPath $taskWav
 }
 $taskResults.Add([pscustomobject]@{text=$taskRecord.text;path=('assets/audio/'+$taskHash+'.mp3');size=(Get-Item -LiteralPath $taskMp3).Length})
 if($taskResults.Count % 250 -eq 0){Write-Output ('Audio progress '+$taskResults.Count+'/'+$taskRecords.Count)}
} } finally { $taskSynth.Dispose() }
$taskMapping=Get-Content -LiteralPath (Join-Path $taskAssets 'audio.json') -Raw | ConvertFrom-Json -AsHashtable
foreach($taskRecord in $taskResults){$taskMapping[$taskRecord.text]=$taskRecord.path}
$taskMapping | ConvertTo-Json -Depth 4 -Compress | Set-Content -LiteralPath (Join-Path $taskAssets 'audio.json') -Encoding utf8 -NoNewline
[ordered]@{voice='Microsoft Haruka Desktop';locale='ja-JP';type='本機合成語音';review='尚待獨立日語教師審音';wordKeys='詞彙與讀音組合，避免同字異音共用';count=$taskMapping.Count} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskAssets 'audio-provenance.json') -Encoding utf8
Write-Output ('Completed '+$taskResults.Count+' audio records; index now '+$taskMapping.Count+' entries.')
