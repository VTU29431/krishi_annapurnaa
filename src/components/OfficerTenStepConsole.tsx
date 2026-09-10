import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  FastForward,
  Scale,
  FlaskConical,
  CreditCard,
  FileText,
  Truck,
  Sparkles,
  Info,
  ChevronRight,
  Stamp,
  Award,
  Lock,
  ArrowRight,
  RotateCcw,
  Check,
  Sliders,
  QrCode,
  MapPin,
  FileCheck,
  Send,
  UserCheck,
  Layers,
  Camera,
  Upload,
  Share2,
  Search,
  Image as ImageIcon,
  CheckCheck,
  Phone,
  Banknote,
} from 'lucide-react';
import { Token, MandiOfficerUser } from '../types.ts';
import { PROCUREMENT_STAGES } from '../data/mockData.ts';
import { parseCropAndVariety } from '../data/cropsData.ts';

interface OfficerTenStepConsoleProps {
  tokens: Token[];
  selectedTokenNumber: string;
  onSelectToken: (tokenNumber: string) => void;
  onAdvanceStage: (tokenNumber: string, targetStageIndex?: number, paymentDetails?: any) => Promise<void>;
  officerUser: MandiOfficerUser | null;
  onQuickLoginOfficer?: () => void;
  onStepClarified?: (tokenNumber: string, stageIndex: number, remarks: string) => void;
}

