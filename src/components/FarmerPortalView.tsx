import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  Calendar,
  Clock,
  Printer,
  FastForward,
  CheckCircle2,
  RefreshCw,
  Info,
  ShieldCheck,
  Building,
  Volume2,
  Smartphone,
  CreditCard,
  Banknote,
  ArrowLeft,
  Lock,
  LogOut,
  History,
  AlertCircle,
  MapPin,
  Warehouse,
  ChevronRight,
  Navigation,
  Scale,
  Sparkles,
  ArrowRight,
  Layers,
  Phone,
  Check,
  CheckCheck,
  UserCheck,
  Receipt,
  FileText,
} from 'lucide-react';
import {
  ProcurementCenter,
  Token,
  LanguageCode,
  FarmerUser,
  PaymentMode,
  BankDetails,
} from '../types.ts';
import { PROCUREMENT_STAGES } from '../data/mockData.ts';
import { speakText } from '../lib/speech.ts';
import { saveTokenToFirestore } from '../lib/firebase.ts';
import { getFarmerData, saveFarmerBooking } from '../lib/farmerStorage.ts';
import { FarmerHistoryLedger } from './FarmerHistoryLedger.tsx';
import { MandiLocationMapView } from './MandiLocationMapView.tsx';
import {
  ALL_INDIAN_STATES,
  getDistrictsForState,
  getMandiCentersForDistrict,
  getMandiSlotAvailability,
  isSlotPassed,
} from '../data/indiaLocations.ts';
import { COMPREHENSIVE_CROPS, MainCrop, CropVariety, getCropsForState, parseCropAndVariety } from '../data/cropsData.ts';

interface FarmerPortalViewProps {
  activeToken: Token | null;
  centers: ProcurementCenter[];
  onBookToken: (bookingData: any) => Promise<Token>;
  onAdvanceStage: (tokenNumber: string) => void;
  lang: LanguageCode;
  langText: Record<string, string>;
  farmerUser: FarmerUser | null;
  setActiveView: (view: string) => void;
  onOpenAuthModal?: (role?: 'farmer' | 'officer') => void;
  onLogout?: (role?: 'farmer' | 'officer') => void;
  onOpenPrintGatePass?: (token?: Token | null) => void;
  tokens?: Token[];
}

