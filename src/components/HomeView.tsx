import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  LogIn,
  LogOut,
  ShieldCheck,
  Building,
  User,
  PhoneCall,
  Lock,
  Sparkles,
  Ticket,
  BookOpen,
  FileText,
  Snowflake,
  Shield,
  Activity,
  Calendar,
  Clock,
  QrCode,
  MapPin,
  Scale,
  Printer,
  Radio,
} from 'lucide-react';
import { FarmerUser, MandiOfficerUser, UserRole, DashboardStats, Token } from '../types.ts';

interface HomeViewProps {
  stats?: DashboardStats;
  setActiveView: (view: string) => void;
  langText: Record<string, string>;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  farmerUser: FarmerUser | null;
  officerUser: MandiOfficerUser | null;
  activeToken?: Token | null;
  onOpenAuthModal: (role?: 'farmer' | 'officer') => void;
  onLogout?: (role: 'farmer' | 'officer') => void;
  onOpenPrintGatePass?: (token?: Token | null) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  setActiveView,
  langText,
  userRole,
  setUserRole,
  farmerUser,
  officerUser,
  activeToken,
  onOpenAuthModal,
  onLogout,
  onOpenPrintGatePass,
}) => {
  // Case 1: Farmer is logged in -> Show ONLY Farmer Essentials
  if (farmerUser) {
    return (
      <div className="min-h-[85vh] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-8">
        {/* Farmer Authenticated Status Banner */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified Farmer Session
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aadhaar e-KYC Active</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Namaste, {farmerUser.fullName}
              </h1>
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <span>Aadhaar: <strong className="font-mono text-emerald-800">•••• •••• {farmerUser.aadhaar.slice(-4)}</strong></span>
                <span>•</span>
                <span>Mobile: <strong className="font-mono">{farmerUser.mobileNumber}</strong></span>
                <span>•</span>
                <span>Location: <strong>{farmerUser.district}, {farmerUser.state}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              id="home-farmer-logout-btn"
              onClick={() => onLogout?.('farmer')}
              className="w-full sm:w-auto py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Session</span>
            </button>
          </div>
        </div>

        {/* Active Booked Mandi Token Pass (Only if farmer has an active token) */}
        {activeToken && (
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl text-white p-6 shadow-md border border-emerald-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-200 text-[11px] font-bold">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Active Mandi Delivery Pass</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Token #{activeToken.tokenNumber} • {activeToken.cropType}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-100">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>Slot: <strong>{activeToken.scheduledDate} ({activeToken.scheduledSlot})</strong></span>
                  </span>
                  <span>•</span>
                  <span>Quantity: <strong>{activeToken.quantityQuintals} Quintals</strong></span>
                  <span>•</span>
                  <span>Stage: <strong className="text-amber-300">{activeToken.stageName}</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                {onOpenPrintGatePass && (
                  <button
                    onClick={() => onOpenPrintGatePass(activeToken)}
                    className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-sm transition-all flex items-center space-x-2"
                    title="Print your Mandi E-Gate Pass directly"
                  >
                    <Printer className="w-4 h-4 text-slate-950" />
                    <span>Print Gate Pass</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setUserRole('farmer');
                    setActiveView('farmer');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-600 transition-all flex items-center space-x-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Farmer Essentials Hub - 5 Exclusive Farmer Sites */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-900">
              Farmer Procurement Essentials
            </h2>
            <p className="text-xs text-slate-500">
              Official services available for your verified Aadhaar account
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Book Slot & Token */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                  🚜
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Book Slot & Token
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Schedule your harvest delivery slot, receive an express QR gate token pass, and bypass mandi road traffic.
                </p>
              </div>
              <button
                onClick={() => {
                  setUserRole('farmer');
                  setActiveView('farmer');
                }}
                className="mt-5 w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Book Mandi Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. How to Register Crop */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                  📝
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  How to Register Crop
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Meri Fasal Mera Byora & e-Uparjan crop registration guidance, land revenue linkage, and document checklist.
                </p>
              </div>
              <button
                onClick={() => setActiveView('crop-registration')}
                className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>View Registration Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Farmer Essentials (MSP & Docs) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                  🌾
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Farmer Essentials (MSP & Docs)
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Guaranteed Minimum Support Price (MSP) rate calculator, fair average quality (FAQ) standards, and DBT bank checklist.
                </p>
              </div>
              <button
                onClick={() => setActiveView('farmer-essentials')}
                className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Explore Essentials & MSP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Cold Storage */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                  ❄️
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Cold Storage Network
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Certified cold storage warehouses near your village, real-time chamber vacancy, and 50% government storage subsidy.
                </p>
              </div>
              <button
                onClick={() => setActiveView('cold-storage')}
                className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Find Nearby Cold Storage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5. Print Official Mandi Gate Pass & Historical Receipts */}
            <div className="bg-white rounded-2xl border border-emerald-300 p-5 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between group bg-gradient-to-b from-white to-emerald-50/30">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm">
                    🖨️
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activeToken
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {activeToken ? 'Pass Ready' : 'Print & Download'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {activeToken ? 'Print Mandi E-Gate Pass' : 'Mandi E-Gate Pass & Receipts'}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {activeToken
                    ? 'Official Government APMC e-Gate Pass with scannable 2D QR Code and 1D barcode for instant weighbridge entry.'
                    : 'Schedule your produce procurement slot to generate verified APMC gate pass and view past year receipts.'}
                </p>
              </div>

              {activeToken ? (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (onOpenPrintGatePass) {
                        onOpenPrintGatePass(activeToken);
                      } else {
                        setUserRole('farmer');
                        setActiveView('farmer');
                      }
                    }}
                    className="w-full py-2.5 px-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Pass</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('farmer');
                      setActiveView('farmer');
                    }}
                    className="w-full py-2.5 px-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-emerald-950 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setUserRole('farmer');
                    setActiveView('farmer');
                  }}
                  className="mt-5 w-full py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>Book Slot & Generate Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security & Helpline Footer */}
        <div className="pt-6 border-t border-slate-200 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NIC e-Governance Secured & 256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Toll-Free Kisan Call Centre: <strong>1800-180-1551</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Mandi Officer is logged in -> Show ONLY Officer Essentials
  if (officerUser) {
    return (
      <div className="min-h-[85vh] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-8">
        {/* Officer Authenticated Status Banner */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
              🏢
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Mandi Official Terminal
                </span>
                <span className="text-xs text-blue-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Terminal Connected</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {officerUser.mandiName}
              </h1>
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <span>Office Code: <strong className="font-mono text-blue-800">{officerUser.mandiOfficeCode}</strong></span>
                <span>•</span>
                <span>Authorized Officer: <strong>{officerUser.officerName}</strong> ({officerUser.officerId})</span>
                <span>•</span>
                <span>Weighbridge Scale: <strong>#{officerUser.scaleNumber}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              id="home-officer-logout-btn"
              onClick={() => onLogout?.('officer')}
              className="w-full sm:w-auto py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Terminal</span>
            </button>
          </div>
        </div>

        {/* Officer Main Operations Console */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Scale className="w-3.5 h-3.5" />
              <span>Ten-Step Standard Operating Procedure (SOP) Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Officer Operations Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Full procurement execution: Gate Inward QR Scanning, Electronic Weighbridge Gross Weight (W-1), Moisture & FAQ Grain Assay, Lot Stacking & Bagging, Weighbridge Tare Weight (W-2), J-Form / I-Form Issuance, Treasury DBT Approval, and Mandi Outward Gate Pass generation.
            </p>
          </div>

          <button
            onClick={() => {
              setUserRole('officer');
              setActiveView('officer');
            }}
            className="w-full md:w-auto py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <span>Launch Officer Desk Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Yard Operational Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Active Scales</span>
            <div className="text-2xl font-black text-slate-900 mt-1">4 Scales Active</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Calibrated & Certified</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Daily Inward Intake</span>
            <div className="text-2xl font-black text-blue-900 mt-1">2,450 Quintals</div>
            <span className="text-[11px] text-blue-600 font-semibold">Wheat & Paddy Common</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Warehouse Storage Saturation</span>
            <div className="text-2xl font-black text-slate-900 mt-1">68% Capacity</div>
            <span className="text-[11px] text-amber-600 font-semibold">Optimal flow maintained</span>
          </div>
        </div>

        {/* Security & Helpline Footer */}
        <div className="pt-6 border-t border-slate-200 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>NIC e-Procurement Mandi Gateway • SSL Encrypted</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Building className="w-4 h-4 text-blue-600" />
            <span>APMC Mandi Yard Operations Protocol 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Default Public / Guest View -> Show ONLY Farmer Login & Mandi Office Login cards
  return (
    <div className="min-h-[80vh] py-10 px-4 sm:px-6 max-w-5xl mx-auto w-full flex flex-col justify-center space-y-8">
      {/* Official Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>National Agricultural Procurement Grid • Govt. of India</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Krishi Annapurna Mandi Procurement Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Centralized public procurement ecosystem connecting farmers directly with government APMC mandis. Please authenticate to access produce slot booking, digital gate passes, and mandi operations.
        </p>
      </div>

      {/* Two Login Cards Only - Farmer Login and Mandi Office Login */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        {/* 1. Farmer Login Card */}
        <div className="bg-white rounded-2xl border-2 border-emerald-300 p-6 sm:p-8 shadow-lg hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-60 pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-3xl shadow-md group-hover:scale-105 transition-transform">
                🌾
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                Farmer Gateway
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                Farmer Login
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Login with your 10-digit mobile number to receive instant SMS OTP verification. Book mandi arrival slots, download APMC e-Gate Passes, and track DBT payment settlements.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              id="home-farmer-login-main-btn"
              onClick={() => onOpenAuthModal('farmer')}
              className="w-full py-3.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Farmer Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Mandi Office Login Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-60 pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl shadow-md group-hover:scale-105 transition-transform">
                🏢
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                Official Staff
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                Mandi Office Login
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Dedicated terminal login for authorized APMC Mandi Officers, Assayers, and Weighbridge Operators. Access the 10-step procurement execution console, weighbridges, and DBT payment clearance.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              id="home-officer-login-main-btn"
              onClick={() => onOpenAuthModal('officer')}
              className="w-full py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Building className="w-4 h-4 text-blue-400" />
              <span>Mandi Office Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Helpline Footer Strip */}
      <div className="pt-6 border-t border-slate-200 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NIC e-Governance Secured & 256-Bit SSL Encrypted</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>Real-Time Mandi Network & Instant SMS Gateway Active</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <PhoneCall className="w-4 h-4 text-emerald-600" />
          <span>Toll-Free Kisan Call Centre: <strong>1800-180-1551</strong></span>
        </div>
      </div>
    </div>
  );
};
