import express from 'express';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { seedDatabase } from './src/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './src/routes/authRoutes.js';
import workspaceRoutes from './src/routes/workspaceRoutes.js';
import leadRoutes from './src/routes/leadRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';
import strategyRoutes from './src/routes/strategyRoutes.js';
import scraperRoutes from './src/routes/scraperRoutes.js';
import { messagingRoutes } from './src/routes/messagingRoutes.js';
import { webhookRoutes } from './src/routes/webhookRoutes.js';
import { voiceRoutes } from './src/routes/voiceRoutes.js';
import { socialRoutes } from './src/routes/socialRoutes.js';
import { adsRoutes } from './src/routes/adsRoutes.js';
import calendarRoutes from './src/routes/calendarRoutes.js';
import complianceRoutes from './src/routes/complianceRoutes.js';
import aiCompanyRoutes from './src/routes/aiCompanyRoutes.js';
import billingRoutes from './src/routes/billingRoutes.js';
import visualRoutes from './src/routes/visualRoutes.js';
import integrationRoutes from './src/routes/integrationRoutes.js';
import briefingRoutes from './src/routes/briefingRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';
import microSiteRoutes from './src/routes/microSiteRoutes.js';
import seoToolsRoutes from './src/routes/seoToolsRoutes.js';
import sanjayaRoutes from './src/routes/sanjayaRoutes.js';
import supportRoutes from './src/routes/supportRoutes.js';
import evolutionRoutes from './src/routes/evolutionRoutes.js';
import assetRoutes from './src/routes/assetRoutes.js';
import { AssetDeliveryService } from './src/services/media/AssetDeliveryService.js';
import { EvolutionOrchestrator } from './src/services/evolution/EvolutionOrchestrator.js';
import { agentEventBus } from './src/services/agents/AgentEventBus.js';
import { initSocialPublisher } from './src/cron/socialPublisher.js';
import { initAdOptimizerCron } from './src/cron/adOptimizer.js';
import { initCalendarReminderCron } from './src/cron/calendarReminderCron.js';

dotenv.config();

// Global crash guards (prevents network ECONNRESET, HTTP2 stream drops, or socket hiccups from crashing server)
process.on('uncaughtException', (err) => {
  console.error('[CRASH GUARD] Intercepted uncaughtException:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[CRASH GUARD] Intercepted unhandledRejection:', reason?.message || reason);
});

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.set('io', io);
agentEventBus.setSocketIO(io);
EvolutionOrchestrator.setSocketIO(io);

// Socket connection and room assignment
io.on('connection', (socket) => {
  // Join specific workspace room for multi-tenant isolation
  socket.on('joinWorkspace', (workspaceId) => {
    if (workspaceId) {
      socket.join(workspaceId.toString());
    }
  });

  socket.on('leaveWorkspace', (workspaceId) => {
    if (workspaceId) {
      socket.leave(workspaceId.toString());
    }
  });

  socket.on('disconnect', () => { });
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static client public files (uploads, media, audio)
// Initialize multi-tenant storage directories and local published delivery ONLY when local storage is active
if (!AssetDeliveryService.storageAdapter.isCloudStorage) {
  AssetDeliveryService.initStorageDirs();
  // Serve publicly published social/ad media (intentionally approved for external publishing)
  app.use('/published', express.static(AssetDeliveryService.PUBLISHED_STORAGE_ROOT));
}

// Guard /uploads: Block direct static access to private workspace folders
app.use('/uploads', (req, res, next) => {
  const cleanPath = req.path.replace(/^\/+/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length >= 2) {
    return res.status(403).json({
      success: false,
      message: 'Direct static access to workspace uploads is prohibited. Use authenticated /api/assets/:id.',
    });
  }
  next();
});

// Serve static client public files (uploads, media, audio)
app.use(express.static(path.resolve(process.cwd(), 'client', 'public')));

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      let sanitizedUrl = req.originalUrl;
      // Redact path-based signed media tokens (including trailing query strings and URL encoding)
      sanitizedUrl = sanitizedUrl.replace(/(\/api\/assets\/view\/)[^?#\s]+/i, '$1[REDACTED]');
      // Redact sensitive query parameters
      sanitizedUrl = sanitizedUrl.replace(/([?&](token|secret|key|sig|signature|auth|password)=)[^&]*/gi, '$1[REDACTED]');
      console.log(`[HTTP] ${req.method} ${sanitizedUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'VYUHOX Autonomous GTM SaaS',
    version: '1.0.0',
    phase: 1,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Core API Gateway Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/ai-company', aiCompanyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/visual', visualRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/briefings', briefingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/microsite', microSiteRoutes);
app.use('/api/seo-tools', seoToolsRoutes);
app.use('/api/sanjaya', sanjayaRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/evolution', evolutionRoutes);

// Serve static client production build & SPA fallback (Render / Production)
const distPath = path.resolve(__dirname, 'client', 'dist');
console.log(`[Static] Checking for client build at: ${distPath} (exists: ${fs.existsSync(distPath)})`);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io') || req.originalUrl.startsWith('/published') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
} else {
  console.warn('[Static] Warning: client/dist not found. Ensure "npm run build" is run during deployment.');
}

// 404 handler for unmatched media routes (prevent HTML SPA fallback on media files)
app.use(['/published', '/uploads'], (req, res) => {
  res.status(404).json({ success: false, message: 'Media asset not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
    // Auto-seed initial demo data if database is empty
    await seedDatabase();

    // Validate media delivery & signing configuration before opening ports
    AssetDeliveryService.validateConfiguration();

    // Reconcile interrupted or orphaned media revocation transactions on startup
    try {
      const reconSummary = await AssetDeliveryService.reconcileQuarantinedAssets();
      if (reconSummary.reconciledCount > 0 || reconSummary.ambiguousPreservedCount > 0) {
        console.log(`[STARTUP] Reconciled media revocation state:`, reconSummary);
      }
    } catch (reconErr) {
      console.error('[STARTUP WARNING] Asset delivery reconciliation failed:', reconErr.message);
    }

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 VYUHOX CORE API GATEWAY ONLINE`);
      console.log(`📍 Port: http://localhost:${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
      initSocialPublisher(app);
      initAdOptimizerCron(io);
      initCalendarReminderCron(io);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
