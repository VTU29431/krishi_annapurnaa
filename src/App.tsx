import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { HomeView } from './components/HomeView.tsx';
import { CropRegistrationView } from './components/CropRegistrationView.tsx';
import { FarmerEssentialsView } from './components/FarmerEssentialsView.tsx';
import { FarmerPortalView } from './components/FarmerPortalView.tsx';
import { OfficerDeskView } from './components/OfficerDeskView.tsx';
import { ColdStorageView } from './components/ColdStorageView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { GatePassPrintModal } from './components/GatePassPrintModal.tsx';
import { JaiJawanJaiKisanWatermark } from './components/JaiJawanJaiKisanWatermark.tsx';
import KrishiSaathiChatModal from './components/KrishiSaathiChatModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import {
  getSocket,
  emitTokenCreate,
  emitTokenAdvance,
  emitOfficerCall,
} from './lib/socket.ts';
import { TRANSLATIONS } from './data/translations.ts';
import { LanguageCode, UserRole, DashboardStats, ProcurementCenter, Token, FarmerUser, MandiOfficerUser } from './types.ts';
import { speakText } from './lib/speech.ts';
import {
  auth,
  googleProvider,
  saveFarmerProfileToFirestore,
  saveTokenToFirestore,
  listenToMandiTokens,
} from './lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFarmerData, saveFarmerBooking, completeFarmerBooking } from './lib/farmerStorage.ts';
import { Bot, Sparkles } from 'lucide-react';

const DEFAULT_STATS: DashboardStats = {
  totalTokens: 1420,
  completedTokens: 980,
  inProgressTokens: 65,
  waitingTokens: 375,
  totalProcuredQuintals: 114200,
  totalDbtDisbursed: 4850000,
  connectedMandis: 9,
  avgWaitMinutes: 32,
  waitingFarmers: 38,
  averageWaitTimeMinutes: 32,
  storageUtilizationPct: 78,
};

