/**
 * VoiceoverService.js
 * Studio-Grade Narration Engine for Vertical Reels & Shorts
 * Supports multi-persona voices, tones, and localized speech synthesis
 */

import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { AssetDeliveryService } from '../media/AssetDeliveryService.js';
import { WorkspaceAsset } from '../../models/WorkspaceAsset.js';

const execPromise = util.promisify(exec);

export class VoiceoverService {
  static VOICE_CATALOG = {
    maya: { name: 'Maya', gender: 'Female', accent: 'US', profile: 'Energetic, High-Conversion Female', preferredSapi: 'Microsoft Zira Desktop' },
    marcus: { name: 'Marcus', gender: 'Male', accent: 'US', profile: 'Deep Baritone, Institutional Male', preferredSapi: 'Microsoft David Desktop' },
    elena: { name: 'Elena', gender: 'Female', accent: 'UK', profile: 'Sharp, Sophisticated Executive Female', preferredSapi: 'Microsoft Zira Desktop' },
    david: { name: 'David', gender: 'Male', accent: 'UK', profile: 'Confident Tech Founder Male', preferredSapi: 'Microsoft David Desktop' },
    priya: { name: 'Priya', gender: 'Female', accent: 'IN', profile: 'Fast, Global Tech Executive Female', preferredSapi: 'Microsoft Zira Desktop' },
    mateo: { name: 'Mateo', gender: 'Male', accent: 'ES/LatAm', profile: 'Warm, Charismatic High-Energy Male', preferredSapi: 'Microsoft David Desktop' },
    kenji: { name: 'Kenji', gender: 'Male', accent: 'JP/Global', profile: 'Calm, Precision Quant Male', preferredSapi: 'Microsoft David Desktop' },
  };

  /**
   * Retrieves all available studio voice personas with profile metadata
   */
  static getVoiceCatalog() {
    return Object.entries(this.VOICE_CATALOG).map(([id, meta]) => ({
      id,
      name: meta.name,
      gender: meta.gender,
      accent: meta.accent,
      profile: meta.profile,
      previewSampleText: `Hello, I am ${meta.name}. I represent your brand across phone calls, reels, and video ads with VYUHOX.`,
    }));
  }

