import React, { useState, useRef } from 'react';
import {
  Building2,
  Megaphone,
  FlaskConical,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FastForward,
  Layers,
  Mic,
  MicOff,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Upload,
  LogIn,
  LogOut,
  Building,
  ShieldCheck,
  ClipboardList,
  Check,
  Search,
  MapPin,
  UserCheck,
  Phone,
  Filter,
  FileText,
  Printer,
  Ticket,
  X,
} from 'lucide-react';
import { Token, MandiOfficerUser } from '../types.ts';
import { OfficerTenStepConsole } from './OfficerTenStepConsole.tsx';

interface OfficerDeskViewProps {
  tokens: Token[];
  onCallNextToken: () => Promise<void>;
  onAdvanceStage: (tokenNumber: string, targetStageIndex?: number) => Promise<void>;
  onSaveQc: (qcData: any) => Promise<void>;
  onRefreshTokens: () => void;
  onRedirectToGis: () => void;
  lastCalledToken: Token | null;
  officerUser?: MandiOfficerUser | null;
  onOpenAuthModal?: (role?: 'farmer' | 'officer') => void;
  onLogout?: (role?: 'farmer' | 'officer') => void;
  onQuickLoginOfficer?: () => void;
  onOpenPrintGatePass?: (token: Token) => void;
}