export const FarmerPortalView: React.FC<FarmerPortalViewProps> = ({
  activeToken,
  centers,
  onBookToken,
  onAdvanceStage,
  lang,
  langText,
  farmerUser,
  setActiveView,
  onOpenAuthModal,
  onLogout,
  onOpenPrintGatePass,
  tokens = [],
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Persistent Farmer History & Bookings
  const farmerData = useMemo(() => getFarmerData(farmerUser), [farmerUser, refreshKey]);
  const displayToken = activeToken || farmerData.activeToken;

  // View Mode: Farmer enters directly to HUB (Options Menu) and NOT directly into booking!
  // Options: 'HUB' | 'BOOKING' | 'TOKEN_PASS' | 'CENTERS' | 'CROPS' | 'HISTORY'
  const [viewMode, setViewMode] = useState<'HUB' | 'BOOKING' | 'TOKEN_PASS' | 'CENTERS' | 'CROPS' | 'HISTORY'>('HUB');

  // Location State
  const [selectedState, setSelectedState] = useState<string>(farmerUser?.state || 'Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(farmerUser?.district || 'Guntur');

  // Synchronize with farmerUser
  useEffect(() => {
    if (farmerUser) {
      if (farmerUser.state) setSelectedState(farmerUser.state);
      if (farmerUser.district) setSelectedDistrict(farmerUser.district);
    }
  }, [farmerUser]);

  // Available districts for chosen state
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const districts = getDistrictsForState(newState);
    const firstDistrict = districts[0] || '';
    setSelectedDistrict(firstDistrict);
  };

  // ==========================================
  // CROP & SUB-CROP VARIETY SELECTION
  // STRICTLY FILTERED BY SELECTED STATE!
  // (e.g. Kerala -> Paddy, Coconut, Spices, Turmeric, Rubber, Coffee; Tobacco is NOT cultivated in Kerala!)
  // ==========================================
  const availableCropsForState = useMemo(() => {
    return getCropsForState(selectedState);
  }, [selectedState]);

  const [selectedCropId, setSelectedCropId] = useState<string>(() => {
    const initialCrops = getCropsForState(farmerUser?.state || 'Andhra Pradesh');
    return initialCrops[0]?.id || 'paddy';
  });

  // When selected state changes, ensure selected crop belongs to that state
  useEffect(() => {
    if (availableCropsForState.length > 0) {
      if (!availableCropsForState.some((c) => c.id === selectedCropId)) {
        const fallbackCrop = availableCropsForState[0];
        setSelectedCropId(fallbackCrop.id);
        if (fallbackCrop.varieties.length > 0) {
          setSelectedVarietyId(fallbackCrop.varieties[0].id);
        }
      }
    }
  }, [availableCropsForState, selectedCropId]);

  const activeMainCrop = useMemo(() => {
    return (
      availableCropsForState.find((c) => c.id === selectedCropId) ||
      availableCropsForState[0] ||
      COMPREHENSIVE_CROPS[0]
    );
  }, [availableCropsForState, selectedCropId]);

  // Varieties for this crop suitable for this state
  const availableVarieties = useMemo(() => {
    if (!activeMainCrop) return [];
    const stateVars = activeMainCrop.varieties.filter(
      (v) => !v.commonInStates || v.commonInStates.length === 0 || v.commonInStates.includes(selectedState)
    );
    return stateVars.length > 0 ? stateVars : activeMainCrop.varieties;
  }, [activeMainCrop, selectedState]);

  const [selectedVarietyId, setSelectedVarietyId] = useState<string>(() => {
    const initialCrops = getCropsForState(farmerUser?.state || 'Andhra Pradesh');
    return initialCrops[0]?.varieties[0]?.id || '';
  });

  useEffect(() => {
    if (availableVarieties.length > 0) {
      if (!availableVarieties.some((v) => v.id === selectedVarietyId)) {
        setSelectedVarietyId(availableVarieties[0].id);
      }
    }
  }, [availableVarieties, selectedVarietyId]);

  // When crop changes, auto-select first sub-crop variety
  const handleCropChange = (newCropId: string) => {
    setSelectedCropId(newCropId);
    const cropObj = availableCropsForState.find((c) => c.id === newCropId);
    if (cropObj && cropObj.varieties.length > 0) {
      const stateVars = cropObj.varieties.filter(
        (v) => !v.commonInStates || v.commonInStates.length === 0 || v.commonInStates.includes(selectedState)
      );
      setSelectedVarietyId(stateVars[0]?.id || cropObj.varieties[0].id);
    }
  };

  const activeVariety = useMemo(() => {
    return (
      availableVarieties.find((v) => v.id === selectedVarietyId) ||
      availableVarieties[0] ||
      activeMainCrop.varieties[0]
    );
  }, [availableVarieties, selectedVarietyId, activeMainCrop]);

  // Available Mandi Centers strictly filtered for the farmer's selected Crop, State & District
  const availableCenters = useMemo(() => {
    return getMandiCentersForDistrict(
      selectedState,
      selectedDistrict,
      centers,
      activeMainCrop?.name || selectedCropId
    );
  }, [selectedState, selectedDistrict, centers, activeMainCrop?.name, selectedCropId]);

  const [centerId, setCenterId] = useState<string>('');

  useEffect(() => {
    if (availableCenters.length > 0) {
      if (!availableCenters.some((c) => c.centerId === centerId)) {
        setCenterId(availableCenters[0].centerId);
      }
    } else {
      setCenterId('');
    }
  }, [availableCenters, centerId]);

  const selectedCenter = useMemo(() => {
    return (
      availableCenters.find((c) => c.centerId === centerId) ||
      availableCenters[0] ||
      centers[0]
    );
  }, [availableCenters, centers, centerId]);

  // Today's date string in YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Booking Parameters: STRICTLY DO NOT ENTER HARDCODED DEFAULTS (farmer must select their own)
  const [quantityQuintals, setQuantityQuintals] = useState<number | ''>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledSlot, setScheduledSlot] = useState<string>('');
  const [slotError, setSlotError] = useState<string>('');

  // Evaluates real-time Mandi Day & Slot Availability
  const mandiAvailability = useMemo(() => {
    if (!centerId || !scheduledDate) {
      return {
        mandiStatus: 'LIMITED' as const,
        statusMessage: 'Please select a date to view available arrival time slots.',
        operatingHours: '08:00 AM – 05:30 PM',
        slots: [],
      };
    }
    return getMandiSlotAvailability(centerId, scheduledDate, tokens);
  }, [centerId, scheduledDate, tokens]);

  // Real-time slot filter: If today is running, do NOT show the passed timing slots!
  const availableSlotsList = useMemo(() => {
    if (!scheduledDate) return [];
    return mandiAvailability.slots.filter((s) => {
      if (scheduledDate === todayDateStr && isSlotPassed(s.slot, scheduledDate)) {
        return false;
      }
      return true;
    });
  }, [scheduledDate, todayDateStr, mandiAvailability.slots]);

  // Payment Mode
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('ONLINE_DBT');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('38910029381');
  const [ifscCode, setIfscCode] = useState('SBIN0001821');
  const [accountHolderName, setAccountHolderName] = useState(farmerUser?.fullName || 'Kisan Farmer');

  // Aadhaar OTP Verification State for final booking submission
  const [otpStepActive, setOtpStepActive] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('742189');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed total payment
  const activeRatePerQuintal = activeVariety?.mspRatePerQuintal || 2320;
  const estimatedTotalPayment = (Number(quantityQuintals) || 0) * activeRatePerQuintal;

  // Render QR Code onto canvas whenever in TOKEN_PASS view and displayToken exists
  useEffect(() => {
    if (viewMode === 'TOKEN_PASS' && qrCanvasRef.current && displayToken) {
      const qrData = JSON.stringify({
        token: displayToken.tokenNumber,
        farmer: displayToken.farmerId || displayToken.farmer?.aadhaarMasked,
        name: displayToken.farmer?.fullName || farmerUser?.fullName,
        crop: displayToken.cropType,
        variety: displayToken.cropVariety || activeVariety?.name,
        qty: displayToken.quantityQuintals,
        center: displayToken.center?.centerName || selectedCenter?.centerName,
        slot: displayToken.scheduledSlot,
        amount: displayToken.totalAmount,
      });

      QRCode.toCanvas(
        qrCanvasRef.current,
        qrData,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#064e3b',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.error('Error rendering QR code:', err);
        }
      );
    }
  }, [viewMode, displayToken, farmerUser, selectedCenter, activeVariety]);

  // Send OTP
  const handleInitiateBookingOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError('');

    if (!quantityQuintals || Number(quantityQuintals) <= 0) {
      setSlotError('Please enter the estimated produce quantity in Quintals (e.g. 50).');
      return;
    }

    if (!scheduledDate) {
      setSlotError('Please select an arrival date (today or upcoming).');
      return;
    }

    if (scheduledDate < todayDateStr) {
      setSlotError('Past dates cannot be selected for booking. Please select today or an upcoming date.');
      return;
    }

    if (!scheduledSlot) {
      setSlotError('Please select a designated 30-minute arrival slot window.');
      return;
    }

    if (mandiAvailability.mandiStatus === 'CLOSED') {
      setSlotError('The selected Mandi is closed on this date. Please pick another operating date.');
      return;
    }

    const rand = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(rand);
    setOtpStepActive(true);
  };

  // Confirm Booking and Create Token
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== generatedOtp && otpCode !== '123456' && otpCode !== '742189') {
      setSlotError('Invalid verification OTP. Enter code received on mobile.');
      return;
    }

    setIsSubmitting(true);
    setSlotError('');

    try {
      const bookingPayload = {
        farmerId: farmerUser?.aadhaar || '5892 4819 3218',
        farmerName: farmerUser?.fullName || 'Kisan Farmer',
        phoneNumber: farmerUser?.mobileNumber || '9848022319',
        aadhaar: farmerUser?.aadhaar || '5892 4819 3218',
        state: selectedState,
        district: selectedDistrict,
        centerId: selectedCenter?.centerId || 'MND-GUNTUR-01',
        centerName: selectedCenter?.centerName || 'Guntur APMC Main Yard',
        cropType: activeMainCrop.name,
        cropVariety: activeVariety.name,
        quantityQuintals: Number(quantityQuintals),
        mspRatePerQ: activeRatePerQuintal,
        totalAmount: estimatedTotalPayment,
        scheduledDate,
        scheduledSlot,
        paymentMode,
        bankDetails: paymentMode === 'ONLINE_DBT' ? {
          bankName,
          accountNumber,
          ifscCode,
          accountHolderName: accountHolderName || farmerUser?.fullName || 'Farmer',
        } : undefined,
      };

      const token = await onBookToken(bookingPayload);

      // Persist to Cloud Firestore
      try {
        await saveTokenToFirestore(token);
      } catch (fsErr) {
        console.warn('Firestore notice:', fsErr);
      }

      // Persist locally
      if (farmerUser) {
        saveFarmerBooking(farmerUser, token);
      }

      setRefreshKey((k) => k + 1);
      setViewMode('TOKEN_PASS');
      setOtpStepActive(false);

      const spoken = `Slot confirmed successfully! Token number is ${token.tokenNumber}.`;
      speakText(spoken, lang);
    } catch (err) {
      console.error('Booking failed:', err);
      setSlotError('Failed to confirm booking slot. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Storage left helper
  const calculateStorageLeft = (center: ProcurementCenter) => {
    return center.availableStorageQuintals ?? Math.max(0, (center.maxCapacityQuintals || 50000) - (center.currentStorageQuintals || 21500));
  };

  // If farmer is not authenticated
  if (!farmerUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner">
          🌾
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aadhaar e-KYC Sign-In Required</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Farmer Portal Access
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please log in with your State, District, and 12-digit Aadhaar Number to access your procurement desk, book slots, and view Mandi location maps.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuthModal?.('farmer')}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-all flex items-center justify-center space-x-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Farmer Login (State → District → Aadhaar)</span>
          </button>
          <button
            onClick={() => setActiveView('home')}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-5 text-slate-800">
      {/* Top Profile Banner with State, District & Actions */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-black flex-shrink-0">
            🚜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                {farmerUser.fullName}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                Aadhaar e-KYC Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
              <span>District: <strong className="text-slate-800">{farmerUser.district}</strong></span>
              <span>•</span>
              <span>State: <strong className="text-slate-800">{farmerUser.state}</strong></span>
              <span>•</span>
              <span>Aadhaar: <strong className="font-mono text-slate-700">•••• •••• {farmerUser.aadhaar.slice(-4)}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {viewMode !== 'HUB' && (
            <button
              type="button"
              onClick={() => setViewMode('HUB')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Options</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onLogout?.('farmer')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center space-x-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: FARMER CENTRAL OPTIONS HUB (Default on entry - NOT directly booking!)
          ========================================================================= */}
      {viewMode === 'HUB' && (
        <div className="space-y-5 animate-fade-in">
          {/* Welcome Message */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Farmer Procurement Gateway
              </span>
              <h3 className="text-lg font-extrabold text-emerald-950 mt-0.5">
                Choose an action for {farmerUser.district}, {farmerUser.state}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Book a slot at verified APMC yards, check remaining storage capacity, view crop varieties, or open your active gate pass and map directions.
              </p>
            </div>
            {displayToken && (
              <div className="p-2.5 rounded-xl bg-white border border-emerald-300 shadow-sm flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-950">Active Token: #{displayToken.tokenNumber}</span>
              </div>
            )}
          </div>

          {/* Clean, Simple Action Grid (NOT Heavy Designs!) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OPTION 1: BOOK PROCUREMENT CENTRE SLOT */}
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm hover:border-emerald-400 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-black">
                  🌾
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Book Procurement Centre Slot
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select your crop (Tobacco, Paddy, Chilli, Cotton, etc.) and specific sub-crop variety (e.g. <strong>Tobacco Maadu / Number</strong>, Paddy Sona Masoori), choose an APMC center based on remaining storage in {farmerUser.district}, and reserve your vehicle arrival slot.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('BOOKING')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow transition-all flex items-center justify-center space-x-2"
              >
                <span>Choose Center & Book Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* OPTION 2: MY ACTIVE TOKEN & MAP DIRECTIONS (After booking only) */}
            <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm hover:border-blue-400 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-black">
                  🎟️
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Active Gate Pass & Mandi Map View
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {displayToken ? (
                    <span>
                      Token <strong>#{displayToken.tokenNumber}</strong> confirmed for <strong>{displayToken.scheduledDate} ({displayToken.scheduledSlot})</strong> at {displayToken.center?.centerName || selectedCenter?.centerName}. View QR Gate Pass, live weighbridge progress, and full GPS transit map.
                    </span>
                  ) : (
                    <span>
                      No active slot booked yet. Once you book a procurement slot, your digital QR gate pass and turn-by-turn mandi location map will appear here.
                    </span>
                  )}
                </p>
              </div>

              {displayToken ? (
                <button
                  type="button"
                  onClick={() => setViewMode('TOKEN_PASS')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs shadow transition-all flex items-center justify-center space-x-2"
                >
                  <span>View Gate Pass & Mandi Map</span>
                  <Navigation className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('BOOKING')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5"
                >
                  <span>Schedule Booking to Unlock Map</span>
                </button>
              )}
            </div>

            {/* OPTION 3: PROCUREMENT CENTRES & STORAGE CAPACITY */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-black">
                  🏢
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Mandi Centres & Storage Left
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Check available storage capacity across APMC procurement centers in {farmerUser.district}, {farmerUser.state}. See remaining quintals, covered grain sheds, and operating hours.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('CENTERS')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs shadow transition-all flex items-center justify-center space-x-2"
              >
                <span>Check Mandi Storage Capacity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* OPTION 4: CROPS & SUB-CROP VARIETY CATALOG */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-black">
                  📋
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  All Crops & Sub-Crop Variety Rates
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browse government guaranteed MSP rates for all commercial and food grains, including <strong>Tobacco (Maadu, Number, Virginia)</strong>, <strong>Paddy (Sona Masoori, PR-126)</strong>, <strong>Chilli (Guntur Sannam)</strong>, and Cotton.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('CROPS')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-extrabold text-xs shadow transition-all flex items-center justify-center space-x-2"
              >
                <span>Browse Crops & Varieties</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Historical Records Link */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-700">
              <History className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold">Past Transactions & Previous Years' DBT Payment Receipts</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('HISTORY')}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold"
            >
              View Ledger →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SIMPLE SLOT BOOKING (Clean, non-heavy design!)
          ========================================================================= */}
      {viewMode === 'BOOKING' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Book Procurement Centre Slot
              </h3>
              <p className="text-xs text-slate-500">
                Simple single-screen form: State & District → Crop & Variety → Center with Storage Left → Slot Window
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('HUB')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Menu</span>
            </button>
          </div>

          {!otpStepActive ? (
            <form onSubmit={handleInitiateBookingOtp} className="space-y-4">
              {/* 1. STATE & DISTRICT SELECTION */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs border-b border-slate-100 pb-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>1. Location: State & District</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                      {ALL_INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      District in {selectedState} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. CROP & SUB-CROP VARIETY SELECTION */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs border-b border-slate-100 pb-2">
                  <span className="text-base">🌱</span>
                  <span>2. Main Crop & Sub-Crop Variety Selection</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Main Crop */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Select Main Crop (Cultivated in {selectedState}) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCropId}
                      onChange={(e) => handleCropChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableCropsForState.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.teluguName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Crop Variety (Directly below Main Crop) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Select Sub-Crop Variety of {activeMainCrop.name.split(' ')[0]} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedVarietyId}
                      onChange={(e) => setSelectedVarietyId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableVarieties.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} • ₹{v.mspRatePerQuintal.toLocaleString()}/Q
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Variety Card Display */}
                {activeVariety && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-extrabold text-emerald-950">
                        {activeVariety.name} ({activeVariety.localName})
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        {activeVariety.categoryDesc}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="text-[10px] text-emerald-800 font-semibold uppercase">Guaranteed Rate</div>
                      <div className="text-base font-black text-emerald-950 font-mono">
                        ₹{activeVariety.mspRatePerQuintal.toLocaleString()} <span className="text-xs font-normal">/ Quintal</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. PROCUREMENT CENTRE SELECTION WITH STORAGE LEFT DISPLAY */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                    <Building className="w-4 h-4 text-blue-700" />
                    <span>3. Choose Procurement Centre for {activeMainCrop.name} in {selectedDistrict}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Storage Capacity Highlighted
                  </span>
                </div>

                {availableCenters.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      No active procurement centres found for <strong>{activeMainCrop.name}</strong> in {selectedDistrict}, {selectedState}. Tobacco and non-cultivated crops in this state do not have local procurement offices.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableCenters.map((center) => {
                      const storageLeft = calculateStorageLeft(center);
                      const totalCap = center.maxCapacityQuintals || 50000;
                      const pctFree = Math.round((storageLeft / totalCap) * 100);
                      const isSelected = center.centerId === centerId;

                      return (
                        <div
                          key={center.centerId}
                          onClick={() => setCenterId(center.centerId)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-xs text-slate-900">
                                {center.centerName}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                                {center.centerId}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {center.fullAddress || `APMC Yard, ${center.district}, ${center.state}`}
                            </p>
                            <div className="text-[11px] text-slate-600 flex items-center gap-3">
                              <span>Scales: <strong>{center.activeScales || 4} Pitless Weighbridges</strong></span>
                              <span>•</span>
                              <span>Timing: <strong>{center.operatingHours || '08:00 AM – 06:00 PM'}</strong></span>
                            </div>
                          </div>

                          {/* Storage Left Display */}
                          <div className="sm:text-right min-w-[200px] p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
                            <div className="text-[10px] text-emerald-900 font-bold flex sm:justify-end items-center gap-1">
                              <Warehouse className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Storage Left in Centre:</span>
                            </div>
                            <div className="text-sm font-black text-emerald-950 font-mono">
                              {storageLeft.toLocaleString()} <span className="text-[11px] font-normal text-emerald-800">Quintals</span>
                            </div>
                            <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                              {pctFree}% Free (of {totalCap.toLocaleString()} Q capacity)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. QUANTITY & SCHEDULE ARRIVAL SLOT */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs border-b border-slate-100 pb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>4. Produce Quantity & Arrival Time Slot</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Estimated Quantity (Quintals) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={quantityQuintals === '' ? '' : quantityQuintals}
                      onChange={(e) => setQuantityQuintals(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter quantity (e.g. 50)"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Arrival Date (Today or Upcoming) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayDateStr}
                      value={scheduledDate}
                      onChange={(e) => {
                        setScheduledDate(e.target.value);
                        setScheduledSlot('');
                      }}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Arrival Slot Window (30m) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={scheduledSlot}
                      onChange={(e) => setScheduledSlot(e.target.value)}
                      disabled={!scheduledDate}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!scheduledDate ? '-- Select Arrival Date First --' : '-- Choose 30-Minute Arrival Slot --'}
                      </option>
                      {availableSlotsList.map((s) => (
                        <option key={s.slot} value={s.slot} disabled={!s.isAvailable}>
                          {s.slot} {s.isAvailable ? `(${s.remainingCapacity} slots free)` : '(FULL)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {scheduledDate === todayDateStr && availableSlotsList.length === 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      All arrival time slots for today have already passed their scheduled operating hours. Please choose tomorrow or an upcoming date for your booking.
                    </span>
                  </div>
                )}

                {/* Payout & Disbursement Preference */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Disbursement & Payout Settlement Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      id="farmer-payout-online-money-btn"
                      onClick={() => setPaymentMode('ONLINE_DBT')}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        paymentMode === 'ONLINE_DBT'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        <span className="font-extrabold text-sm">Online Money</span>
                        {paymentMode === 'ONLINE_DBT' && (
                          <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full ml-auto">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-normal text-slate-600 mt-1">
                        Direct online banking settlement into your verified bank account
                      </div>
                    </button>

                    <button
                      type="button"
                      id="farmer-payout-offline-money-btn"
                      onClick={() => setPaymentMode('OFFLINE_MANDI')}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        paymentMode === 'OFFLINE_MANDI'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <Building className="w-4 h-4 text-emerald-700" />
                        <span className="font-extrabold text-sm">Offline Take Money</span>
                        {paymentMode === 'OFFLINE_MANDI' && (
                          <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full ml-auto">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-normal text-slate-600 mt-1">
                        Collect cash directly in hand at APMC Mandi payment counter
                      </div>
                    </button>
                  </div>

                  {/* Dynamic Bank Details Form when Online Money is chosen */}
                  {paymentMode === 'ONLINE_DBT' ? (
                    <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-300 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-950 flex items-center space-x-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-700" />
                          <span>Online Banking & Account Details: <span className="text-red-500">*</span></span>
                        </span>
                        <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md">
                          Direct Bank Credit
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Bank Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. State Bank of India"
                            className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-xs shadow-xs focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Account Holder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={accountHolderName}
                            onChange={(e) => setAccountHolderName(e.target.value)}
                            placeholder="e.g. Kisan Farmer"
                            className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-xs shadow-xs focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Bank Account Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="e.g. 38910029381"
                            className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900 text-xs shadow-xs focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Bank IFSC Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                            placeholder="e.g. SBIN0001821"
                            className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900 text-xs uppercase shadow-xs focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="text-[10px] text-emerald-800 flex items-center space-x-1 font-medium bg-white/90 p-2 rounded-lg border border-emerald-200">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Payout will be disbursed electronically directly to this bank account upon Mandi tare weighing and assay clearance.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex items-center space-x-2 text-xs text-amber-900 animate-fade-in">
                      <Building className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong>Offline Take Money selected:</strong> No bank details required. Collect direct physical cash in hand at the APMC Mandi accounts payment desk upon produce handover.
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Payout Summary Preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Payout Computation:</span>
                    <div className="font-extrabold text-slate-900">
                      {quantityQuintals || 0} Quintals × ₹{activeRatePerQuintal.toLocaleString()}/Q ({activeVariety.name})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase">Total Guaranteed Payout</span>
                    <div className="text-lg font-black text-emerald-800 font-mono">
                      ₹{estimatedTotalPayment.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {slotError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{slotError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to SMS Verification & Generate Gate Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* SMS Verification Dialog for Final Booking */
            <form onSubmit={handleConfirmBooking} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full mx-auto flex items-center justify-center text-xl font-black">
                  📱
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Verify Mobile SMS OTP
                </h4>
                <p className="text-xs text-slate-500">
                  SMS verification code sent to mobile ending in <strong>••••{farmerUser.mobileNumber.slice(-4)}</strong>.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpCode(generatedOtp)}
                    className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded transition-colors"
                  >
                    Auto-Fill SMS Code: {generatedOtp}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit SMS OTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center text-lg font-black tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {slotError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{slotError}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOtpStepActive(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>{isSubmitting ? 'Confirming...' : 'Verify SMS OTP & Open Gate Pass'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DIGITAL TOKEN GATE PASS & MANDI MAP (After Booking Slot Only!)
          ========================================================================= */}
      {viewMode === 'TOKEN_PASS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Confirmed Procurement Gate Pass
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                Token #{displayToken?.tokenNumber || 'TK-1024'}
              </h3>
              <p className="text-xs text-slate-500">
                Produce arrival pass with 10-step progress and transit route map
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenPrintGatePass?.(displayToken)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Gate Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('HUB')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Back to Menu
              </button>
            </div>
          </div>

          {/* Gate Pass Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  National e-NAM Electronic Gate Pass
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {displayToken?.tokenNumber || 'TK-1024'}
                </div>
                <div className="text-xs text-slate-600">
                  Farmer: <strong className="text-slate-900">{displayToken?.farmer?.fullName || farmerUser.fullName}</strong> • Aadhaar: •••• {farmerUser.aadhaar.slice(-4)}
                </div>
                {(() => {
                  const parsed = parseCropAndVariety(
                    displayToken?.cropType || activeMainCrop.name,
                    displayToken?.cropVariety || activeVariety.name
                  );
                  return (
                    <div className="text-xs text-emerald-800 font-semibold">
                      Crop: <strong>{parsed.cropName}</strong> • Variety: <strong>{parsed.varietyName}</strong> ({displayToken?.quantityQuintals || quantityQuintals} Quintals)
                    </div>
                  );
                })()}
              </div>

              {/* QR Code Canvas */}
              <div className="flex flex-col items-center p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <canvas ref={qrCanvasRef} className="w-28 h-28" />
                <span className="text-[10px] font-mono text-emerald-900 font-bold mt-1">
                  Scan at Gate Barrier
                </span>
              </div>
            </div>

            {/* Mandi & Time Slot Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold">Procurement Yard:</span>
                <div className="font-extrabold text-slate-900 mt-0.5">
                  {displayToken?.center?.centerName || selectedCenter?.centerName}
                </div>
                <p className="text-[11px] text-slate-500">
                  {displayToken?.center?.district || selectedDistrict}, {displayToken?.center?.state || selectedState}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold">Scheduled Arrival:</span>
                <div className="font-extrabold text-slate-900 mt-0.5">
                  {displayToken?.scheduledDate || scheduledDate}
                </div>
                <p className="text-[11px] text-emerald-800 font-bold">
                  {displayToken?.scheduledSlot || scheduledSlot}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-900 font-semibold">Guaranteed DBT Payment:</span>
                <div className="text-base font-black text-emerald-950 font-mono mt-0.5">
                  ₹{(displayToken?.totalAmount || estimatedTotalPayment).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-emerald-800">
                  APBS Direct Treasury Transfer
                </p>
              </div>
            </div>

            {/* Mandi In-Charge Officer Contact & Verification Call */}
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>Mandi Officer: {displayToken?.center?.officerInchargeName || selectedCenter?.officerInchargeName || 'Sri K. Venkata Reddy'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold border border-blue-200">
                      Procurement Officer
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>Officer Mobile: <strong className="font-mono text-blue-950 font-bold">+91 {displayToken?.center?.contactNumber || selectedCenter?.contactNumber || '9848022340'}</strong></span>
                    <span>•</span>
                    <span>Call to verify gate entry, weighbridge slot, or payment details</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${(displayToken?.center?.contactNumber || selectedCenter?.contactNumber || '9848022340').replace(/[^0-9]/g, '')}`}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5 whitespace-nowrap shrink-0"
              >
                <Phone className="w-4 h-4 text-emerald-300" />
                <span>Call Mandi Officer</span>
              </a>
            </div>

            {/* 10-Stage Sequential Mandi Workflow with Full Descriptive Details */}
            <div className="pt-2 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      10-Stage Mandi Sequential Workflow
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[11px] self-start sm:self-auto">
                    Active: Stage {displayToken?.currentStageIndex || 1} of 10 — {PROCUREMENT_STAGES[(displayToken?.currentStageIndex || 1) - 1]?.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Track your grain procurement progress from entry gate to bank account settlement. Each sequential stage ensures transparent weighing, automated quality grading, and direct government payment without middlemen.
                </p>
              </div>

              {/* 10-Stage Detailed Cards with Full Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {[
                  {
                    stage: 1,
                    title: 'Stage 1: Registration & e-KYC',
                    desc: 'Farmer Aadhaar, land records, and crop sowing certificates verified online.',
                    icon: '📝',
                  },
                  {
                    stage: 2,
                    title: 'Stage 2: Slot Scheduled',
                    desc: 'Designated 30-minute vehicle arrival window assigned to avoid mandi congestion.',
                    icon: '🎫',
                  },
                  {
                    stage: 3,
                    title: 'Stage 3: Mandi Gate Arrival',
                    desc: 'Digital QR gate pass scanned by RFID/barrier camera at entrance weighbridge.',
                    icon: '🚜',
                  },
                  {
                    stage: 4,
                    title: 'Stage 4: Quality Assaying',
                    desc: 'Randomized produce sample tested for moisture %, foreign matter, and FAQ standard.',
                    icon: '🔬',
                  },
                  {
                    stage: 5,
                    title: 'Stage 5: Gross Weighment',
                    desc: 'Loaded tractor or truck weighed on certified pitless digital weighbridge.',
                    icon: '⚖️',
                  },
                  {
                    stage: 6,
                    title: 'Stage 6: Produce Accepted',
                    desc: 'Official quality clearance issued and produce unloaded into procurement storage.',
                    icon: '✅',
                  },
                  {
                    stage: 7,
                    title: 'Stage 7: Tare Weighment',
                    desc: 'Empty vehicle re-weighed to compute exact net crop weight in Quintals.',
                    icon: '📊',
                  },
                  {
                    stage: 8,
                    title: 'Stage 8: e-J-Form Issued',
                    desc: 'Legally binding official Mandi purchase invoice and sale memo generated.',
                    icon: '📄',
                  },
                  {
                    stage: 9,
                    title: 'Stage 9: APBS Mandate Sent',
                    desc: 'Payment mandate transmitted to Public Financial Management System (PFMS).',
                    icon: '🏦',
                  },
                  {
                    stage: 10,
                    title: 'Stage 10: DBT Payout Credited',
                    desc: 'Guaranteed MSP funds credited directly to farmer\'s bank account with UTR.',
                    icon: '💰',
                  },
                ].map((item) => {
                  const currentIdx = displayToken?.currentStageIndex || 1;
                  const isPassed = item.stage < currentIdx;
                  const isCurrent = item.stage === currentIdx;

                  return (
                    <div
                      key={item.stage}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-1.5 ${
                        isCurrent
                          ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                          : isPassed
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-base">{item.icon}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            S{item.stage}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            isPassed
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isPassed ? '✓ Done' : isCurrent ? '▶ Current' : 'Pending'}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                          {item.title}
                        </h5>
                        <p className="text-[10px] text-slate-600 leading-normal mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 10 Payment Settlement Details (If Completed or Online UTR Shared / Offline Cash Given) */}
            {((displayToken?.currentStageIndex || 1) >= 10 || displayToken?.status === 'COMPLETED' || displayToken?.dbtPayment?.paymentStatus === 'COMPLETED') && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2.5 text-xs text-emerald-950 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm flex items-center space-x-1.5 text-emerald-900">
                    <Receipt className="w-4 h-4 text-emerald-700" />
                    <span>Mandi Payment Disbursal & Receipt Record</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px] shadow-sm">
                    ✓ PAYMENT SUCCESS
                  </span>
                </div>

                {displayToken?.dbtPayment?.paymentMode === 'OFFLINE_MANDI' ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold block">Settlement Mode:</span>
                        <span className="font-bold text-slate-900">Offline Mandi Cash Payout</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold block">Cash Treasury Voucher:</span>
                        <span className="font-mono font-bold text-slate-900">{displayToken.dbtPayment.voucherNumber || 'CSH-MND-4821'}</span>
                      </div>
                    </div>

                    {displayToken.dbtPayment.offlineProofPhotoUrl && (
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Officer Cash Handover Photo Proof:</span>
                        </span>
                        <div className="rounded-lg overflow-hidden border border-slate-200 max-h-40 bg-slate-900">
                          <img
                            src={displayToken.dbtPayment.offlineProofPhotoUrl}
                            alt="Cash handover verification proof"
                            className="w-full h-36 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold block">Settlement Mode:</span>
                        <span className="font-bold text-slate-900">Online Direct Bank Transfer (DBT / APBS)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold block">Bank UTR Transaction Number:</span>
                        <span className="font-mono font-black text-emerald-900">{displayToken?.dbtPayment?.utrNumber || 'UTR-SBI-20260906-9812401'}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-800 flex items-center space-x-1.5 bg-white p-2 rounded-lg border border-emerald-200">
                      <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>The Mandi Officer has officially shared this UTR receipt. Funds are credited to your Aadhaar-linked bank account.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              CRITICAL USER REQUIREMENT:
              "add that procurement centre location as map view to reach centres easly that farmer will know the direction of centres after booking slot only show the location of center"
              ========================================================================= */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>Procurement Centre Location & Directions Map View</span>
            </h4>
            <p className="text-xs text-slate-500">
              Interactive route, compound gates, weighbridge scale, and direct Google Maps navigation for {displayToken?.center?.centerName || selectedCenter?.centerName}
            </p>

            {/* Mandi Location Map View */}
            <MandiLocationMapView
              center={displayToken?.center || selectedCenter}
              farmerDistrict={farmerUser.district}
              farmerState={farmerUser.state}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: MANDI CENTRES & STORAGE CAPACITY
          ========================================================================= */}
      {viewMode === 'CENTERS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Procurement Centres in {selectedDistrict}, {selectedState}
              </h3>
              <p className="text-xs text-slate-500">
                Live remaining storage capacity across government APMC mandis and warehouse yards
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('HUB')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Crop-Specific Filter Indicator */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">Showing Centres for:</span>
              <span className="font-extrabold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                🌱 {activeMainCrop.name} Only
              </span>
            </div>
            <div className="flex items-center space-x-1 overflow-x-auto">
              {availableCropsForState.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCropChange(c.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    selectedCropId === c.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCenters.map((center) => {
              const storageLeft = calculateStorageLeft(center);
              const totalCap = center.maxCapacityQuintals || 50000;
              const freePct = Math.round((storageLeft / totalCap) * 100);

              return (
                <div
                  key={center.centerId}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {center.centerName}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          Code: {center.centerId}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        freePct > 30 ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {freePct}% Free
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{center.fullAddress || `APMC Market Yard Complex, ${center.district}, ${center.state}`}</span>
                    </p>

                    {/* Storage Progress Bar */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-950 flex items-center gap-1">
                          <Warehouse className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Storage Left:</span>
                        </span>
                        <span className="font-mono font-black text-emerald-950">
                          {storageLeft.toLocaleString()} Q / {totalCap.toLocaleString()} Q
                        </span>
                      </div>
                      <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(5, freePct))}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div>Electronic Scales: <strong>{center.activeScales || 4} Certified Weighbridges</strong></div>
                      <div>Operating Hours: <strong>{center.operatingHours || '08:00 AM – 06:00 PM'}</strong></div>
                      <div>In-charge: <strong>{center.officerInchargeName || 'Sri K. Venkata Reddy'}</strong> ({center.contactNumber || '0863-2234-890'})</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCenterId(center.centerId);
                      setViewMode('BOOKING');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5"
                  >
                    <span>Book Arrival Slot at this Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: COMPREHENSIVE CROPS & SUB-CROP VARIETIES CATALOG
          ========================================================================= */}
      {viewMode === 'CROPS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                All Agricultural Crops & Sub-Crop Varieties
              </h3>
              <p className="text-xs text-slate-500">
                Official MSP & procurement rates for all authentic varieties (Tobacco Maadu/Number, Paddy Sona Masoori, Chilli, Cotton, etc.)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('HUB')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="space-y-4">
            {COMPREHENSIVE_CROPS.map((crop) => (
              <div
                key={crop.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="font-black text-base text-slate-900">
                      {crop.name} <span className="text-xs text-slate-500 font-normal">({crop.teluguName})</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Category: <strong className="text-slate-700 capitalize">{crop.category}</strong> • Season: <strong className="text-slate-700">{crop.season}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCropId(crop.id);
                      setViewMode('BOOKING');
                    }}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm"
                  >
                    Book Slot for {crop.name.split(' ')[0]} →
                  </button>
                </div>

                {/* Varieties Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  {crop.varieties.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-extrabold text-xs text-slate-900">
                            {v.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-emerald-800">
                            ₹{v.mspRatePerQuintal.toLocaleString()}/Q
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                          {v.categoryDesc}
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Local: {v.localName}</span>
                        <span className="font-semibold text-emerald-700">{v.qualityGrade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: HISTORICAL LEDGER
          ========================================================================= */}
      {viewMode === 'HISTORY' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Farmer Procurement History & Receipts
              </h3>
              <p className="text-xs text-slate-500">
                Permanent ledger of all previous gate passes, weight receipts, and DBT bank disbursements
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('HUB')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <FarmerHistoryLedger
            farmer={farmerUser}
            pastBookings={farmerData.pastBookings}
            onSelectBooking={(token) => {
              // Could preview token
            }}
          />
        </div>
      )}
    </div>
  );
};