  /**
   * Generates a voiceover narration audio file from script text.
   * Securely persists customer audio via the private media lifecycle (AssetDeliveryService & WorkspaceAsset)
   * outside of client/public to preserve tenant privacy and authorization.
   * 
   * @param {string} text - Script text to speak
   * @param {string} voiceId - Voice persona ID ('maya', 'marcus', 'elena', 'david', 'priya', 'mateo', 'kenji')
   * @param {string} tone - Tone style ('aggressive_challenger', 'institutional_authority', 'urgent_fomo', 'educational_breakdown')
   * @param {string} language - Target language ('en-US', 'es-ES', 'fr-FR', 'de-DE', 'hi-IN', etc.)
   * @param {string} filename - Target filename (without path)
   * @param {string|ObjectId} workspaceId - Tenant workspace ID
   * @param {string} userId - User creating the voiceover
   */
  static async generateVoiceover({
    text,
    voiceId = 'maya',
    tone = 'aggressive_challenger',
    language = 'en-US',
    filename = null,
    workspaceId = null,
    userId = null,
  }) {
    const cleanVoiceId = (voiceId || 'maya').toLowerCase().split('_')[0];
    const voiceMeta = this.VOICE_CATALOG[cleanVoiceId] || this.VOICE_CATALOG.maya;

    // Clean text to avoid speech synthesis syntax errors
    const sanitizedText = (text || '')
      .replace(/["']/g, '')
      .replace(/[#@*]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // Map tone to synthesis speaking rate
    let speechRate = 1; // Default
    if (tone === 'aggressive_challenger' || tone === 'urgent_fomo') {
      speechRate = 2; // Punchy, high-velocity
    } else if (tone === 'institutional_authority') {
      speechRate = -1; // Gravitas, deliberate institutional cadence
    } else if (tone === 'educational_breakdown') {
      speechRate = 0; // Natural educational cadence
    }

    const preferredVoiceName = voiceMeta.preferredSapi;

    // Helper to persist audio buffer into the private media lifecycle
    const persistPrivateAudio = async (audioBuffer, fileExt, mimeType) => {
      const safeFilename = filename || `voiceover_${cleanVoiceId}_${Date.now()}.${fileExt}`;

      if (workspaceId) {
        const wsIdStr = workspaceId.toString();
        await AssetDeliveryService.savePrivateAsset(wsIdStr, safeFilename, audioBuffer, mimeType);

        const assetRecord = await WorkspaceAsset.create({
          workspaceId: wsIdStr,
          userId: userId || null,
          url: `/api/assets/pending_${Date.now()}`,
          filename: safeFilename,
          originalName: safeFilename,
          mimeType,
          size: audioBuffer.length,
          assetType: 'GENERAL',
          status: 'PRIVATE',
          userAuthorized: true,
          metadata: {
            source: 'VOICEOVER_STUDIO',
            voiceId: cleanVoiceId,
            tone,
            language,
          },
        });

        const assetUrl = `/api/assets/${assetRecord._id}`;
        assetRecord.url = assetUrl;
        await assetRecord.save();

        return {
          audioUrl: assetUrl,
          assetId: assetRecord._id,
        };
      }

      // If no workspace context provided, do not persist to public disk
      return { audioUrl: null, assetId: null };
    };

    // 1. Production Cloud TTS via OpenAI Audio Speech API (Linux / Render / Cloud Native)
    if (process.env.OPENAI_API_KEY && workspaceId) {
      try {
        const openaiVoice = voiceMeta.gender === 'Male' ? 'onyx' : 'nova';
        const openAiRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: sanitizedText.slice(0, 800),
            voice: openaiVoice,
            response_format: 'mp3',
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (openAiRes.ok) {
          const buffer = Buffer.from(await openAiRes.arrayBuffer());
          const persisted = await persistPrivateAudio(buffer, 'mp3', 'audio/mpeg');

          if (persisted.audioUrl) {
            return {
              success: true,
              audioUrl: persisted.audioUrl,
              assetId: persisted.assetId,
              provider: 'OPENAI_STUDIO_TTS',
              voice: voiceMeta,
              tone,
              language,
              durationSeconds: Math.ceil(sanitizedText.split(' ').length * 0.35),
            };
          }
        }
      } catch (cloudErr) {
        console.warn('[VoiceoverService] Cloud TTS attempt notice:', cloudErr.message);
      }
    }

    // 2. Windows Local SAPI (Only when executing on Windows host with an active workspace)
    if (process.platform === 'win32' && workspaceId) {
      try {
        const tempWavName = `temp_voice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.wav`;
        const tempPath = path.join(os.tmpdir(), tempWavName);

        const psScript = `
          Add-Type -AssemblyName System.Speech;
          $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
          try {
            $synth.SelectVoice('${preferredVoiceName}');
          } catch {}
          $synth.Rate = ${speechRate};
          $synth.SetOutputToWaveFile('${tempPath.replace(/\\/g, '\\\\')}');
          $synth.Speak('${sanitizedText.slice(0, 500)}');
          $synth.Dispose();
        `;

        await execPromise(`powershell -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, ' ')}"`, {
          timeout: 12000,
        });

        if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 1000) {
          const buffer = fs.readFileSync(tempPath);
          try { fs.unlinkSync(tempPath); } catch (_) {}

          const persisted = await persistPrivateAudio(buffer, 'wav', 'audio/wav');

          if (persisted.audioUrl) {
            return {
              success: true,
              audioUrl: persisted.audioUrl,
              assetId: persisted.assetId,
              provider: 'WINDOWS_STUDIO_SAPI',
              voice: voiceMeta,
              tone,
              language,
              durationSeconds: Math.ceil(sanitizedText.split(' ').length * (speechRate > 0 ? 0.32 : 0.4)),
            };
          }
        }
      } catch (err) {
        console.warn('[VoiceoverService] Speech synthesis command fallback:', err.message);
      }
    }

    // 3. Clean Graceful Fallback: Browser Web Speech API Compatible (Zero hardcoded crypto hedge fund recordings)
    return {
      success: true,
      audioUrl: null, // Signals frontend to synthesize cleanly via Web Speech API
      provider: 'BROWSER_WEB_SPEECH_API',
      voice: voiceMeta,
      tone,
      language,
      durationSeconds: Math.ceil(sanitizedText.split(' ').length * 0.35),
    };
  }
}

export default VoiceoverService;