export const OfficerDeskView: React.FC<OfficerDeskViewProps> = ({
  tokens,
  onCallNextToken,
  onAdvanceStage,
  onSaveQc,
  onRefreshTokens,
  onRedirectToGis,
  lastCalledToken,
  officerUser,
  onOpenAuthModal,
  onLogout,
  onQuickLoginOfficer,
  onOpenPrintGatePass,
}) => {
  // Navigation tabs for the Mandi Office Workspace
  const [deskTab, setDeskTab] = useState<'console' | 'queue' | 'qc' | 'storage'>('console');
  const [selectedConsoleTokenNumber, setSelectedConsoleTokenNumber] = useState<string>(
    lastCalledToken?.tokenNumber || tokens[0]?.tokenNumber || 'P-1024'
  );

  // Search & Filter State for Mandi Queue
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Token Pass Search Modal State
  const [isPassSearchModalOpen, setIsPassSearchModalOpen] = useState(false);
  const [passSearchQuery, setPassSearchQuery] = useState('');

  // Quality Assay Form State
  const [qcTokenNumber, setQcTokenNumber] = useState(lastCalledToken?.tokenNumber || 'P-1024');
  const [moisture, setMoisture] = useState<number>(13.5);
  const [foreignMatter, setForeignMatter] = useState<number>(0.8);
  const [grade, setGrade] = useState('Grade A');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [qcFeedback, setQcFeedback] = useState<string | null>(null);

  // Gemini Audio Speech-to-Text for Officer Remarks
  const [qcRemarks, setQcRemarks] = useState<string>(
    'Fair Average Quality (FAQ) certified. Kernels mature, moisture compliant with FCI procurement norms.'
  );
  const [isRecordingRemarks, setIsRecordingRemarks] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Gemini Flash Image Produce Visual Quality Reference
  const [samplePrompt, setSamplePrompt] = useState<string>(
    'Macro detailed photo of Fair Average Quality (FAQ) Grade A Sharbati Indian Wheat grains on a stainless steel assay tray, uniform amber kernels, clean husk, 12% moisture.'
  );
  const [sampleImageUrl, setSampleImageUrl] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState<boolean>(false);

  const handleStartRecordingRemarks = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const res = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio }),
            });
            const data = await res.json();
            if (data.transcript) {
              setQcRemarks((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
            }
          } catch (err) {
            console.error('Transcription error:', err);
          }
        };
      };

      mr.start();
      setIsRecordingRemarks(true);
    } catch (err) {
      console.warn('Microphone error:', err);
      alert('Microphone permission required for voice notes.');
    }
  };

  const handleStopRecordingRemarks = () => {
    if (mediaRecorderRef.current && isRecordingRemarks) {
      mediaRecorderRef.current.stop();
      setIsRecordingRemarks(false);
    }
  };

  const handleGenerateSampleReference = async () => {
    if (isGeneratingSample) return;
    setIsGeneratingSample(true);
    try {
      const res = await fetch('/api/ai/generate-sample-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: samplePrompt,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSampleImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error('Image sample generation error:', err);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const waitingCount = tokens.filter((t) => t.status === 'WAITING').length;
  const inProgressCount = tokens.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tokens.filter((t) => t.status === 'COMPLETED').length;

  const handleEvaluateQc = async () => {
    setIsEvaluating(true);
    try {
      await onSaveQc({
        tokenNumber: qcTokenNumber,
        moisturePercentage: moisture,
        foreignMatterPercentage: foreignMatter,
        cropGrade: grade,
      });
      const passed = moisture <= 17.0 && foreignMatter <= 2.0;
      setQcFeedback(
        passed
          ? `QC PASSED: ${grade} accepted. Saved to official procurement records.`
          : 'QC REJECTED: Moisture exceeds standard FCI limits.'
      );
    } catch (err) {
      console.error('QC evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // If officer is not logged in, show dedicated login card with instant 1-click credentials
  if (!officerUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner">
          🏢
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Authorized Mandi Personnel Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Mandi Officer Authentication Required
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            The 10-Step Procurement Operations Console and weighbridge controls are strictly restricted to authorized APMC Mandi Staff.
          </p>
        </div>

        <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-left text-xs text-blue-950 space-y-2 max-w-md mx-auto">
          <div className="font-extrabold flex items-center space-x-1.5 text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Official Office Site Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>Yard Code: <strong>MND-GUNTUR-01</strong></div>
            <div>Staff ID: <strong>OFF-AP-GNT-01</strong></div>
            <div>Officer: <strong>Sri K. Venkata Reddy</strong></div>
            <div>State/Dist: <strong>Andhra Pradesh (Guntur)</strong></div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuthModal?.('officer')}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mandi Officer Login / New Yard Registration</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Mandi Officer Authentication & Terminal Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-blue-50 rounded-2xl border border-blue-300 text-xs shadow-sm">
        <div className="flex items-center space-x-2.5 text-blue-950">
          <span className="text-xl">🏢</span>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">
              Terminal Active: <span className="text-blue-800 font-bold">{officerUser.officerName}</span>
            </div>
            <div className="text-[11px] text-blue-800 font-mono">
              Office Code: {officerUser.mandiOfficeCode} • {officerUser.mandiName} • ID: {officerUser.officerId} (Scale #{officerUser.scaleNumber})
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPassSearchModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
            title="Search and verify digital token gate pass"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Search Token Pass</span>
          </button>

          <button
            type="button"
            id="officer-desk-logout-btn"
            onClick={() => onLogout?.('officer')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
            title="Logout Mandi Officer Terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Terminal</span>
          </button>
        </div>
      </div>

      {/* TOP NOTIFICATION FOR OFFICER SITE: Shown when all 10 stages are completed */}
      {(() => {
        const activeTok = tokens.find(t => t.tokenNumber === (lastCalledToken?.tokenNumber || selectedConsoleTokenNumber)) || tokens[0];
        const isCompleted = activeTok && (
          activeTok.status === 'COMPLETED' ||
          (activeTok.currentStageIndex || 1) >= 10 ||
          activeTok.dbtPayment?.paymentStatus === 'COMPLETED' ||
          activeTok.paymentDetails?.paymentStatus === 'COMPLETED'
        );

        if (!isCompleted || !activeTok) return null;

        return (
          <div
            id="officer-site-top-all-stages-completed"
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-2 border-emerald-400 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
          >
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                ✓
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-white text-base tracking-wider bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-600">
                    {activeTok.tokenNumber}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>ALL STAGES COMPLETED & DISBURSED</span>
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-bold">
                    10 of 10 Stages Finished
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium mt-1">
                  Farmer <strong>{activeTok.farmer?.fullName || activeTok.farmerName}</strong> • {activeTok.cropType} ({activeTok.quantityQuintals} Quintals) — Mandi Inward Gate, Tare Weighing, Moisture & Quality Assay, e-J-Form, Warehousing, and Final Payout have all been completed and certified.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-emerald-950/80 p-3 rounded-xl border border-emerald-500/50 self-start md:self-auto">
              <div className="text-left">
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
                  Disbursed Payout
                </span>
                <div className="font-mono font-black text-emerald-300 text-lg">
                  ₹{(activeTok.totalAmount || activeTok.quantityQuintals * (activeTok.mspRate || 2425)).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-black text-xs uppercase shadow-sm">
                COMPLETED
              </div>
            </div>
          </div>
        );
      })()}

      {/* Officer Command Desk Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
        <div>
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Operational Command Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Procurement Operations & Sequential Workflow Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            <strong className="text-white">{officerUser?.mandiName || 'Guntur Chilli Dedicated APMC Yard'}</strong> • District: <strong className="text-amber-300">{officerUser?.district || 'Guntur'}</strong>, State: <strong className="text-amber-300">{officerUser?.state || 'Andhra Pradesh'}</strong> • Staff ID: <strong className="text-white font-mono">{officerUser?.officerId || 'OFF-AP-GNT-01'}</strong> • Desk Scale #{officerUser?.scaleNumber || 1} • Officer Contact: <strong className="text-emerald-300 font-mono">{officerUser?.mobileNumber || '9848022340'}</strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {(() => {
            const activeTok = tokens.find(t => t.tokenNumber === (lastCalledToken?.tokenNumber || selectedConsoleTokenNumber)) || tokens[0];
            return (
              <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl min-w-[280px]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                  <span>Current Called Token</span>
                  <span className="text-emerald-400 font-mono font-black text-xs">{activeTok?.tokenNumber || 'P-1024'}</span>
                </div>
                <div className="mt-1">
                  <div className="text-sm font-extrabold text-white truncate">
                    {activeTok?.farmer?.fullName || activeTok?.farmerName || 'Farmer'}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-300 font-mono mt-0.5">
                    <span>Aadhaar: <strong className="text-white">{activeTok?.farmer?.aadhaarMasked || activeTok?.aadhaar || 'XXXX-XXXX-3918'}</strong></span>
                    <span>•</span>
                    <span>Mobile: <strong className="text-white">{activeTok?.farmer?.phoneNumber || activeTok?.phoneNumber || '9848022319'}</strong></span>
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-1 truncate">
                    🏢 {activeTok?.center?.centerName || activeTok?.centerName || officerUser?.mandiName || 'Guntur Chilli Dedicated APMC Yard'} ({activeTok?.center?.district || activeTok?.district || officerUser?.district || 'Guntur'}, {activeTok?.center?.state || activeTok?.state || officerUser?.state || 'Andhra Pradesh'})
                  </div>
                </div>
              </div>
            );
          })()}

          <button
            onClick={onCallNextToken}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 h-full"
          >
            <Megaphone className="w-4 h-4 animate-bounce" />
            <span>Call Next Token</span>
          </button>
        </div>
      </div>

      {/* Real-time Mandi Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Farmers Scheduled</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5 font-mono">250</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Farmers Arrived</div>
          <div className="text-lg font-extrabold text-blue-700 mt-0.5 font-mono">182</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Completed Today</div>
          <div className="text-lg font-extrabold text-emerald-700 mt-0.5 font-mono">
            {completedCount || 145}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Currently Waiting</div>
          <div className="text-lg font-extrabold text-amber-600 mt-0.5 font-mono">
            {waitingCount || 37}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">In Progress</div>
          <div className="text-lg font-extrabold text-purple-700 mt-0.5 font-mono">
            {inProgressCount || 15}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-sm">
          <div className="text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-1">
            <Warehouse className="w-3.5 h-3.5 text-emerald-700" />
            <span>Storage Left</span>
          </div>
          <div className="text-lg font-black text-emerald-950 mt-0.5 font-mono">28,500 Q</div>
          <div className="text-[10px] text-emerald-700 font-semibold">57% Available</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Avg Turnaround</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5 font-mono">18 min</div>
        </div>
      </div>

      {/* Office Workspace Navigation Tabs & Quick Token Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDeskTab('console')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center space-x-2 ${
              deskTab === 'console'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FastForward className="w-4 h-4 text-amber-300" />
            <span>⚡ 10-Step Sequential Stage Console</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-900 text-white text-[10px] font-mono">
              Primary
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDeskTab('queue')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
              deskTab === 'queue'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Mandi Token Queue & Registry</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
              {tokens.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDeskTab('qc')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
              deskTab === 'qc'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>QC Lab & Visual AI Assay</span>
          </button>

          <button
            type="button"
            onClick={() => setDeskTab('storage')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
              deskTab === 'storage'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>Storage Saturation & Yard Monitor</span>
          </button>
        </div>

        {/* Quick Search Token Pass on Officer Desk */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={passSearchQuery}
              onChange={(e) => {
                setPassSearchQuery(e.target.value);
                const q = e.target.value.toLowerCase().trim();
                if (q) {
                  const found = tokens.find(
                    (t) =>
                      (t.tokenNumber || '').toLowerCase().includes(q) ||
                      (t.farmer?.phoneNumber || t.phoneNumber || '').includes(q) ||
                      (t.farmer?.fullName || t.farmerName || '').toLowerCase().includes(q)
                  );
                  if (found) {
                    setSelectedConsoleTokenNumber(found.tokenNumber);
                    setDeskTab('console');
                  }
                }
              }}
              placeholder="Search Token Pass / Phone..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsPassSearchModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center space-x-1.5 transition-colors whitespace-nowrap shadow-xs"
            title="Open Token Pass Search & Gate Pass Modal"
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-700" />
            <span>Search Pass</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 10-Step Sequential Stage Console */}
      {deskTab === 'console' && (
        <OfficerTenStepConsole
          tokens={tokens}
          selectedTokenNumber={selectedConsoleTokenNumber}
          onSelectToken={(num) => setSelectedConsoleTokenNumber(num)}
          onAdvanceStage={onAdvanceStage}
          officerUser={officerUser}
          onQuickLoginOfficer={onQuickLoginOfficer}
        />
      )}

      {/* TAB 2: Live Mandi Token Queue Table */}
      {deskTab === 'queue' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Live Farmer Procurement Tokens at Mandi</span>
              </h2>
              <p className="text-xs text-slate-500">
                Accurate real-time farmer names, Aadhaar, verified mobile numbers, and procurement center locations as booked by farmers.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsPassSearchModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
                title="Search and view token gate pass"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Search Token Pass</span>
              </button>
              <button
                onClick={onRefreshTokens}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Refresh</span>
              </button>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {tokens.length} Records
              </span>
            </div>
          </div>

          {/* Search and Status Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search token pass #, farmer name, mobile number, Aadhaar, center, district..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(['ALL', 'WAITING', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Tokens' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          {(() => {
            const filtered = tokens.filter((tok) => {
              const name = (tok.farmer?.fullName || tok.farmerName || tok.farmerId || '').toLowerCase();
              const tokenNum = (tok.tokenNumber || '').toLowerCase();
              const aadhaar = (tok.farmer?.aadhaarMasked || tok.aadhaar || '').toLowerCase();
              const phone = (tok.farmer?.phoneNumber || tok.phoneNumber || '').toLowerCase();
              const center = (tok.center?.centerName || tok.centerName || '').toLowerCase();
              const district = (tok.center?.district || tok.district || tok.farmer?.district || '').toLowerCase();
              const state = (tok.center?.state || tok.state || tok.farmer?.state || '').toLowerCase();
              const q = searchTerm.toLowerCase().trim();

              const matchesSearch =
                !q ||
                name.includes(q) ||
                tokenNum.includes(q) ||
                aadhaar.includes(q) ||
                phone.includes(q) ||
                center.includes(q) ||
                district.includes(q) ||
                state.includes(q);

              const matchesStatus = statusFilter === 'ALL' || tok.status === statusFilter;

              return matchesSearch && matchesStatus;
            });

            return (
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[550px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-200 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-3">Token No.</th>
                      <th className="p-3">Farmer Details</th>
                      <th className="p-3">Procurement Centre & Location</th>
                      <th className="p-3">Crop & Qty</th>
                      <th className="p-3">Slot Time</th>
                      <th className="p-3">Current Stage</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Payment & DBT Method</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          No token records matching your search query.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((tok) => (
                        <tr key={tok.tokenNumber} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <div className="text-sm text-emerald-800 font-extrabold">{tok.tokenNumber}</div>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-semibold">
                              QUEUE #{tok.queueAhead ?? 0}
                            </span>
                          </td>

                          {/* Correct Farmer Name, Aadhaar, and Mobile */}
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900 text-sm">
                              {tok.farmer?.fullName || tok.farmerName || tok.farmerId}
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                              <span className="text-slate-400 font-sans">Aadhaar: </span>
                              <span className="font-bold text-slate-800">
                                {tok.farmer?.aadhaarMasked || tok.aadhaar || ('XXXX-XXXX-' + tok.farmerId.slice(-4))}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                              <span className="text-slate-400 font-sans">Mobile: </span>
                              <span className="font-bold text-slate-900">
                                {tok.farmer?.phoneNumber || tok.phoneNumber || '9848022319'}
                              </span>
                            </div>
                          </td>

                          {/* Procurement Centre Name, District, and State */}
                          <td className="p-3">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span>{tok.center?.centerName || tok.centerName || officerUser?.mandiName || 'APMC Main Market Yard'}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-purple-600 flex-shrink-0" />
                              <span>
                                District: <strong className="text-purple-900">{tok.center?.district || tok.district || tok.farmer?.district || officerUser?.district || 'Guntur'}</strong>
                                {' '}• State: <strong className="text-purple-900">{tok.center?.state || tok.state || tok.farmer?.state || officerUser?.state || 'Andhra Pradesh'}</strong>
                              </span>
                            </div>
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            <div className="font-medium text-slate-800">{tok.cropType}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-bold">{tok.quantityQuintals} q (₹{((tok.totalAmount || tok.quantityQuintals * 2300)).toLocaleString('en-IN')})</div>
                          </td>

                          <td className="p-3 text-slate-600 font-medium whitespace-nowrap">
                            <div>{tok.scheduledDate}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{tok.scheduledSlot}</div>
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                              {tok.stageName || `Stage ${tok.currentStageIndex}`}
                            </span>
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tok.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tok.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {tok.status}
                            </span>
                          </td>

                          {/* Payment Method & Strict Success Status */}
                          <td className="p-3 whitespace-nowrap">
                            {(() => {
                              const isPaymentDone = tok.currentStageIndex >= 10 || tok.status === 'COMPLETED' || tok.dbtPayment?.paymentStatus === 'COMPLETED';
                              return (
                                <div>
                                  <div className="text-[11px] font-bold text-slate-900">
                                    Direct DBT (APBS)
                                  </div>
                                  <div className="mt-0.5">
                                    {isPaymentDone ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                        <span>✓</span>
                                        <span>SUCCESS</span>
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                        <span>⏳</span>
                                        <span>PENDING (Stage 10)</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                    {isPaymentDone ? `₹${((tok.totalAmount || tok.quantityQuintals * 2300)).toLocaleString('en-IN')}` : 'Awaiting clearance'}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              {onOpenPrintGatePass && (
                                <button
                                  type="button"
                                  onClick={() => onOpenPrintGatePass(tok)}
                                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1 shadow-xs"
                                  title="View and print official Mandi Gate Pass"
                                >
                                  <FileText className="w-3 h-3 text-emerald-700" />
                                  <span>Pass</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedConsoleTokenNumber(tok.tokenNumber);
                                  setDeskTab('console');
                                }}
                                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all inline-flex items-center space-x-1"
                              >
                                <FastForward className="w-3 h-3" />
                                <span>Work on 10 Steps</span>
                              </button>
                              <button
                                onClick={() => onAdvanceStage(tok.tokenNumber)}
                                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-all"
                                title="Quickly advance to next stage"
                              >
                                <span>+1 Stage</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: QC Lab & Visual AI Assay */}
      {deskTab === 'qc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quality Assay Station */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <FlaskConical className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  Quality Assay Lab & Fair Average Quality (FAQ) Station
                </h2>
                <p className="text-xs text-slate-500">
                  Moisture Meter & Grain Sample Analysis for Token Registry
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Token Under Assay
                </label>
                <select
                  value={qcTokenNumber}
                  onChange={(e) => setQcTokenNumber(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white text-slate-900"
                >
                  {tokens.map((t) => (
                    <option key={t.tokenNumber} value={t.tokenNumber}>
                      {t.tokenNumber} ({t.cropType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Moisture Content (% max 17.0)
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Foreign Matter (% max 2.0)
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={foreignMatter}
                    onChange={(e) => setForeignMatter(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Crop Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-900"
              >
                <option value="Grade A">Grade A (Premium FAQ - Full MSP)</option>
                <option value="Common Quality">Common Quality (FAQ Passed)</option>
                <option value="Dockage Flagged">Dockage Flagged (Exceeds Moisture Norms)</option>
              </select>
            </div>

            {/* Officer Voice Dictated Remarks via Gemini Speech-to-Text */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  <span>Officer Voice Dictated Remarks (Gemini Flash Speech-to-Text)</span>
                </span>
                <button
                  type="button"
                  onClick={isRecordingRemarks ? handleStopRecordingRemarks : handleStartRecordingRemarks}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                    isRecordingRemarks
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                  }`}
                >
                  {isRecordingRemarks ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3" />
                      <span>Start Voice Dictation</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={qcRemarks}
                onChange={(e) => setQcRemarks(e.target.value)}
                rows={2}
                placeholder="Click 'Start Voice Dictation' to dictate remarks in Hindi/English, or type here directly..."
                className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
              />
            </div>

            {qcFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                  qcFeedback.includes('PASSED')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{qcFeedback}</span>
              </div>
            )}

            <button
              onClick={handleEvaluateQc}
              disabled={isEvaluating}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEvaluating ? 'Certifying Assay in Database...' : 'Save & Certify QC Assay'}</span>
            </button>
          </div>

          {/* Gemini AI Visual Quality Reference Generator */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Gemini Flash Grain Visual Reference
                </h3>
                <p className="text-[11px] text-slate-500">
                  Generate synthetic standard FAQ images for physical comparison
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Prompt / Grain Type</label>
              <input
                type="text"
                value={samplePrompt}
                onChange={(e) => setSamplePrompt(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleGenerateSampleReference}
                disabled={isGeneratingSample}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                {isGeneratingSample ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Visual Reference...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate FAQ Visual Reference</span>
                  </>
                )}
              </button>
            </div>

            {sampleImageUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600">Generated Reference Assay:</span>
                <img
                  src={sampleImageUrl}
                  alt="Standard Grain Reference"
                  className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-inner"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Storage Saturation & Yard Monitor */}
      {deskTab === 'storage' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Warehouse className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                Warehouse Storage Saturation & Load Diversion Alert
              </h2>
              <p className="text-xs text-slate-500">
                Automated early warning system for Mandi yard traffic congestion
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-emerald-700" />
                <span>Available Storage Left: <strong>28,500 Quintals</strong> (out of 50,000 Q total capacity)</span>
              </span>
              <span className="text-emerald-800 font-black">57% FREE CAPACITY</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '57%' }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Current Stored Produce: 21,500 Q (43%)</span>
              <span>Remaining Available Space: 28,500 Q (57%)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>STORAGE STATUS: HEALTHY & ACTIVE FOR INCOMING PRODUCE</span>
            </div>
            <p className="leading-relaxed text-[11px] text-emerald-900">
              Mandi Yard currently has <strong>28,500 quintals</strong> of verified covered warehouse space and moisture-proof grain silos ready to receive fresh farmer arrivals today for <strong>{officerUser?.district || 'Guntur'}, {officerUser?.state || 'Andhra Pradesh'}</strong>.
            </p>
            <button
              onClick={onRedirectToGis}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center space-x-1.5"
            >
              <span>⚡ View Mandi Logistics & Buffer Storage Map</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          OFFICER SITE: SEARCH TOKEN PASS & DIGITAL VERIFICATION MODAL
          ========================================================================= */}
      {isPassSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                    <span>Search Mandi Token Pass</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                      Officer Desk
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Locate gate pass by Token #, Farmer Mobile, Name, or Aadhaar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPassSearchModalOpen(false);
                  setPassSearchQuery('');
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={passSearchQuery}
                  onChange={(e) => setPassSearchQuery(e.target.value)}
                  placeholder="Enter Token ID (e.g. TK-APM-1024 or P-1024), Farmer Phone, Name, or Aadhaar..."
                  className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
                />
                {passSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPassSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Search Results List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {(() => {
                const q = passSearchQuery.toLowerCase().trim();
                const matchedTokens = tokens.filter((tok) => {
                  if (!q) return true;
                  const tokenNo = (tok.tokenNumber || '').toLowerCase();
                  const name = (tok.farmer?.fullName || tok.farmerName || '').toLowerCase();
                  const phone = (tok.farmer?.phoneNumber || tok.phoneNumber || '').toLowerCase();
                  const aadhaar = (tok.farmer?.aadhaarMasked || tok.aadhaar || '').toLowerCase();
                  const crop = (tok.cropType || '').toLowerCase();
                  return (
                    tokenNo.includes(q) ||
                    name.includes(q) ||
                    phone.includes(q) ||
                    aadhaar.includes(q) ||
                    crop.includes(q)
                  );
                });

                if (matchedTokens.length === 0) {
                  return (
                    <div className="text-center py-10 space-y-2">
                      <div className="text-3xl">🔍</div>
                      <div className="font-extrabold text-slate-800 text-sm">No Token Pass Found</div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        No pass matched &quot;{passSearchQuery}&quot;. Please verify the token number or farmer mobile.
                      </p>
                    </div>
                  );
                }

                return matchedTokens.map((tok) => {
                  const isPaymentDone =
                    tok.currentStageIndex >= 10 ||
                    tok.status === 'COMPLETED' ||
                    tok.dbtPayment?.paymentStatus === 'COMPLETED';

                  return (
                    <div
                      key={tok.tokenNumber}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all bg-white space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-base font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            {tok.tokenNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tok.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tok.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tok.status}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Stage {tok.currentStageIndex}/10: {tok.stageName || 'In Process'}
                          </span>
                        </div>

                        <div className="text-xs font-mono font-bold text-slate-900">
                          ₹{((tok.totalAmount || tok.quantityQuintals * 2300)).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">Farmer Details</div>
                          <div className="font-extrabold text-slate-900">{tok.farmer?.fullName || tok.farmerName || 'Farmer'}</div>
                          <div className="font-mono text-[11px] text-slate-600">
                            Mobile: <strong className="text-slate-900">{tok.farmer?.phoneNumber || tok.phoneNumber || '9848022319'}</strong>
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">
                            Aadhaar: {tok.farmer?.aadhaarMasked || tok.aadhaar || 'XXXX-XXXX-3918'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">Lot & Schedule</div>
                          <div className="font-bold text-slate-900">{tok.cropType} • {tok.quantityQuintals} Quintals</div>
                          <div className="text-[11px] text-slate-600">
                            {tok.scheduledDate} ({tok.scheduledSlot})
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            🏢 {tok.center?.centerName || tok.centerName || 'APMC Main Yard'}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status Summary */}
                      <div className="flex items-center justify-between text-xs px-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-500 font-medium">Payment Settlement:</span>
                          {isPaymentDone ? (
                            <span className="text-emerald-700 font-bold flex items-center space-x-1">
                              <span>✓ Completed</span>
                              {tok.paymentDetails?.utrNumber && (
                                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded">
                                  UTR: {tok.paymentDetails.utrNumber}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold">⏳ Pending (Stage 10)</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        {onOpenPrintGatePass && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsPassSearchModalOpen(false);
                              onOpenPrintGatePass(tok);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Print Gate Pass</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedConsoleTokenNumber(tok.tokenNumber);
                            setDeskTab('console');
                            setIsPassSearchModalOpen(false);
                          }}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                          <span>Open in 10-Step Console</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await onAdvanceStage(tok.tokenNumber);
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          <span>+1 Stage</span>
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>{tokens.length} total mandi passes recorded in this terminal</span>
              <button
                type="button"
                onClick={() => setIsPassSearchModalOpen(false)}
                className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
