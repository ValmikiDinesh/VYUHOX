Add-Type -AssemblyName System.Speech

function Generate-ConversationAudio {
    param (
        [string]$OutputPath,
        [array]$Dialogue
    )
    
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $synth.SetOutputToWaveFile($OutputPath)
    
    # Configure natural speech rate
    $synth.Rate = 0
    
    foreach ($line in $Dialogue) {
        $role = $line.role
        $text = $line.text
        
        if ($role -eq 'assistant') {
            # Maya - Female voice
            try { $synth.SelectVoice("Microsoft Zira Desktop") } catch {}
            $synth.Speak("Maya: $text")
        } elseif ($role -eq 'user') {
            # Lead - Male voice
            try { $synth.SelectVoice("Microsoft David Desktop") } catch {}
            $synth.Speak("Lead: $text")
        } elseif ($role -eq 'human_rep') {
            # Human Rep - Male voice
            try { $synth.SelectVoice("Microsoft David Desktop") } catch {}
            $synth.Speak("Rep Nanda: $text")
        }
        # Pause slightly between turns
        Start-Sleep -Milliseconds 250
    }
    
    $synth.Dispose()
    Write-Host "Created: $OutputPath"
}

# Ensure directory exists
$audioDir = "c:\VYUHOX\client\public\audio"
if (!(Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir -Force | Out-Null
}

# 1. Harrison Brooks Call
$harrisonDialogue = @(
    @{ role = 'assistant'; text = "Hi Harrison! This is Maya from VYUHOX. I saw your interest in autonomous lead conversion. Am I catching you at a good moment?" },
    @{ role = 'user'; text = "Hey Maya, yeah I have a couple minutes. We've been looking into scaling our outbound pipeline." },
    @{ role = 'human_rep'; text = "Hey Harrison, this is Nanda taking over from Maya. We can set up your multi-channel sales pipeline and Bland A.I. dialer by tomorrow." },
    @{ role = 'user'; text = "That sounds awesome Nanda. Let's get the pilot agreement rolling." }
)
Generate-ConversationAudio -OutputPath "$audioDir\call_harrison.wav" -Dialogue $harrisonDialogue

# 2. Elena Rostova Call
$elenaDialogue = @(
    @{ role = 'assistant'; text = "Hi Elena! This is Maya from HedgeX Algorithmic Capital. I noticed Vanguard Alpha Fund is scaling multi-exchange arbitrage. Do you have a couple minutes to review our latency benchmarks?" },
    @{ role = 'user'; text = "Hi Maya! Yes, we actually have been evaluating quantitative market makers this month. What Sharpe ratio are your live algorithms achieving?" },
    @{ role = 'assistant'; text = "Our high-velocity liquidity models achieved an annualized Sharpe of 3.82 across Q2. We can configure institutional custody with Spearbit audits." },
    @{ role = 'user'; text = "That is impressive. Can we lock in a 15-minute technical walkthrough this Friday at 3 PM EST?" },
    @{ role = 'assistant'; text = "Absolutely Elena. I have locked in Friday 3 PM EST on our partner calendar. Sending the confirmation and audit dossier now." }
)
Generate-ConversationAudio -OutputPath "$audioDir\call_elena.wav" -Dialogue $elenaDialogue

# 3. David Chen Call
$davidDialogue = @(
    @{ role = 'assistant'; text = "Hello David, Maya here from HedgeX following up on your BlockPulse quantitative inquiry. Are you open to reviewing our API execution latency?" },
    @{ role = 'user'; text = "The latency looks decent, but our quants are concerned the onboarding fee is too steep compared to building in-house." },
    @{ role = 'assistant'; text = "Understood David. For high-frequency partners trading above 50,000 lots, we provide a dedicated volume tier that reduces per-trade overhead by 42%." },
    @{ role = 'human_rep'; text = "Hey David, Nanda here jumping on with Maya. I can personally approve the tier-2 rebate for BlockPulse if we finalize the pilot this week." },
    @{ role = 'user'; text = "That completely changes the numbers. Let us review the contract addendum." }
)
Generate-ConversationAudio -OutputPath "$audioDir\call_david.wav" -Dialogue $davidDialogue

# 4. Marcus Sterling Call
$marcusDialogue = @(
    @{ role = 'assistant'; text = "Marcus, hello! Maya from HedgeX. Reaching out regarding Aetherium Ventures thesis on decentralized liquidity routing." },
    @{ role = 'user'; text = "Good timing. We need institutional custody proof before we can allocate capital to external algorithmic liquidity pools." },
    @{ role = 'assistant'; text = "We integrate multi-party computation with Fireblocks and carry full ISO27001 certification. I can send the custody architecture whitepaper." },
    @{ role = 'user'; text = "Send that over to my email. If compliance signs off, we will schedule a partners sync." }
)
Generate-ConversationAudio -OutputPath "$audioDir\call_marcus.wav" -Dialogue $marcusDialogue

# 5. Overwrite sample_recording.wav with the Harrison conversation as default
Copy-Item "$audioDir\call_harrison.wav" "$audioDir\sample_recording.wav" -Force
Write-Host "sample_recording.wav updated with real conversation speech!"
