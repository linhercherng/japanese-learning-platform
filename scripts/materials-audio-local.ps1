# Offline Japanese synthesis. Requires Windows System.Speech and Haruka Desktop.
# Generated audio is a draft learning aid, not reviewed teacher pronunciation.
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskAssets = Join-Path $taskRoot 'app/assets'
$taskAudio = Join-Path $taskAssets 'audio'
$taskTexts = Get-Content -Raw (Join-Path $taskAssets 'audio-texts.json') | ConvertFrom-Json
$taskFfmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
New-Item -ItemType Directory -Path $taskAudio -Force | Out-Null
$taskResults = $taskTexts | ForEach-Object {
 $ErrorActionPreference = 'Stop'
 $taskText = $_
 Add-Type -AssemblyName System.Speech
 $taskHashBytes = [System.Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes("Microsoft Haruka Desktop`n" + $taskText))
 $taskHash = [Convert]::ToHexString($taskHashBytes).ToLowerInvariant().Substring(0,20)
 $taskMp3 = Join-Path $taskAudio ($taskHash + '.mp3')
 $taskWav = Join-Path $taskAudio ($taskHash + '.wav')
 if (!(Test-Path -LiteralPath $taskMp3) -or (Get-Item -LiteralPath $taskMp3).Length -lt 512) {
  $taskSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  try {
   $taskSynth.SelectVoice('Microsoft Haruka Desktop')
   $taskSynth.Rate = -1
   $taskSynth.SetOutputToWaveFile($taskWav)
   $taskSynth.Speak($taskText)
  } finally {$taskSynth.Dispose()}
  & $taskFfmpeg -hide_banner -loglevel error -y -i $taskWav -codec:a libmp3lame -q:a 4 $taskMp3
  if ($LASTEXITCODE -ne 0) {throw 'ffmpeg failed for instructional audio.'}
  if ((Get-Item -LiteralPath $taskMp3).Length -lt 512) {throw 'Empty synthesized audio.'}
  Remove-Item -LiteralPath $taskWav
 }
 [pscustomobject]@{text=$taskText;path=('assets/audio/' + $taskHash + '.mp3')}
}
$taskMapping = [ordered]@{}
foreach ($taskResult in $taskResults | Sort-Object text) {$taskMapping[$taskResult.text]=$taskResult.path}
$taskMapping | ConvertTo-Json -Depth 3 | Set-Content -Encoding utf8 (Join-Path $taskAssets 'audio.json')
[ordered]@{voice='Microsoft Haruka Desktop';locale='ja-JP';type='本機合成語音';review='尚待獨立日語教師審音';count=$taskMapping.Count} | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $taskAssets 'audio-provenance.json')
Write-Output ('Saved ' + $taskMapping.Count + ' locally playable Japanese MP3 files with Haruka Desktop.')
