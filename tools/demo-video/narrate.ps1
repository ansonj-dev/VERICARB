param(
    [Parameter(Mandatory = $true)][string]$Manifest,
    [Parameter(Mandatory = $true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$scenes = Get-Content -LiteralPath $Manifest -Raw | ConvertFrom-Json
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $speaker.SelectVoice('Microsoft Zira Desktop')
    $speaker.Rate = -1
    $speaker.Volume = 100
    foreach ($scene in $scenes) {
        $speaker.SetOutputToWaveFile((Join-Path $OutputDirectory ($scene.id + '.wav')))
        $speaker.Speak($scene.narration)
        $speaker.SetOutputToNull()
        Write-Output ('Narration ready: ' + $scene.title)
    }
}
finally { $speaker.Dispose() }