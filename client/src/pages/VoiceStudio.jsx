import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Play,
  Pause,
  Sparkles,
  Clock,
  Flame,
  Shield,
  Activity,
  Zap,
  Settings,
  Calendar,
  User,
  RefreshCw,
  Sliders,
  MessageSquare,
  Check,
  CheckCheck,
  FileText,
  ChevronRight,
  Headphones,
  Send,
  TrendingUp,
  Square,
  RotateCcw,
  Volume1,
} from 'lucide-react';
import { api } from '../services/api';

export default function VoiceStudio({ activeWorkspace, socket }) {
  // Navigation / Tab inside Voice Studio
  const [activeTab, setActiveTab] = useState('supervision'); // 'supervision' | 'dialer' | 'config' | 'analytics'

  // Calls Data
  const [calls, setCalls] = useState([]);
  const [activeCalls, setActiveCalls] = useState([]);
  const [selectedCallForModal, setSelectedCallForModal] = useState(null);
  const [loadingCalls, setLoadingCalls] = useState(false);

  // Softphone Dialer State
  const [dialerNumber, setDialerNumber] = useState('');
  const [isDialerCalling, setIsDialerCalling] = useState(false);
  const [dialerCallDuration, setDialerCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(true);

  // Live Supervision & Whisper State
  const [liveCall, setLiveCall] = useState(null); // Currently monitored live call
  const [whisperInput, setWhisperInput] = useState('');
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [isWhispering, setIsWhispering] = useState(false);

  // Voice Agent Config State
  const [agentConfig, setAgentConfig] = useState({
    agentName: 'Maya - Autonomous SDR',
    voicePersona: {
      tone: 'Consultative',
      accent: 'US Professional',
      voiceId: 'bland_nat_maya_01',
      speed: 1.0,
      temperature: 0.7,
    },
    systemPrompt:
      'You are Maya, an elite high-intent SDR at {{companyName}}. Your goal is to qualify the executive lead within 2 minutes, verify their growth bottlenecks, and secure a confirmed slot on our senior partner calendar at {{calendarUrl}}.',
    qualificationQuestions: [
      'What is your primary quantitative execution bottleneck right now?',
      'What target capital allocation or volume are you aiming for this quarter?',
      'Who besides yourself makes technical and institutional security decisions?',
    ],
    calendarBookingUrl: 'https://cal.com/vyuhox/discovery-sync',
    speedToLeadEnabled: true,
    speedToLeadDelaySeconds: 45,
    minLeadScoreForCall: 70,
    minPortfolioUSD: 10000,
    transferPhoneNumber: '+1 (415) 555-0199',
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Audio Playback State
  const [playingCallId, setPlayingCallId] = useState(null);
  const [playingCall, setPlayingCall] = useState(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(15);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const audioRef = useRef(new Audio());

  // Attach Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setAudioDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setPlayingCallId(null);
      setPlayingCall(null);
      setAudioCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setAudioDuration(audio.duration);
      }
    };

    const handleError = (e) => {
      console.warn('Audio element error event:', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Timer Ref for Softphone
  const dialerTimerRef = useRef(null);

  // 1. Initial Load of Calls & Voice Config
  useEffect(() => {
    if (!activeWorkspace?._id) return;
    loadCallsData();
    loadVoiceConfig();
  }, [activeWorkspace?._id]);

  const loadCallsData = async () => {
    setLoadingCalls(true);
    try {
      const [callsRes, activeRes] = await Promise.all([
        api.getCalls(activeWorkspace._id),
        api.getActiveCalls(activeWorkspace._id),
      ]);
      if (callsRes.success) setCalls(callsRes.calls || []);
      if (activeRes.success) {
        setActiveCalls(activeRes.activeCalls || []);
        if (activeRes.activeCalls?.length > 0 && !liveCall) {
          setLiveCall(activeRes.activeCalls[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load calls data:', err);
    } finally {
      setLoadingCalls(false);
    }
  };

  const loadVoiceConfig = async () => {
    try {
      const res = await api.getVoiceConfig(activeWorkspace._id);
      if (res.success && res.config) {
        setAgentConfig(res.config);
      }
    } catch (err) {
      console.error('Failed to load voice config:', err);
    }
  };

  // 2. Socket.io Real-time Event Subscriptions
  useEffect(() => {
    if (!socket) return;

    const handleCallStarted = ({ callLog, lead }) => {
      setLiveCall(callLog);
      setActiveCalls((prev) => [callLog, ...prev.filter((c) => c.callId !== callLog.callId)]);
      setCalls((prev) => [callLog, ...prev.filter((c) => c.callId !== callLog.callId)]);
      showToast(`📞 Live Call Connected to ${lead?.name || callLog.toNumber}!`);
    };

    const handleTranscriptUpdate = ({ callId, transcript }) => {
      if (liveCall && liveCall.callId === callId) {
        setLiveCall((prev) => (prev ? { ...prev, transcript } : prev));
      }
      setCalls((prev) =>
        prev.map((c) => (c.callId === callId ? { ...c, transcript } : c))
      );
    };

    const handleCallTakeover = ({ callId, takenOverBy, callLog }) => {
      if (liveCall && liveCall.callId === callId) {
        setLiveCall((prev) => ({ ...prev, takenOver: true, takenOverBy, status: 'transferred' }));
      }
      setCalls((prev) =>
        prev.map((c) => (c.callId === callId ? { ...c, takenOver: true, takenOverBy, status: 'transferred' } : c))
      );
      showToast(`⚡ Human Rep (${takenOverBy}) took over call ${callId}!`);
    };

    const handleCallWhisper = ({ callId, whisperMessage }) => {
      showToast(`🤫 Whisper sent: "${whisperMessage.substring(0, 30)}..."`);
    };

    const handleCallEnded = ({ callId, callLog }) => {
      if (liveCall && liveCall.callId === callId) {
        setLiveCall((prev) => ({ ...prev, status: 'completed' }));
      }
      setActiveCalls((prev) => prev.filter((c) => c.callId !== callId));
      setCalls((prev) =>
        prev.map((c) => (c.callId === callId ? { ...c, status: 'completed', ...callLog } : c))
      );
      showToast(`Call ${callId} ended.`);
    };

    socket.on('call:started', handleCallStarted);
    socket.on('call:transcript_update', handleTranscriptUpdate);
    socket.on('call:takeover', handleCallTakeover);
    socket.on('call:whisper', handleCallWhisper);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:started', handleCallStarted);
      socket.off('call:transcript_update', handleTranscriptUpdate);
      socket.off('call:takeover', handleCallTakeover);
      socket.off('call:whisper', handleCallWhisper);
      socket.off('call:ended', handleCallEnded);
    };
  }, [socket, liveCall]);

  // Play DTMF keypad tone via Web Audio API
  const playDtmfTone = (key) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const dtmfMap = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
      };
      const freqs = dtmfMap[key] || [440, 480];
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.12);
    } catch {
      // fallback
    }
  };

  // 3. Softphone Calling Controls
  const handleStartDialerCall = async () => {
    if (!dialerNumber.trim()) {
      showToast('Please enter a phone number to dial');
      return;
    }
    playDtmfTone('1');
    setIsDialerCalling(true);
    setDialerCallDuration(0);

    dialerTimerRef.current = setInterval(() => {
      setDialerCallDuration((prev) => prev + 1);
    }, 1000);

    try {
      const res = await api.dispatchCall({
        workspaceId: activeWorkspace?._id,
        phoneNumber: dialerNumber.trim(),
      });
      if (res.success) {
        setLiveCall(res.callLog);
        loadCallsData();
        showToast('WebRTC Browser Call Connected via Bland.ai carrier (<800ms)');
      }
    } catch (err) {
      console.error('Dialer error:', err);
      showToast('Call connection failed');
      handleEndDialerCall();
    }
  };

  const handleEndDialerCall = async () => {
    if (dialerTimerRef.current) clearInterval(dialerTimerRef.current);
    setIsDialerCalling(false);
    if (liveCall?.callId) {
      await api.endCall(liveCall.callId);
    }
    showToast('Call disconnected.');
    loadCallsData();
  };

  // 4. Live Takeover Action
  const handleTakeoverCall = async (callId) => {
    if (!callId) return;
    setIsTakingOver(true);
    try {
      const res = await api.takeOverCall(callId, 'Nanda Sai (Lead AE)');
      if (res.success) {
        showToast('⚡ Call audio stream transferred to your headset!');
        if (liveCall && liveCall.callId === callId) {
          setLiveCall((prev) => ({
            ...prev,
            takenOver: true,
            takenOverBy: 'Nanda Sai (Lead AE)',
            status: 'transferred',
          }));
        }
      }
    } catch (err) {
      console.error('Takeover error:', err);
      showToast('Takeover failed');
    } finally {
      setIsTakingOver(false);
    }
  };

  // 5. Whisper Action
  const handleSendWhisper = async (callId) => {
    if (!whisperInput.trim() || !callId) return;
    setIsWhispering(true);
    try {
      const res = await api.whisperToCall(callId, whisperInput.trim());
      if (res.success) {
        setWhisperInput('');
        showToast('🤫 Whisper delivered to AI agent earpiece!');
      }
    } catch (err) {
      console.error('Whisper error:', err);
      showToast('Whisper failed');
    } finally {
      setIsWhispering(false);
    }
  };

  // 6. Speed-to-Lead Test Trigger
  const handleTriggerSpeedToLead = async () => {
    if (!activeWorkspace?._id) return;
    try {
      const res = await api.simulateLiveCall(activeWorkspace._id);
      if (res.success) {
        setLiveCall(res.callLog);
        setActiveTab('supervision');
        showToast('⚡ Speed-to-Lead outbound call launched! Monitoring live stream...');
        loadCallsData();
      }
    } catch (err) {
      console.error('Speed to lead simulation error:', err);
    }
  };

  // 7. Save Voice Agent Configuration
  const handleSaveConfig = async () => {
    if (!activeWorkspace?._id) return;
    setSavingConfig(true);
    try {
      const res = await api.updateVoiceConfig(activeWorkspace._id, agentConfig);
      if (res.success) {
        showToast('Voice Agent persona & speed-to-lead settings saved!');
      }
    } catch (err) {
      console.error('Save config error:', err);
      showToast('Failed to save config');
    } finally {
      setSavingConfig(false);
    }
  };

  // 8. Audio Player Handlers
  const togglePlayAudio = (callId, audioUrl, callObj = null) => {
    const audio = audioRef.current;
    if (playingCallId === callId) {
      audio.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlayingCallId(null);
      setPlayingCall(null);
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();

      // Resolve URL: map to specific human conversation dialogue audio
      const rawUrl = audioUrl || '';
      const foundCall = callObj || calls.find((c) => c.callId === callId) || null;
      const leadName = (foundCall?.leadId?.name || '').toLowerCase();

      let srcUrl = rawUrl;
      if (!srcUrl || srcUrl.includes('assets.mixkit.co') || srcUrl.includes('sample_recording.wav')) {
        if (leadName.includes('elena')) {
          srcUrl = '/audio/call_elena.wav';
        } else if (leadName.includes('david')) {
          srcUrl = '/audio/call_david.wav';
        } else if (leadName.includes('marcus')) {
          srcUrl = '/audio/call_marcus.wav';
        } else {
          srcUrl = '/audio/call_harrison.wav';
        }
      }

      setPlayingCall(foundCall);
      setPlayingCallId(callId);
      setAudioCurrentTime(0);

      audio.src = srcUrl;
      audio.playbackRate = audioSpeed;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Audio tag play failed, falling back to speech synthesis:', e);
          // If browser blocked audio tag decoding or autoplay, fall back to speaking the actual transcript
          if (window.speechSynthesis && foundCall?.transcript?.length > 0) {
            showToast('Browser blocked raw audio. Playing voice transcript via Speech Synthesis...');
            const textToSpeak = foundCall.transcript
              .filter((t) => t.role !== 'system')
              .map((t) => `${t.role === 'assistant' ? 'Maya' : 'Lead'}: ${t.content}`)
              .join('. ');
            const utter = new SpeechSynthesisUtterance(textToSpeak);
            utter.rate = audioSpeed;
            utter.onend = () => {
              setPlayingCallId(null);
              setPlayingCall(null);
            };
            window.speechSynthesis.speak(utter);
          } else {
            showToast('Unable to play audio recording: ' + (e.message || 'Media decode failed'));
            setPlayingCallId(null);
            setPlayingCall(null);
          }
        });
      }
    }
  };

  const handleAudioSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const cycleAudioSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setAudioSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayingCallId(null);
    setPlayingCall(null);
    setAudioCurrentTime(0);
  };

  // Play dialogue turn-by-turn using Speech Synthesis with distinct male/female voices
  const playVoiceTranscriptSpeech = (callObj) => {
    if (!window.speechSynthesis) {
      showToast('Speech synthesis not supported in this browser');
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis.cancel();

    const speechId = `speech_${callObj.callId}`;
    if (playingCallId === speechId) {
      setPlayingCallId(null);
      setPlayingCall(null);
      return;
    }

    const dialogueLines = (callObj.transcript || []).filter((t) => t.role !== 'system');
    if (dialogueLines.length === 0) {
      showToast('No dialogue lines to speak');
      return;
    }

    setPlayingCallId(speechId);
    setPlayingCall(callObj);
    showToast('Speaking dialogue with Maya (Female) & Lead voices...');

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find((v) => v.name.includes('Zira') || v.name.includes('Female') || v.name.includes('Natural')) || voices[0];
    const maleVoice = voices.find((v) => (v.name.includes('David') || v.name.includes('Male')) && v !== femaleVoice) || voices[1] || voices[0];

    let currentIdx = 0;
    const speakNext = () => {
      if (currentIdx >= dialogueLines.length) {
        setPlayingCallId(null);
        setPlayingCall(null);
        return;
      }
      const item = dialogueLines[currentIdx];
      const speaker = item.role === 'assistant' ? 'Maya' : (callObj.leadId?.name ? callObj.leadId.name : 'Lead');
      const utter = new SpeechSynthesisUtterance(`${speaker} says: ${item.content}`);
      utter.rate = audioSpeed;
      if (femaleVoice && maleVoice) {
        utter.voice = item.role === 'assistant' ? femaleVoice : maleVoice;
      }
      utter.onend = () => {
        currentIdx++;
        speakNext();
      };
      utter.onerror = () => {
        setPlayingCallId(null);
        setPlayingCall(null);
      };
      window.speechSynthesis.speak(utter);
    };

    speakNext();
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec = 0) => {
    const total = Math.floor(sec || 0);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 65px)',
      background: '#070C18',
      color: '#F8FAFC',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.5)',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.25)',
          borderRadius: '10px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#38BDF8',
          fontSize: '0.875rem',
          fontWeight: '600',
          backdropFilter: 'blur(16px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Zap size={16} color="#06B6D4" />
          {toastMessage}
        </div>
      )}

      {/* Top Banner / Metrics Deck */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(11, 17, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        {/* Title & Engine Specs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}>
            <PhoneCall size={22} color="#04101A" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '0.02em' }}>
                Autonomous Voice Studio
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <Radio size={10} className="pulse-icon" /> &lt;800ms Bland.ai Engine
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Sub-second conversational voice agent with live call supervision, whisper coaching &amp; 1-click human rep takeover.
            </div>
          </div>
        </div>

        {/* Metric Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600' }}>SPEED-TO-LEAD</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#10B981' }}>&lt; 45s</span>
          </div>

          <div style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600' }}>AVG CALL DURATION</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#38BDF8' }}>2m 14s</span>
          </div>

          <div style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600' }}>DEMO BOOKING RATE</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#F59E0B' }}>41.8%</span>
          </div>

          {/* Speed-to-lead trigger button */}
          <button
            id="speed-to-lead-trigger-btn"
            onClick={handleTriggerSpeedToLead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              border: 'none',
              color: '#04101A',
              fontWeight: '800',
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={15} />
            Test Speed-to-Lead
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '8px 24px',
        background: 'rgba(15, 23, 42, 0.7)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        {[
          { id: 'supervision', label: 'Live Call Supervision & Takeover', icon: Activity, count: activeCalls.length ? `${activeCalls.length} Active` : null },
          { id: 'dialer', label: 'WebRTC Softphone Dialer', icon: Phone },
          { id: 'config', label: 'AI Voice Agent Configurator', icon: Sliders },
          { id: 'analytics', label: 'Call History & Recordings', icon: Clock, count: `${calls.length}` },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: active ? '700' : '500',
                background: active ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                border: `1px solid ${active ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}`,
                color: active ? '#38BDF8' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} color={active ? '#06B6D4' : '#94A3B8'} />
              <span>{tab.label}</span>
              {tab.count && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: active ? '#06B6D4' : 'rgba(255, 255, 255, 0.1)',
                  color: active ? '#04101A' : '#CBD5E1',
                  fontWeight: '700',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Workspace Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* ========================================================================= */}
        {/* TAB 1: LIVE CALL SUPERVISION & TAKEOVER */}
        {/* ========================================================================= */}
        {activeTab === 'supervision' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', height: '100%' }}>
            {/* Left Stream: Real-Time Live Transcript Feed */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* Live Session Header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(11, 17, 32, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: liveCall?.status === 'in-progress' ? '#10B981' : '#F59E0B',
                    boxShadow: liveCall?.status === 'in-progress' ? '0 0 10px #10B981' : 'none',
                  }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#F8FAFC' }}>
                      {liveCall ? `Active Call: ${liveCall.leadId?.name || liveCall.toNumber}` : 'No Active Call In-Progress'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {liveCall ? `Call ID: ${liveCall.callId} • Gateway: Bland.ai Sub-Second Telephony` : 'Click "Test Speed-to-Lead" or use Dialer to launch a live session'}
                    </div>
                  </div>
                </div>

                {liveCall && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {liveCall.takenOver ? (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(14, 165, 233, 0.15)',
                        color: '#38BDF8',
                        border: '1px solid rgba(14, 165, 233, 0.4)',
                      }}>
                        ⚡ Rep Headset Active ({liveCall.takenOverBy || 'Human'})
                      </span>
                    ) : (
                      <button
                        id="takeover-call-btn"
                        onClick={() => handleTakeoverCall(liveCall.callId)}
                        disabled={isTakingOver}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          border: 'none',
                          color: '#04101A',
                          fontWeight: '800',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <PhoneForwarded size={13} />
                        Take Over Call
                      </button>
                    )}

                    <button
                      onClick={() => handleEndDialerCall()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#EF4444',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <PhoneOff size={13} />
                      Hang Up
                    </button>
                  </div>
                )}
              </div>

              {/* Transcript Stream Body */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'rgba(7, 12, 24, 0.7)',
              }}>
                {liveCall?.transcript && liveCall.transcript.length > 0 ? (
                  liveCall.transcript.map((item, idx) => {
                    const isAi = item.role === 'assistant';
                    const isRep = item.role === 'human_rep';
                    const isSystem = item.role === 'system';

                    if (isSystem) {
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: 'center',
                            fontSize: '0.72rem',
                            color: '#38BDF8',
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.25)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            maxWidth: '90%',
                            textAlign: 'center',
                          }}
                        >
                          {item.content}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isAi ? 'flex-start' : isRep ? 'flex-start' : 'flex-end',
                          alignSelf: isAi || isRep ? 'flex-start' : 'flex-end',
                          maxWidth: '78%',
                        }}
                      >
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#64748B',
                          marginBottom: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          {isAi && <Sparkles size={11} color="#10B981" />}
                          {isRep && <Headphones size={11} color="#38BDF8" />}
                          <span>{isAi ? 'Maya (Voice AI Agent)' : isRep ? 'Sales Rep (You)' : liveCall.leadId?.name || 'Lead'}</span>
                        </div>

                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isAi || isRep ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                          background: isAi
                            ? 'rgba(16, 185, 129, 0.12)'
                            : isRep
                            ? 'rgba(14, 165, 233, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: isAi
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : isRep
                            ? '1px solid rgba(14, 165, 233, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '0.84rem',
                          color: '#F8FAFC',
                          lineHeight: '1.45',
                        }}>
                          {item.content}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
                    <Radio size={36} color="#06B6D4" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                    <h4 style={{ margin: '0 0 6px', color: '#E2E8F0' }}>Live Audio Supervision Stream Ready</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>
                      Click <b>"Test Speed-to-Lead"</b> above to launch an instant sub-second qualification call and watch real-time transcript streaming.
                    </p>
                  </div>
                )}
              </div>

              {/* Whisper Input Box */}
              <div style={{
                padding: '12px 18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(11, 17, 32, 0.9)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}>
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#C084FC',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}>
                  🤫 Whisper Coach
                </div>

                <input
                  type="text"
                  placeholder="Type advice or injection to AI agent (e.g. 'Offer 15% discount if they commit today')..."
                  value={whisperInput}
                  onChange={(e) => setWhisperInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && liveCall) handleSendWhisper(liveCall.callId);
                  }}
                  disabled={!liveCall || liveCall.status === 'completed'}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '7px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                />

                <button
                  id="send-whisper-btn"
                  onClick={() => liveCall && handleSendWhisper(liveCall.callId)}
                  disabled={!liveCall || !whisperInput.trim() || isWhispering}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '7px',
                    background: whisperInput.trim()
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: whisperInput.trim() ? '#F8FAFC' : '#64748B',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    cursor: whisperInput.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Send size={13} />
                  Whisper
                </button>
              </div>
            </div>

            {/* Right Panel: Supervision Controls & Lead Dossier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Active Session Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Live Telephony Stats
                </span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Carrier Latency</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#10B981' }}>680ms (Ultra-Low)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>AI Persona</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#F1F5F9' }}>
                    {agentConfig.agentName}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>AI Sentiment</span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                  }}>
                    {liveCall?.sentiment || 'HIGH_INTENT'} ({liveCall?.sentimentScore || 85}%)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Calendar Linked</span>
                  <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600' }}>
                    Google / Cal.com ✓
                  </span>
                </div>
              </div>

              {/* Speed-to-Lead Quick Launcher */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="#06B6D4" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Speed-to-Lead Simulator
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#94A3B8', lineHeight: '1.4' }}>
                  Simulates a prospect submitting a high-intent enterprise request. Bland.ai automatically dials within 45s to secure a meeting.
                </p>
                <button
                  onClick={handleTriggerSpeedToLead}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                    border: 'none',
                    color: '#04101A',
                    fontWeight: '800',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Trigger Speed-to-Lead Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WEBRTC SOFTPHONE DIALER */}
        {/* ========================================================================= */}
        {activeTab === 'dialer' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '480px' }}>
            <div style={{
              width: '360px',
              background: '#0B1120',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}>
              {/* Softphone Header */}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isDialerCalling ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: isDialerCalling ? '#10B981' : '#94A3B8',
                  border: isDialerCalling ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  {isDialerCalling ? `● CALL CONNECTED (${formatSeconds(dialerCallDuration)})` : '● WEBRTC BROWSER READY'}
                </span>
                <h3 style={{ margin: '8px 0 2px', fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC' }}>
                  WebRTC Softphone Dialer
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Direct microphone headset bridge
                </span>
              </div>

              {/* Quick Lead Autofill Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>QUICK SELECT LEAD:</span>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {[
                    { name: 'Elena Rostova', phone: '+14158902234' },
                    { name: 'Marcus Sterling', phone: '+442079460912' },
                    { name: 'David Chen', phone: '+16503329901' },
                  ].map((lead) => (
                    <button
                      key={lead.name}
                      onClick={() => setDialerNumber(lead.phone)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '5px',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        color: '#38BDF8',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {lead.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Input Display */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '12px 14px',
                textAlign: 'center',
              }}>
                <input
                  id="softphone-phone-input"
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={dialerNumber}
                  onChange={(e) => setDialerNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: '#38BDF8',
                    letterSpacing: '0.05em',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Animated Equalizer when in-call */}
              {isDialerCalling && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}>
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700', marginRight: '6px' }}>
                    LIVE WEBRTC AUDIO STREAM:
                  </span>
                  {[12, 22, 16, 26, 14, 24, 18, 10].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '3px',
                        height: `${h}px`,
                        background: '#10B981',
                        borderRadius: '2px',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Dial Pad Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
              }}>
                {[
                  { n: '1', sub: '' },
                  { n: '2', sub: 'ABC' },
                  { n: '3', sub: 'DEF' },
                  { n: '4', sub: 'GHI' },
                  { n: '5', sub: 'JKL' },
                  { n: '6', sub: 'MNO' },
                  { n: '7', sub: 'PQRS' },
                  { n: '8', sub: 'TUV' },
                  { n: '9', sub: 'WXYZ' },
                  { n: '*', sub: '' },
                  { n: '0', sub: '+' },
                  { n: '#', sub: '' },
                ].map((key) => (
                  <button
                    key={key.n}
                    onClick={() => {
                      playDtmfTone(key.n);
                      setDialerNumber((prev) => prev + key.n);
                    }}
                    style={{
                      height: '52px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', lineHeight: 1 }}>{key.n}</span>
                    {key.sub && <span style={{ fontSize: '0.55rem', color: '#64748B', marginTop: '2px' }}>{key.sub}</span>}
                  </button>
                ))}
              </div>

              {/* Dialer Actions: Mute / Call / Record */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingTop: '6px' }}>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: isMuted ? '#EF4444' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Primary Call / Hangup Button */}
                {isDialerCalling ? (
                  <button
                    id="end-softphone-call-btn"
                    onClick={handleEndDialerCall}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#EF4444',
                      border: 'none',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    <PhoneOff size={26} />
                  </button>
                ) : (
                  <button
                    id="start-softphone-call-btn"
                    onClick={handleStartDialerCall}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      color: '#04101A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                    }}
                  >
                    <Phone size={26} strokeWidth={2.5} />
                  </button>
                )}

                <button
                  onClick={() => setIsRecording(!isRecording)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isRecording ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${isRecording ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: isRecording ? '#10B981' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={isRecording ? 'Call Recording Enabled' : 'Recording Disabled'}
                >
                  <Radio size={18} className={isRecording ? 'pulse-icon' : ''} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AI VOICE AGENT CONFIGURATOR */}
        {/* ========================================================================= */}
        {activeTab === 'config' && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC' }}>
                AI Voice Persona &amp; Carrier Configurator
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Customize conversational tone, script prompts, speed-to-lead automation triggers, and calendar booking link.
              </p>
            </div>

            {/* Persona Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                  AGENT IDENTITY / NAME
                </label>
                <input
                  type="text"
                  value={agentConfig.agentName}
                  onChange={(e) => setAgentConfig({ ...agentConfig, agentName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                  CONVERSATIONAL TONE
                </label>
                <select
                  value={agentConfig.voicePersona?.tone || 'Consultative'}
                  onChange={(e) =>
                    setAgentConfig({
                      ...agentConfig,
                      voicePersona: { ...agentConfig.voicePersona, tone: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#38BDF8',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="Consultative">Consultative &amp; Empathetic (Recommended)</option>
                  <option value="Executive">Executive &amp; High-Authority</option>
                  <option value="Friendly">Friendly &amp; Upbeat</option>
                  <option value="Aggressive Closer">Direct &amp; Fast Closer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                  PRIMARY LANGUAGE / LOCALIZATION
                </label>
                <select
                  value={agentConfig.voicePersona?.language || 'en-US'}
                  onChange={(e) =>
                    setAgentConfig({
                      ...agentConfig,
                      voicePersona: { ...agentConfig.voicePersona, language: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#38BDF8',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="en-US">English (US) - Global Executive Standard</option>
                  <option value="en-IN">Hinglish / Indian English (en-IN) - Urban Business</option>
                  <option value="hi-IN">Hindi (hi-IN) - Natural Shuddh &amp; Conversational</option>
                  <option value="te-IN">Telugu (te-IN) - Andhra &amp; Telangana Regional</option>
                  <option value="ta-IN">Tamil (ta-IN) - Tamil Nadu Regional</option>
                  <option value="kn-IN">Kannada (kn-IN) - Bengaluru / Karnataka</option>
                  <option value="mr-IN">Marathi (mr-IN) - Mumbai / Maharashtra</option>
                  <option value="en-GB">English (UK) - British Professional</option>
                  <option value="es-ES">Spanish (es-ES) - European &amp; LatAm</option>
                  <option value="ar-AE">Arabic (ar-AE) - UAE / Gulf GCC Standard</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                  VOICE ACCENT / NEURAL MODEL
                </label>
                <select
                  value={agentConfig.voicePersona?.accent || 'US Professional'}
                  onChange={(e) =>
                    setAgentConfig({
                      ...agentConfig,
                      voicePersona: { ...agentConfig.voicePersona, accent: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#38BDF8',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="US Professional">US Professional (Maya - Natural Bland v2)</option>
                  <option value="Indian Business (Female)">Indian Business Female (Neerja - High Trust)</option>
                  <option value="Indian Executive (Male)">Indian Executive Male (Prabhat - Closer)</option>
                  <option value="Hindi Conversational">Hindi Conversational (Aditi - Empathetic)</option>
                  <option value="Telugu Conversational">Telugu Conversational (Mohan / Shruthi)</option>
                  <option value="Tamil Conversational">Tamil Conversational (Pallavi)</option>
                  <option value="British Neutral">British Neutral (Arthur - Vapi)</option>
                  <option value="Australian Warm">Australian Warm (Sarah - ElevenLabs)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                  CALENDAR BOOKING URL
                </label>
                <input
                  type="text"
                  value={agentConfig.calendarBookingUrl}
                  onChange={(e) => setAgentConfig({ ...agentConfig, calendarBookingUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* System Prompt Script */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
                AI VOICE PROMPT SCRIPT
              </label>
              <textarea
                rows={4}
                value={agentConfig.systemPrompt}
                onChange={(e) => setAgentConfig({ ...agentConfig, systemPrompt: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(11, 17, 32, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  outline: 'none',
                }}
              />
            </div>

            {/* Speed-to-Lead Criteria */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC' }}>
                  Speed-to-Lead Autodial Trigger (&lt;45s)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                  Auto-dial high-intent inbound prospects who score &ge; {agentConfig.minLeadScoreForCall || 70}/100 within 45 seconds.
                </div>
              </div>

              <input
                type="checkbox"
                checked={agentConfig.speedToLeadEnabled}
                onChange={(e) => setAgentConfig({ ...agentConfig, speedToLeadEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                id="save-voice-config-btn"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  border: 'none',
                  color: '#04101A',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {savingConfig ? <RefreshCw size={14} className="spin-icon" /> : <Check size={14} />}
                Save Voice Agent Settings
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CALL ANALYTICS & LOGS TABLE */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}>
            {/* Table Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Call Records &amp; Audio Transcripts
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                  {calls.length} Total Voice Sessions logged across Bland.ai and Twilio WebRTC
                </span>
              </div>

              <button
                onClick={loadCallsData}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  color: '#94A3B8',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                }}
              >
                <RefreshCw size={12} className={loadingCalls ? 'spin-icon' : ''} />
                Refresh
              </button>
            </div>

            {/* Table Rows */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '12px 18px' }}>CONTACT / LEAD</th>
                    <th style={{ padding: '12px 14px' }}>PHONE</th>
                    <th style={{ padding: '12px 14px' }}>DURATION</th>
                    <th style={{ padding: '12px 14px' }}>STATUS</th>
                    <th style={{ padding: '12px 14px' }}>AI SENTIMENT</th>
                    <th style={{ padding: '12px 14px' }}>SUMMARY</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                        No calls logged yet. Launch a Speed-to-Lead call to generate initial data.
                      </td>
                    </tr>
                  ) : (
                    calls.map((c) => {
                      const isPlaying = playingCallId === c.callId;
                      return (
                        <tr
                          key={c._id || c.callId}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: '700', color: '#F1F5F9' }}>
                              {c.leadId?.name || 'Inbound Prospect'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                              {c.leadId?.company || 'Enterprise Account'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 14px', color: '#CBD5E1' }}>
                            {c.toNumber}
                          </td>

                          <td style={{ padding: '14px 14px', color: '#38BDF8', fontWeight: '600' }}>
                            {formatSeconds(c.durationSeconds)}
                          </td>

                          <td style={{ padding: '14px 14px' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background:
                                c.status === 'completed'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : c.status === 'transferred'
                                  ? 'rgba(14, 165, 233, 0.15)'
                                  : 'rgba(245, 158, 11, 0.15)',
                              color:
                                c.status === 'completed'
                                  ? '#10B981'
                                  : c.status === 'transferred'
                                  ? '#38BDF8'
                                  : '#F59E0B',
                            }}>
                              {c.takenOver ? `⚡ Transferred to Rep` : c.status?.toUpperCase()}
                            </span>
                          </td>

                          <td style={{ padding: '14px 14px' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                            }}>
                              🔥 {c.sentimentScore || 85}% Intent
                            </span>
                          </td>

                          <td style={{ padding: '14px 14px', maxWidth: '280px', color: '#94A3B8' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.aiSummary || 'AI phone qualification session'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              {/* Audio Playback button */}
                              <button
                                onClick={() => togglePlayAudio(c.callId, c.recordingUrl, c)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: isPlaying ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                                  border: `1px solid ${isPlaying ? '#10B981' : 'rgba(255, 255, 255, 0.12)'}`,
                                  color: isPlaying ? '#10B981' : '#CBD5E1',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: isPlaying ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                                  transition: 'all 0.2s ease',
                                }}
                                title={isPlaying ? 'Pause Audio' : 'Play Call Recording'}
                              >
                                {isPlaying ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ width: '2px', height: '10px', background: '#10B981', animation: 'eqPulse 0.6s infinite ease-in-out' }} />
                                    <span style={{ width: '2px', height: '14px', background: '#10B981', animation: 'eqPulse 0.4s infinite ease-in-out' }} />
                                    <span style={{ width: '2px', height: '8px', background: '#10B981', animation: 'eqPulse 0.5s infinite ease-in-out' }} />
                                  </div>
                                ) : (
                                  <Play size={13} style={{ marginLeft: '1px' }} />
                                )}
                              </button>

                              {/* View Transcript button */}
                              <button
                                onClick={() => setSelectedCallForModal(c)}
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  background: 'rgba(6, 182, 212, 0.1)',
                                  border: '1px solid rgba(6, 182, 212, 0.3)',
                                  color: '#38BDF8',
                                  fontSize: '0.74rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <FileText size={12} />
                                Transcript
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TRANSCRIPT INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {selectedCallForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 7, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: '560px',
            maxWidth: '92vw',
            maxHeight: '85vh',
            background: '#0B1120',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Call Transcript &amp; AI Action Items
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  {selectedCallForModal.leadId?.name} • Duration: {formatSeconds(selectedCallForModal.durationSeconds)}
                </span>
              </div>
              <button
                onClick={() => setSelectedCallForModal(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            {/* Audio Player Strip inside Modal */}
            <div style={{
              padding: '12px 18px',
              background: 'rgba(15, 23, 42, 0.95)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button
                onClick={() => togglePlayAudio(selectedCallForModal.callId, selectedCallForModal.recordingUrl, selectedCallForModal)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: playingCallId === selectedCallForModal.callId ? '#10B981' : '#0EA5E9',
                  border: 'none',
                  color: '#040710',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 0 14px rgba(14, 165, 233, 0.4)',
                  flexShrink: 0,
                }}
                title={playingCallId === selectedCallForModal.callId ? 'Pause Call Audio' : 'Play Call Audio'}
              >
                {playingCallId === selectedCallForModal.callId ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
              </button>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                  <span style={{ fontWeight: '700', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 size={13} />
                    {playingCallId === selectedCallForModal.callId ? 'Playing Recording...' : 'Bland.ai Call Recording (Stereo)'}
                  </span>
                  <span style={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                    {formatSeconds(playingCallId === selectedCallForModal.callId ? audioCurrentTime : 0)} / {formatSeconds(selectedCallForModal.durationSeconds || 15)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={selectedCallForModal.durationSeconds || audioDuration || 15}
                  step="0.1"
                  value={playingCallId === selectedCallForModal.callId ? audioCurrentTime : 0}
                  onChange={handleAudioSeek}
                  style={{
                    width: '100%',
                    accentColor: '#10B981',
                    cursor: 'pointer',
                    height: '4px',
                  }}
                />
              </div>

              <button
                onClick={cycleAudioSpeed}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#CBD5E1',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title="Change playback speed"
              >
                {audioSpeed}x
              </button>

              {/* Multi-Voice TTS Toggle */}
              <button
                onClick={() => playVoiceTranscriptSpeech(selectedCallForModal)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: playingCallId === `speech_${selectedCallForModal.callId}` ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                  border: `1px solid ${playingCallId === `speech_${selectedCallForModal.callId}` ? '#10B981' : 'rgba(56, 189, 248, 0.3)'}`,
                  color: playingCallId === `speech_${selectedCallForModal.callId}` ? '#10B981' : '#38BDF8',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                }}
                title="Speak conversation turn-by-turn with distinct voices"
              >
                <Sparkles size={12} />
                {playingCallId === `speech_${selectedCallForModal.callId}` ? 'Speaking...' : 'Multi-Voice TTS'}
              </button>
            </div>

            {/* AI Summary Banner */}
            <div style={{
              padding: '12px 18px',
              background: 'rgba(6, 182, 212, 0.08)',
              borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
              fontSize: '0.78rem',
              color: '#E2E8F0',
              lineHeight: '1.45',
            }}>
              <span style={{ fontWeight: '700', color: '#38BDF8' }}>AI Executive Summary: </span>
              {selectedCallForModal.aiSummary}
            </div>

            {/* Transcript Messages Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {selectedCallForModal.transcript?.map((t, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: t.role === 'assistant' ? 'flex-start' : 'flex-end',
                }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', marginBottom: '2px' }}>
                    {t.role === 'assistant' ? 'Maya (Voice AI)' : t.role === 'human_rep' ? 'Human Rep' : selectedCallForModal.leadId?.name || 'Lead'}
                  </span>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: t.role === 'assistant' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                    border: t.role === 'assistant' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.82rem',
                    color: '#F8FAFC',
                    maxWidth: '85%',
                  }}>
                    {t.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Items Footer */}
            {selectedCallForModal.actionItems?.length > 0 && (
              <div style={{
                padding: '14px 18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(15, 23, 42, 0.8)',
              }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Extracted Action Items
                </span>
                <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '0.78rem', color: '#10B981' }}>
                  {selectedCallForModal.actionItems.map((act, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING STICKY AUDIO PLAYER DOCK */}
      {/* ========================================================================= */}
      {playingCallId && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '680px',
          maxWidth: '92vw',
          background: 'rgba(11, 17, 32, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '16px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 28px rgba(16, 185, 129, 0.25)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1100,
          animation: 'fadeInUp 0.25s ease',
        }}>
          {/* Animated Waveform Bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '22px' }}>
            <span style={{ width: '3px', height: '14px', background: '#10B981', borderRadius: '2px', animation: 'eqPulse 0.5s infinite ease-in-out' }} />
            <span style={{ width: '3px', height: '22px', background: '#38BDF8', borderRadius: '2px', animation: 'eqPulse 0.35s infinite ease-in-out' }} />
            <span style={{ width: '3px', height: '10px', background: '#10B981', borderRadius: '2px', animation: 'eqPulse 0.6s infinite ease-in-out' }} />
            <span style={{ width: '3px', height: '18px', background: '#38BDF8', borderRadius: '2px', animation: 'eqPulse 0.4s infinite ease-in-out' }} />
          </div>

          {/* Call Metadata */}
          <div style={{ maxWidth: '170px', overflow: 'hidden' }}>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#F8FAFC',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {playingCall?.leadId?.name || 'Call Recording'}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: '#94A3B8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {playingCall?.leadId?.company || playingCall?.toNumber || 'Bland AI Voice'}
            </div>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={() => togglePlayAudio(playingCallId, playingCall?.recordingUrl, playingCall)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#10B981',
              border: 'none',
              color: '#040710',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)',
              flexShrink: 0,
            }}
            title="Pause Audio"
          >
            <Pause size={16} />
          </button>

          {/* Scrubber & Time */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>
              <span style={{ color: '#10B981', fontWeight: '700' }}>{formatSeconds(audioCurrentTime)}</span>
              <span>{formatSeconds(audioDuration || playingCall?.durationSeconds || 15)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={audioDuration || playingCall?.durationSeconds || 15}
              step="0.1"
              value={audioCurrentTime}
              onChange={handleAudioSeek}
              style={{
                width: '100%',
                accentColor: '#10B981',
                cursor: 'pointer',
                height: '4px',
              }}
            />
          </div>

          {/* Speed Pill */}
          <button
            onClick={cycleAudioSpeed}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#38BDF8',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Playback Speed"
          >
            {audioSpeed}x
          </button>

          {/* Stop / Close */}
          <button
            onClick={stopAudio}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              fontSize: '1rem',
              lineHeight: 1,
            }}
            title="Stop & Close Audio Player"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Equalizer CSS */}
      <style>{`
        @keyframes eqPulse {
          0%, 100% { height: 4px; }
          50% { height: 18px; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
