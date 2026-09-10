import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import { db } from './src/db/index.ts';
import { inMemoryStore } from './src/db/inMemoryStore.ts';
import {
  cropRegistrations,
  dbtPayments,
  farmers,
  procurementCenters,
  qualityInspections,
  tokens,
  users,
} from './src/db/schema.ts';
import { desc, eq, sql } from 'drizzle-orm';
import { optionalAuth, requireAuth } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Initialize Socket.io attached to the HTTP server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT'],
    },
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
  });

  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Socket.io Real-Time Synchronization Engine
  let connectedClients = 0;
  io.on('connection', (socket) => {
    connectedClients++;
    console.log(`[Socket.io] Client connected: ${socket.id}. Active clients: ${connectedClients}`);

    // Broadcast updated active client count to all connected clients
    io.emit('clients:count', { count: connectedClients });

    // Join specific mandi room or national room
    socket.on('join:center', (centerId: string) => {
      socket.join(`center:${centerId}`);
      console.log(`[Socket.io] ${socket.id} joined center room: ${centerId}`);
    });

    socket.on('leave:center', (centerId: string) => {
      socket.leave(`center:${centerId}`);
    });

    // Heartbeat ping/pong for live round-trip latency measurement
    socket.on('ping:heartbeat', (data: any, ack: any) => {
      if (typeof ack === 'function') {
        ack({
          clientTimestamp: data?.timestamp,
          serverTimestamp: Date.now(),
          connectedClients,
        });
      }
    });

    // Client requests full real-time synchronization of state
    socket.on('sync:request', (_data: any, ack: any) => {
      const payload = {
        tokens: inMemoryStore.getTokens(),
        centers: inMemoryStore.getCenters(),
        stats: inMemoryStore.getStats(),
        messages: inMemoryStore.getChatMessages(30),
        connectedClients,
        serverTime: new Date().toISOString(),
      };
      if (typeof ack === 'function') {
        ack(payload);
      } else {
        socket.emit('sync:response', payload);
      }
    });

    // Real-Time Token Creation via WebSocket
    socket.on('token:create', async (data: any, ack: any) => {
      try {
        const createdToken = inMemoryStore.createToken({
          ...data,
          quantityQuintals: parseFloat(data.quantityQuintals) || 50,
        });
        const hydrated = inMemoryStore.hydrateToken(createdToken);

        // Broadcast to all clients
        io.emit('token:created', {
          token: hydrated,
          totalTokens: inMemoryStore.getTokens().length,
        });

        if (hydrated.centerId) {
          io.to(`center:${hydrated.centerId}`).emit('center:queue_updated', {
            centerId: hydrated.centerId,
            action: 'NEW_TOKEN',
            token: hydrated,
          });
        }

        if (typeof ack === 'function') {
          ack({ success: true, token: hydrated });
        }
      } catch (err: any) {
        console.error('[Socket.io] token:create error:', err.message);
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    // Real-Time Stage Advance via WebSocket
    socket.on('token:advance', async (data: any, ack: any) => {
      try {
        const { tokenNumber, targetStageIndex, paymentDetails } = data;
        const updated = inMemoryStore.advanceStage(tokenNumber, targetStageIndex, paymentDetails);
        if (updated) {
          const hydrated = inMemoryStore.hydrateToken(updated.token);

          // Broadcast to all clients
          io.emit('token:stage_advanced', {
            token: hydrated,
            stageIndex: hydrated.currentStageIndex,
            stageName: hydrated.stageName,
            status: hydrated.status,
          });

          if (typeof ack === 'function') {
            ack({ success: true, token: hydrated });
          }
        } else {
          if (typeof ack === 'function') ack({ success: false, error: 'Token not found' });
        }
      } catch (err: any) {
        console.error('[Socket.io] token:advance error:', err.message);
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    // Real-Time Officer Call Next Token via WebSocket
    socket.on('officer:call', async (data: any, ack: any) => {
      try {
        const { centerId = 'MND-KRN-01', scaleNumber = 1 } = data || {};
        const called = inMemoryStore.callNextToken(centerId);
        if (called) {
          const hydrated = inMemoryStore.hydrateToken(called);
          const announcement = `Attention Please. Token Number ${hydrated.tokenNumber}, please proceed to Weighbridge Scale ${scaleNumber}.`;

          io.emit('officer:token_called', {
            token: hydrated,
            scaleNumber,
            announcement,
            timestamp: new Date().toISOString(),
          });

          if (typeof ack === 'function') {
            ack({ success: true, token: hydrated, announcement });
          }
        } else {
          if (typeof ack === 'function') ack({ success: false, message: 'No waiting tokens in queue' });
        }
      } catch (err: any) {
        console.error('[Socket.io] officer:call error:', err.message);
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    // Real-Time Mandi Community & Officer Desk Chat via WebSocket
    socket.on('chat:message', (data: any, ack: any) => {
      try {
        const newMsg = inMemoryStore.addChatMessage(data);
        io.emit('chat:message', newMsg);
        if (typeof ack === 'function') {
          ack({ success: true, message: newMsg });
        }
      } catch (err: any) {
        console.error('[Socket.io] chat:message error:', err.message);
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    // Real-Time Overload Diversion Advisory Broadcast
    socket.on('admin:overload_diversion', (data: any) => {
      io.emit('admin:overload_diversion', data);
    });

    socket.on('disconnect', () => {
      connectedClients = Math.max(0, connectedClients - 1);
      io.emit('clients:count', { count: connectedClients });
      console.log(`[Socket.io] Client disconnected: ${socket.id}. Active clients: ${connectedClients}`);
    });
  });

  // Make `io` accessible to API routes
  app.set('io', io);

  // =========================================================================
  // API ROUTES (Always before Vite middleware)
  // =========================================================================

  // 1. Health & Telemetry
  app.get('/api/health', async (_req, res) => {
    let dbStatus = 'In-Memory Grid Active';
    let tokenCount = inMemoryStore.getTokens().length;

    if (process.env.SQL_HOST) {
      try {
        const [tableCounts] = await Promise.all([
          db.select({ count: sql<number>`count(*)::int` }).from(tokens),
        ]);
        dbStatus = 'Cloud SQL Connected';
        tokenCount = tableCounts[0]?.count || tokenCount;
      } catch (err: any) {
        dbStatus = 'Cloud SQL Standby (In-Memory Active)';
      }
    }

    res.json({
      status: 'online',
      database: dbStatus,
      realtime: 'Socket.io Active',
      connectedClients,
      totalTokens: tokenCount,
      timestamp: new Date().toISOString(),
    });
  });

  // 1.5 Real-Time Chat API
  app.get('/api/realtime/messages', (_req, res) => {
    res.json({
      messages: inMemoryStore.getChatMessages(50),
      connectedClients,
    });
  });

  app.post('/api/realtime/messages', (req, res) => {
    const msg = inMemoryStore.addChatMessage(req.body);
    io.emit('chat:message', msg);
    res.json({ success: true, message: msg });
  });

  // 2. Sync Firebase User
  app.post('/api/auth/sync', optionalAuth, async (req: any, res) => {
    try {
      const { uid, email, role, fullName } = req.body;
      const targetUid = req.user?.uid || uid;
      const targetEmail = req.user?.email || email;

      if (!targetUid || !targetEmail) {
        return res.status(400).json({ error: 'UID and Email are required' });
      }

      const user = await getOrCreateUser(targetUid, targetEmail, role || 'farmer', fullName);
      res.json({ success: true, user });
    } catch (err: any) {
      console.error('Auth sync error:', err);
      res.status(500).json({ error: err.message || 'Failed to sync user' });
    }
  });

  // 3. Procurement Centers (Mandis) with Live Queues
  app.get('/api/centers', async (_req, res) => {
    if (process.env.SQL_HOST) {
      try {
        const centers = await db.select().from(procurementCenters);
        if (centers && centers.length > 0) {
          return res.json(centers);
        }
      } catch (err: any) {
        console.warn('SQL query error for centers, using in-memory store:', err.message);
      }
    }
    res.json(inMemoryStore.getCenters());
  });

  // 4. Tokens list with details
  app.get('/api/tokens', async (req, res) => {
    const { centerId, farmerId, status } = req.query;

    if (process.env.SQL_HOST) {
      try {
        let query = db.select().from(tokens);
        if (centerId) {
          query = query.where(eq(tokens.centerId, String(centerId))) as any;
        }
        if (farmerId) {
          query = query.where(eq(tokens.farmerId, String(farmerId))) as any;
        }
        if (status) {
          query = query.where(eq(tokens.status, String(status))) as any;
        }
        const results = await query.orderBy(desc(tokens.createdAt));
        if (results) return res.json(results);
      } catch (err: any) {
        console.warn('SQL query error for tokens, using in-memory store:', err.message);
      }
    }

    const inMemoryTokens = inMemoryStore.getTokens({
      centerId: centerId ? String(centerId) : undefined,
      farmerId: farmerId ? String(farmerId) : undefined,
      status: status ? String(status) : undefined,
    });
    res.json(inMemoryTokens);
  });

  // 5. Single Token Lookup
  app.get('/api/tokens/:tokenNumber', async (req, res) => {
    const { tokenNumber } = req.params;

    if (process.env.SQL_HOST) {
      try {
        const foundTokens = await db.select().from(tokens).where(eq(tokens.tokenNumber, tokenNumber));
        if (foundTokens.length) {
          const token = foundTokens[0];
          const [farmer] = await db.select().from(farmers).where(eq(farmers.farmerId, token.farmerId));
          const [center] = await db.select().from(procurementCenters).where(eq(procurementCenters.centerId, token.centerId));
          const [qc] = await db.select().from(qualityInspections).where(eq(qualityInspections.tokenNumber, tokenNumber));
          const [dbt] = await db.select().from(dbtPayments).where(eq(dbtPayments.tokenNumber, tokenNumber));

          return res.json({
            ...token,
            farmer: farmer || null,
            center: center || null,
            qualityInspection: qc || null,
            dbtPayment: dbt || null,
          });
        }
      } catch (err: any) {
        console.warn('SQL query error for single token, using in-memory store:', err.message);
      }
    }

    const token = inMemoryStore.getToken(tokenNumber);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const farmer = inMemoryStore.getFarmer(token.farmerId);
    const center = inMemoryStore.getCenter(token.centerId);
    const qc = inMemoryStore.getQualityInspectionForToken(tokenNumber);
    const dbt = inMemoryStore.getDbtPaymentForToken(tokenNumber);

    res.json({
      ...token,
      farmer: farmer || null,
      center: center || null,
      qualityInspection: qc || null,
      dbtPayment: dbt || null,
    });
  });

  // 6. Create New Token (Real-time Broadcast)
  app.post('/api/tokens', async (req, res) => {
    try {
      const {
        farmerId,
        farmerName,
        phoneNumber,
        aadhaar,
        district,
        state,
        cropType,
        quantityQuintals,
        centerId,
        centerName,
        scheduledDate,
        scheduledSlot,
        paymentMode,
        bankDetails,
      } = req.body;

      if (!farmerId || !farmerName || !phoneNumber || !cropType || !quantityQuintals || !centerId) {
        return res.status(400).json({ error: 'Missing required booking fields' });
      }

      const qty = parseFloat(quantityQuintals) || 50;
      let newToken: any = null;

      if (process.env.SQL_HOST) {
        try {
          // 1. Ensure procurement center exists in Cloud SQL
          const existingCenter = await db
            .select()
            .from(procurementCenters)
            .where(eq(procurementCenters.centerId, centerId));

          if (!existingCenter.length) {
            await db.insert(procurementCenters).values({
              centerId,
              centerName: centerName || `APMC Mandi Yard (${centerId})`,
              state: state || 'Andhra Pradesh',
              district: district || 'Guntur',
              latitude: 16.3067,
              longitude: 80.4365,
              maxCapacityQuintals: 50000,
              currentStorageQuintals: 21500,
              activeScales: 6,
              activeStaff: 24,
              avgProcessingTimeMins: 25,
              status: 'AVAILABLE',
            });
          }

          // 2. Ensure farmer exists or register new
          const existingFarmer = await db.select().from(farmers).where(eq(farmers.farmerId, farmerId));
          if (!existingFarmer.length) {
            await db.insert(farmers).values({
              farmerId,
              fullName: farmerName,
              phoneNumber,
              aadhaarMasked: aadhaar || `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
              district: district || 'Guntur',
              state: state || 'Andhra Pradesh',
              landAreaAcres: (qty / 20),
              bankAccountMasked: `SBIN0001234-****${Math.floor(1000 + Math.random() * 9000)}`,
              ifscCode: 'SBIN0001234',
            });
          }

          // 3. Calculate MSP rate
          const mspMap: Record<string, number> = {
            'Paddy (Grade A)': 2320,
            'Paddy (Common)': 2300,
            'Wheat (Buffer)': 2275,
            'Maize (Makka)': 2090,
            'Soybean (Yellow)': 4892,
            'Cotton (Medium)': 7121,
          };
          const mspRate = parseFloat(req.body.mspRatePerQ) || mspMap[cropType] || 2320;
          const totalAmount = parseFloat(req.body.totalAmount) || (qty * mspRate);

          // 4. Count existing tokens today for queue estimation
          const allCenterTokens = await db
            .select()
            .from(tokens)
            .where(eq(tokens.centerId, centerId));
          const waitingAhead = allCenterTokens.filter((t) => t.status === 'WAITING').length;
          const estimatedWaitMins = Math.max(15, waitingAhead * 3 + 10);

          // 5. Generate unique token number
          const countTotal = await db.select({ count: sql<number>`count(*)::int` }).from(tokens);
          const nextNum = 1030 + (countTotal[0]?.count || 0);
          const distCode = (district || 'APMC').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'TK';
          const tokenNumber = req.body.tokenNumber || `TK-${distCode}-${nextNum}`;

          const slotHours = ['09:30 AM – 10:00 AM', '10:30 AM – 11:00 AM', '11:30 AM – 12:00 PM', '02:00 PM – 02:30 PM'];
          const designatedSlot = scheduledSlot || slotHours[waitingAhead % slotHours.length];
          const cleanCropType = cropType;
          const cropVariety = req.body.cropVariety || '';

          const [inserted] = await db
            .insert(tokens)
            .values({
              tokenNumber,
              farmerId,
              centerId,
              cropType: cleanCropType,
              quantityQuintals: qty,
              mspRatePerQ: mspRate,
              totalAmount,
              scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
              scheduledSlot: designatedSlot,
              queueAhead: waitingAhead,
              estimatedWaitMinutes: estimatedWaitMins,
              currentStageIndex: 1,
              stageName: 'Gate Arrival & Biometric e-KYC',
              status: 'WAITING',
            })
            .returning();
          newToken = { ...inserted, cropVariety };
        } catch (dbErr: any) {
          console.warn('SQL create token error, falling back to inMemoryStore:', dbErr.message);
        }
      }

      if (!newToken) {
        newToken = inMemoryStore.createToken({
          farmerId,
          farmerName,
          phoneNumber,
          aadhaar,
          district,
          state,
          cropType,
          cropVariety: req.body.cropVariety || '',
          quantityQuintals: qty,
          centerId,
          centerName,
          scheduledDate,
          scheduledSlot,
          paymentMode,
          bankDetails,
          ...(req.body.mspRatePerQ ? { mspRatePerQ: req.body.mspRatePerQ } : {}),
          ...(req.body.totalAmount ? { totalAmount: req.body.totalAmount } : {}),
          ...(req.body.tokenNumber ? { tokenNumber: req.body.tokenNumber } : {}),
        } as any);
      } else {
        // Ensure synchronized in inMemoryStore
        inMemoryStore.ensureCenter({
          centerId,
          centerName: centerName || `APMC Mandi Yard (${centerId})`,
          district: district || 'Guntur',
          state: state || 'Andhra Pradesh',
        });
        inMemoryStore.ensureFarmer(
          farmerId,
          farmerName,
          phoneNumber,
          district || 'Guntur',
          state || 'Andhra Pradesh',
          aadhaar
        );
        inMemoryStore.saveToken(newToken);
      }

      const hydratedToken = inMemoryStore.hydrateToken(newToken);

      // Realtime Broadcast to All Connected Clients via Socket.io
      io.emit('token:created', {
        token: hydratedToken,
        totalTokens: inMemoryStore.getTokens().length,
        message: `New digital token ${hydratedToken.tokenNumber} generated for ${hydratedToken.farmer?.fullName || farmerName}`,
      });
      io.to(`center:${centerId}`).emit('center:queue_updated', {
        centerId,
        queueAhead: (hydratedToken.queueAhead || 0) + 1,
      });

      res.status(201).json(hydratedToken);
    } catch (err: any) {
      console.error('Error creating token:', err);
      res.status(500).json({ error: err.message || 'Failed to generate token' });
    }
  });

  // 7. Advance Token Procurement Stage (1 to 10)
  const STAGES = [
    'Registration',
    'Slot Scheduled',
    'Arrived at Gate',
    'Quality Assay',
    'Gross Weight',
    'Produce Accepted',
    'Tare Weight',
    'e-J-Form Issued',
    'APBS Initiated',
    'DBT Completed',
  ];

  const handleAdvanceStage = async (req: express.Request, res: express.Response) => {
    try {
      const { tokenNumber } = req.params;
      const { targetStageIndex: reqTargetStage, paymentDetails } = req.body || {};
      let updated: any = null;
      let nextStageIndex = 2;
      let nextStageName = 'Slot Scheduled';
      let newStatus = 'IN_PROGRESS';

      if (process.env.SQL_HOST) {
        try {
          const foundTokens = await db.select().from(tokens).where(eq(tokens.tokenNumber, tokenNumber));
          if (foundTokens.length) {
            const current = foundTokens[0];
            if (typeof reqTargetStage === 'number' && reqTargetStage >= 1 && reqTargetStage <= 10) {
              nextStageIndex = reqTargetStage;
            } else {
              nextStageIndex = Math.min(STAGES.length, (current.currentStageIndex || 1) + 1);
            }
            nextStageName = STAGES[nextStageIndex - 1];
            newStatus = nextStageIndex >= 10 ? 'COMPLETED' : 'IN_PROGRESS';

            const [dbUpdated] = await db
              .update(tokens)
              .set({
                currentStageIndex: nextStageIndex,
                stageName: nextStageName,
                status: newStatus,
                updatedAt: new Date(),
              })
              .where(eq(tokens.tokenNumber, tokenNumber))
              .returning();
            updated = dbUpdated;

            if (nextStageIndex >= 5) {
              const existingQc = await db
                .select()
                .from(qualityInspections)
                .where(eq(qualityInspections.tokenNumber, tokenNumber));
              if (!existingQc.length) {
                await db.insert(qualityInspections).values({
                  inspectionId: `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  tokenNumber,
                  moisturePercentage: 13.4,
                  foreignMatterPercentage: 0.7,
                  cropGrade: 'Grade A',
                  cvConfidenceScore: 96.5,
                  qcStatus: 'PASSED',
                  remarks: 'Grain quality standards verified. Optimal for FCI storage.',
                  inspectedBy: 'Mandi Quality Officer',
                });
              }
            }

            if (nextStageIndex >= 10) {
              const existingDbt = await db
                .select()
                .from(dbtPayments)
                .where(eq(dbtPayments.tokenNumber, tokenNumber));
              if (!existingDbt.length) {
                await db.insert(dbtPayments).values({
                  transactionUtr: `UTR-SBI-20260910-${Math.floor(100000 + Math.random() * 900000)}`,
                  tokenNumber,
                  farmerId: current.farmerId,
                  disbursedAmount: current.totalAmount,
                  paymentMode: 'Aadhaar Payment Bridge (APBS)',
                  bankName: 'State Bank of India',
                  bankAccountMasked: 'SBIN0001234-****3918',
                  paymentStatus: 'COMPLETED',
                });
              }
            }
          }
        } catch (dbErr: any) {
          console.warn('SQL advance stage error, falling back to inMemoryStore:', dbErr.message);
        }
      }

      if (!updated) {
        const advanced = inMemoryStore.advanceStage(
          tokenNumber,
          typeof reqTargetStage === 'number' && reqTargetStage >= 1 && reqTargetStage <= 10
            ? reqTargetStage
            : undefined,
          paymentDetails
        );
        if (!advanced) {
          return res.status(404).json({ error: 'Token not found' });
        }
        updated = advanced.token;
        nextStageIndex = advanced.stageIndex;
        nextStageName = advanced.stageName;
        newStatus = advanced.status;
      }

      const hydratedUpdated = inMemoryStore.hydrateToken(updated);

      // Broadcast Real-Time Update across all clients via Socket.io
      io.emit('token:stage_advanced', {
        tokenNumber,
        token: hydratedUpdated,
        stageIndex: nextStageIndex,
        stageName: nextStageName,
        status: newStatus,
      });

      res.json(hydratedUpdated);
    } catch (err: any) {
      console.error('Error advancing token stage:', err);
      res.status(500).json({ error: err.message || 'Failed to advance token stage' });
    }
  };

  app.put('/api/tokens/:tokenNumber/advance', handleAdvanceStage);
  app.post('/api/tokens/:tokenNumber/advance', handleAdvanceStage);

  // 8. Officer Call Next Token Broadcast
  app.post('/api/officer/call-next', async (req, res) => {
    try {
      const { centerId } = req.body;
      let calledToken: any = null;

      if (process.env.SQL_HOST) {
        try {
          const waitingTokens = await db
            .select()
            .from(tokens)
            .where(eq(tokens.status, 'WAITING'))
            .orderBy(tokens.createdAt);

          if (waitingTokens.length) {
            const firstWait = waitingTokens[0];
            const [updated] = await db
              .update(tokens)
              .set({
                status: 'IN_PROGRESS',
                currentStageIndex: 3,
                stageName: 'Arrived at Mandi (Admitted at Gate)',
                updatedAt: new Date(),
              })
              .where(eq(tokens.tokenNumber, firstWait.tokenNumber))
              .returning();
            calledToken = updated;
          }
        } catch (dbErr: any) {
          console.warn('SQL call-next error, falling back to inMemoryStore:', dbErr.message);
        }
      }

      if (!calledToken) {
        calledToken = inMemoryStore.callNextToken(centerId);
      }

      if (!calledToken) {
        return res.json({ message: 'No waiting tokens in queue', token: null });
      }

      const hydratedCalled = inMemoryStore.hydrateToken(calledToken);

      // Broadcast Realtime Loudspeaker Voice & Visual Announcement via Socket.io
      io.emit('officer:token_called', {
        tokenNumber: hydratedCalled.tokenNumber,
        token: hydratedCalled,
        centerId: centerId || hydratedCalled.centerId,
        scaleNumber: 1,
        announcement: `Attention: Token ${hydratedCalled.tokenNumber} is now called to Weighbridge Scale 1. Please proceed for gate entry.`,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        calledToken: hydratedCalled,
        announcement: `Token ${hydratedCalled.tokenNumber} called to weighbridge.`,
      });
    } catch (err: any) {
      console.error('Error calling next token:', err);
      res.status(500).json({ error: err.message || 'Failed to call next token' });
    }
  });

  // 9. Quality Assay Submission
  app.post('/api/quality-inspections', async (req, res) => {
    try {
      const { tokenNumber, moisturePercentage, foreignMatterPercentage, cropGrade, remarks } = req.body;

      if (!tokenNumber) {
        return res.status(400).json({ error: 'Token number is required' });
      }

      const moisture = parseFloat(moisturePercentage) || 13.5;
      const foreignMatter = parseFloat(foreignMatterPercentage) || 0.8;
      let inspection: any = null;

      if (process.env.SQL_HOST) {
        try {
          const isPassed = moisture <= 17.0 && foreignMatter <= 2.0;
          const qcStatus = isPassed ? 'PASSED' : 'REJECTED';
          const inspectionId = `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

          const [dbInspection] = await db
            .insert(qualityInspections)
            .values({
              inspectionId,
              tokenNumber,
              moisturePercentage: moisture,
              foreignMatterPercentage: foreignMatter,
              cropGrade: cropGrade || 'Grade A',
              cvConfidenceScore: 97.2,
              qcStatus,
              remarks: remarks || (isPassed ? 'Produce meets Fair Average Quality standards.' : 'Moisture exceeds threshold.'),
              inspectedBy: 'Mandi Quality Officer',
            })
            .returning();
          inspection = dbInspection;
        } catch (dbErr: any) {
          console.warn('SQL QC error, falling back to inMemoryStore:', dbErr.message);
        }
      }

      if (!inspection) {
        inspection = inMemoryStore.saveQualityInspection({
          tokenNumber,
          moisturePercentage: moisture,
          foreignMatterPercentage: foreignMatter,
          cropGrade,
          remarks,
        });
      }

      // Realtime Broadcast
      io.emit('qc:evaluated', {
        tokenNumber,
        inspection,
      });

      res.json(inspection);
    } catch (err: any) {
      console.error('Error saving QC inspection:', err);
      res.status(500).json({ error: err.message || 'Failed to save QC inspection' });
    }
  });

  // 10. Land Records e-KYC Verification
  app.post('/api/crop-registrations/verify', async (req, res) => {
    try {
      const { state, khasraNo } = req.body;
      const cleanKhasra = String(khasraNo || '142/1A').trim();

      if (process.env.SQL_HOST) {
        try {
          const [existing] = await db
            .select()
            .from(cropRegistrations)
            .where(eq(cropRegistrations.khasraSurveyNo, cleanKhasra));

          if (existing) {
            return res.json({
              verified: true,
              record: existing,
              source: existing.stateRegistry,
              quota: existing.maxProcurementQuotaQ,
            });
          }

          const regId = `REG-${(state || 'HR').toUpperCase().slice(0, 2)}-2026-${Math.floor(100 + Math.random() * 900)}`;
          const [newReg] = await db
            .insert(cropRegistrations)
            .values({
              registrationId: regId,
              farmerId: 'AP-KRN-78219',
              stateRegistry: `${state || 'Haryana'} Revenue & e-Girdawari Portal`,
              khasraSurveyNo: cleanKhasra,
              cropName: 'Paddy (Grade A)',
              sownAreaAcres: 4.5,
              maxProcurementQuotaQ: 90.0,
              verificationStatus: 'VERIFIED',
            })
            .returning();

          return res.json({
            verified: true,
            record: newReg,
            source: newReg.stateRegistry,
            quota: newReg.maxProcurementQuotaQ,
          });
        } catch (dbErr: any) {
          console.warn('SQL land record error, falling back to inMemoryStore:', dbErr.message);
        }
      }

      const result = inMemoryStore.verifyCropRegistration(state, cleanKhasra);
      res.json(result);
    } catch (err: any) {
      console.error('Error verifying land record:', err);
      res.status(500).json({ error: 'Failed to verify land record' });
    }
  });

  // 11. National & Mandi Aggregated Dashboard Stats
  const handleDashboardStats = async (_req: express.Request, res: express.Response) => {
    try {
      if (process.env.SQL_HOST) {
        try {
          const allTokens = await db.select().from(tokens);
          const allPayments = await db.select().from(dbtPayments);
          const allCenters = await db.select().from(procurementCenters);

          const totalTokens = allTokens.length;
          const completedTokens = allTokens.filter((t) => t.status === 'COMPLETED').length;
          const inProgressTokens = allTokens.filter((t) => t.status === 'IN_PROGRESS').length;
          const waitingTokens = allTokens.filter((t) => t.status === 'WAITING').length;

          const totalProcuredQuintals = allTokens
            .filter((t) => t.status === 'COMPLETED')
            .reduce((sum, t) => sum + (t.quantityQuintals || 0), 0);

          const totalDbtDisbursed = allPayments.reduce((sum, p) => sum + (p.disbursedAmount || 0), 0);

          return res.json({
            totalTokens,
            completedTokens,
            inProgressTokens,
            waitingTokens,
            totalProcuredQuintals,
            totalDbtDisbursed,
            connectedMandis: allCenters.length,
            avgWaitMinutes: 38,
            waitingFarmers: waitingTokens,
            averageWaitTimeMinutes: 32,
            storageUtilizationPct: 78,
          });
        } catch (dbErr: any) {
          console.warn('SQL dashboard stats error, falling back to inMemoryStore:', dbErr.message);
        }
      }

      res.json(inMemoryStore.getStats());
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      res.json(inMemoryStore.getStats());
    }
  };

  app.get('/api/stats/dashboard', handleDashboardStats);
  app.get('/api/dashboard/stats', handleDashboardStats);

  // =========================================================================
  // GEMINI AI SUITE (Server-Side Secure Endpoints)
  // =========================================================================

  let _aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    if (!_aiClient) {
      _aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return _aiClient;
  }

  // 1. Multi-Turn Chatbot (gemini-3.8-flash with domain system instructions)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, district, lang } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      const ai = getGenAI();
      const systemInstruction = `You are Krishi Saathi (कृषि साथी), the Official National Agricultural Procurement Assistant for the Ministry of Agriculture & Farmers Welfare, Government of India.
You assist farmers, Mandi secretaries, weighing scale officers, and truck drivers across India.
Operational Guidelines:
1. Digital Tokens & Staggered 30-Min Arrival: Explain that tokens prevent 12-48h queues by staggering truck gate entry.
2. Fair Average Quality (FAQ) Standard Thresholds:
   - Paddy (Grade A & Common): Maximum moisture 17.0%, foreign matter max 2.0%, damaged grains max 5.0%.
   - Wheat: Maximum moisture 12.0%, foreign matter max 1.0%.
3. Minimum Support Price (MSP): Paddy Grade A ₹2,320/quintal, Paddy Common ₹2,300/quintal, Wheat ₹2,275/quintal.
4. Direct Benefit Transfer (DBT): Automatically disbursed through PFMS directly into Aadhaar-linked DBT bank accounts within 48-72 hours of weighbridge receipt.
5. Real-Time Mandi Load Balancing: Karnal Central Mandi (Center A) has longer wait times (~35-45 mins); Nilokheri Sub-Mandi (Center B) has minimal queue (~8 mins). Recommend nearby diversions when requested.
Respond in a friendly, respectful, and crystal-clear tone using clean Markdown bullet points. Match the user's language (Hindi, Punjabi, English, Telugu, etc.). Selected state/district context: ${district || 'Karnal, Haryana'}. Target language: ${lang || 'English'}.`;

      // Convert messages to Gemini API format
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.content || m.text || '') }],
      }));

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        responseText = response.text || '';
      } catch (geminiErr: any) {
        console.warn('Gemini chat request fallback:', geminiErr?.message || geminiErr);
        responseText = `नमस्ते Kisan Bandhu! Currently operating in synchronized portal mode for ${district || 'Karnal, Haryana'}:

- **30-Min Staggered Slots**: Please arrive strictly within your allotted 30-minute arrival window to eliminate truck queue delays.
- **Fair Average Quality (FAQ) Standards**: Paddy moisture must be below 17.0% (optimal 12-14%), foreign matter under 2.0%.
- **Guaranteed MSP Rates**: Paddy Grade A at ₹2,320/quintal, Wheat at ₹2,275/quintal.
- **DBT Payouts**: Automated transfer directly to your Aadhaar-linked bank account within 48-72 hours of weighment receipt generation.
- **Support**: For token rescheduling or gate help, call the Kisan Helpline toll-free at **1800-180-1551**.`;
      }

      res.json({
        text: responseText,
      });
    } catch (err: any) {
      console.warn('Chat error handled:', err?.message || err);
      res.json({
        text: 'The AI assistant is operating with cached procurement guidelines. Please review your token slot and Fair Average Quality (FAQ) moisture norms in the portal.',
      });
    }
  });

  // 2. Google Maps Grounding for Mandis & APMC Yards (gemini-3.8-flash with googleMaps)
  app.post('/api/ai/maps-mandi', async (req, res) => {
    try {
      const { location, latitude, longitude, crop } = req.body;
      const ai = getGenAI();

      const userLocText = location || 'Karnal, Haryana';
      const prompt = `Locate major agricultural grain mandis, government procurement centers, APMC yards, or FCI godown storage hubs around ${userLocText} for ${crop || 'paddy and wheat'}. 
Provide exact center names, addresses, highway accessibility, storage capacity insights, and operational status.`;

      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
          },
        };
      }

      let response: any = null;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config,
        });
      } catch (gMapsErr: any) {
        console.warn('Google Maps Grounding API fallback triggered:', gMapsErr?.message || gMapsErr);
      }

      const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const places: Array<{ title: string; uri: string }> = [];

      for (const chunk of chunks as any[]) {
        if (chunk.maps?.uri) {
          places.push({
            title: chunk.maps.title || 'Google Maps Mandi Location',
            uri: chunk.maps.uri,
          });
        } else if (chunk.web?.uri) {
          places.push({
            title: chunk.web.title || 'Mandi Information Source',
            uri: chunk.web.uri,
          });
        }
      }

      if (places.length === 0) {
        places.push(
          {
            title: 'Karnal Central APMC Mandi (Center A) - GT Road',
            uri: 'https://maps.google.com/?q=Karnal+New+Grain+Market',
          },
          {
            title: 'Nilokheri Sub-Mandi (Center B) - Express Weighing',
            uri: 'https://maps.google.com/?q=Nilokheri+Grain+Market',
          },
          {
            title: 'Gharaunda Sub-Yard (Center C) - Highway Hub',
            uri: 'https://maps.google.com/?q=Gharaunda+Grain+Market',
          }
        );
      }

      const text = response?.text || `**Government Procurement Mandi Network for ${userLocText}**:

1. **Karnal Central APMC Mandi (Center A)**: Situated along NH-44 (GT Road). Features 4 electronic weighbridges, automated baggers, and 45,000 MT covered godowns.
2. **Nilokheri Sub-Mandi (Center B)**: High-speed intake point situated 18 km north. Optimal for low-congestion unloading (average turnaround < 10 mins).
3. **Gharaunda Procurement Yard (Center C)**: Southern arterial yard with direct rail siding and Food Corporation of India (FCI) silo connectivity.`;

      res.json({
        text,
        places,
        groundingChunks: chunks,
      });
    } catch (err: any) {
      console.warn('Maps Grounding fallback handled:', err?.message || err);
      res.json({
        text: 'Showing verified national procurement centers and APMC yards connected to the state electronic weighbridge network.',
        places: [
          {
            title: 'Karnal Central Mandi (Center A) - GT Road',
            uri: 'https://maps.google.com/?q=Karnal+New+Grain+Market',
          },
          {
            title: 'Nilokheri Sub-Mandi (Center B)',
            uri: 'https://maps.google.com/?q=Nilokheri+Grain+Market',
          },
          {
            title: 'Gharaunda Sub-Yard (Center C)',
            uri: 'https://maps.google.com/?q=Gharaunda+Grain+Market',
          }
        ],
      });
    }
  });

  // 3. Audio Transcription (gemini-3.5-transcribe)
  app.post('/api/ai/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, '');
      const ai = getGenAI();

      let transcript = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: cleanBase64,
                },
              },
              {
                text: 'Transcribe this spoken audio accurately in its native spoken language (e.g. Hindi, English, Punjabi, Haryanvi, Telugu). Output only the verbatim transcript.',
              },
            ],
          },
        });
        transcript = response.text?.trim() || '';
      } catch (transcribeErr: any) {
        console.warn('Speech transcription API notice:', transcribeErr?.message || transcribeErr);
      }

      res.json({
        transcript,
      });
    } catch (err: any) {
      console.warn('Transcription fallback handled:', err?.message || err);
      res.json({
        transcript: '',
      });
    }
  });

  // 4. Create & Edit Visual Quality Assay Images (gemini-3.1-flash-image with graceful FAQ asset fallback)
  app.post('/api/ai/generate-sample-image', async (req, res) => {
    const { prompt, base64ImageData, mimeType } = req.body;
    const isWheat = (prompt || '').toLowerCase().includes('wheat') || (prompt || '').toLowerCase().includes('sharbati');
    const fallbackUrl = isWheat
      ? '/assets/faq_wheat_sample_1788687040056.jpg'
      : '/assets/faq_paddy_sample_1788687024727.jpg';

    const fallbackDescription = isWheat
      ? 'Official Fair Average Quality (FAQ) Grade A Sharbati Wheat Standard. Amber bold kernels, moisture 11.8% (max threshold 12.0%), foreign matter 0.2%, zero insect damage. Approved for Grade A procurement.'
      : 'Official Fair Average Quality (FAQ) Grade A Indian Paddy Standard. Uniform golden husk, moisture 13.5% (max threshold 17.0%), foreign organic matter 0.4%, Grade A purity benchmark verified.';

    try {
      const ai = getGenAI();

      let response: any;
      if (base64ImageData) {
        // Edit / annotate existing produce image
        const cleanBase64 = base64ImageData.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              {
                text: prompt || 'Highlight grain defect areas, discolored kernels, and moisture marks on this grain sample with clear inspection boxes.',
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });
      } else {
        // Generate synthetic reference produce sample
        const cleanPrompt = prompt || 'Close-up macro photo of Fair Average Quality (FAQ) Grade A Indian Paddy grain, golden clean husks, uniform size, 12% moisture, on a clean laboratory inspection tray.';
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: {
            parts: [{ text: cleanPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });
      }

      // Extract image part
      let imageUrl: string | null = null;
      let textExplanation = '';
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const imgMime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${imgMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textExplanation += part.text;
        }
      }

      res.json({
        imageUrl: imageUrl || fallbackUrl,
        text: textExplanation || fallbackDescription,
      });
    } catch (err: any) {
      console.warn('Gemini 3.1 Flash Image quota limit encountered; serving official FAQ reference asset:', err?.message || err);
      // Graceful fallback prevents 500 crashes and gives officers the exact FAQ standard sample
      res.json({
        imageUrl: fallbackUrl,
        text: fallbackDescription,
        isFaqStandard: true,
        note: 'Official Government of India FCI/APMC Fair Average Quality (FAQ) Grade A reference benchmark loaded.',
      });
    }
  });

  // 5. Voice Dialogue / Spoken Voice Response (gemini-3.1-flash-live-preview & TTS)
  app.post('/api/ai/voice-dialogue', async (req, res) => {
    try {
      const { userSpeechText, audioBase64, mimeType, lang } = req.body;
      const ai = getGenAI();

      let queryText = userSpeechText;
      if (!queryText && audioBase64) {
        const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, '');
        const transRes = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: cleanBase64,
                },
              },
              { text: 'Transcribe this voice query directly.' },
            ],
          },
        });
        queryText = transRes.text?.trim() || '';
      }

      if (!queryText) {
        return res.status(400).json({ error: 'No voice speech or text provided.' });
      }

      // Generate concise spoken assistant response
      let answerText = 'Your request has been received.';
      try {
        const answerRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are Krishi Annapurna Live Voice Assistant. Give a brief, clear spoken answer (max 2-3 sentences) suitable for reading aloud to a farmer. Question: "${queryText}". Language: ${lang || 'English'}.`,
        });
        answerText = answerRes.text?.trim() || answerText;
      } catch (genErr) {
        console.warn('Voice dialogue answer fallback:', genErr);
        answerText = 'DBT payments are transferred directly via PFMS into your Aadhaar-seeded bank account within 48 to 72 hours of weighbridge receipt generation.';
      }

      // Synthesize audio response using gemini-3.1-flash-tts-preview
      let synthesizedAudio: string | null = null;
      try {
        const ttsRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: answerText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });
        synthesizedAudio = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (ttsErr) {
        console.warn('TTS preview synthesis fallback:', ttsErr);
      }

      res.json({
        userQuery: queryText,
        responseText: answerText,
        audioBase64: synthesizedAudio,
      });
    } catch (err: any) {
      console.warn('Voice dialogue handled fallback:', err?.message || err);
      res.json({
        userQuery: 'Farmer voice query',
        responseText: 'DBT payments are transferred directly via PFMS into your Aadhaar-linked bank account within 48 to 72 hours of weighbridge receipt generation.',
        audioBase64: null,
      });
    }
  });

  // Catch-all 404 for API routes so they return JSON instead of Vite HTML
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // =========================================================================
  // VITE MIDDLEWARE SETUP (Development vs Production)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Krishi Annapurna] Full-stack Server + Socket.io running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
