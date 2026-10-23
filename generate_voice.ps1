Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# List installed voices
$voices = $synth.GetInstalledVoices()
Write-Host "Installed voices:"
foreach ($v in $voices) {
    Write-Host "- $($v.VoiceInfo.Name) ($($v.VoiceInfo.Gender))"
}

# Generate audio file
$outputPath = "c:\VYUHOX\client\public\audio\test_voice.wav"
$synth.SetOutputToWaveFile($outputPath)
$synth.Speak("Hi there! This is Maya from HedgeX Algorithmic Capital. I am reaching out to see if you are interested in reviewing our sub-second latency benchmarks.")
$synth.Dispose()

Write-Host "Generated test voice file:"
Get-Item $outputPath | Select-Object Name, Length