const DEFAULT_CENTERS: ProcurementCenter[] = [
  {
    centerId: 'center_karnal_a',
    centerName: 'Karnal Central Mandi (Center A)',
    district: 'Karnal',
    state: 'Haryana',
    latitude: 29.6857,
    longitude: 76.9905,
    maxCapacityQuintals: 1500,
    capacityQuintals: 1500,
    currentStorageQuintals: 1425,
    weighbridgeCount: 3,
    activeScales: 3,
    operatingHours: '08:00 AM - 07:00 PM',
    waitingTimeMinutes: 45,
  },
  {
    centerId: 'center_karnal_b',
    centerName: 'Nilokheri Sub-Mandi (Center B)',
    district: 'Karnal',
    state: 'Haryana',
    latitude: 29.8335,
    longitude: 76.9205,
    maxCapacityQuintals: 1800,
    capacityQuintals: 1800,
    currentStorageQuintals: 720,
    weighbridgeCount: 4,
    activeScales: 4,
    operatingHours: '08:00 AM - 07:00 PM',
    waitingTimeMinutes: 8,
  },
  {
    centerId: 'center_gharaunda',
    centerName: 'Gharaunda Procurement Yard',
    district: 'Karnal',
    state: 'Haryana',
    latitude: 29.5392,
    longitude: 76.9744,
    maxCapacityQuintals: 1200,
    capacityQuintals: 1200,
    currentStorageQuintals: 810,
    weighbridgeCount: 2,
    activeScales: 2,
    operatingHours: '08:00 AM - 06:00 PM',
    waitingTimeMinutes: 22,
  },
  {
    centerId: 'center_panipat',
    centerName: 'Panipat Main Grain Terminal',
    district: 'Panipat',
    state: 'Haryana',
    latitude: 29.3909,
    longitude: 76.9635,
    maxCapacityQuintals: 2500,
    capacityQuintals: 2500,
    currentStorageQuintals: 1650,
    weighbridgeCount: 5,
    activeScales: 4,
    operatingHours: '07:30 AM - 08:00 PM',
    waitingTimeMinutes: 28,
  },
];

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [userRole, setUserRole] = useState<UserRole>('farmer');
  const [user, setUser] = useState<User | null>(null);

  // Authenticated Profiles for Farmer (Aadhaar) and Mandi Officer (Office Code & ID)
  // Not logged in by default ("not as direct login") - persists only if user explicitly logged in
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'farmer' | 'officer'>('farmer');
  const [farmerUser, setFarmerUser] = useState<FarmerUser | null>(() => {
    try {
      const saved = localStorage.getItem('krishi_farmer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [officerUser, setOfficerUser] = useState<MandiOfficerUser | null>(() => {
    try {
      const saved = localStorage.getItem('krishi_officer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Real-time state
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [centers, setCenters] = useState<ProcurementCenter[]>(DEFAULT_CENTERS);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activeFarmerToken, setActiveFarmerToken] = useState<Token | null>(null);
  const [lastCalledToken, setLastCalledToken] = useState<Token | null>(null);

  // Audio Voice guide state
  const [isAudioGuideActive, setIsAudioGuideActive] = useState<boolean>(true);

  // Gemini Krishi Saathi AI Assistant state
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);

  // Gate Pass Print & Preview Modal state
  const [isGatePassPrintModalOpen, setIsGatePassPrintModalOpen] = useState<boolean>(false);
  const [printModalToken, setPrintModalToken] = useState<Token | null>(null);

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Speak announcement using Multi-Language Web Speech Engine
  const speakAnnouncement = useCallback(
    (text: string) => {
      if (!isAudioGuideActive) return;
      speakText(text, lang);
    },
    [isAudioGuideActive, lang]
  );

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = Date.now().toString() + Math.random().toString();
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 7000);
    },
    []
  );

  // Fetch initial data from PostgreSQL REST APIs
  const fetchDashboardData = useCallback(async () => {
    try {
      const safeJson = async (res: Response) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return null;
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      const [statsRes, centersRes, tokensRes] = await Promise.all([
        fetch('/api/dashboard/stats').catch(() => null),
        fetch('/api/centers').catch(() => null),
        fetch('/api/tokens').catch(() => null),
      ]);

      if (statsRes) {
        const statsData = await safeJson(statsRes);
        if (statsData) {
          setStats((prev) => ({ ...prev, ...statsData }));
        }
      }

      if (centersRes) {
        const centersData = await safeJson(centersRes);
        if (Array.isArray(centersData) && centersData.length > 0) {
          setCenters(centersData);
        }
      }

      if (tokensRes) {
        const tokensData = await safeJson(tokensRes);
        if (Array.isArray(tokensData)) {
          setTokens(tokensData);
          // Do not auto-assign tokens if farmer is not logged in or logged out
        }
      }
    } catch (err) {
      console.warn('Failed to fetch initial data:', err);
    }
  }, []);

  // Firebase auth state observer & Firestore profile sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.uid) {
        try {
          await saveFarmerProfileToFirestore(currentUser.uid, {
            email: currentUser.email,
            displayName: currentUser.displayName || farmerUser?.fullName,
            photoURL: currentUser.photoURL,
            district: farmerUser?.district || 'Karnal',
            state: farmerUser?.state || 'Haryana',
            lastLogin: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.warn('Firestore profile sync error:', fsErr);
        }
      }
    });
    return () => unsubscribe();
  }, [farmerUser]);

  // Synchronize authenticated farmer with local persistent booking history
  useEffect(() => {
    if (farmerUser) {
      const farmerData = getFarmerData(farmerUser);
      if (farmerData.activeToken) {
        setActiveFarmerToken(farmerData.activeToken);
      } else {
        setActiveFarmerToken(null);
      }
    } else {
      setActiveFarmerToken(null);
    }
  }, [farmerUser]);

  // Socket.io initialization & real-time events
  useEffect(() => {
    fetchDashboardData();

    const socket = getSocket();

    const handleConnect = () => {
      setIsSocketConnected(true);
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleTokenCreated = (data: { token: Token; totalTokens: number }) => {
      setTokens((prev) => [data.token, ...prev.filter((t) => t.tokenNumber !== data.token.tokenNumber)]);
      setStats((prev) => ({ ...prev, totalTokens: data.totalTokens }));
      addToast({
        type: 'notification',
        title: 'New Digital Token Created',
        message: `Token ${data.token.tokenNumber} for ${data.token.cropType} booked successfully.`,
      });
    };

    const handleStageAdvanced = (data: { token: Token }) => {
      setTokens((prev) =>
        prev.map((t) => (t.tokenNumber === data.token.tokenNumber ? data.token : t))
      );
      if (activeFarmerToken?.tokenNumber === data.token.tokenNumber) {
        setActiveFarmerToken(data.token);
      }
      addToast({
        type: 'notification',
        title: `Token ${data.token.tokenNumber} Updated`,
        message: `Advanced to ${data.token.stageName || `Stage ${data.token.currentStageIndex}`}.`,
      });
    };

    const handleTokenCalled = (data: { token: Token; scaleNumber: number }) => {
      setLastCalledToken(data.token);
      setTokens((prev) =>
        prev.map((t) => (t.tokenNumber === data.token.tokenNumber ? data.token : t))
      );
      if (activeFarmerToken?.tokenNumber === data.token.tokenNumber) {
        setActiveFarmerToken(data.token);
      }

      const announcement = `Attention Please. Token Number ${data.token.tokenNumber}, please proceed to Weighbridge Scale ${data.scaleNumber}.`;
      speakAnnouncement(announcement);

      addToast({
        type: 'announcement',
        title: `Token Called: ${data.token.tokenNumber}`,
        message: `Please proceed to Weighbridge Scale ${data.scaleNumber}.`,
      });
    };

    const handleDiversionAlert = (data: { from: string; to: string; reason: string }) => {
      addToast({
        type: 'reroute',
        title: 'Mandi Overload Traffic Advisory',
        message: `Traffic diverted from ${data.from} to ${data.to}. Estimated 3.8 hrs saved.`,
      });
      speakAnnouncement(`Advisory: Rerouting advised from ${data.from} to ${data.to}.`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('token:created', handleTokenCreated);
    socket.on('token:stage_advanced', handleStageAdvanced);
    socket.on('officer:token_called', handleTokenCalled);
    socket.on('admin:overload_diversion', handleDiversionAlert);

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('token:created', handleTokenCreated);
      socket.off('token:stage_advanced', handleStageAdvanced);
      socket.off('officer:token_called', handleTokenCalled);
      socket.off('admin:overload_diversion', handleDiversionAlert);
    };
  }, [fetchDashboardData, speakAnnouncement, addToast, activeFarmerToken?.tokenNumber]);

  // Firestore Real-Time Collection Listener for persistent multi-device syncing
  useEffect(() => {
    const unsubscribe = listenToMandiTokens(
      (firestoreTokens) => {
        if (firestoreTokens && firestoreTokens.length > 0) {
          setTokens((prev) => {
            const map = new Map(prev.map((t) => [t.tokenNumber, t]));
            firestoreTokens.forEach((ft: any) => {
              if (ft && ft.tokenNumber) {
                const existing = map.get(ft.tokenNumber);
                if (existing) {
                  map.set(ft.tokenNumber, Object.assign({}, existing, ft) as Token);
                } else {
                  map.set(ft.tokenNumber, ft as Token);
                }
              }
            });
            return Array.from(map.values());
          });
        }
      },
      (err) => {
        console.warn('Firestore real-time sync standby:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Strict Access Guard: Only allow sites when properly authenticated
  useEffect(() => {
    if (!farmerUser && ['farmer', 'crop-registration', 'farmer-essentials', 'cold-storage'].includes(activeView)) {
      setActiveView('home');
    }
    if (!officerUser && activeView === 'officer') {
      setActiveView('home');
    }
  }, [farmerUser, officerUser, activeView]);

  // Handlers
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign-in skipped or cancelled:', err);
    }
  };

  const handleLogout = async (role?: 'farmer' | 'officer') => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }

    if (!role || role === 'farmer') {
      setFarmerUser(null);
      setActiveFarmerToken(null);
      setPrintModalToken(null);
      try {
        localStorage.removeItem('krishi_farmer_user');
      } catch {}
      addToast({
        type: 'notification',
        title: 'Farmer Profile Logged Out',
        message: 'Aadhaar session disconnected. All tokens and personal details cleared.',
      });
    }

    if (!role || role === 'officer') {
      setOfficerUser(null);
      setLastCalledToken(null);
      try {
        localStorage.removeItem('krishi_officer_user');
      } catch {}
      addToast({
        type: 'notification',
        title: 'Officer Terminal Logged Out',
        message: 'Mandi staff credentials and desk cleared.',
      });
    }

    setActiveView('home');
  };

  const handleBookToken = async (bookingData: any): Promise<Token> => {
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    if (!res.ok) {
      throw new Error('Failed to create token in registry');
    }

    const createdToken: Token = await res.json();
    setActiveFarmerToken(createdToken);
    setTokens((prev) => [createdToken, ...prev]);

    // Real-time dispatch via WebSocket
    try {
      emitTokenCreate(createdToken);
    } catch (wsErr) {
      console.warn('Real-time WebSocket token dispatch notice:', wsErr);
    }

    // Persist to local farmer history
    if (farmerUser) {
      saveFarmerBooking(farmerUser, createdToken);
    }

    // Persist to Cloud Firestore
    try {
      await saveTokenToFirestore(createdToken);
    } catch (fsErr) {
      console.warn('Firestore token save notice:', fsErr);
    }

    return createdToken;
  };

  const handleAdvanceStage = async (tokenNumber: string, targetStageIndex?: number, paymentDetails?: any) => {
    // Real-time broadcast via WebSocket
    try {
      emitTokenAdvance(tokenNumber, targetStageIndex, paymentDetails);
    } catch (wsErr) {
      console.warn('Real-time WebSocket stage advance notice:', wsErr);
    }

    try {
      const res = await fetch(`/api/tokens/${tokenNumber}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStageIndex, paymentDetails }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (paymentDetails) {
          updated.paymentDetails = paymentDetails;
        }
        setTokens((prev) => prev.map((t) => (t.tokenNumber === tokenNumber ? updated : t)));
        if (activeFarmerToken?.tokenNumber === tokenNumber) {
          setActiveFarmerToken(updated);
        }
        if (updated.stage === 'COMPLETED' || updated.currentStage === 'COMPLETED' || updated.status === 'COMPLETED') {
          if (farmerUser) {
            completeFarmerBooking(farmerUser, updated);
          }
        }
      }
    } catch (err) {
      console.error('Failed to advance token stage:', err);
    }
  };

  const handleCallNextToken = async () => {
    // Real-time dispatch via WebSocket
    try {
      emitOfficerCall('center_karnal_a', 1);
    } catch (wsErr) {
      console.warn('Real-time WebSocket officer call notice:', wsErr);
    }

    try {
      const res = await fetch('/api/officer/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centerId: 'center_karnal_a', scaleNumber: 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setLastCalledToken(data.token);
        }
      }
    } catch (err) {
      console.error('Failed to call next token:', err);
    }
  };

  const handleSaveQc = async (qcData: any) => {
    const res = await fetch('/api/quality-inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qcData),
    });
    if (!res.ok) {
      throw new Error('Failed to save QC assay record');
    }
  };

  const handleSendDiversionBroadcast = (fromCenter: string, toCenter: string) => {
    const socket = getSocket();
    socket.emit('admin:overload_diversion', {
      from: fromCenter,
      to: toCenter,
      reason: 'Capacity Saturation > 95%',
    });
    addToast({
      type: 'reroute',
      title: 'Diversion Advisory Sent',
      message: `Reroute advisory from ${fromCenter} to ${toCenter} broadcasted to all farmers.`,
    });
  };

  // State-scoped tokens for the Mandi Officer desk so Andhra Pradesh officers see Andhra tokens
  const officerDeskTokens = useMemo(() => {
    if (!officerUser) return tokens;
    const officerState = officerUser.state || 'Andhra Pradesh';
    const officerDist = officerUser.district || 'Guntur';
    const officerMandi = officerUser.mandiName || 'Guntur Chilli Dedicated APMC Yard';

    const matching = tokens.filter(
      (t) =>
        t.center?.state === officerState ||
        t.state === officerState ||
        t.center?.district === officerDist ||
        t.district === officerDist ||
        t.center?.centerName === officerMandi
    );

    if (matching.length > 0) {
      return matching;
    }

    return [
      {
        tokenNumber: `TK-${officerDist.slice(0, 3).toUpperCase()}-1024`,
        farmerId: '5892 4819 3218',
        farmerName: 'Sri K. Sambasiva Rao',
        phoneNumber: '9848022319',
        aadhaar: '5892 4819 3218',
        cropType: officerState === 'Andhra Pradesh' ? 'Tobacco (तंबाकू / పొగాకు)' : 'Paddy (धान / వరి)',
        cropVariety: officerState === 'Andhra Pradesh' ? 'Maadu (Natu Sun-Cured Tobacco)' : 'Sona Masoori (BPT 5204)',
        quantityQuintals: 60,
        centerId: officerUser.mandiOfficeCode || `MND-${officerDist.slice(0, 3).toUpperCase()}-01`,
        centerName: officerMandi,
        state: officerState,
        district: officerDist,
        scheduledDate: '2026-09-10',
        scheduledSlot: '10:00 AM – 10:30 AM',
        currentStageIndex: 1,
        stageName: 'Gate Arrival & Biometric e-KYC',
        status: 'WAITING',
        totalAmount: 60 * (officerState === 'Andhra Pradesh' ? 16500 : 2550),
        center: {
          centerId: officerUser.mandiOfficeCode || `MND-${officerDist.slice(0, 3).toUpperCase()}-01`,
          centerName: officerMandi,
          district: officerDist,
          state: officerState,
        } as any,
        farmer: {
          fullName: 'Sri K. Sambasiva Rao',
          aadhaarMasked: 'XXXX-XXXX-3218',
          phoneNumber: '9848022319',
          district: officerDist,
          state: officerState,
        } as any,
      },
      {
        tokenNumber: `TK-${officerDist.slice(0, 3).toUpperCase()}-1025`,
        farmerId: '9182 7361 5420',
        farmerName: 'Sri M. Venkata Subbaiah',
        phoneNumber: '9440182736',
        aadhaar: '9182 7361 5420',
        cropType: officerState === 'Andhra Pradesh' ? 'Tobacco (तंबाकू / పొగాకు)' : 'Paddy (धान / వరి)',
        cropVariety: officerState === 'Andhra Pradesh' ? 'Number (Grade 1 Lanka Leaf)' : 'PR-126 (High Yielding)',
        quantityQuintals: 75,
        centerId: officerUser.mandiOfficeCode || `MND-${officerDist.slice(0, 3).toUpperCase()}-01`,
        centerName: officerMandi,
        state: officerState,
        district: officerDist,
        scheduledDate: '2026-09-10',
        scheduledSlot: '10:30 AM – 11:00 AM',
        currentStageIndex: 3,
        stageName: 'Electronic Gross Tare Weighment',
        status: 'IN_PROGRESS',
        totalAmount: 75 * (officerState === 'Andhra Pradesh' ? 21500 : 2320),
        center: {
          centerId: officerUser.mandiOfficeCode || `MND-${officerDist.slice(0, 3).toUpperCase()}-01`,
          centerName: officerMandi,
          district: officerDist,
          state: officerState,
        } as any,
        farmer: {
          fullName: 'Sri M. Venkata Subbaiah',
          aadhaarMasked: 'XXXX-XXXX-5420',
          phoneNumber: '9440182736',
          district: officerDist,
          state: officerState,
        } as any,
      },
      {
        tokenNumber: `TK-${officerDist.slice(0, 3).toUpperCase()}-1026`,
        farmerId: '4729 1840 9283',
        farmerName: 'Smt. P. Lakshmi Kantham',
        phoneNumber: '9989012345',
        aadhaar: '4729 1840 9283',
        cropType: 'Chilli / Red Pepper (मिर्च / మిరప)',
        cropVariety: 'Guntur Sannam (S4 GI Tagged)',
        quantityQuintals: 45,
        centerId: officerUser.mandiOfficeCode || `MND-${officerDist.slice(0, 3).toUpperCase()}-01`,
        centerName: officerMandi,
        state: officerState,
        district: officerDist,
        scheduledDate: '2026-09-10',
        scheduledSlot: '11:00 AM – 11:30 AM',
        currentStageIndex: 10,
        stageName: 'Real-time PFMS DBT Settlement',
        status: 'COMPLETED',
        totalAmount: 45 * 19800,
        center: {
          centerId: officerUser.mandiOfficeCode || `MND-${officerDist.slice(0, 3).toUpperCase()}-01`,
          centerName: officerMandi,
          district: officerDist,
          state: officerState,
        } as any,
        farmer: {
          fullName: 'Smt. P. Lakshmi Kantham',
          aadhaarMasked: 'XXXX-XXXX-9283',
          phoneNumber: '9989012345',
          district: officerDist,
          state: officerState,
        } as any,
      },
    ];
  }, [tokens, officerUser]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Global Jai Jawan Jai Kisan Watermark with Indian Flag Colors */}
      <JaiJawanJaiKisanWatermark />

      {/* Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        lang={lang}
        setLang={setLang}
        isSocketConnected={isSocketConnected}
        userRole={userRole}
        setUserRole={setUserRole}
        farmerUser={farmerUser}
        officerUser={officerUser}
        activeToken={activeFarmerToken}
        userEmail={user?.email}
        onLogin={(role) => {
          if (role) setAuthModalTab(role);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenChatModal={() => setIsChatModalOpen(true)}
        onOpenPrintGatePass={() => {
          setPrintModalToken(activeFarmerToken || null);
          setIsGatePassPrintModalOpen(true);
        }}
        isAudioGuideActive={isAudioGuideActive}
        toggleAudioGuide={() => setIsAudioGuideActive(!isAudioGuideActive)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView
            stats={stats}
            setActiveView={setActiveView}
            langText={t}
            userRole={userRole}
            setUserRole={setUserRole}
            farmerUser={farmerUser}
            officerUser={officerUser}
            activeToken={activeFarmerToken}
            onOpenAuthModal={(role) => {
              if (role) setAuthModalTab(role);
              setIsAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            onOpenPrintGatePass={(token) => {
              setPrintModalToken(token || activeFarmerToken || null);
              setIsGatePassPrintModalOpen(true);
            }}
          />
        )}

        {activeView === 'crop-registration' && (
          <CropRegistrationView
            farmerUser={farmerUser}
            onProceedToBooking={() => setActiveView('farmer')}
          />
        )}

        {activeView === 'farmer-essentials' && (
          <FarmerEssentialsView
            onProceedToBooking={() => setActiveView('farmer')}
          />
        )}

        {activeView === 'farmer' && (
          <FarmerPortalView
            activeToken={activeFarmerToken}
            centers={centers}
            onBookToken={handleBookToken}
            onAdvanceStage={handleAdvanceStage}
            lang={lang}
            langText={t}
            farmerUser={farmerUser}
            setActiveView={setActiveView}
            onOpenAuthModal={(role) => {
              if (role) setAuthModalTab(role);
              setIsAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            onOpenPrintGatePass={(token) => {
              setPrintModalToken(token || activeFarmerToken || null);
              setIsGatePassPrintModalOpen(true);
            }}
          />
        )}

        {activeView === 'cold-storage' && (
          <ColdStorageView
            farmerUser={farmerUser}
            lang={lang}
            langText={t}
          />
        )}

        {activeView === 'officer' && (
          <OfficerDeskView
            tokens={officerDeskTokens}
            onCallNextToken={handleCallNextToken}
            onAdvanceStage={handleAdvanceStage}
            onSaveQc={handleSaveQc}
            onRefreshTokens={fetchDashboardData}
            onRedirectToGis={() => setActiveView('home')}
            lastCalledToken={lastCalledToken}
            officerUser={officerUser}
            onOpenAuthModal={(role) => {
              if (role) setAuthModalTab(role);
              setIsAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            onQuickLoginOfficer={() => {
              const officialOfficer: MandiOfficerUser = {
                mandiOfficeCode: 'MND-GUNTUR-01',
                mandiName: 'Guntur Chilli Dedicated APMC Yard',
                officerId: 'OFF-AP-GNT-01',
                officerName: 'Sri K. Venkata Reddy',
                designation: 'Procurement Officer & Weighbridge Incharge',
                scaleNumber: 1,
                state: 'Andhra Pradesh',
                district: 'Guntur',
              };
              setOfficerUser(officialOfficer);
              setUserRole('officer');
              try {
                localStorage.setItem('krishi_officer_user', JSON.stringify(officialOfficer));
              } catch {}
              addToast({
                type: 'notification',
                title: 'Mandi Officer Authenticated',
                message: 'Authorized terminal active: Sri K. Venkata Reddy (OFF-AP-GNT-01 • Andhra Pradesh / Guntur).',
              });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌾</span>
            <div>
              <div className="text-slate-200 font-bold">
                Krishi Annapurna (कृषि अन्नपूर्णा)
              </div>
              <div className="text-[11px] text-slate-500">
                Department of Food & Public Distribution • National Agricultural Procurement Grid
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <div>National Agricultural Cloud Infrastructure • Real-Time Grid</div>
            <div className="mt-0.5 text-emerald-400 font-medium">
              Zero Queues • Guaranteed MSP • 48-72h Direct Benefit Transfer (DBT)
            </div>
          </div>
        </div>
      </footer>

      {/* Separate Farmer & Mandi Officer Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userRole={userRole}
        setUserRole={setUserRole}
        farmerUser={farmerUser}
        setFarmerUser={setFarmerUser}
        officerUser={officerUser}
        setOfficerUser={setOfficerUser}
        onSuccessLogin={(role) => {
          setUserRole(role);
          if (role === 'officer') {
            setActiveView('officer');
          } else {
            setActiveView('farmer');
          }
        }}
        lang={lang}
        initialTab={authModalTab}
        onLogout={handleLogout}
      />

      {/* Dedicated High-Resolution Gate Pass Print & Verification Modal */}
      <GatePassPrintModal
        isOpen={isGatePassPrintModalOpen}
        onClose={() => setIsGatePassPrintModalOpen(false)}
        token={printModalToken || activeFarmerToken}
        farmerUser={farmerUser}
        center={centers.find((c) => c.centerId === (printModalToken?.centerId || activeFarmerToken?.centerId))}
      />

      {/* Krishi Saathi AI Assistant Floating Button with pop-in / slide-up entrance animation */}
      <button
        id="krishi-saathi-floating-button"
        onClick={() => setIsChatModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full shadow-2xl animate-pop-in-slide-up hover:scale-105 active:scale-95 transition-transform flex items-center space-x-2 border-2 border-white/50 group cursor-pointer"
        title="Open Krishi Saathi AI Assistant (Voice, Chat, Maps)"
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
        </div>
        <span className="text-xs font-bold hidden sm:inline pr-1">Krishi AI Saathi</span>
      </button>

      {/* Krishi Saathi AI Assistant Modal */}
      <KrishiSaathiChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        lang={lang}
        user={user}
      />

      {/* Real-time Toasts */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
