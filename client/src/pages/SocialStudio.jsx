import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Calendar as CalendarIcon,
  Sparkles,
  Play,
  Pause,
  Share2,
  Heart,
  Eye,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sliders,
  Plus,
  RefreshCw,
  Flame,
  Zap,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Layers,
  Type,
  Image as ImageIcon,
  Send,
  AlertCircle,
  Settings,
  Smartphone,
  Check,
  Globe,
  Radio,
  Upload,
  UploadCloud,
  FileVideo,
  FileImage,
  Trash2,
  Megaphone,
  Mic,
} from 'lucide-react';
import { api } from '../services/api';

export default function SocialStudio({ activeWorkspace, socket }) {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'reel_player' | 'carousels' | 'config'
  const [calendarView, setCalendarView] = useState('monthly'); // 'monthly' | 'weekly'

  // Data State
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalScheduled: 0,
    totalPublished: 0,
    totalViews: 0,
    totalLikes: 0,
    totalReach: 0,
    totalShares: 0,
  });
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Selected Post for Inspector / Player
  const [selectedPost, setSelectedPost] = useState(null);

  // Video Reel Player Interactive State
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [reelCurrentTime, setReelCurrentTime] = useState(0);
  const [reelDuration, setReelDuration] = useState(30);
  const reelAudioRef = useRef(new Audio());
  const reelVideoRef = useRef(null);
  const reelCanvasRef = useRef(null);

  // Carousel Slide State & View Mode
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [carouselViewMode, setCarouselViewMode] = useState('RENDER'); // 'RENDER' | 'SLIDES'

  // 60FPS Dynamic Motion Canvas (Candlesticks, Liquidity Depth Wave, Floating Data Particles, Spectrum)
  useEffect(() => {
    let animId;
    let tick = 0;
    const canvas = reelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate 35 particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * 340,
      y: Math.random() * 604,
      size: Math.random() * 2.5 + 0.8,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.4 ? '#06B6D4' : Math.random() > 0.5 ? '#10B981' : '#FACC15',
    }));

    // Candlesticks configuration
    const candleCount = 14;
    const candleWidth = 12;
    const candleSpacing = 22;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Floating Cybernetic Particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (isPlayingReel ? 0.95 : 0.5);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Draw Active Order Book Candlesticks (in lower area: Y = 360 to 440)
      const baseCandleY = 390;
      for (let i = 0; i < candleCount; i++) {
        const cx = 16 + i * candleSpacing;
        const phase = tick * 0.04 + i * 0.75;
        const height = 12 + Math.sin(phase) * 10 + Math.cos(phase * 0.5) * 6;
        const isBullish = Math.sin(phase) >= 0;
        const candleColor = isBullish ? '#10B981' : '#EF4444';
        const topWick = height + Math.abs(Math.sin(phase * 1.5)) * 12;
        const botWick = height + Math.abs(Math.cos(phase * 1.2)) * 10;

        ctx.globalAlpha = isPlayingReel ? 0.6 : 0.35;
        ctx.strokeStyle = candleColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + candleWidth / 2, baseCandleY - topWick);
        ctx.lineTo(cx + candleWidth / 2, baseCandleY + botWick);
        ctx.stroke();

        ctx.fillStyle = candleColor;
        ctx.fillRect(cx, baseCandleY - height, candleWidth, height * 2);
      }

      // 3. Draw Undulating Liquidity Wave (Sine wave with cyan neon glow)
      ctx.beginPath();
      const waveY = 430;
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = waveY + Math.sin(x * 0.03 + tick * 0.04) * 12 + Math.cos(x * 0.015 - tick * 0.02) * 6;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 10;
      ctx.globalAlpha = isPlayingReel ? 0.85 : 0.45;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Fill area under wave
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      const waveGrad = ctx.createLinearGradient(0, waveY, 0, canvas.height);
      waveGrad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
      waveGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = waveGrad;
      ctx.globalAlpha = isPlayingReel ? 0.75 : 0.35;
      ctx.fill();

      // 4. Top Audio Spectrum Frequency Bars (Right under ticker)
      const numBars = 22;
      const barWidth = 7;
      const barSpacing = 14;
      const startX = 18;
      const barBaseY = 92;

      for (let b = 0; b < numBars; b++) {
        const bx = startX + b * barSpacing;
        const bPhase = tick * 0.12 + b * 0.6;
        const rawHeight = (Math.sin(bPhase) * 0.5 + 0.5) * (isPlayingReel ? 22 : 8) + 4;
        ctx.fillStyle = b % 2 === 0 ? '#38BDF8' : '#F472B6';
        ctx.globalAlpha = isPlayingReel ? 0.85 : 0.35;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fillRect(bx, barBaseY - rawHeight, barWidth, rawHeight);
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingReel, activeTab]);

  // Modals
  const [is30DayModalOpen, setIs30DayModalOpen] = useState(false);
  const [isCreatingReelModalOpen, setIsCreatingReelModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newReelTopic, setNewReelTopic] = useState('');
  const [newReelPlatform, setNewReelPlatform] = useState('INSTAGRAM');
  const [newReelTheme, setNewReelTheme] = useState('cyber_crypto_matrix');

  // Business Owner Upload & Automated Publishing Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState(null);
  const [uploadIsVideo, setUploadIsVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPlatform, setUploadPlatform] = useState('INSTAGRAM');
  const [uploadPostType, setUploadPostType] = useState('REEL'); // 'REEL' | 'STATIC_GRAPHIC' | 'CAROUSEL'
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadHashtags, setUploadHashtags] = useState('#Crypto #AlgorithmicFinance #QuantitativeTrading #FinTech');
  const [uploadPublishMode, setUploadPublishMode] = useState('AUTOMATIC_NOW'); // 'AUTOMATIC_NOW' | 'SCHEDULED_AUTOPILOT'
  const [uploadScheduledDate, setUploadScheduledDate] = useState('');
  const [uploadGenerateVoiceover, setUploadGenerateVoiceover] = useState(true);

  // AI Prompt-to-Post Studio Modal State (Multi-Voice, Tone, Language & Business Model Context)
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [promptPostType, setPromptPostType] = useState('REEL');
  const [promptPlatform, setPromptPlatform] = useState('INSTAGRAM');
  const [promptVoiceId, setPromptVoiceId] = useState('maya');
  const [promptLanguage, setPromptLanguage] = useState('en-US');
  const [promptTone, setPromptTone] = useState('aggressive_challenger');
  const [promptInjectBusinessData, setPromptInjectBusinessData] = useState(true);
  const [promptPublishMode, setPromptPublishMode] = useState('AUTOMATIC_NOW');
  const [promptScheduledDate, setPromptScheduledDate] = useState('');
  const [isPromptGenerating, setIsPromptGenerating] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const isVid = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(file.name);
    setUploadIsVideo(isVid);
    setUploadPostType(isVid ? 'REEL' : 'STATIC_GRAPHIC');
    const localUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(localUrl);
    if (!uploadTitle) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setUploadTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleClearUpload = () => {
    if (uploadPreviewUrl && uploadPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(uploadPreviewUrl);
    }
    setUploadFile(null);
    setUploadPreviewUrl(null);
  };

  const handleCreateCustomPost = async () => {
    if (!uploadFile && !uploadTitle && !uploadCaption) {
      showToast('⚠️ Please upload an image/video or provide a title.');
      return;
    }

    setIsUploading(true);
    try {
      let finalMediaUrl = '';

      if (uploadFile) {
        showToast('⏳ Uploading media asset to dashboard...');
        const uploadRes = await api.uploadSocialMedia(uploadFile);
        if (uploadRes.success && uploadRes.url) {
          finalMediaUrl = uploadRes.url;
        } else {
          throw new Error(uploadRes.message || 'File upload failed');
        }
      }

      showToast(uploadPublishMode === 'AUTOMATIC_NOW' ? '🚀 Distributing post live...' : '📅 Scheduling post on autopilot...');
      const tagsArray = uploadHashtags
        .split(/[,\s]+/)
        .map((t) => (t.startsWith('#') ? t : `#${t}`))
        .filter((t) => t.length > 1);

      const res = await api.createCustomSocialPost({
        workspaceId: activeWorkspace._id,
        platform: uploadPlatform,
        type: uploadPostType,
        title: uploadTitle || 'Custom Business Media Post',
        scriptHook: uploadTitle,
        scriptBody: uploadCaption,
        caption: `${uploadCaption}\n\n${tagsArray.join(' ')}`,
        hashtags: tagsArray,
        mediaUrl: finalMediaUrl,
        thumbnailUrl: finalMediaUrl,
        publishImmediately: uploadPublishMode === 'AUTOMATIC_NOW',
        scheduledAt: uploadPublishMode === 'SCHEDULED_AUTOPILOT' && uploadScheduledDate ? new Date(uploadScheduledDate) : null,
        generateVoiceover: uploadGenerateVoiceover,
      });

      if (res.success && res.post) {
        showToast(res.message || '✨ Post created successfully!');
        setIsUploadModalOpen(false);
        handleClearUpload();
        setUploadTitle('');
        setUploadCaption('');
        await loadSocialData();
        setSelectedPost(res.post);
        if (res.post.type === 'REEL') {
          setActiveTab('reel_player');
        }
      } else {
        showToast('❌ Failed: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Custom post error:', err);
      showToast('❌ ' + (err.message || 'Failed to publish post'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!promptText.trim()) {
      showToast('⚠️ Please enter a text prompt or topic.');
      return;
    }

    setIsPromptGenerating(true);
    try {
      showToast('✨ Synthesizing unique post from business model & prompt...');
      const res = await api.generateFromPrompt({
        workspaceId: activeWorkspace._id,
        prompt: promptText,
        postType: promptPostType,
        platform: promptPlatform,
        voiceId: promptVoiceId,
        language: promptLanguage,
        tone: promptTone,
        publishImmediately: promptPublishMode === 'AUTOMATIC_NOW',
        scheduledAt: promptPublishMode === 'SCHEDULED_AUTOPILOT' && promptScheduledDate ? new Date(promptScheduledDate) : null,
      });

      if (res.success && res.post) {
        showToast(
          promptPublishMode === 'AUTOMATIC_NOW'
            ? '🚀 Generated & published immediately across channels!'
            : '✨ Generated unique post successfully!'
        );
        setIsPromptModalOpen(false);
        setPromptText('');
        await loadSocialData();
        setSelectedPost(res.post);
        if (res.post.type === 'REEL') {
          setActiveTab('reel_player');
        } else if (res.post.type === 'CAROUSEL') {
          setActiveTab('carousels');
        }
      } else {
        showToast('❌ Failed: ' + (res.message || 'Generation error'));
      }
    } catch (err) {
      console.error('Generate from prompt error:', err);
      showToast('❌ Failed: ' + err.message);
    } finally {
      setIsPromptGenerating(false);
    }
  };

  const handleBoostToAds = async (postId) => {
    try {
      showToast('⚡ Boosting post to Facebook & Instagram Ads...');
      const res = await api.boostPostToAds({ postId, dailyBudgetUSD: 100 });
      if (res.success) {
        showToast(`📢 Boosted live on Meta Ads! Campaign: ${res.campaign.campaignName}`);
      } else {
        showToast('❌ Failed: ' + (res.message || 'Error boosting post'));
      }
    } catch (err) {
      console.error('Boost error:', err);
      showToast('❌ Boost failed');
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load of Posts & Social Config
  useEffect(() => {
    if (!activeWorkspace?._id) return;
    loadSocialData();
    loadSocialConfig();
  }, [activeWorkspace?._id, platformFilter, typeFilter]);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (platformFilter !== 'ALL') params.platform = platformFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await api.getSocialPosts(activeWorkspace._id, params);
      if (res.success) {
        setPosts(res.posts || []);
        if (res.analytics) setAnalytics(res.analytics);
        if (!selectedPost && res.posts?.length > 0) {
          const firstReel = res.posts.find((p) => p.type === 'REEL') || res.posts[0];
          setSelectedPost(firstReel);
        }
      }
    } catch (err) {
      console.error('Failed to load social posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialConfig = async () => {
    try {
      const res = await api.getSocialConfig(activeWorkspace._id);
      if (res.success && res.config) {
        setConfig(res.config);
      }
    } catch (err) {
      console.error('Failed to load social config:', err);
    }
  };

  // 2. Real-time Socket.io Events
  useEffect(() => {
    if (!socket) return;

    const handlePostPublished = (data) => {
      showToast(data.message || '🚀 Social post published live!');
      loadSocialData();
    };

    const handleBatchGenerated = (data) => {
      showToast(data.message || '✨ 30 days of social content generated!');
      loadSocialData();
    };

    socket.on('social:post_published', handlePostPublished);
    socket.on('social:batch_generated', handleBatchGenerated);

    return () => {
      socket.off('social:post_published', handlePostPublished);
      socket.off('social:batch_generated', handleBatchGenerated);
    };
  }, [socket]);

  // 3. Audio / Video Synchronization for Reel Player
  useEffect(() => {
    const audio = reelAudioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setReelCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setReelDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlayingReel(false);
      setReelCurrentTime(0);
      if (reelVideoRef.current) {
        reelVideoRef.current.currentTime = 0;
        reelVideoRef.current.pause();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // When selectedPost changes, update audio source and stop playback cleanly
  useEffect(() => {
    if (!selectedPost) return;
    const audio = reelAudioRef.current;
    if (audio) {
      audio.pause();
      setIsPlayingReel(false);
      setReelCurrentTime(0);
      const targetAudio = selectedPost.audioUrl || '/audio/reels/reel_fund_speed.wav';
      audio.src = targetAudio;
    }
    if (reelVideoRef.current) {
      reelVideoRef.current.pause();
      reelVideoRef.current.currentTime = 0;
    }
  }, [selectedPost?._id]);

  const togglePlayReel = () => {
    const audio = reelAudioRef.current;
    const video = reelVideoRef.current;

    if (isPlayingReel) {
      audio.pause();
      if (video) video.pause();
      setIsPlayingReel(false);
    } else {
      const srcUrl = selectedPost?.audioUrl || '/audio/reels/reel_fund_speed.wav';
      if (audio.src !== window.location.origin + srcUrl && !audio.src.endsWith(srcUrl)) {
        audio.src = srcUrl;
      }
      audio.play().catch((e) => console.log('Reel audio play notice:', e));
      if (video) {
        video.play().catch(() => {});
      }
      setIsPlayingReel(true);
    }
  };

  const handleReelSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setReelCurrentTime(newTime);
    if (reelAudioRef.current) reelAudioRef.current.currentTime = newTime;
    if (reelVideoRef.current) reelVideoRef.current.currentTime = newTime % 15;
  };

  // 4. Toggle Autopilot Publishing Mode
  const handleToggleAutopilot = async () => {
    if (!config) return;
    const newMode = config.autopilotEnabled ? false : true;
    try {
      const res = await api.updateSocialConfig(activeWorkspace._id, {
        autopilotEnabled: newMode,
        publishingMode: newMode ? 'AUTOPILOT' : 'REVIEW_APPROVE',
      });
      if (res.success) {
        setConfig(res.config);
        showToast(
          newMode
            ? '🔘 Autopilot Mode Activated! Scheduled posts will publish automatically.'
            : '⚪ Review & Approve Mode: Posts will require manual sign-off before publishing.'
        );
      }
    } catch (err) {
      console.error('Failed to toggle autopilot:', err);
    }
  };

  // 5. Generate 30-Day Batch
  const handleGenerate30Days = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generate30Days(activeWorkspace._id);
      if (res.success) {
        setIs30DayModalOpen(false);
        showToast(`✨ Successfully generated and mapped ${res.count} posts across the calendar!`);
        loadSocialData();
      }
    } catch (err) {
      console.error('Failed to generate 30 days:', err);
      showToast('Error generating 30-day plan');
    } finally {
      setIsGenerating(false);
    }
  };

  // 6. Generate Single Reel
  const handleGenerateReel = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateReel(activeWorkspace._id, {
        topic: newReelTopic || undefined,
        platform: newReelPlatform,
        theme: newReelTheme,
      });
      if (res.success) {
        setIsCreatingReelModalOpen(false);
        setNewReelTopic('');
        setSelectedPost(res.post);
        setActiveTab('reel_player');
        showToast('🎬 Vertical Reel rendered! Ready for preview & publishing.');
        loadSocialData();
      }
    } catch (err) {
      console.error('Failed to generate reel:', err);
      showToast('Error rendering reel');
    } finally {
      setIsGenerating(false);
    }
  };

  // 7. Approve Post
  const handleApprovePost = async (postId) => {
    try {
      const res = await api.approveSocialPost(postId);
      if (res.success) {
        showToast('✅ Post approved and scheduled for automated publication!');
        loadSocialData();
      }
    } catch (err) {
      console.error('Failed to approve post:', err);
    }
  };

  // 8. Publish Post Now
  const handlePublishNow = async (postId) => {
    try {
      const res = await api.publishSocialPostNow(postId);
      if (res.success) {
        showToast('🚀 Post published live to social feeds!');
        if (selectedPost?._id === postId) {
          setSelectedPost(res.post);
        }
        loadSocialData();
      }
    } catch (err) {
      console.error('Failed to publish post:', err);
    }
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec = 0) => {
    const total = Math.floor(sec || 0);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Find active word for karaoke caption animation
  const getActiveWord = () => {
    if (!selectedPost?.timedCaptions) return null;
    for (const chunk of selectedPost.timedCaptions) {
      if (reelCurrentTime >= chunk.start && reelCurrentTime <= chunk.end) {
        const wordMatch = chunk.words?.find(
          (w) => reelCurrentTime >= w.start && reelCurrentTime <= w.end
        );
        return {
          chunkText: chunk.text,
          activeWord: wordMatch?.word || '',
        };
      }
    }
    return null;
  };

  const activeKaraoke = getActiveWord();

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
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: 'rgba(6, 182, 212, 0.95)',
          color: '#040710',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '0.86rem',
          boxShadow: '0 8px 30px rgba(6, 182, 212, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Zap size={16} />
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER & KPI STRIP */}
      {/* ========================================================================= */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(11, 17, 32, 0.7)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Left: Title & Persona */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
          }}>
            <Video size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#F8FAFC' }}>
                Autonomous Social Studio
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#F472B6',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <Radio size={10} className="animate-pulse" />
                9:16 Video Engine
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
              Automated viral reel scripting, AI voice narration, kinetic subtitles &amp; multi-channel distribution.
            </p>
          </div>
        </div>

        {/* Center: Live KPI Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' }}>Scheduled</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#38BDF8' }}>{analytics.totalScheduled} Posts</div>
          </div>

          <div style={{
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' }}>Live Published</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10B981' }}>{analytics.totalPublished} Posts</div>
          </div>

          <div style={{
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' }}>Total Views</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F472B6' }}>{(analytics.totalViews / 1000).toFixed(1)}k</div>
          </div>
        </div>

        {/* Right: Autopilot Switcher & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Autopilot Mode Pill Toggle */}
          <button
            onClick={handleToggleAutopilot}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: config?.autopilotEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${config?.autopilotEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.15)'}`,
              color: config?.autopilotEnabled ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            title="Toggle between 100% Autopilot Publishing and Review & Approve Mode"
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: config?.autopilotEnabled ? '#10B981' : '#64748B',
              boxShadow: config?.autopilotEnabled ? '0 0 8px #10B981' : 'none',
            }} />
            {config?.autopilotEnabled ? 'Autopilot: ON' : 'Review & Approve'}
          </button>

          {/* 1-Click 30-Day Batch Button */}
          <button
            onClick={() => setIs30DayModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Sparkles size={14} />
            Generate 30 Days
          </button>

          {/* New Reel Button */}
          <button
            onClick={() => setIsCreatingReelModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#06B6D4',
              border: 'none',
              color: '#040710',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Plus size={14} />
            Create Reel / Graphic
          </button>

          {/* AI Prompt Studio Button */}
          <button
            onClick={() => setIsPromptModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 18px rgba(236, 72, 153, 0.45)',
            }}
          >
            <Sparkles size={14} />
            AI Prompt Studio
          </button>

          {/* Business Owner Upload & Automated Publishing Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
            }}
          >
            <UploadCloud size={14} />
            Upload &amp; Auto-Publish
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECONDARY NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(8, 12, 22, 0.9)',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'calendar', label: 'Visual Content Calendar', icon: CalendarIcon },
            { id: 'reel_player', label: '9:16 Video Reel Studio', icon: Smartphone, badge: 'Interactive' },
            { id: 'carousels', label: 'Carousels & Graphics', icon: Layers },
            { id: 'config', label: 'Brand Voice & Channels', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(236, 72, 153, 0.4)' : 'transparent'}`,
                  color: isActive ? '#F472B6' : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                {tab.label}
                {tab.badge && (
                  <span style={{
                    fontSize: '0.62rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(6, 182, 212, 0.2)',
                    color: '#38BDF8',
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Platform Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', marginRight: '4px' }}>FILTER:</span>
          {['ALL', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE_SHORTS', 'LINKEDIN', 'TWITTER'].map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: platformFilter === p ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${platformFilter === p ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                color: platformFilter === p ? '#F8FAFC' : '#64748B',
                fontSize: '0.68rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={loadSocialData}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px 6px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Refresh Posts"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', position: 'relative' }}>
        {/* ========================================================================= */}
        {/* TAB 1: VISUAL CONTENT CALENDAR */}
        {/* ========================================================================= */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Calendar Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Content Calendar ({posts.length} Posts Planned)
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                  Drag or click any card to inspect script, media, and publishing triggers.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setCalendarView('monthly')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: calendarView === 'monthly' ? '#06B6D4' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: calendarView === 'monthly' ? '#040710' : '#94A3B8',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Monthly Grid
                </button>
                <button
                  onClick={() => setCalendarView('weekly')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: calendarView === 'weekly' ? '#06B6D4' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: calendarView === 'weekly' ? '#040710' : '#94A3B8',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  List Pipeline
                </button>
              </div>
            </div>

            {/* Posts Grid View */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {posts.map((post) => {
                const isReel = post.type === 'REEL';
                const isPublished = post.status === 'PUBLISHED';
                const isScheduled = post.status === 'SCHEDULED';

                return (
                  <div
                    key={post._id}
                    onClick={() => {
                      setSelectedPost(post);
                      if (isReel) setActiveTab('reel_player');
                      else setActiveTab('carousels');
                    }}
                    style={{
                      background: 'rgba(11, 17, 32, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, border-color 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    {/* Top Media / Thumbnail Preview */}
                    <div style={{
                      height: '140px',
                      background: 'linear-gradient(135deg, #0B1120 0%, #1E1B4B 100%)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {post.thumbnailUrl && (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                        />
                      )}

                      {/* Overlay Badges */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        display: 'flex',
                        gap: '6px',
                      }}>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(4px)',
                          color: '#38BDF8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                        }}>
                          {post.platform}
                        </span>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: isReel ? '#F472B6' : '#FACC15',
                          border: `1px solid ${isReel ? 'rgba(244, 114, 182, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`,
                        }}>
                          {post.type}
                        </span>
                      </div>

                      {/* Status Chip */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                      }}>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: isPublished
                            ? 'rgba(16, 185, 129, 0.2)'
                            : isScheduled
                            ? 'rgba(6, 182, 212, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                          color: isPublished ? '#10B981' : isScheduled ? '#38BDF8' : '#F59E0B',
                          border: `1px solid ${isPublished ? '#10B981' : isScheduled ? '#38BDF8' : '#F59E0B'}`,
                        }}>
                          {post.status}
                        </span>
                      </div>

                      {/* Reel Play Icon or Slide Count */}
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        {isReel ? <Play size={12} fill="#F8FAFC" /> : <Layers size={12} />}
                        {isReel ? '0:35' : `${post.carouselSlides?.length || 5} Slides`}
                      </div>
                    </div>

                    {/* Post Content Details */}
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{
                        margin: '0 0 6px',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: '#F8FAFC',
                        lineHeight: '1.35',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {post.title}
                      </h4>

                      <p style={{
                        margin: '0 0 12px',
                        fontSize: '0.74rem',
                        color: '#94A3B8',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.4',
                      }}>
                        {post.scriptHook || post.caption}
                      </p>

                      {/* Performance or Schedule Footer */}
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                      }}>
                        {isPublished ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Eye size={12} /> {post.metrics?.views || 1840}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Heart size={12} /> {post.metrics?.likes || 142}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38BDF8' }}>
                            <Clock size={12} />
                            {post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Ready to Schedule'}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {post.status === 'DRAFT' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprovePost(post._id);
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid #10B981',
                                color: '#10B981',
                                fontSize: '0.68rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Approve
                            </button>
                          )}
                          {!isPublished && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePublishNow(post._id);
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: 'rgba(6, 182, 212, 0.15)',
                                border: '1px solid #06B6D4',
                                color: '#38BDF8',
                                fontSize: '0.68rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Publish Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 9:16 VIDEO REEL STUDIO & PLAYER */}
        {/* ========================================================================= */}
        {activeTab === 'reel_player' && selectedPost && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Left: Smartphone Vertical Mockup Frame (9:16) */}
            <div style={{
              width: '340px',
              height: '604px',
              borderRadius: '36px',
              border: '6px solid #1E293B',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 50px rgba(6, 182, 212, 0.25)',
              background: '#020617',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <style>{`
                @keyframes kenBurnsSlow {
                  0% { transform: scale(1.0) translate(0px, 0px); }
                  50% { transform: scale(1.12) translate(-6px, -10px); }
                  100% { transform: scale(1.05) translate(8px, 6px); }
                }
                @keyframes tickerSlide {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                @keyframes ctaGlow {
                  0%, 100% { box-shadow: 0 0 12px rgba(6, 182, 212, 0.4); border-color: rgba(6, 182, 212, 0.5); }
                  50% { box-shadow: 0 0 26px rgba(6, 182, 212, 0.9); border-color: rgba(6, 182, 212, 0.9); }
                }
              `}</style>

              {/* Phone Camera Notch */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                height: '18px',
                background: '#1E293B',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                zIndex: 35,
              }} />

              {/* Live Market Ticker Tape Marquee */}
              <div style={{
                position: 'absolute',
                top: '18px',
                left: 0,
                right: 0,
                overflow: 'hidden',
                zIndex: 25,
                background: 'rgba(2, 6, 23, 0.88)',
                borderBottom: '1px solid rgba(6, 182, 212, 0.35)',
                padding: '4px 0',
              }}>
                <div style={{
                  display: 'inline-flex',
                  whiteSpace: 'nowrap',
                  animation: 'tickerSlide 20s linear infinite',
                  fontSize: '0.6rem',
                  fontWeight: '800',
                  fontFamily: 'monospace',
                  color: '#38BDF8',
                  gap: '20px',
                }}>
                  <span>🟢 BTC/USDT $94,820 ▲ +4.2%</span>
                  <span>⚡ OKX / BYBIT ARB +18.4 bps</span>
                  <span>⏱️ LATENCY: 480ms</span>
                  <span>📊 3.82 SHARPE (Q2)</span>
                  <span>🛡️ SPEARBIT AUDITED</span>
                  <span>🔐 FIREBLOCKS MPC</span>
                  <span>🟢 BTC/USDT $94,820 ▲ +4.2%</span>
                  <span>⚡ OKX / BYBIT ARB +18.4 bps</span>
                  <span>⏱️ LATENCY: 480ms</span>
                  <span>📊 3.82 SHARPE (Q2)</span>
                </div>
              </div>

              {/* Verified Brand Header */}
              <div style={{
                position: 'absolute',
                top: '46px',
                left: '14px',
                zIndex: 25,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.72)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '16px',
                border: '1px solid rgba(250, 204, 21, 0.35)',
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: '900',
                  color: '#FFFFFF',
                }}>
                  {activeWorkspace?.name?.charAt(0) || 'H'}
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#F8FAFC' }}>
                  {activeWorkspace?.name || 'HedgeX Capital'}
                </span>
                <Check size={12} color="#FACC15" style={{ strokeWidth: 3 }} />
                <span style={{
                  fontSize: '0.52rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  color: '#34D399',
                  fontWeight: '800',
                }}>
                  LIVE ARB
                </span>
              </div>

              {/* Photorealistic 8K Cinematic Backdrop or User Uploaded Video */}
              {selectedPost.mediaUrl?.match(/\.(mp4|mov|webm)$/i) ? (
                <video
                  ref={reelVideoRef}
                  src={selectedPost.mediaUrl}
                  loop
                  muted
                  playsInline
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 2,
                    filter: 'brightness(0.96) contrast(1.05)',
                  }}
                />
              ) : (
                <img
                  src={
                    selectedPost.mediaUrl?.startsWith('/media/') || selectedPost.mediaUrl?.startsWith('/uploads/')
                      ? selectedPost.mediaUrl
                      : ((activeWorkspace?.industry || '').toLowerCase().includes('crypto') || (activeWorkspace?.name || '').toLowerCase().includes('hedge')
                          ? '/media/hedgex_reel.jpg'
                          : '/media/vyuhox_reel.jpg')
                  }
                  alt="Cinematic B-Roll Backdrop"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1,
                    animation: 'kenBurnsSlow 20s ease-in-out infinite alternate',
                    filter: 'brightness(0.92) contrast(1.1)',
                  }}
                />
              )}

              {/* 60FPS Interactive Motion Canvas (Candlesticks, Depth Waves, Particles, Spectrum) */}
              <canvas
                ref={reelCanvasRef}
                width={340}
                height={604}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              />

              {/* Gradient Vignette Overlays for Maximum Subtitle Legibility */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.15) 25%, rgba(2,6,23,0.25) 60%, rgba(2,6,23,0.96) 100%)',
                zIndex: 3,
                pointerEvents: 'none',
              }} />

              {/* CENTER: High-Impact Word-By-Word Kinetic Subtitle Overlay */}
              <div style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                textAlign: 'center',
                zIndex: 15,
                pointerEvents: 'none',
              }}>
                {activeKaraoke ? (
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    fontFamily: 'Montserrat, Inter, sans-serif',
                    textTransform: 'uppercase',
                    lineHeight: '1.4',
                    textShadow: '0 4px 20px rgba(0,0,0,1), 0 0 30px rgba(6,182,212,0.8)',
                    letterSpacing: '-0.01em',
                  }}>
                    {activeKaraoke.chunkText.split(' ').map((word, idx) => {
                      const isCurrent = activeKaraoke.activeWord && word.toLowerCase().includes(activeKaraoke.activeWord.toLowerCase());
                      return (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-block',
                            margin: '0 3px',
                            color: isCurrent ? '#FACC15' : '#FFFFFF',
                            background: isCurrent ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.4)',
                            padding: isCurrent ? '3px 8px' : '2px 4px',
                            borderRadius: '6px',
                            border: isCurrent ? '1.5px solid #FACC15' : '1px solid rgba(255, 255, 255, 0.1)',
                            transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: isCurrent ? '0 0 18px rgba(250, 204, 21, 0.7)' : 'none',
                            transition: 'all 0.1s ease',
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: '900',
                    color: '#FACC15',
                    textTransform: 'uppercase',
                    background: 'rgba(0, 0, 0, 0.75)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(250, 204, 21, 0.4)',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
                  }}>
                    {selectedPost.scriptHook || selectedPost.title}
                  </div>
                )}
              </div>

              {/* Right Side Social Actions Column */}
              <div style={{
                position: 'absolute',
                right: '12px',
                bottom: '100px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                zIndex: 10,
                alignItems: 'center',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={18} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#F8FAFC', fontWeight: '700' }}>14.2k</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={18} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#F8FAFC', fontWeight: '700' }}>382</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Share2 size={18} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#F8FAFC', fontWeight: '700' }}>1.4k</span>
                </div>
              </div>

              {/* Conversion Call-To-Action Pill */}
              <div style={{
                position: 'absolute',
                bottom: '82px',
                left: '14px',
                right: '14px',
                zIndex: 14,
                textAlign: 'center',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
                  border: '1px solid rgba(6, 182, 212, 0.6)',
                  backdropFilter: 'blur(10px)',
                  padding: '7px 12px',
                  borderRadius: '12px',
                  fontSize: '0.66rem',
                  fontWeight: '800',
                  color: '#F8FAFC',
                  letterSpacing: '0.02em',
                  animation: 'ctaGlow 2.5s infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}>
                  <Sparkles size={12} color="#FACC15" />
                  <span>COMMENT "ALPHA" FOR LP DOSSIER</span>
                </div>
              </div>

              {/* Bottom Caption & Audio Pill */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '16px',
                right: '60px',
                zIndex: 10,
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '3px' }}>
                  @{activeWorkspace?.slug || 'hedgex_capital'}
                </div>
                <div style={{
                  fontSize: '0.68rem',
                  color: '#CBD5E1',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {selectedPost.caption || selectedPost.scriptHook}
                </div>
              </div>

              {/* Bottom Scrubber Progress Bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                zIndex: 25,
              }}>
                <div style={{
                  width: `${(reelCurrentTime / (reelDuration || 30)) * 100}%`,
                  height: '100%',
                  background: '#FACC15',
                }} />
              </div>
            </div>

            {/* Right: Reel Editor, Script Breakdown & Controls */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Playback Controls Card */}
              <div style={{
                padding: '16px 20px',
                background: 'rgba(11, 17, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <button
                  onClick={togglePlayReel}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: isPlayingReel ? '#10B981' : '#EC4899',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isPlayingReel ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 0 20px rgba(236, 72, 153, 0.5)',
                    flexShrink: 0,
                  }}
                >
                  {isPlayingReel ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94A3B8' }}>
                    <span style={{ fontWeight: '700', color: '#F8FAFC' }}>
                      {isPlayingReel ? 'Playing Audio & Kinetic Captions...' : 'Interactive Reel Simulator'}
                    </span>
                    <span style={{ fontFamily: 'monospace' }}>
                      {formatSeconds(reelCurrentTime)} / {formatSeconds(reelDuration || 30)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={reelDuration || 30}
                    step="0.1"
                    value={reelCurrentTime}
                    onChange={handleReelSeek}
                    style={{
                      width: '100%',
                      accentColor: '#EC4899',
                      cursor: 'pointer',
                      height: '5px',
                    }}
                  />
                </div>

                <button
                  onClick={() => handlePublishNow(selectedPost._id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                    border: 'none',
                    color: '#040710',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  <Send size={14} />
                  Publish Reel Live
                </button>

                <button
                  onClick={() => handleBoostToAds(selectedPost._id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1877F2 0%, #06B6D4 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 16px rgba(24, 119, 242, 0.4)',
                    flexShrink: 0,
                  }}
                  title="Boost this reel directly to Facebook & Instagram Ad campaigns"
                >
                  <Megaphone size={14} />
                  Boost to Meta Ads
                </button>
              </div>

              {/* Persona, Voice & Localization Indicator */}
              <div style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.74rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic size={14} color="#06B6D4" />
                  <span style={{ color: '#94A3B8' }}>Studio Voice Talent:</span>
                  <strong style={{ color: '#38BDF8', textTransform: 'capitalize' }}>
                    {selectedPost?.metadata?.voiceId || 'Maya (US High-Conversion)'}
                  </strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#94A3B8' }}>
                    Tone: <strong style={{ color: '#FACC15', textTransform: 'capitalize' }}>
                      {selectedPost?.metadata?.tone ? selectedPost.metadata.tone.replace(/_/g, ' ') : 'Aggressive Challenger'}
                    </strong>
                  </span>
                  <span style={{ color: '#94A3B8' }}>
                    Lang: <strong style={{ color: '#10B981' }}>{selectedPost?.metadata?.language || 'en-US'}</strong>
                  </span>
                </div>
              </div>

              {/* 4-Phase Viral Script Breakdown */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: '800', color: '#F8FAFC' }}>
                  4-Phase Viral Script Architecture
                </h3>

                {/* 1. Hook */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(236, 72, 153, 0.1)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#F472B6', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Phase 1: Pattern Interrupt Hook (0-3s)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#F8FAFC', fontWeight: '600', lineHeight: '1.4' }}>
                    {selectedPost.scriptHook || 'Stop manually checking order books.'}
                  </div>
                </div>

                {/* 2. Body */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Phase 2: Agitation &amp; Autonomous Mechanism (3-25s)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.45' }}>
                    {selectedPost.scriptBody || 'High-frequency arbitrage is about execution velocity...'}
                  </div>
                </div>

                {/* 3. CTA */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Phase 3: Conversion Call-To-Action (25-35s)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#F8FAFC', fontWeight: '600' }}>
                    {selectedPost.scriptCta || "Drop the word 'ALPHA' below and I'll send you our institutional framework."}
                  </div>
                </div>

                {/* Caption & Hashtags Editor */}
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Generated Caption &amp; Hashtags
                  </label>
                  <textarea
                    rows={4}
                    defaultValue={selectedPost.caption}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#F8FAFC',
                      fontSize: '0.78rem',
                      fontFamily: 'inherit',
                      resize: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CAROUSELS & GRAPHIC STUDIO */}
        {/* ========================================================================= */}
        {activeTab === 'carousels' && selectedPost && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCarouselViewMode('RENDER')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: carouselViewMode === 'RENDER' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${carouselViewMode === 'RENDER' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: carouselViewMode === 'RENDER' ? '#34D399' : '#94A3B8',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} />
                  8K Photorealistic 3D Render
                </button>
                <button
                  onClick={() => setCarouselViewMode('SLIDES')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: carouselViewMode === 'SLIDES' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${carouselViewMode === 'SLIDES' ? '#06B6D4' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: carouselViewMode === 'SLIDES' ? '#38BDF8' : '#94A3B8',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Layers size={14} />
                  Institutional Slide Deck ({selectedPost.carouselSlides?.length || 5} Slides)
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800' }}>
                  🛡️ Spearbit Audited • Fireblocks Custody
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Carousel Slide Card or 8K Photorealistic Graphic */}
              {carouselViewMode === 'RENDER' ? (
                <div style={{
                  width: '420px',
                  height: '520px',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.25)',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  flexShrink: 0,
                }}>
                  <img
                    src={selectedPost.mediaUrl?.startsWith('/media/') ? selectedPost.mediaUrl : '/media/hedgex_carousel.jpg'}
                    alt="HedgeX 3D Liquidity Asset"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'contrast(1.08) brightness(0.95)',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.08) 40%, rgba(2,6,23,0.88) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px',
                    pointerEvents: 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#F8FAFC' }}>
                          {activeWorkspace?.name?.toUpperCase() || 'HEDGEX'} • BRAND ASSET
                        </span>
                      </div>
                      <span style={{ fontSize: '0.64rem', color: '#34D399', fontWeight: '800', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        8K OCTANE RENDER
                      </span>
                    </div>

                    <div>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.3)',
                        border: '1px solid #10B981',
                        fontSize: '0.8rem',
                        fontWeight: '900',
                        color: '#A7F3D0',
                        marginBottom: '8px',
                      }}>
                        +3.82 ANNUALIZED SHARPE RATIO
                      </div>
                      <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '900', color: '#F8FAFC', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                        {selectedPost.title || 'Sub-600ms Cross-Exchange Arbitrage Execution'}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                        Automated liquidity routing across Binance, OKX, and Bybit with institutional multi-party custody.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  width: '420px',
                  height: '520px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #064E3B 0%, #022C22 50%, #020617 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)',
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  {/* Header Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10B981', letterSpacing: '0.04em' }}>
                      {activeWorkspace?.name?.toUpperCase() || 'VYUHOX'} • QUANTITATIVE
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: '#A7F3D0',
                    }}>
                      Slide {(currentSlideIndex % (selectedPost.carouselSlides?.length || 5)) + 1} of {selectedPost.carouselSlides?.length || 5}
                    </span>
                  </div>

                  {/* Main Headline & Stat Callout */}
                  <div>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: '#34D399',
                      marginBottom: '16px',
                    }}>
                      {selectedPost.carouselSlides?.[currentSlideIndex]?.statCallout || '+382% Pipeline Velocity'}
                    </div>

                    <h2 style={{
                      margin: '0 0 14px',
                      fontSize: '1.45rem',
                      fontWeight: '800',
                      lineHeight: '1.25',
                      color: '#F8FAFC',
                    }}>
                      {selectedPost.carouselSlides?.[currentSlideIndex]?.headline || selectedPost.title}
                    </h2>

                    <p style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      color: '#CBD5E1',
                      lineHeight: '1.5',
                    }}>
                      {selectedPost.carouselSlides?.[currentSlideIndex]?.subtext || selectedPost.caption}
                    </p>
                  </div>

                  {/* Footer CTA & Swipe Prompt */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Swipe to see the breakdown 👉</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentSlideIndex((prev) => Math.min((selectedPost.carouselSlides?.length || 5) - 1, prev + 1))}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* Slide Thumbnails & Publishing Drawer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'rgba(11, 17, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.94rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Slide Deck Navigator ({selectedPost.carouselSlides?.length || 5} Slides)
                </h3>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {(selectedPost.carouselSlides || [1, 2, 3, 4, 5]).map((slide, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      style={{
                        width: '110px',
                        height: '140px',
                        borderRadius: '10px',
                        background: currentSlideIndex === idx ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: `2px solid ${currentSlideIndex === idx ? '#10B981' : 'rgba(255, 255, 255, 0.08)'}`,
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10B981' }}>Slide {idx + 1}</span>
                      <span style={{ fontSize: '0.68rem', color: '#F8FAFC', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {slide.headline || `Slide #${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish / Download Strip */}
              <div style={{
                padding: '16px 20px',
                background: 'rgba(11, 17, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontWeight: '700', color: '#F8FAFC', display: 'block', fontSize: '0.86rem' }}>
                    Publish to LinkedIn &amp; Instagram
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    Formats automatically as a swipeable multi-page PDF/Carousel asset.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => showToast('📥 Downloading high-res carousel PDF...')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#F8FAFC',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    onClick={() => handlePublishNow(selectedPost._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#10B981',
                      border: 'none',
                      color: '#040710',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <Send size={14} /> Publish Carousel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BRAND VOICE & SOCIAL ACCOUNTS CONFIG */}
        {/* ========================================================================= */}
        {activeTab === 'config' && config && (
          <div style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Connected Accounts Matrix */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.94rem', fontWeight: '800', color: '#F8FAFC' }}>
                Connected Social Media Channels
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {Object.entries(config.connectedAccounts || {}).map(([key, acc]) => (
                  <div
                    key={key}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#F8FAFC', textTransform: 'capitalize' }}>
                        {key}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        {acc.username || acc.handle || acc.channelName || '@vyuhox'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}>
                      CONNECTED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Voice Persona Settings */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: '800', color: '#F8FAFC' }}>
                Autonomous Brand Voice Persona
              </h3>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Brand Tone &amp; Cadence
                </label>
                <input
                  type="text"
                  defaultValue={config.brandVoice?.tone || 'Authoritative, Data-Driven & Visionary'}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#F8FAFC',
                    fontSize: '0.8rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Default SEO Hashtags
                </label>
                <input
                  type="text"
                  defaultValue={config.defaultHashtags?.join(' ') || '#CryptoAlpha #QuantTrading #GTMStrategy'}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#38BDF8',
                    fontSize: '0.8rem',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: 1-CLICK 30-DAY CONTENT MATRIX */}
      {/* ========================================================================= */}
      {is30DayModalOpen && (
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
            width: '540px',
            maxWidth: '92vw',
            background: '#0B1120',
            border: '1px solid rgba(236, 72, 153, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#EC4899" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                  1-Click 30-Day Content Matrix
                </h3>
              </div>
              <button
                onClick={() => setIs30DayModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.45' }}>
              Our AI Script Agent will generate 30 high-retention video reels, 5-slide carousels, and quote cards mapped systematically across your publishing calendar.
            </p>

            <div style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.08)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.76rem',
              color: '#F8FAFC',
            }}>
              <div>• 14 Vertical 9:16 Video Reels (Instagram &amp; TikTok)</div>
              <div>• 8 Educational 5-Slide Carousels (LinkedIn)</div>
              <div>• 8 Authoritative Stat &amp; Quote Graphics (X / Twitter)</div>
              <div>• Timed kinetic subtitles &amp; audio voiceover sync</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => setIs30DayModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#CBD5E1',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate30Days}
                disabled={isGenerating}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 16px rgba(236, 72, 153, 0.4)',
                }}
              >
                {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isGenerating ? 'Rendering 30 Days...' : 'Generate 30 Days Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE SINGLE REEL / GRAPHIC */}
      {/* ========================================================================= */}
      {isCreatingReelModalOpen && (
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
            width: '520px',
            maxWidth: '92vw',
            background: '#0B1120',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} color="#06B6D4" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Create Viral Video Reel
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingReelModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Reel Topic or Custom Hook Prompt (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Why high-frequency funds bleed alpha without sub-second routing"
                value={newReelTopic}
                onChange={(e) => setNewReelTopic(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#F8FAFC',
                  fontSize: '0.8rem',
                }}
              />
              {/* 1-Click Tailored Business Topic Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {[
                  '⚡ Cross-Exchange Latency Arbitrage (OKX / Bybit)',
                  '📈 Q2 3.82 Sharpe Ratio Performance Audit',
                  '🔐 Institutional Fireblocks MPC Multi-Sig Security',
                  '🤖 Maya Sub-Second Inbound Lead Voice Agent',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setNewReelTopic(chip)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      color: '#38BDF8',
                      fontSize: '0.66rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Target Platform
                </label>
                <select
                  value={newReelPlatform}
                  onChange={(e) => setNewReelPlatform(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#F8FAFC',
                    fontSize: '0.78rem',
                  }}
                >
                  <option value="INSTAGRAM">Instagram Reels</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="YOUTUBE_SHORTS">YouTube Shorts</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  B-Roll Visual Style
                </label>
                <select
                  value={newReelTheme}
                  onChange={(e) => setNewReelTheme(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#F8FAFC',
                    fontSize: '0.78rem',
                  }}
                >
                  <option value="cyber_crypto_matrix">Cybernetic Matrix HUD</option>
                  <option value="neon_data_stream">High-Velocity Neon Tunnel</option>
                  <option value="abstract_ai_cube">Abstract Neural Architecture</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setIsCreatingReelModalOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#CBD5E1',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReel}
                disabled={isGenerating}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#06B6D4',
                  border: 'none',
                  color: '#040710',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                {isGenerating ? 'Rendering...' : 'Render Reel Preview'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BUSINESS OWNER MEDIA UPLOAD & AUTOMATIC PUBLISHING */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 7, 16, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            width: '680px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: '#0B1120',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '18px',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.2)',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <UploadCloud size={18} color="#10B981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Upload Media &amp; Automated Publishing
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    Upload your custom image, graphic, or video reel and publish automatically across your social channels.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  handleClearUpload();
                }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop File Zone */}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                1. Select or Drop Your Media File (Image / Video Reel)
              </label>

              {!uploadFile ? (
                <label style={{
                  border: '2px dashed rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.03)',
                  padding: '28px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}>
                    <Upload size={20} color="#34D399" />
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#F8FAFC', marginBottom: '4px' }}>
                    Click to browse or drag &amp; drop your media file
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Supports MP4, MOV, WebM (up to 100MB) for Reels • JPG, PNG, WebP for Graphics &amp; Carousels
                  </div>
                </label>
              ) : (
                <div style={{
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    {uploadIsVideo ? (
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#020617', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        <video src={uploadPreviewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', borderRadius: '3px', padding: '1px 3px', fontSize: '0.55rem', color: '#34D399' }}>VIDEO</div>
                      </div>
                    ) : (
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#020617', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={uploadPreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#F8FAFC', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {uploadFile.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadIsVideo ? 'Vertical Video Reel' : 'Static Image Graphic'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClearUpload}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              )}
            </div>

            {/* Post Title & Caption */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Post Title / Video Hook
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sub-600ms Arbitrage Execution Demo"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#F8FAFC',
                    fontSize: '0.78rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Target Platform &amp; Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select
                    value={uploadPlatform}
                    onChange={(e) => setUploadPlatform(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0F172A',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.76rem',
                    }}
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook (Reels &amp; Feed)</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="YOUTUBE_SHORTS">YouTube Shorts</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="TWITTER">X / Twitter</option>
                  </select>

                  <select
                    value={uploadPostType}
                    onChange={(e) => setUploadPostType(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0F172A',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.76rem',
                    }}
                  >
                    <option value="REEL">Video Reel (9:16)</option>
                    <option value="STATIC_GRAPHIC">Graphic (1:1 / 4:5)</option>
                    <option value="CAROUSEL">Multi-Slide Carousel</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Caption & Hashtags */}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Caption &amp; Script Narration Text
              </label>
              <textarea
                rows={3}
                placeholder="Write your post caption. If this is a reel, this text will also power the kinetic karaoke subtitles and AI voiceover narration."
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#F8FAFC',
                  fontSize: '0.78rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Hashtags
              </label>
              <input
                type="text"
                placeholder="#Crypto #FinTech #AlgorithmicTrading #QuantAlpha"
                value={uploadHashtags}
                onChange={(e) => setUploadHashtags(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#F8FAFC',
                  fontSize: '0.78rem',
                }}
              />
            </div>

            {/* Voiceover & Kinetic Subtitles Option for Reels */}
            {uploadPostType === 'REEL' && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={uploadGenerateVoiceover}
                  onChange={(e) => setUploadGenerateVoiceover(e.target.checked)}
                />
                <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: '600' }}>
                  🎙️ Generate Studio Single-Voice Narration &amp; Kinetic Word-by-Word Subtitles
                </span>
              </label>
            )}

            {/* Automated Publishing Trigger Selector */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px',
            }}>
              <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Automated Publishing Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  onClick={() => setUploadPublishMode('AUTOMATIC_NOW')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${uploadPublishMode === 'AUTOMATIC_NOW' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: uploadPublishMode === 'AUTOMATIC_NOW' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#F8FAFC' }}>
                      Publish Automatically Now
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    Instantly dispatches live to your connected platform and records real-time analytics.
                  </span>
                </div>

                <div
                  onClick={() => setUploadPublishMode('SCHEDULED_AUTOPILOT')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${uploadPublishMode === 'SCHEDULED_AUTOPILOT' ? '#06B6D4' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: uploadPublishMode === 'SCHEDULED_AUTOPILOT' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#F8FAFC' }}>
                      Autopilot Smart Schedule
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    Queues post to automatically publish at peak engagement times.
                  </span>
                </div>
              </div>

              {uploadPublishMode === 'SCHEDULED_AUTOPILOT' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Target Publishing Date &amp; Time (Leave empty for optimal AI peak hour)
                  </label>
                  <input
                    type="datetime-local"
                    value={uploadScheduledDate}
                    onChange={(e) => setUploadScheduledDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0F172A',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#F8FAFC',
                      fontSize: '0.78rem',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  handleClearUpload();
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#CBD5E1',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomPost}
                disabled={isUploading}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  background: uploadPublishMode === 'AUTOMATIC_NOW'
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: uploadPublishMode === 'AUTOMATIC_NOW'
                    ? '0 0 18px rgba(16, 185, 129, 0.4)'
                    : '0 0 18px rgba(6, 182, 212, 0.4)',
                }}
              >
                {isUploading ? <RefreshCw size={14} className="animate-spin" /> : (uploadPublishMode === 'AUTOMATIC_NOW' ? <Send size={14} /> : <CalendarIcon size={14} />)}
                {isUploading ? 'Processing Asset...' : (uploadPublishMode === 'AUTOMATIC_NOW' ? 'Publish Automatically Now' : 'Schedule on Autopilot')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: AI PROMPT-TO-POST STUDIO (BUSINESS INTELLIGENCE & MULTI-VOICE) */}
      {/* ========================================================================= */}
      {isPromptModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 7, 16, 0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            width: '740px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: '#0B1120',
            border: '1px solid rgba(236, 72, 153, 0.4)',
            borderRadius: '20px',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(236, 72, 153, 0.25)',
            padding: '26px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(236, 72, 153, 0.4)',
                }}>
                  <Sparkles size={20} color="#FFFFFF" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC' }}>
                    AI Prompt-to-Post Studio
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                    Turn any raw idea or prompt into unique, high-retention video reels, carousels, or graphics customized with your business model.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPromptModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            {/* Business Intelligence Context Bar */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.06)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🏢 Active Business Context Engine
                </div>
                <div style={{ fontSize: '0.78rem', color: '#F8FAFC', fontWeight: '600', marginTop: '2px' }}>
                  {activeWorkspace?.name || 'HedgeX Algorithmic Capital'} • {activeWorkspace?.industry || 'Crypto / Quant Finance'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                  ICP: Institutional Allocators, Fund Managers • Value Prop: Sub-millisecond execution &amp; zero slippage
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#10B981', cursor: 'pointer', fontWeight: '700' }}>
                <input
                  type="checkbox"
                  checked={promptInjectBusinessData}
                  onChange={(e) => setPromptInjectBusinessData(e.target.checked)}
                  style={{ accentColor: '#10B981' }}
                />
                Auto-Inject Model Strategy
              </label>
            </div>

            {/* Prompt Input */}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                1. Your Post Topic, Angle, or Custom Prompt
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Break down how our sub-millisecond execution crushes legacy funds during high-volatility spikes, or announce our new verified allocator audit milestone..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#F8FAFC',
                  fontSize: '0.84rem',
                  lineHeight: '1.4',
                  boxSizing: 'border-box',
                }}
              />

              {/* Quick Idea Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', alignSelf: 'center', marginRight: '4px' }}>Ideas:</span>
                {[
                  'Sub-second execution vs legacy funds',
                  'Why AI SDRs dial inbound leads in 42s',
                  'Institutional capital allocation milestone',
                  '3-step order flow slippage elimination',
                ].map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setPromptText(idea)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#CBD5E1',
                      fontSize: '0.68rem',
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Format & Platform */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Post Format
                </label>
                <select
                  value={promptPostType}
                  onChange={(e) => setPromptPostType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    color: '#F8FAFC',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="REEL">9:16 Video Reel (TikTok / Shorts / Reels)</option>
                  <option value="CAROUSEL">5-Slide Educational Carousel</option>
                  <option value="STATIC_GRAPHIC">High-Impact Stat Graphic</option>
                  <option value="TEXT_THREAD">Thought Leadership Thread</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Target Distribution Channel
                </label>
                <select
                  value={promptPlatform}
                  onChange={(e) => setPromptPlatform(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    color: '#F8FAFC',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="INSTAGRAM">Instagram (Reels &amp; Grid)</option>
                  <option value="FACEBOOK">Facebook (Page Feed &amp; Reels)</option>
                  <option value="TIKTOK">TikTok (For You Feed)</option>
                  <option value="YOUTUBE_SHORTS">YouTube Shorts</option>
                  <option value="LINKEDIN">LinkedIn Corporate</option>
                  <option value="TWITTER">X / Twitter</option>
                </select>
              </div>
            </div>

            {/* Voice Talent, Language, and Tone Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  🎙️ Studio Voice Talent
                </label>
                <select
                  value={promptVoiceId}
                  onChange={(e) => setPromptVoiceId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#38BDF8',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                  }}
                >
                  <option value="maya">Maya (US Female • Energetic)</option>
                  <option value="marcus">Marcus (US Male • Deep Baritone)</option>
                  <option value="elena">Elena (UK Female • Executive)</option>
                  <option value="david">David (UK Male • Founder)</option>
                  <option value="priya">Priya (Indian Tech • Fast/Crisp)</option>
                  <option value="mateo">Mateo (LatAm • Dynamic Energy)</option>
                  <option value="kenji">Kenji (Global • Calm Quant)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  🌍 Local Language
                </label>
                <select
                  value={promptLanguage}
                  onChange={(e) => setPromptLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#10B981',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                  }}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish (Español)</option>
                  <option value="fr-FR">French (Français)</option>
                  <option value="de-DE">German (Deutsch)</option>
                  <option value="hi-IN">Hindi (हिन्दी)</option>
                  <option value="pt-BR">Portuguese (Português)</option>
                  <option value="ja-JP">Japanese (日本語)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  🔥 Tone of Voice
                </label>
                <select
                  value={promptTone}
                  onChange={(e) => setPromptTone(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#FACC15',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                  }}
                >
                  <option value="aggressive_challenger">Aggressive Challenger</option>
                  <option value="institutional_authority">Institutional Authority</option>
                  <option value="visionary_founder">Visionary Founder</option>
                  <option value="educational_breakdown">Educational Breakdown</option>
                  <option value="urgent_fomo">Urgent FOMO</option>
                </select>
              </div>
            </div>

            {/* Publishing Setting */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Publishing Setting
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  onClick={() => setPromptPublishMode('AUTOMATIC_NOW')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${promptPublishMode === 'AUTOMATIC_NOW' ? '#EC4899' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: promptPublishMode === 'AUTOMATIC_NOW' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#F8FAFC' }}>
                      Publish Immediately Now
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    Dispatches live to platform feeds and immediately creates real-time metrics.
                  </span>
                </div>

                <div
                  onClick={() => setPromptPublishMode('SCHEDULED_AUTOPILOT')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${promptPublishMode === 'SCHEDULED_AUTOPILOT' ? '#06B6D4' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: promptPublishMode === 'SCHEDULED_AUTOPILOT' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#F8FAFC' }}>
                      Autopilot Smart Schedule
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    Schedules post for peak audience time on the content calendar.
                  </span>
                </div>
              </div>

              {promptPublishMode === 'SCHEDULED_AUTOPILOT' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Custom Publish Date &amp; Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={promptScheduledDate}
                    onChange={(e) => setPromptScheduledDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0F172A',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#F8FAFC',
                      fontSize: '0.78rem',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setIsPromptModalOpen(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#CBD5E1',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateFromPrompt}
                disabled={isPromptGenerating}
                style={{
                  padding: '9px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: isPromptGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.45)',
                }}
              >
                {isPromptGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isPromptGenerating ? 'Synthesizing with Business AI...' : (promptPublishMode === 'AUTOMATIC_NOW' ? '⚡ Generate & Publish Live' : '✨ Generate & Schedule Post')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