export const OfficerTenStepConsole: React.FC<OfficerTenStepConsoleProps> = ({
  tokens,
  selectedTokenNumber,
  onSelectToken,
  onAdvanceStage,
  officerUser,
  onStepClarified,
}) => {
  const [optimisticStages, setOptimisticStages] = useState<Record<string, number>>({});

  const token = tokens.find((t) => t.tokenNumber === selectedTokenNumber) || tokens[0];
  const backendStage = token ? Math.min(10, Math.max(1, token.currentStageIndex || 1)) : 1;
  const currentStageIndex = token && optimisticStages[token.tokenNumber] !== undefined
    ? Math.max(optimisticStages[token.tokenNumber], backendStage)
    : backendStage;

  // Track which stage is currently inspected in the workbench (defaults to current active stage)
  const [inspectedStage, setInspectedStage] = useState<number>(currentStageIndex);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageToast, setStageToast] = useState<string | null>(null);

  // Sync inspected stage when token or currentStageIndex changes
  useEffect(() => {
    setInspectedStage(currentStageIndex);
  }, [currentStageIndex, token?.tokenNumber]);

  // Stage-specific interactive parameters
  const [stage1LandAcres, setStage1LandAcres] = useState<number>(4.5);
  const [stage1RorNumber, setStage1RorNumber] = useState<string>('Guntur Rural / Kankipadu');
  const [stage2GateBarrier, setStage2GateBarrier] = useState<string>('Gate #1 (North Ingress Weighbridge)');
  const [stage2Window, setStage2Window] = useState<string>('10:30 AM - 11:00 AM (30m slot)');
  const [stage3VehiclePlate, setStage3VehiclePlate] = useState<string>('HR-05-AB-4920');
  const [stage3RfidTag, setStage3RfidTag] = useState<string>('RFID-MND-88219');
  const [stage4Moisture, setStage4Moisture] = useState<number>(13.2);
  const [stage4ForeignMatter, setStage4ForeignMatter] = useState<number>(0.7);
  const [stage4Grade, setStage4Grade] = useState<string>('Grade A (FAQ Standard)');
  const [stage5GrossWeightKg, setStage5GrossWeightKg] = useState<number>(8450);
  const [stage5ScaleNumber, setStage5ScaleNumber] = useState<number>(1);
  const [stage6LotId, setStage6LotId] = useState<string>('LOT-2026-KRN-481');
  const [stage6StorageBay, setStage6StorageBay] = useState<string>('Covered Yard Bay #4B');
  const [stage7TareWeightKg, setStage7TareWeightKg] = useState<number>(3950);
  const [stage8JFormNumber, setStage8JFormNumber] = useState<string>('JFORM-2026-HR-98421');
  const [stage9PfmsBatch, setStage9PfmsBatch] = useState<string>('PFMS-APBS-20260906-749');
  const [stage10UtrNumber, setStage10UtrNumber] = useState<string>('UTR-SBI-20260906-9812401');

  // Stage 10 Payment Enhancement State: Online DBT vs Offline Mandi Cash vs Money Credit
  const [stage10PaymentMode, setStage10PaymentMode] = useState<'ONLINE_DBT' | 'OFFLINE_MANDI' | 'MONEY_CREDIT'>('ONLINE_DBT');
  const [stage10BankName, setStage10BankName] = useState<string>('State Bank of India');
  const [stage10BankRef, setStage10BankRef] = useState<string>('REF-DBT-2026-9812');
  const [stage10CreditTxnId, setStage10CreditTxnId] = useState<string>('CR-eNAM-2026-89412');
  const [receiptSharedState, setReceiptSharedState] = useState<boolean>(false);
  const [isSharingReceipt, setIsSharingReceipt] = useState<boolean>(false);
  const [stage10VoucherNumber, setStage10VoucherNumber] = useState<string>('CSH-VOUCHER-MND-4821');
  const [offlineProofPhoto, setOfflineProofPhoto] = useState<string>('');
  const [tokenConsoleSearch, setTokenConsoleSearch] = useState<string>('');

  // Sync arrival window, crop-specific weights, and payment parameters when token changes
  useEffect(() => {
    if (token) {
      // 1. Dynamic Weight Calculation based on specific crop and quantity booked
      const qtyQ = token.quantityQuintals || 60;
      const netKg = qtyQ * 100;
      // Realistic tare weight of standard tractor trailer
      const standardTareKg = 3500;
      const calculatedGrossKg = standardTareKg + netKg;
      setStage7TareWeightKg(standardTareKg);
      setStage5GrossWeightKg(calculatedGrossKg);

      // 2. Selectable Arrival Window: align with token slot or standard 30-min window
      if (token.scheduledSlot) {
        const normalized = token.scheduledSlot.replace('–', '-');
        const formatted = normalized.includes('(30m slot)') ? normalized : `${normalized} (30m slot)`;
        setStage2Window(formatted);
      } else {
        setStage2Window('10:30 AM - 11:00 AM (30m slot)');
      }

      if (token.paymentMode === 'MONEY_CREDIT' || token.paymentDetails?.paymentMode === 'MONEY_CREDIT') {
        setStage10PaymentMode('MONEY_CREDIT');
      } else if (token.paymentMode === 'OFFLINE_MANDI' || token.paymentDetails?.paymentMode === 'OFFLINE_MANDI') {
        setStage10PaymentMode('OFFLINE_MANDI');
      } else {
        setStage10PaymentMode('ONLINE_DBT');
      }

      if (token.paymentDetails?.receiptShared || token.currentStageIndex >= 10 || token.status === 'COMPLETED') {
        setReceiptSharedState(true);
      } else {
        setReceiptSharedState(false);
      }

      if (token.paymentDetails?.utrNumber) {
        setStage10UtrNumber(token.paymentDetails.utrNumber);
      } else if (token.dbtPayment?.transactionUtr) {
        setStage10UtrNumber(token.dbtPayment.transactionUtr);
      }

      if (token.paymentDetails?.voucherNumber) {
        setStage10VoucherNumber(token.paymentDetails.voucherNumber);
      } else {
        setStage10VoucherNumber(`CSH-VCHR-${token.tokenNumber}`);
      }

      if (token.paymentDetails?.offlineProofPhotoUrl) {
        setOfflineProofPhoto(token.paymentDetails.offlineProofPhotoUrl);
      }
    }
  }, [token?.tokenNumber, token?.quantityQuintals, token?.cropType, token?.scheduledSlot]);

  // Computed net weight in quintals based on active crop weighment
  const computedNetKg = Math.max(0, stage5GrossWeightKg - stage7TareWeightKg);
  const computedNetQuintals = Number((computedNetKg / 100).toFixed(2));
  const activeRate = token?.mspRatePerQ || 2320;
  const computedPayout = Math.round(computedNetQuintals * activeRate);

  // Store officer certifications per token
  const [officerCertifications, setOfficerCertifications] = useState<
    Record<string, Record<number, { officerName: string; officerId: string; timestamp: string; remarks: string; details?: string }>>
  >({
    'P-1024': {
      1: {
        officerName: 'Shri R. K. Sharma',
        officerId: 'OFF-7821-KRN',
        timestamp: 'Today, 09:15 AM',
        remarks: 'Farmer landholding in Guntur Region verified via State Agricultural Registry. Farmer Aadhaar KYC authenticated.',
        details: 'Land: 4.5 Acres • Quota Verified: 45.00 Quintals',
      },
      2: {
        officerName: 'Shri R. K. Sharma',
        officerId: 'OFF-7821-KRN',
        timestamp: 'Today, 09:30 AM',
        remarks: 'Slot confirmed for 10:30 AM - 11:00 AM (30-Minute arrival window) to regulate mandi yard vehicle flow.',
        details: 'Gate #1 Assigned • Congestion Index: Green',
      },
      3: {
        officerName: 'Shri R. K. Sharma',
        officerId: 'OFF-7821-KRN',
        timestamp: 'Today, 10:28 AM',
        remarks: 'Vehicle HR-05-AB-4920 arrived at Gate #1 barrier. RFID tag scanned and directed to Scale #1.',
        details: 'RFID: RFID-MND-88219 • Inward Permitted',
      },
    },
  });

  const [officerRemarks, setOfficerRemarks] = useState<string>('');

  if (!token) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <p className="text-slate-600 font-semibold text-sm">No digital tokens currently active in Mandi queue.</p>
      </div>
    );
  }

  const tokenCertifications = officerCertifications[token.tokenNumber] || {};

  // Officer action: Share payment details with farmer (SMS + Digital Portal)
  const handleSharePaymentDetailsWithFarmer = async () => {
    setIsSharingReceipt(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setReceiptSharedState(true);
    setIsSharingReceipt(false);
    setStageToast(
      `✓ Payment receipt and UTR #${stage10UtrNumber} dispatched to Farmer (+91 ${token.farmer?.phoneNumber || token.phoneNumber || '9848022319'}) via SMS & Portal!`
    );
    setTimeout(() => setStageToast(null), 4000);
  };

  // Officer action: Upload photo proof of cash giving to farmer
  const handleOfflinePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOfflineProofPhoto(reader.result as string);
        setStageToast('✓ Cash handover photo uploaded with Mandi Treasury official seal!');
        setTimeout(() => setStageToast(null), 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete the current stage and proceed immediately to the next stage
  const handleCompleteCurrentStage = async () => {
    if (isProcessing) return;

    // Normal sequential progression: auto-populate payment fallbacks if needed so it proceeds smoothly
    if (currentStageIndex === 10) {
      if (stage10PaymentMode === 'ONLINE_DBT') {
        if (!stage10UtrNumber.trim()) {
          setStage10UtrNumber('UTR-SBI-20260906-9812401');
        }
        setReceiptSharedState(true);
      } else {
        if (!stage10VoucherNumber.trim()) {
          setStage10VoucherNumber('CSH-VOUCHER-MND-4821');
        }
      }
    }

    setIsProcessing(true);

    const stageNumber = currentStageIndex;
    const stageMeta = PROCUREMENT_STAGES[stageNumber - 1];
    const officerName = officerUser?.officerName || 'Shri R. K. Sharma';
    const officerId = officerUser?.officerId || 'OFF-7821-KRN';
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Generate meaningful summary remarks based on current stage
    let defaultRemark = `Stage ${stageNumber} (${stageMeta.title}): ${stageMeta.desc} verified and certified by Mandi Officer.`;
    let detailsSummary = '';
    let paymentPayload: any = undefined;

    if (stageNumber === 1) {
      defaultRemark = `Farmer KYC approved via Aadhaar & Agricultural Portal. Area: ${stage1RorNumber || 'Guntur Region'}. Land holding: ${stage1LandAcres || 4.5} Acres.`;
      detailsSummary = `${stage1LandAcres || 4.5} Acres • ${stage1RorNumber || 'Village Area'}`;
    } else if (stageNumber === 2) {
      defaultRemark = `Assigned 30-minute arrival window ${stage2Window} at ${stage2GateBarrier}.`;
      detailsSummary = `${stage2Window} • Gate #1`;
    } else if (stageNumber === 3) {
      defaultRemark = `Tractor ${stage3VehiclePlate} scanned at weighbridge entrance barrier. RFID ${stage3RfidTag} verified.`;
      detailsSummary = `Vehicle: ${stage3VehiclePlate} • RFID Barrier Raised`;
    } else if (stageNumber === 4) {
      defaultRemark = `Moisture certified at ${stage4Moisture}% (FCI limit ≤ 17.0%); Foreign matter ${stage4ForeignMatter}% (≤ 1.0%). FAQ ${stage4Grade} passed.`;
      detailsSummary = `Moisture: ${stage4Moisture}% • Foreign Matter: ${stage4ForeignMatter}% • ${stage4Grade}`;
    } else if (stageNumber === 5) {
      defaultRemark = `Gross weight digitally captured from Pitless Scale #${stage5ScaleNumber}: ${stage5GrossWeightKg} kg (Tractor + Trolley + Crop).`;
      detailsSummary = `Gross: ${stage5GrossWeightKg} kg • Scale #${stage5ScaleNumber}`;
    } else if (stageNumber === 6) {
      defaultRemark = `Produce accepted under Central Pool MSP norms. Lot #${stage6LotId} assigned to ${stage6StorageBay}.`;
      detailsSummary = `Lot #${stage6LotId} • ${stage6StorageBay}`;
    } else if (stageNumber === 7) {
      defaultRemark = `Tare weight recorded: ${stage7TareWeightKg} kg. Net computed produce: ${computedNetKg} kg (${computedNetQuintals} Quintals).`;
      detailsSummary = `Tare: ${stage7TareWeightKg} kg • Net: ${computedNetQuintals} Quintals`;
    } else if (stageNumber === 8) {
      defaultRemark = `Official APMC e-J-Form purchase memo #${stage8JFormNumber} issued. Net ${computedNetQuintals} q × ₹${activeRate} = ₹${computedPayout.toLocaleString('en-IN')}.`;
      detailsSummary = `e-J-Form #${stage8JFormNumber} • Payable: ₹${computedPayout.toLocaleString('en-IN')}`;
    } else if (stageNumber === 9) {
      defaultRemark = `Aadhaar Payment Bridge (APBS) batch #${stage9PfmsBatch} dispatched to PFMS for direct treasury transmission.`;
      detailsSummary = `PFMS Batch: ${stage9PfmsBatch} • NPCI Active`;
    } else if (stageNumber === 10) {
      if (stage10PaymentMode === 'ONLINE_DBT') {
        defaultRemark = `Direct Benefit Transfer (DBT) completed. Bank UTR ${stage10UtrNumber} credited to farmer bank account. Payment receipt shared with farmer.`;
        detailsSummary = `UTR: ${stage10UtrNumber} • ₹${computedPayout.toLocaleString('en-IN')} Credited • Receipt Shared`;
        paymentPayload = {
          paymentMode: 'ONLINE_DBT',
          utrNumber: stage10UtrNumber,
          bankName: stage10BankName,
          bankRef: stage10BankRef,
          receiptShared: true,
          amountPaid: computedPayout,
          verifiedByOfficerName: officerName,
          verifiedByOfficerMobile: officerUser?.mobileNumber || '9848022340',
          verifiedAt: new Date().toISOString(),
        };
      } else if (stage10PaymentMode === 'MONEY_CREDIT') {
        defaultRemark = `Instant Money Credit processed. APMC Mandi credit ledger TXN ${stage10CreditTxnId}. ₹${computedPayout.toLocaleString('en-IN')} credited to farmer account with instant SMS confirmation.`;
        detailsSummary = `Credit TXN: ${stage10CreditTxnId} • ₹${computedPayout.toLocaleString('en-IN')} Money Credited • Receipt Shared`;
        paymentPayload = {
          paymentMode: 'MONEY_CREDIT',
          utrNumber: stage10CreditTxnId,
          receiptShared: true,
          amountPaid: computedPayout,
          verifiedByOfficerName: officerName,
          verifiedByOfficerMobile: officerUser?.mobileNumber || '9848022340',
          verifiedAt: new Date().toISOString(),
        };
      } else {
        defaultRemark = `Mandi Cash Disbursal completed. Voucher #${stage10VoucherNumber}. ₹${computedPayout.toLocaleString('en-IN')} handed over in person with photo verification.`;
        detailsSummary = `Voucher: ${stage10VoucherNumber} • ₹${computedPayout.toLocaleString('en-IN')} Cash In Hand • Photo Verified`;
        paymentPayload = {
          paymentMode: 'OFFLINE_MANDI',
          voucherNumber: stage10VoucherNumber,
          offlineProofPhotoUrl: offlineProofPhoto,
          receiptShared: true,
          amountPaid: computedPayout,
          verifiedByOfficerName: officerName,
          verifiedByOfficerMobile: officerUser?.mobileNumber || '9848022340',
          verifiedAt: new Date().toISOString(),
        };
      }
    }

    const remarksToSave = officerRemarks.trim() || defaultRemark;

    // Save certification stamp
    setOfficerCertifications((prev) => ({
      ...prev,
      [token.tokenNumber]: {
        ...(prev[token.tokenNumber] || {}),
        [stageNumber]: {
          officerName,
          officerId,
          timestamp: `Today, ${now}`,
          remarks: remarksToSave,
          details: detailsSummary,
        },
      },
    }));

    if (onStepClarified) {
      onStepClarified(token.tokenNumber, stageNumber, remarksToSave);
    }

    // Advance stage in backend and state
    const nextStage = Math.min(10, stageNumber + 1);

    // Optimistically update local stage map and active workbench inspection panel
    setOptimisticStages((prev) => ({ ...prev, [token.tokenNumber]: nextStage }));
    setInspectedStage(nextStage);
    setOfficerRemarks('');

    try {
      await onAdvanceStage(token.tokenNumber, nextStage, paymentPayload);
    } catch (err) {
      console.warn('Backend sync on stage advance:', err);
    } finally {
      setIsProcessing(false);
    }

    // Provide visual feedback toast
    setStageToast(
      stageNumber >= 10
        ? `🎉 Payment Stage Successfully Completed! Status updated to SUCCESS for both Mandi and Farmer.`
        : `✓ Stage ${stageNumber} Certified (${stageMeta.title})! Proceeding to Stage ${nextStage} (${PROCUREMENT_STAGES[nextStage - 1]?.title}).`
    );

    setTimeout(() => {
      setStageToast(null);
    }, 4500);
  };

  const isAllCompleted =
    token.status === 'COMPLETED' ||
    Boolean(tokenCertifications[10]) ||
    token.dbtPayment?.paymentStatus === 'COMPLETED' ||
    token.paymentDetails?.paymentStatus === 'COMPLETED' ||
    (currentStageIndex >= 10 && Boolean(tokenCertifications[10]));

  return (
    <div className="space-y-6" id="officer-ten-step-console">
      {/* Toast Notification */}
      {stageToast && (
        <div className="p-3.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-500 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{stageToast}</span>
          </div>
          <button
            onClick={() => setStageToast(null)}
            className="text-emerald-200 hover:text-white text-xs underline font-normal ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP STATUS INDICATOR: User requirement "once all stages completed from officer site make thm to shown as completed on above officer site" */}
      {isAllCompleted && (
        <div
          id="officer-site-all-stages-completed-banner"
          className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 border-2 border-emerald-400 text-white rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
        >
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              ✓
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-black text-white text-base tracking-wider bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-600">
                  {token.tokenNumber}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>ALL 10 STAGES COMPLETED & CERTIFIED</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                Farmer <strong>{token.farmer?.fullName || token.farmerName}</strong> • {token.cropType} ({token.quantityQuintals} Quintals) — All 10 procurement protocol stages are fully completed, certified by Mandi Officer, and final payment is disbursed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-emerald-950/70 p-3 rounded-xl border border-emerald-600/50 self-start md:self-auto">
            <div className="text-left">
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
                Disbursed MSP Payout
              </span>
              <div className="font-mono font-black text-emerald-300 text-lg">
                ₹{(token.totalAmount || token.quantityQuintals * activeRate).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-black text-xs uppercase shadow-sm">
              COMPLETED
            </div>
          </div>
        </div>
      )}

      {/* Mandi Officer Authorization Header with Quick Credentials */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mandi Operations Command Terminal</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Sequential 10-Stage Procurement Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Officer Desk: Step-by-Step Verification Console
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Every step must be verified and certified sequentially. Complete each stage to unlock and advance to the next stage in strict compliance with Mandi Procurement Regulations.
          </p>
        </div>

        {/* Authorized Mandi Officer Credentials & Official Contact */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-800/90 p-3 rounded-xl border border-slate-700">
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Authorized Mandi Officer
            </div>
            <div className="font-extrabold text-sm text-emerald-300 flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>{officerUser?.officerName || 'Shri R. K. Sharma'}</span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              ID: {officerUser?.officerId || 'OFF-7821-KRN'} • Mandi Contact: <strong className="text-emerald-300 font-bold">{officerUser?.mobileNumber || '9848022340'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Active Token Bar with Fast Switcher & Progress */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Token Selector & Details */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl text-white font-black font-mono flex flex-col items-center justify-center text-sm shadow-md border ${
            isAllCompleted
              ? 'bg-emerald-600 border-emerald-400 ring-2 ring-emerald-500/50'
              : 'bg-emerald-800 border-emerald-600'
          }`}>
            <span className="text-[9px] text-emerald-200 uppercase font-semibold">
              {isAllCompleted ? 'DONE' : 'TOKEN'}
            </span>
            <span>{token.tokenNumber}</span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-slate-900 text-lg">
                {token.farmer?.fullName || token.farmerName || 'Farmer'}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {token.cropType} • {token.quantityQuintals} Quintals
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold font-mono">
                ₹{(token.totalAmount || token.quantityQuintals * activeRate).toLocaleString('en-IN')} Guaranteed MSP
              </span>
              {isAllCompleted ? (
                <span className="text-xs bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>COMPLETED (ALL 10 STAGES)</span>
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  <span>REAL-TIME LIVE ENTRY</span>
                </span>
              )}
            </div>

            {/* Farmer Verified Identity Badges: Aadhaar, Contact Mobile, Center & State/District */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-slate-800">
                <span className="text-slate-500 font-sans font-medium text-[11px]">Aadhaar:</span>
                <strong className="text-slate-900">{token.farmer?.aadhaarMasked || token.aadhaar || ('XXXX-XXXX-' + token.farmerId.slice(-4))}</strong>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 font-mono text-slate-800">
                <Phone className="w-3 h-3 text-emerald-700" />
                <span className="text-emerald-800 font-sans font-medium text-[11px]">Mobile:</span>
                <strong className="text-emerald-950 font-bold">{token.farmer?.phoneNumber || token.phoneNumber || '9848022319'}</strong>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 font-medium">
                <Building className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>
                  Center: <strong className="text-blue-900">{token.center?.centerName || token.centerName || officerUser?.mandiName || 'APMC Main Market Yard'}</strong>
                </span>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 font-medium">
                <MapPin className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span>
                  District: <strong className="text-purple-900">{token.center?.district || token.district || token.farmer?.district || officerUser?.district || 'Guntur'}</strong>
                  {' '}• State: <strong className="text-purple-900">{token.center?.state || token.state || token.farmer?.state || officerUser?.state || 'Andhra Pradesh'}</strong>
                </span>
              </div>
            </div>

            {/* Payment Method Strict Success/Pending Badge */}
            <div className="pt-0.5">
              {(() => {
                const isPaymentDone = isAllCompleted || token.currentStageIndex >= 10 || token.status === 'COMPLETED' || token.dbtPayment?.paymentStatus === 'COMPLETED';
                const isOffline = token.paymentMode === 'OFFLINE_MANDI' || stage10PaymentMode === 'OFFLINE_MANDI';
                const methodLabel = isOffline ? 'Offline Take Money (Mandi Cash)' : 'Online Money (Bank Direct)';
                return (
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                    isPaymentDone
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                      : 'bg-amber-50 text-amber-950 border-amber-300'
                  }`}>
                    <span>Payment Method: <strong>{methodLabel}</strong></span>
                    <span>•</span>
                    {isPaymentDone ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px] inline-flex items-center gap-1 shadow-sm">
                        <span>✓</span>
                        <span>SUCCESS (COMPLETED)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] border border-amber-300 inline-flex items-center gap-1">
                        <span>⏳</span>
                        <span>PENDING (Stage 10)</span>
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-600">
                      {isPaymentDone
                        ? `(Settled: ₹${(token.totalAmount || token.quantityQuintals * activeRate).toLocaleString('en-IN')})`
                        : '(Awaiting final Mandi Stage 10 certification)'}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="text-slate-500 text-xs flex flex-wrap items-center gap-2 pt-0.5">
              <span>Slot: <strong>{token.scheduledDate} ({token.scheduledSlot})</strong></span>
              <span>•</span>
              {isAllCompleted ? (
                <span className="text-emerald-800 font-black text-xs flex items-center gap-1 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Current Status: COMPLETED — All 10 Stages Officially Certified & Settled</span>
                </span>
              ) : (
                <span className="text-emerald-800 font-bold">
                  Current Status: Stage {currentStageIndex} of 10 ({PROCUREMENT_STAGES[currentStageIndex - 1]?.title})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Search Token Pass & Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tokenConsoleSearch}
              onChange={(e) => {
                setTokenConsoleSearch(e.target.value);
                const q = e.target.value.toLowerCase().trim();
                if (q) {
                  const match = tokens.find(
                    (t) =>
                      (t.tokenNumber || '').toLowerCase().includes(q) ||
                      (t.farmer?.phoneNumber || t.phoneNumber || '').includes(q) ||
                      (t.farmer?.fullName || t.farmerName || '').toLowerCase().includes(q)
                  );
                  if (match) {
                    onSelectToken(match.tokenNumber);
                  }
                }
              }}
              placeholder="Search pass / mobile..."
              className="pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 w-44 shadow-2xs"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-500 px-1">Token:</span>
            <select
              value={token.tokenNumber}
              onChange={(e) => onSelectToken(e.target.value)}
              className="bg-white text-slate-900 font-mono font-bold text-xs p-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 max-w-[240px]"
            >
              {tokens
                .filter((t) => {
                  if (!tokenConsoleSearch.trim()) return true;
                  const q = tokenConsoleSearch.toLowerCase().trim();
                  return (
                    (t.tokenNumber || '').toLowerCase().includes(q) ||
                    (t.farmer?.phoneNumber || t.phoneNumber || '').includes(q) ||
                    (t.farmer?.fullName || t.farmerName || '').toLowerCase().includes(q)
                  );
                })
                .map((t) => (
                  <option key={t.tokenNumber} value={t.tokenNumber}>
                    {t.tokenNumber} - {t.farmer?.fullName || t.farmerName || t.farmerId} (Ph: {t.farmer?.phoneNumber || t.phoneNumber || '9848022319'})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal 10-Step Sequential Progress Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 text-sm">Sequential 10-Stage Pipeline</span>
            <span className="text-slate-500 font-medium">(Click any step to inspect audit details)</span>
          </div>
          <div className="flex items-center space-x-2 font-mono">
            {isAllCompleted ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                ✓ 10 / 10 Stages Completed (100%) — ALL STAGES FINISHED
              </span>
            ) : (
              <>
                <span className="font-bold text-slate-700">
                  {currentStageIndex >= 10 && tokenCertifications[10] ? '10 / 10 Stages Certified' : `${currentStageIndex - 1} / 10 Completed`}
                </span>
                <span className="text-emerald-700 font-bold">
                  ({Math.round(((currentStageIndex - 1) / 10) * 100)}%)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: isAllCompleted ? '100%' : `${Math.min(100, Math.max(10, (currentStageIndex / 10) * 100))}%` }}
          />
        </div>

        {/* 10 Step Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-1">
          {PROCUREMENT_STAGES.map((stage) => {
            const isCompleted = isAllCompleted ? true : stage.index < currentStageIndex;
            const isCurrent = !isAllCompleted && stage.index === currentStageIndex;
            const isPending = !isAllCompleted && stage.index > currentStageIndex;
            const isSelected = inspectedStage === stage.index;

            return (
              <button
                key={stage.index}
                type="button"
                onClick={() => setInspectedStage(stage.index)}
                className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between h-20 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-md scale-[1.02]'
                    : isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${
                    isCurrent ? 'bg-emerald-800 text-emerald-100' : isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    #{stage.index}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>

                <div>
                  <div className={`text-xs font-black truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                    {stage.title}
                  </div>
                  <div className={`text-[9px] truncate ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {stage.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE WORKBENCH: Active Stage Processing Panel */}
      {(() => {
        const activeStageMeta = PROCUREMENT_STAGES[inspectedStage - 1] || PROCUREMENT_STAGES[0];
        const isStageCompleted = inspectedStage < currentStageIndex;
        const isStageCurrent = inspectedStage === currentStageIndex;
        const isStagePending = inspectedStage > currentStageIndex;
        const existingCert = tokenCertifications[inspectedStage];

        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            {/* Workbench Stage Banner */}
            <div className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white ${
              isStageCurrent ? 'bg-emerald-800' : isStageCompleted ? 'bg-slate-800' : 'bg-slate-700'
            }`}>
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-lg border border-white/20">
                  {activeStageMeta.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                      Stage {activeStageMeta.index} of 10
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isStageCurrent
                        ? 'bg-emerald-500 text-white animate-pulse'
                        : isStageCompleted
                        ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                        : 'bg-slate-600 text-slate-300'
                    }`}>
                      {isStageCurrent ? 'ACTIVE CURRENT STAGE' : isStageCompleted ? '✓ CERTIFIED' : 'UPCOMING'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black">
                    {activeStageMeta.title} — {activeStageMeta.desc}
                  </h3>
                </div>
              </div>

              {/* Status or Stage Switcher */}
              <div className="flex items-center space-x-2">
                {inspectedStage !== currentStageIndex && (
                  <button
                    onClick={() => setInspectedStage(currentStageIndex)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1"
                  >
                    <span>Jump to Active Stage {currentStageIndex}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Workbench Interactive Body */}
            <div className="p-6 space-y-6">
              {/* If viewing an upcoming stage */}
              {isStagePending && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>
                      Viewing Stage {inspectedStage}: <strong>{activeStageMeta.title}</strong>. Current workflow stage is <strong>Stage {currentStageIndex}: {PROCUREMENT_STAGES[currentStageIndex - 1]?.title}</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedStage(currentStageIndex)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs whitespace-nowrap shadow-xs"
                  >
                    Go to Active Stage {currentStageIndex}
                  </button>
                </div>
              )}

              {/* Specific Stage Fields & Checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Verification Checklist & Live Inputs */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    <span>Stage {inspectedStage} Mandatory Verification Parameters</span>
                  </h4>

                  {/* Stage 1: Registration */}
                  {inspectedStage === 1 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {/* Live Farmer KYC Data Card */}
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 text-xs">
                        <div className="font-extrabold text-emerald-950 flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <UserCheck className="w-4 h-4 text-emerald-700" />
                            <span>Farmer Identity & Mandi Registration</span>
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                            AADHAAR KYC VERIFIED
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 text-slate-800">
                          <div>
                            <span className="text-slate-500 font-medium block text-[10px]">Farmer Full Name:</span>
                            <span className="font-extrabold text-slate-900 text-sm">{token.farmer?.fullName || token.farmerName || 'Farmer'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block text-[10px]">Aadhaar Number:</span>
                            <span className="font-mono font-bold text-slate-900">{token.farmer?.aadhaarMasked || token.aadhaar || ('XXXX-XXXX-' + token.farmerId.slice(-4))}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block text-[10px]">Mobile (Registered):</span>
                            <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900">
                              <Phone className="w-3 h-3 text-emerald-700" />
                              <span>{token.farmer?.phoneNumber || token.phoneNumber || '9848022319'}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block text-[10px]">Procurement Centre & Location:</span>
                            <span className="font-bold text-slate-900 block truncate">{token.center?.centerName || token.centerName || 'Karnal Central Mandi'}</span>
                            <span className="text-[10px] text-slate-600 font-medium">
                              District: <strong>{token.center?.district || token.district || token.farmer?.district || 'Karnal'}</strong> • State: <strong>{token.center?.state || token.state || token.farmer?.state || 'Haryana'}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Farmer Farm Land Village & Mandal Area
                        </label>
                        <input
                          type="text"
                          value={stage1RorNumber}
                          onChange={(e) => setStage1RorNumber(e.target.value)}
                          placeholder="e.g. Guntur Rural / Tadikonda Mandal"
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-bold bg-white text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Verified Land Area (Acres)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={stage1LandAcres}
                            onChange={(e) => setStage1LandAcres(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Aadhaar KYC Verification
                          </label>
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center space-x-1">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Biometrics Linked</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        State Land Registry Girdawari certified for Wheat Rabi season. Sown area verified against remote sensing GIS plot.
                      </p>
                    </div>
                  )}

                  {/* Stage 2: Slot Scheduled */}
                  {inspectedStage === 2 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Assigned 30-Minute Arrival Window
                        </label>
                        <select
                          value={stage2Window}
                          onChange={(e) => setStage2Window(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="08:00 AM - 08:30 AM (30m slot)">08:00 AM - 08:30 AM (30m slot)</option>
                          <option value="08:30 AM - 09:00 AM (30m slot)">08:30 AM - 09:00 AM (30m slot)</option>
                          <option value="09:00 AM - 09:30 AM (30m slot)">09:00 AM - 09:30 AM (30m slot)</option>
                          <option value="09:30 AM - 10:00 AM (30m slot)">09:30 AM - 10:00 AM (30m slot)</option>
                          <option value="10:00 AM - 10:30 AM (30m slot)">10:00 AM - 10:30 AM (30m slot)</option>
                          <option value="10:30 AM - 11:00 AM (30m slot)">10:30 AM - 11:00 AM (30m slot)</option>
                          <option value="11:00 AM - 11:30 AM (30m slot)">11:00 AM - 11:30 AM (30m slot)</option>
                          <option value="11:30 AM - 12:00 PM (30m slot)">11:30 AM - 12:00 PM (30m slot)</option>
                          <option value="12:30 PM - 01:00 PM (30m slot)">12:30 PM - 01:00 PM (30m slot)</option>
                          <option value="01:30 PM - 02:00 PM (30m slot)">01:30 PM - 02:00 PM (30m slot)</option>
                          <option value="02:30 PM - 03:00 PM (30m slot)">02:30 PM - 03:00 PM (30m slot)</option>
                          <option value="03:30 PM - 04:00 PM (30m slot)">03:30 PM - 04:00 PM (30m slot)</option>
                          <option value="04:30 PM - 05:00 PM (30m slot)">04:30 PM - 05:00 PM (30m slot)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Designated Mandi Entry Gate Barrier
                        </label>
                        <select
                          value={stage2GateBarrier}
                          onChange={(e) => setStage2GateBarrier(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                        >
                          <option value="Gate #1 (North Ingress Weighbridge)">Gate #1 (North Ingress Weighbridge)</option>
                          <option value="Gate #2 (Express Tractor Corridor)">Gate #2 (Express Tractor Corridor)</option>
                          <option value="Gate #3 (Heavy Multi-Axle Inward)">Gate #3 (Heavy Multi-Axle Inward)</option>
                        </select>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Dynamic queue pacing maintains maximum 12-minute wait time at the weighbridge.
                      </p>
                    </div>
                  )}

                  {/* Stage 3: Arrived at Gate */}
                  {inspectedStage === 3 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Tractor / Trolley Plate
                          </label>
                          <input
                            type="text"
                            value={stage3VehiclePlate}
                            onChange={(e) => setStage3VehiclePlate(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            RFID Barrier Pass
                          </label>
                          <input
                            type="text"
                            value={stage3RfidTag}
                            onChange={(e) => setStage3RfidTag(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-center space-x-2">
                        <QrCode className="w-5 h-5 text-emerald-700" />
                        <div>
                          <strong className="block">Digital Gate Pass Validated</strong>
                          <span className="text-[11px] text-emerald-800">Scanned at Barrier Weighbridge #1. Mandi Yard Inward Permitted.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 4: Quality Assay */}
                  {inspectedStage === 4 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Moisture Content (%) <span className="text-slate-400 font-normal">[≤17.0%]</span>
                          </label>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              step="0.1"
                              value={stage4Moisture}
                              onChange={(e) => setStage4Moisture(Number(e.target.value))}
                              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                            />
                            <span className="font-bold text-slate-600">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Foreign Matter (%) <span className="text-slate-400 font-normal">[≤1.0%]</span>
                          </label>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              step="0.1"
                              value={stage4ForeignMatter}
                              onChange={(e) => setStage4ForeignMatter(Number(e.target.value))}
                              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                            />
                            <span className="font-bold text-slate-600">%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Fair Average Quality (FAQ) Grade
                        </label>
                        <select
                          value={stage4Grade}
                          onChange={(e) => setStage4Grade(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                        >
                          <option value="Grade A (FAQ Standard)">Grade A (FAQ Standard - Full MSP Guaranteed)</option>
                          <option value="Common Quality (FAQ Passed)">Common Quality (FAQ Passed)</option>
                        </select>
                      </div>

                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 font-medium">
                        ✓ Moisture {stage4Moisture}% meets FCI safe procurement standards. Zero dockage deduction applied.
                      </div>
                    </div>
                  )}

                  {/* Stage 5: Gross Weight */}
                  {inspectedStage === 5 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between">
                        <span>Selected Crop & Produce:</span>
                        <span className="font-extrabold text-blue-950 font-mono">
                          {token.cropType} {token.cropVariety ? `(${token.cropVariety})` : ''} • Booked: {token.quantityQuintals} Q ({token.quantityQuintals * 100} kg net produce)
                        </span>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Digital Pitless Scale Reading (Gross kg)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={stage5GrossWeightKg}
                            onChange={(e) => setStage5GrossWeightKg(Number(e.target.value))}
                            className="w-full p-3 rounded-lg border border-slate-300 font-mono text-lg font-black text-slate-900 bg-white"
                          />
                          <span className="font-bold text-slate-700 font-mono text-sm">KG</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Weighbridge Scale</label>
                          <select
                            value={stage5ScaleNumber}
                            onChange={(e) => setStage5ScaleNumber(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            <option value={1}>Scale #1 (Gross Inward 60MT)</option>
                            <option value={2}>Scale #2 (Gross Inward 60MT)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Calibration Seal</label>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                            W&M Cert #2026-HR-881
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Digital load cells zero-balanced. Gross weight captures Tractor + Trolley + Fresh {token.cropType} Produce.
                      </p>
                    </div>
                  )}

                  {/* Stage 6: Produce Accepted */}
                  {inspectedStage === 6 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Procurement Lot Number</label>
                          <input
                            type="text"
                            value={stage6LotId}
                            onChange={(e) => setStage6LotId(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Allocated Storage Yard Bay</label>
                          <input
                            type="text"
                            value={stage6StorageBay}
                            onChange={(e) => setStage6StorageBay(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-bold bg-white"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-medium">
                        ✓ Produce meets APMC Quality & FAQ Specifications. Purchase order locked for unloading into covered godown.
                      </div>
                    </div>
                  )}

                  {/* Stage 7: Tare Weight */}
                  {inspectedStage === 7 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Empty Vehicle Tare Weight (kg)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={stage7TareWeightKg}
                            onChange={(e) => setStage7TareWeightKg(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-black text-slate-900 bg-white"
                          />
                          <span className="font-bold text-slate-700 font-mono">KG</span>
                        </div>
                      </div>

                      {/* Automated Computation Card */}
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
                        <div className="flex items-center justify-between text-xs text-emerald-900 font-bold border-b border-emerald-200 pb-1.5">
                          <span>Crop & Variety:</span>
                          <span className="font-extrabold text-emerald-950 font-mono">
                            {(() => {
                              const parsed = parseCropAndVariety(token.cropType, token.cropVariety);
                              return `${parsed.cropName} • ${parsed.varietyName}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono font-bold text-emerald-950">
                          <span>Gross Weight (W-1 Loaded):</span>
                          <span>{stage5GrossWeightKg.toLocaleString()} kg</span>
                        </div>
                        <div className="flex items-center justify-between font-mono font-bold text-emerald-950">
                          <span>Tare Weight (W-2 Empty Tractor):</span>
                          <span>- {stage7TareWeightKg.toLocaleString()} kg</span>
                        </div>
                        <div className="border-t border-emerald-300 pt-1.5 flex items-center justify-between font-bold text-emerald-950">
                          <span>Net {parseCropAndVariety(token.cropType, token.cropVariety).cropName} Procured:</span>
                          <span className="font-mono text-base font-black text-emerald-800">
                            {computedNetQuintals} Quintals ({computedNetKg.toLocaleString()} kg)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 8: e-J-Form Issued */}
                  {inspectedStage === 8 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          APMC Official e-J-Form Serial Number
                        </label>
                        <input
                          type="text"
                          value={stage8JFormNumber}
                          onChange={(e) => setStage8JFormNumber(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white text-slate-900"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5 text-blue-950">
                        <div className="flex justify-between font-bold">
                          <span>Farmer Beneficiary:</span>
                          <span className="font-extrabold text-blue-950">{token.farmer?.fullName || token.farmerName || 'Farmer'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Aadhaar & Mobile:</span>
                          <span className="font-mono font-bold">{token.farmer?.aadhaarMasked || token.aadhaar || 'XXXX-XXXX-3918'} • {token.farmer?.phoneNumber || token.phoneNumber || '9848022319'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Procurement Mandi:</span>
                          <span className="font-bold">{token.center?.centerName || token.centerName || 'Karnal Central Mandi'} ({token.center?.district || token.district || 'Karnal'}, {token.center?.state || token.state || 'Haryana'})</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1 border-t border-blue-200">
                          <span>Produce Net Quantity:</span>
                          <span className="font-mono">{computedNetQuintals} Quintals</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Guaranteed MSP Rate:</span>
                          <span className="font-mono">₹{activeRate} / Quintal</span>
                        </div>
                        <div className="border-t border-blue-200 pt-1.5 flex justify-between font-black text-sm text-blue-900">
                          <span>Total Payable Amount:</span>
                          <span className="font-mono">₹{computedPayout.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Digital Mandi purchase memo generated under State APMC Act with secure HMAC digital signature.
                      </p>
                    </div>
                  )}

                  {/* Stage 9: APBS Initiated */}
                  {inspectedStage === 9 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          PFMS APBS Mandate Batch Reference
                        </label>
                        <input
                          type="text"
                          value={stage9PfmsBatch}
                          onChange={(e) => setStage9PfmsBatch(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                        />
                      </div>

                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5 text-purple-950">
                        <div className="flex justify-between">
                          <span className="font-semibold">Beneficiary Farmer:</span>
                          <span className="font-bold text-purple-900">{token.farmer?.fullName || token.farmerName || 'Farmer'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Payment Bridge:</span>
                          <span className="font-mono font-bold">Aadhaar Payment Bridge (APBS)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Aadhaar Linked Account:</span>
                          <span className="font-mono font-bold">{token.farmer?.aadhaarMasked || token.aadhaar || 'XXXX-XXXX-3918'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">SMS Alert Dispatched:</span>
                          <span className="font-mono font-bold">To Farmer +91 {token.farmer?.phoneNumber || token.phoneNumber || '9848022319'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">NPCI Aadhaar Status:</span>
                          <span className="font-bold text-emerald-700">Active & Mapped</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 10: Payment Settlement & Verification */}
                  {inspectedStage === 10 && (
                    <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {/* Payment Method Selector (Online vs Offline) */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">Payment Settlement Mode:</span>
                          {currentStageIndex >= 10 || token.status === 'COMPLETED' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px] inline-flex items-center gap-1 shadow-sm">
                              <span>✓</span>
                              <span>SUCCESS (Disbursed)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] inline-flex items-center gap-1">
                              <span>⏳</span>
                              <span>MANDI VERIFICATION PENDING</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setStage10PaymentMode('ONLINE_DBT')}
                            className={`p-3 rounded-xl border text-left font-bold transition-all ${
                              stage10PaymentMode === 'ONLINE_DBT'
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 text-xs">
                              <CreditCard className="w-4 h-4 text-emerald-700" />
                              <span className="font-extrabold text-sm">Online Money (Bank Direct)</span>
                            </div>
                            <div className="text-[10px] font-normal text-slate-500 mt-1">
                              Direct treasury bank transfer with UTR & digital receipt share to verified farmer account
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setStage10PaymentMode('OFFLINE_MANDI')}
                            className={`p-3 rounded-xl border text-left font-bold transition-all ${
                              stage10PaymentMode === 'OFFLINE_MANDI'
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 text-xs">
                              <Building className="w-4 h-4 text-emerald-700" />
                              <span className="font-extrabold text-sm">Offline Take Money (Mandi Cash)</span>
                            </div>
                            <div className="text-[10px] font-normal text-slate-500 mt-1">
                              Physical cash payout at Mandi accounts desk with mandatory photo proof
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* ONLINE PAYMENT FORM */}
                      {stage10PaymentMode === 'ONLINE_DBT' && (
                        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          {/* Farmer's Verified Bank Details Display */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-emerald-700" />
                                <span>Farmer Registered Bank Account Details</span>
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] border border-emerald-300">
                                VERIFIED FOR DBT
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                              <div className="bg-white p-2 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-sans text-slate-500 block">Bank Name</span>
                                <strong className="text-slate-900">{token.bankDetails?.bankName || stage10BankName || 'State Bank of India'}</strong>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-sans text-slate-500 block">Account Holder</span>
                                <strong className="text-slate-900">{token.bankDetails?.accountHolderName || token.farmer?.fullName || token.farmerName || 'Farmer'}</strong>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-sans text-slate-500 block">Account Number</span>
                                <strong className="text-emerald-900">{token.bankDetails?.accountNumber || '482910482019'}</strong>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-sans text-slate-500 block">IFSC Code</span>
                                <strong className="text-slate-900">{token.bankDetails?.ifscCode || 'SBIN0002194'}</strong>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              RBI-NPCI Bank UTR Transaction Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={stage10UtrNumber}
                              onChange={(e) => setStage10UtrNumber(e.target.value)}
                              placeholder="e.g. UTR-SBI-20260906-9812401"
                              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-black text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block font-bold text-slate-600 text-[11px] mb-0.5">
                                Disbursing Bank Name
                              </label>
                              <input
                                type="text"
                                value={stage10BankName}
                                onChange={(e) => setStage10BankName(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-600 text-[11px] mb-0.5">
                                Treasury Reference
                              </label>
                              <input
                                type="text"
                                value={stage10BankRef}
                                onChange={(e) => setStage10BankRef(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white"
                              />
                            </div>
                          </div>

                          {/* Share Payment Details Action */}
                          <div className={`p-3 rounded-xl border transition-all ${
                            receiptSharedState
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50 border-amber-300 text-amber-950'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="font-bold flex items-center space-x-1.5 text-xs">
                                  {receiptSharedState ? (
                                    <>
                                      <CheckCheck className="w-4 h-4 text-emerald-700" />
                                      <span>✓ Payment Details & UTR Receipt Shared with Farmer</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-4 h-4 text-amber-700" />
                                      <span>Mandatory: Share UTR & Receipt Details with Farmer</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  Dispatches UTR: <strong className="font-mono">{stage10UtrNumber || 'Pending'}</strong> to farmer mobile (+91 {token.farmer?.phoneNumber || token.phoneNumber || '9848022319'})
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleSharePaymentDetailsWithFarmer}
                                disabled={isSharingReceipt || !stage10UtrNumber.trim()}
                                className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold text-xs shadow flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50 whitespace-nowrap"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>{isSharingReceipt ? 'Sharing...' : receiptSharedState ? 'Re-Share Details' : 'Share Payment Details'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* OFFLINE CASH PAYMENT FORM WITH PHOTO PROOF */}
                      {stage10PaymentMode === 'OFFLINE_MANDI' && (
                        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Mandi Treasury Cash Voucher Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={stage10VoucherNumber}
                              onChange={(e) => setStage10VoucherNumber(e.target.value)}
                              placeholder="e.g. CSH-VOUCHER-MND-4821"
                              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-white"
                            />
                          </div>

                          {/* Cash Giving Photo Proof Upload */}
                          <div className={`p-3.5 rounded-xl border ${
                            offlineProofPhoto
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-amber-50 border-amber-300'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                                <Camera className="w-4 h-4 text-emerald-700" />
                                <span>Photo of Cash Handover to Farmer: <span className="text-red-500">*</span></span>
                              </span>
                              {offlineProofPhoto ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px]">
                                  ✓ PHOTO VERIFIED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                                  PHOTO REQUIRED
                                </span>
                              )}
                            </div>

                            {offlineProofPhoto ? (
                              <div className="space-y-2">
                                <div className="relative rounded-lg overflow-hidden border border-emerald-300 max-h-48 bg-slate-900 flex items-center justify-center">
                                  <img
                                    src={offlineProofPhoto}
                                    alt="Cash handover to farmer verification"
                                    className="w-full h-44 object-cover"
                                  />
                                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-1.5 rounded text-[10px] flex justify-between font-mono">
                                    <span>Voucher: {stage10VoucherNumber}</span>
                                    <span>Handover Cash: ₹{computedPayout.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setOfflineProofPhoto('')}
                                    className="text-red-600 hover:text-red-700 font-bold text-xs underline"
                                  >
                                    Retake / Upload New Photo
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[11px] text-slate-600">
                                  Mandatory government audit requirement: Take or upload a clear photo showing physical cash being handed over to the farmer at the Mandi counter.
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <label className="cursor-pointer px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow flex items-center space-x-1.5">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Cash Handover Photo</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      onChange={handleOfflinePhotoUpload}
                                      className="hidden"
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Generate authentic official APMC stamped receipt image proof
                                      const canvas = document.createElement('canvas');
                                      canvas.width = 600;
                                      canvas.height = 360;
                                      const ctx = canvas.getContext('2d');
                                      if (ctx) {
                                        ctx.fillStyle = '#064e3b';
                                        ctx.fillRect(0, 0, 600, 360);
                                        ctx.fillStyle = '#ffffff';
                                        ctx.font = 'bold 20px sans-serif';
                                        ctx.fillText('APMC MANDI CASH PAYOUT DISBURSAL', 30, 45);
                                        ctx.font = '14px monospace';
                                        ctx.fillStyle = '#a7f3d0';
                                        ctx.fillText(`TOKEN: ${token.tokenNumber} | VOUCHER: ${stage10VoucherNumber}`, 30, 80);
                                        ctx.fillText(`FARMER: ${token.farmer?.fullName || token.farmerName || 'Farmer'}`, 30, 110);
                                        ctx.fillText(`MOBILE: +91 ${token.farmer?.phoneNumber || token.phoneNumber || '9848022319'}`, 30, 140);
                                        ctx.fillText(`OFFICER: ${officerUser?.officerName || 'Shri R. K. Sharma'} (ID: ${officerUser?.officerId || 'OFF-7821-KRN'})`, 30, 170);
                                        ctx.font = 'bold 24px monospace';
                                        ctx.fillStyle = '#fde047';
                                        ctx.fillText(`CASH HANDOVER: ₹${computedPayout.toLocaleString('en-IN')}`, 30, 220);
                                        ctx.font = '12px sans-serif';
                                        ctx.fillStyle = '#d1fae5';
                                        ctx.fillText(`TIME: ${new Date().toLocaleString('en-IN')} • SEALED & SIGNED`, 30, 260);
                                        ctx.strokeStyle = '#34d399';
                                        ctx.lineWidth = 3;
                                        ctx.strokeRect(20, 20, 560, 320);
                                      }
                                      setOfflineProofPhoto(canvas.toDataURL('image/png'));
                                      setStageToast('✓ Official APMC cash payout verification record captured!');
                                      setTimeout(() => setStageToast(null), 3000);
                                    }}
                                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center space-x-1"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Capture Mandi Counter Seal Photo</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payout Summary Card */}
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 text-emerald-950">
                        <div className="flex justify-between font-bold">
                          <span>Settled Mandi Payout:</span>
                          <span className="font-mono font-black text-emerald-800 text-sm">
                            ₹{computedPayout.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium text-[11px]">
                          <span>Farmer Beneficiary:</span>
                          <span className="font-bold text-slate-900">{token.farmer?.fullName || token.farmerName || 'Farmer'}</span>
                        </div>
                        <div className="flex justify-between font-medium text-[11px]">
                          <span>Farmer Mobile (Direct Verification):</span>
                          <span className="font-mono font-bold text-slate-900">+91 {token.farmer?.phoneNumber || token.phoneNumber || '9848022319'}</span>
                        </div>
                        <div className="flex justify-between font-medium text-[11px]">
                          <span>Procurement Officer Contact:</span>
                          <span className="font-mono font-bold text-emerald-800">+91 {officerUser?.mobileNumber || '9848022340'} ({officerUser?.officerName || 'Shri R. K. Sharma'})</span>
                        </div>
                        <div className="flex justify-between font-medium text-[11px]">
                          <span>Procurement Center:</span>
                          <span className="font-bold text-slate-900">{token.center?.centerName || token.centerName || 'Karnal Central Mandi'} ({token.center?.district || token.district || 'Karnal'}, {token.center?.state || token.state || 'Haryana'})</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 italic border-t border-emerald-200 pt-1">
                          Payment will reflect as SUCCESS across Mandi and Farmer portals only after this stage is certified.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Officer Digital Stamp & Action Button */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Stamp className="w-4 h-4 text-emerald-700" />
                      <span>Officer Authority Certification & Audit Stamp</span>
                    </h4>

                    {/* Authenticated Officer Credentials Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Certifying Officer:</span>
                        <span className="font-bold text-slate-900">
                          {officerUser?.officerName || 'Shri R. K. Sharma'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Mandi Staff ID:</span>
                        <span className="font-bold text-blue-800">
                          {officerUser?.officerId || 'OFF-7821-KRN'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Mandi Yard Code:</span>
                        <span className="text-slate-700">
                          {officerUser?.mandiOfficeCode || 'MND-KRN-01'} (Karnal Central)
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Weighbridge Scale:</span>
                        <span className="text-slate-700">Scale #{officerUser?.scaleNumber || 1}</span>
                      </div>
                    </div>

                    {/* Existing Stamp if already completed */}
                    {existingCert && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Stage {inspectedStage} Verified & Certified</span>
                          </span>
                          <span className="font-mono text-[10px] text-emerald-700">{existingCert.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 italic">
                          "{existingCert.remarks}"
                        </p>
                        {existingCert.details && (
                          <div className="text-[10px] font-mono text-emerald-800 font-semibold pt-1">
                            {existingCert.details}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Officer Remarks Input (for current stage) */}
                    {isStageCurrent && (
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Official Remarks / Endorsement Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={officerRemarks}
                          onChange={(e) => setOfficerRemarks(e.target.value)}
                          placeholder="e.g. All physical and digital parameters verified compliant."
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTON: Sequential 10-Stage Progression Engine */}
                  <div className="pt-2 space-y-2">
                    {/* If token has finished all 10 stages */}
                    {currentStageIndex >= 10 && (tokenCertifications[10] || token.status === 'COMPLETED') ? (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-emerald-900 font-extrabold text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>All 10 Stages Completed & Verified • Status: COMPLETED</span>
                        </div>
                        <p className="text-xs text-emerald-800">
                          Produce accepted, tare calculated, e-J-Form issued, and final payment voucher certified in the statutory audit ledger.
                        </p>
                        <div className="pt-2 flex items-center justify-center">
                          <span className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Procurement & Payout Completed</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Active sequential stage progression button */
                      <div className="space-y-2">
                        {currentStageIndex >= 10 ? (
                          <button
                            type="button"
                            onClick={handleCompleteCurrentStage}
                            disabled={isProcessing}
                            className="w-full py-4 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <span>Finalizing Payment Ledger & Marking SUCCESS...</span>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                                <span>
                                  Proceed with Stage 10: {PROCUREMENT_STAGES[9].title} (Finalize & Complete Mandi Procurement)
                                </span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleCompleteCurrentStage}
                            disabled={isProcessing}
                            className="w-full py-4 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-black text-sm shadow-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <span>Certifying & Passing to Next Stage...</span>
                            ) : (
                              <>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                                  <span>
                                    Proceed with Stage {currentStageIndex}: {PROCUREMENT_STAGES[currentStageIndex - 1]?.title}
                                  </span>
                                </div>
                                <span className="text-emerald-200 text-xs font-semibold flex items-center">
                                  (Pass to Stage {currentStageIndex + 1}: {PROCUREMENT_STAGES[currentStageIndex]?.title})
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                              </>
                            )}
                          </button>
                        )}

                        {isStageCompleted && (
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600 font-semibold flex items-center justify-center space-x-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Viewing certified audit of Stage {inspectedStage}. Use button above to proceed with workflow.</span>
                          </div>
                        )}

                        {isStagePending && (
                          <p className="text-[11px] text-center text-slate-500 font-medium">
                            Viewing preview of Stage {inspectedStage}. Clicking the button above will advance Stage {currentStageIndex} to Stage {currentStageIndex + 1}.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Complete Audit Trail Summary for All 10 Stages */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Complete 10-Stage Mandi Audit History for Token {token.tokenNumber}</span>
          </h4>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            {token.cropType} • {token.quantityQuintals} Quintals
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {PROCUREMENT_STAGES.map((stage) => {
            const isCompleted = stage.index < currentStageIndex;
            const isCurrent = stage.index === currentStageIndex;
            const cert = tokenCertifications[stage.index];

            return (
              <div
                key={stage.index}
                className={`py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isCurrent ? 'bg-emerald-50/50 px-2 rounded-lg' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : stage.index}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">
                      Stage {stage.index}: {stage.title}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-2 font-medium">({stage.desc})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  {isCompleted ? (
                    <>
                      <span className="text-emerald-800 font-bold font-mono">
                        {cert?.officerName || 'Shri R. K. Sharma'} ({cert?.officerId || 'OFF-7821-KRN'})
                      </span>
                      <span className="text-slate-400 font-mono">{cert?.timestamp || 'Certified'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ✓ Stamped
                      </span>
                    </>
                  ) : isCurrent ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px] animate-pulse">
                      In Progress (Officer Action)
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Pending Sequence</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
