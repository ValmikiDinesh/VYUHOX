import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Send,
  Cpu,
  PhoneCall,
  Compass,
  DollarSign,
  Layers,
  Bot,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { api } from '../services/api';

/**
 * SANJAYA (सञ्जय) • Divya-Drishti Celestial Voice Commander
 * 
 * Named after Sanjaya from the Mahabharata/Puranas endowed with celestial vision.
 * Autonomous voice controller orchestrating end-to-end GTM, prospecting, calling,
 * analytics, and tactical switches with 0 manual clicks.
 */
export default function SanjayaVoiceCommander({
  isOpen,
  onClose,
  activeWorkspace,
  onNavigateTab,
  onToggleOperatingMode,
  onOpenAddFundsModal,
  onRefreshData,
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [responseLog, setResponseLog] = useState([
    {
      id: 'welcome',
      role: 'sanjaya',
      title: 'Divya-Drishti Online',
      message:
        'Pranam! I am Sanjaya (सञ्जय), your celestial voice commander. Speak any command — I perceive your workspace in real-time and execute lead discovery, automated phone calls with Maya, outreach, revenue analytics, and system modes immediately.',
      action: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioWaves, setAudioWaves] = useState([20, 45, 80, 60, 30, 90, 40, 75]);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const logEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [responseLog, isOpen, processing]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        setTranscript(final);
        handleExecuteCommand(final);
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.warn('[Sanjaya Speech Error]:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [activeWorkspace]);

  // Audio wave animation when listening
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setAudioWaves([
          Math.floor(Math.random() * 70) + 20,
          Math.floor(Math.random() * 85) + 15,
          Math.floor(Math.random() * 95) + 10,
          Math.floor(Math.random() * 60) + 25,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 100) + 10,
          Math.floor(Math.random() * 75) + 20,
          Math.floor(Math.random() * 60) + 30,
        ]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Speak Sanjaya response back
  const speakResponse = (text) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[SpeechSynthesis Error]:', err);
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type commands below.');
      return;
    }
    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    } catch (e) {
      console.warn('[Speech Start]', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Execute command through backend Sanjaya AI Commander
  const handleExecuteCommand = async (commandToRun) => {
    const text = (commandToRun || transcript).trim();
    if (!text) return;

    stopListening();
    setProcessing(true);

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setResponseLog((prev) => [...prev, userMsg]);
    setTranscript('');
    setInterimTranscript('');

    try {
      const result = await api.sendSanjayaCommand(text, activeWorkspace?._id);

      if (result && result.success) {
        const spokenText =
          result.speechResponse ||
          result.result?.spokenResponse ||
          result.actionTaken ||
          result.result?.message ||
          result.message ||
          'Command executed successfully.';

        const intentName = result.intent || result.result?.action || 'ACTION_EXECUTED';
        const summaryData = result.details || result.result?.summary || null;

        const sanjayaMsg = {
          id: `sanjaya-${Date.now()}`,
          role: 'sanjaya',
          title: `Executed: ${intentName.replace(/_/g, ' ')}`,
          message: spokenText,
          action: intentName,
          targetTab: result.targetTab || result.result?.data?.tab,
          summary: summaryData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setResponseLog((prev) => [...prev, sanjayaMsg]);
        speakResponse(sanjayaMsg.message);

        // Perform real-time client side-effects based on Sanjaya intent
        executeClientSideEffects(result);
      } else {
        const errMsg = {
          id: `err-${Date.now()}`,
          role: 'sanjaya',
          title: 'Perception Obscured',
          message: result?.message || 'Could not execute the voice command. Please check your instructions.',
          action: 'ERROR',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setResponseLog((prev) => [...prev, errMsg]);
        speakResponse(errMsg.message);
      }
    } catch (err) {
      const errMsg = {
        id: `err-${Date.now()}`,
        role: 'sanjaya',
        title: 'Communication Disrupted',
        message: err.message || 'Network error communicating with Sanjaya voice commander.',
        action: 'ERROR',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setResponseLog((prev) => [...prev, errMsg]);
    } finally {
      setProcessing(false);
    }
  };

  // Perform immediate UI transitions requested by Sanjaya
  const executeClientSideEffects = (commandResult) => {
    if (!commandResult) return;
    const action = commandResult.intent || commandResult.action || commandResult.result?.action;
    const targetTab = commandResult.targetTab || commandResult.data?.tab || commandResult.result?.data?.tab;
    const data = commandResult.details || commandResult.data || commandResult.result?.data;

    if (targetTab && onNavigateTab) {
      onNavigateTab(targetTab);
    } else if (action === 'NAVIGATE_TAB' && data?.tab && onNavigateTab) {
      onNavigateTab(data.tab);
    } else if (action === 'LEAD_DISCOVERY') {
      if (onNavigateTab) onNavigateTab('leads');
      if (onRefreshData) onRefreshData();
    } else if (action === 'VOICE_CALL') {
      if (onNavigateTab) onNavigateTab('voice');
      if (onRefreshData) onRefreshData();
    } else if (action === 'SEND_MESSAGES') {
      if (onNavigateTab) onNavigateTab('messaging');
      if (onRefreshData) onRefreshData();
    } else if (action === 'SWITCH_MODE' && onToggleOperatingMode) {
      const mode = data?.targetMode || (action === 'SWITCH_MODE' ? 'AI_COMPANY' : null);
      if (mode) {
        onToggleOperatingMode(mode);
      }
    } else if (action === 'TOPUP_WALLET' && onOpenAddFundsModal) {
      onOpenAddFundsModal();
    } else if (action === 'CEO_BRIEFING') {
      if (onNavigateTab) onNavigateTab('ai-company');
      if (onRefreshData) onRefreshData();
    }
  };

  const companyName = activeWorkspace?.branding?.companyName || activeWorkspace?.name || 'our enterprise';
  const industryName = activeWorkspace?.industry || activeWorkspace?.businessCategory || 'target market';

  const quickCommands = [
    { label: `🔍 Find 10 leads for ${industryName.slice(0, 18)}`, cmd: `Find 10 high-intent leads and decision makers for ${companyName}` },
    { label: '📞 Call leads with Maya', cmd: `Mobilize Maya Vance to call top qualified prospects for ${companyName}` },
    { label: '🎯 Who are our buyers?', cmd: `Sanjaya, who are our most profitable buyer personas for ${companyName} and how should we reach them?` },
    { label: '💰 Check revenue & stats', cmd: 'Show me my revenue, conversion rates, and wallet balance' },
    { label: '⚡ Run autonomous mode', cmd: 'Switch my workspace to Autonomous AI Company mode' },
    { label: '📊 Brief me like a CEO', cmd: 'Give me an executive CEO morning briefing of all sales activities' },
  ];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopListening();
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          height: '85vh',
          maxHeight: '740px',
          background: 'linear-gradient(180deg, #0b1329 0%, #060a17 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(245, 158, 11, 0.25), 0 0 40px rgba(6, 182, 212, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.65)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
              }}
            >
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    letterSpacing: '0.02em',
                  }}
                >
                  SANJAYA <span style={{ color: '#F59E0B', fontSize: '0.95rem' }}>(सञ्जय)</span>
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: 'rgba(245, 158, 11, 0.18)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                  }}
                >
                  Divya-Drishti AI
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#38BDF8',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}
                >
                  ⌘J / Ctrl+J
                </span>
              </div>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                }}
              >
                Autonomous Celestial Voice Commander • Complete GTM & Strategy Execution
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Audio Voice Toggle */}
            <button
              onClick={() => setVoiceMuted(!voiceMuted)}
              style={{
                background: voiceMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${voiceMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                color: voiceMuted ? '#F87171' : '#34D399',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
              title={voiceMuted ? 'Unmute voice synthesis' : 'Mute voice synthesis'}
            >
              {voiceMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{voiceMuted ? 'Muted' : 'Voice On'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                stopListening();
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94A3B8',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Conversation / Execution Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Active Maya Speaking Live Animation */}
          {isSpeaking && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.45)',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.8)',
                  }}
                >
                  <Bot size={20} color="#04101A" />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #060a17',
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F8FAFC' }}>
                      Maya Vance • Speaking Live
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      Active Voice
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#38BDF8', marginTop: '2px' }}>
                    Sub-800ms Voice Synthesis • Addressing Directive
                  </div>
                </div>
              </div>

              {/* Reactive Soundwave Animation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {[14, 28, 20, 36, 24, 16, 32, 18].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: `${h}px`,
                      borderRadius: '3px',
                      background: i % 2 === 0 ? '#06B6D4' : '#10B981',
                      transition: 'height 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {responseLog.map((item) => (
            <div
              key={item.id}
              style={{
                alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: item.role === 'user' ? '80%' : '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: item.role === 'user' ? '#38BDF8' : '#F59E0B',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.role === 'user' ? 'You (Voice Command)' : 'Sanjaya AI'}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>{item.timestamp}</span>
              </div>

              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: item.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background:
                    item.role === 'user'
                      ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)'
                      : 'rgba(15, 23, 42, 0.85)',
                  border:
                    item.role === 'user'
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#F8FAFC',
                  fontSize: '0.88rem',
                  lineHeight: '1.55',
                  boxShadow:
                    item.role === 'user'
                      ? '0 4px 15px rgba(2, 132, 199, 0.2)'
                      : '0 4px 20px rgba(0, 0, 0, 0.4)',
                }}
              >
                {item.title && item.role === 'sanjaya' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#FBBF24',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                      }}
                    >
                      {item.title}
                    </span>
                    {item.action && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#34D399',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={12} /> Auto-Executed
                      </span>
                    )}
                  </div>
                )}
                <div>{item.message}</div>

                {/* Structured metrics summary card if available */}
                {item.summary && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {Object.entries(item.summary).map(([key, val]) => (
                      <div key={key}>
                        <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                          {key.replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38BDF8' }}>
                          {String(val)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Processing Indicator */}
          {processing && (
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#FBBF24',
                fontSize: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderTopColor: '#F59E0B',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Sanjaya is parsing your battlefield command & orchestrating autonomous agents...</span>
            </div>
          )}

          <div ref={logEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div
          style={{
            padding: '8px 20px',
            background: 'rgba(6, 10, 23, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>Try saying:</span>
          {quickCommands.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteCommand(item.cmd)}
              disabled={processing}
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F59E0B';
                e.currentTarget.style.color = '#FBBF24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#CBD5E1';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Voice Control & Input Bar */}
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(11, 19, 41, 0.95)',
            borderTop: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Active Listening Visualizer Bar */}
          {isListening && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '700', marginRight: '8px' }}>
                Listening to your divine command...
              </span>
              {audioWaves.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    height: `${Math.max(6, (h / 100) * 26)}px`,
                    borderRadius: '2px',
                    background: i % 2 === 0 ? '#F59E0B' : '#06B6D4',
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                  fontStyle: 'italic',
                  marginLeft: '8px',
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {interimTranscript || 'Speak naturally...'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Primary Voice Mic Trigger Orb */}
            <button
              onClick={handleToggleListening}
              disabled={processing}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: isListening
                  ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isListening
                  ? '0 0 25px rgba(239, 68, 68, 0.7)'
                  : '0 0 20px rgba(245, 158, 11, 0.5)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              title={isListening ? 'Click to stop listening' : 'Click to speak to Sanjaya'}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Text Input Fallback */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(2, 6, 23, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '4px 14px',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  isListening
                    ? interimTranscript || 'Listening...'
                    : 'Speak via microphone or type your voice command (e.g. "Find 10 leads")...'
                }
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleExecuteCommand(transcript);
                  }
                }}
                disabled={processing || isListening}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                  padding: '8px 0',
                }}
              />
              <button
                onClick={() => handleExecuteCommand(transcript)}
                disabled={processing || !transcript.trim()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: transcript.trim() ? '#F59E0B' : '#64748B',
                  cursor: transcript.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
