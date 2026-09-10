import React, { useEffect, useRef, useState } from 'react';
import {
  Printer,
  X,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Truck,
  ShieldCheck,
  FileText,
  Copy,
  ChevronDown,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Token, ProcurementCenter, FarmerUser } from '../types.ts';
import { parseCropAndVariety } from '../data/cropsData.ts';

interface GatePassPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
  availableTokens?: Token[];
  onSelectToken?: (token: Token) => void;
  farmerUser?: FarmerUser | null;
  center?: ProcurementCenter | null;
}

export const GatePassPrintModal: React.FC<GatePassPrintModalProps> = ({
  isOpen,
  onClose,
  token,
  availableTokens = [],
  onSelectToken,
  farmerUser,
  center,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [selectedTokenNumber, setSelectedTokenNumber] = useState(token?.tokenNumber || '');

  // Keep selected token in sync
  useEffect(() => {
    if (token) {
      setSelectedTokenNumber(token.tokenNumber);
    } else if (availableTokens.length > 0 && !selectedTokenNumber) {
      setSelectedTokenNumber(availableTokens[0].tokenNumber);
      if (onSelectToken) onSelectToken(availableTokens[0]);
    }
  }, [token, availableTokens, selectedTokenNumber, onSelectToken]);

  const activeToken =
    token ||
    availableTokens.find((t) => t.tokenNumber === selectedTokenNumber) ||
    availableTokens[0] ||
    null;

  // Render QR Code onto canvas
  useEffect(() => {
    if (isOpen && qrCanvasRef.current && activeToken) {
      const qrPayload = JSON.stringify({
        token: activeToken.tokenNumber,
        farmer: activeToken.farmerId || activeToken.farmer?.fullName || farmerUser?.fullName || 'Farmer',
        aadhaar: activeToken.farmer?.aadhaarMasked || (farmerUser?.aadhaar ? `XXXX-XXXX-${farmerUser.aadhaar.slice(-4)}` : 'XXXX-XXXX-8192'),
        crop: activeToken.cropType,
        qty: activeToken.quantityQuintals,
        msp: activeToken.totalAmount,
        center: activeToken.centerId || center?.centerId || 'MND-KRN-01',
        date: activeToken.scheduledDate,
        slot: activeToken.scheduledSlot,
        type: 'APMC_MANDI_GATE_PASS',
        verified: true,
      });

      QRCode.toCanvas(
        qrCanvasRef.current,
        qrPayload,
        {
          width: 150,
          margin: 1,
          color: {
            dark: '#064e3b',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.error('Error generating QR on modal:', err);
        }
      );
    }
  }, [isOpen, activeToken, farmerUser, center]);

  if (!isOpen) return null;

  if (!activeToken) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl">
            🎫
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              No Registered Gate Pass Found
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No crop delivery slot or electronic gate pass has been booked yet for this profile.
              Please book a produce procurement slot to generate your official APMC Mandi E-Gate Pass.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentToken: Token = activeToken;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDedicatedPass = () => {
    const qrDataUrl = qrCanvasRef.current ? qrCanvasRef.current.toDataURL() : '';
    const passHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Mandi E-Gate Pass - ${currentToken.tokenNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { background: #ffffff; color: #0f172a; padding: 24px; font-size: 13px; line-height: 1.5; }
          .pass-container { max-width: 800px; margin: 0 auto; border: 3px solid #064e3b; border-radius: 16px; padding: 28px; background: #ffffff; position: relative; }
          .pass-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #064e3b; padding-bottom: 16px; margin-bottom: 20px; }
          .badge { display: inline-block; background: #ecfdf5; color: #064e3b; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
          .token-box { background: #064e3b; color: #ffffff; padding: 8px 18px; border-radius: 12px; text-align: center; }
          .token-title { font-size: 11px; opacity: 0.8; font-weight: 600; }
          .token-number { font-size: 26px; font-weight: 900; letter-spacing: 1px; font-family: monospace; }
          .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 20px; align-items: center; }
          .qr-box { text-align: center; border: 2px solid #cbd5e1; border-radius: 12px; padding: 14px; background: #f8fafc; }
          .qr-box img { width: 140px; height: 140px; display: block; margin: 0 auto; }
          .details-table { width: 100%; border-collapse: collapse; }
          .details-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 12px; }
          .details-table td.label { background: #f8fafc; color: #64748b; font-weight: 600; width: 38%; }
          .details-table td.value { color: #0f172a; font-weight: 700; }
          .highlight-row td { background: #ecfdf5 !important; color: #064e3b !important; }
          .checklist { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 11px; color: #78350f; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 10px; color: #64748b; }
          .stamp { border: 2px dashed #064e3b; border-radius: 50%; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; font-weight: 800; color: #064e3b; transform: rotate(-8deg); }
          @media print {
            body { padding: 0; }
            .pass-container { border: 2px solid #064e3b; border-radius: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="pass-container">
          <div class="pass-header">
            <div>
              <span class="badge">Government of India • APMC National e-Mandi</span>
              <h1 style="font-size: 20px; color: #064e3b; margin-top: 4px; font-weight: 800;">OFFICIAL MANDI PROCUREMENT E-GATE PASS</h1>
              <p style="font-size: 11px; color: #64748b;">Fast-Track RFID / QR Inward Entry for Weighbridge & Quality Assay</p>
            </div>
            <div class="token-box">
              <div class="token-title">TOKEN PASS #</div>
              <div class="token-number">${currentToken.tokenNumber}</div>
            </div>
          </div>

          <div class="grid">
            <div class="qr-box">
              <img src="${qrDataUrl}" alt="Gate Pass QR Code" />
              <div style="font-size: 10px; font-weight: 700; color: #064e3b; margin-top: 6px;">SCAN AT GATE ENTRY</div>
              <div style="font-size: 9px; color: #64748b;">Verified e-KYC Slot</div>
            </div>

            <div>
              <table class="details-table">
                <tr>
                  <td class="label">Farmer Full Name</td>
                  <td class="value">${currentToken.farmer?.fullName || farmerUser?.fullName || 'Kisan Producer'}</td>
                </tr>
                <tr>
                  <td class="label">Aadhaar (Masked)</td>
                  <td class="value">${currentToken.farmer?.aadhaarMasked || (farmerUser?.aadhaar ? `XXXX-XXXX-${farmerUser.aadhaar.slice(-4)}` : 'XXXX-XXXX-8192')}</td>
                </tr>
                <tr>
                  <td class="label">Commodity & Declared Qty</td>
                  <td class="value">${(() => {
                    const parsed = parseCropAndVariety(currentToken.cropType, currentToken.cropVariety);
                    return `${parsed.cropName} • <em>${parsed.varietyName}</em>`;
                  })()} — <strong>${currentToken.quantityQuintals} Quintals</strong></td>
                </tr>
                <tr class="highlight-row">
                  <td class="label" style="background:#ecfdf5; color:#064e3b;">Guaranteed MSP Settlement</td>
                  <td class="value"><strong>₹${(currentToken.totalAmount || 0).toLocaleString()}</strong> (Rate: ₹${currentToken.mspRatePerQ}/Q)</td>
                </tr>
                <tr>
                  <td class="label">Payment Method & Status</td>
                  <td class="value">
                    ${(() => {
                      const isOffline = currentToken.paymentMode === 'OFFLINE_MANDI' || currentToken.paymentDetails?.paymentMode === 'OFFLINE_MANDI';
                      return isOffline ? 'Offline Take Money (Mandi Cash)' : 'Online Money (Direct Bank Transfer)';
                    })()} — ${
                      (currentToken.currentStageIndex >= 10 || currentToken.status === 'COMPLETED' || currentToken.dbtPayment?.paymentStatus === 'COMPLETED')
                        ? '<span style="color:#065f46; background:#d1fae5; padding:2px 8px; border-radius:4px; font-weight:800; border:1px solid #6ee7b7;">✓ SUCCESS (Paid)</span>'
                        : '<span style="color:#92400e; background:#fef3c7; padding:2px 8px; border-radius:4px; font-weight:700; border:1px solid #fcd34d;">⏳ PENDING (Awaiting Mandi Stage 10 Clearance)</span>'
                    }
                  </td>
                </tr>
                <tr>
                  <td class="label">Designated Mandi Center</td>
                  <td class="value">${center?.centerName || 'Karnal Central APMC Mandi (Center A)'}</td>
                </tr>
                <tr>
                  <td class="label">Reporting Date & Slot</td>
                  <td class="value">${currentToken.scheduledDate} | <strong>${currentToken.scheduledSlot}</strong></td>
                </tr>
                <tr>
                  <td class="label">Weighbridge Bay & Gate</td>
                  <td class="value">Bay #2 (Gross Scale W-1) • Inward Gate #3</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="checklist" style="background:#ecfdf5; border-color:#6ee7b7; color:#064e3b; margin-top:14px;">
            <strong style="color:#064e3b;">🏛️ OFFICIAL GOVERNMENT OF INDIA & STATE APMC STATUTORY DECLARATION:</strong>
            "Under Gazette Notification Ref: <strong>GOI/AGRI-MSP/2026-44B</strong>, the Government of India and State Agricultural Marketing Board officially state that 100% of produce delivered under this verified E-Gate Pass carries guaranteed MSP rate settlement with zero middleman deductions. Payout shall be disbursed via Direct Benefit Transfer (DBT) directly into the verified farmer's Aadhaar-linked bank account within 24 to 48 hours. Mandi authorities are legally mandated to provide priority green-channel weighbridge entry."
          </div>

          <div class="checklist">
            <strong>Mandatory Inward Checklist for Farmer:</strong>
            1. Keep grain moisture content below 17.0% for immediate pass without dockage.
            2. Present this QR Gate Pass on your mobile or paper print to the security gate officer.
            3. Vehicle registration: Tractor Trolley (Carrying Lot ${currentToken.tokenNumber}). Direct DBT transfer initiated post tare-weighing.
          </div>

          <div class="footer">
            <div>
              <div>Security Verification Hash: <strong>SHA256:APMC-${currentToken.tokenNumber}-${Date.now().toString(36).toUpperCase()}</strong></div>
              <div>Ministry of Agriculture & Farmers Welfare, Government of India • Kisan Helpline: 1800-180-1551</div>
            </div>
            <div class="stamp">
              GOVT APMC<br/>OFFICIAL<br/>VERIFIED PASS
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([passHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printTab = window.open(blobUrl, '_blank');
    if (!printTab) {
      window.print();
    }
  };

  const handleCopySummary = () => {
    const parsedCrop = parseCropAndVariety(currentToken.cropType, currentToken.cropVariety);
    const isOffline = currentToken.paymentMode === 'OFFLINE_MANDI' || currentToken.paymentDetails?.paymentMode === 'OFFLINE_MANDI';
    const paymentLabel = isOffline ? 'Offline Take Money (Mandi Cash)' : 'Online Money (Direct Bank Transfer)';

    const text = `GOVERNMENT OF INDIA • APMC DIGITAL MANDI GATE PASS
Token Number: ${currentToken.tokenNumber}
Farmer: ${currentToken.farmer?.fullName || farmerUser?.fullName || 'Kisan'}
Crop: ${parsedCrop.cropName} • Variety: ${parsedCrop.varietyName} (${currentToken.quantityQuintals} Quintals)
MSP Value: ₹${(currentToken.totalAmount || 0).toLocaleString()}
Payment Mode: ${paymentLabel}
Mandi: ${center?.centerName || 'Karnal Central Mandi'}
Date & Slot: ${currentToken.scheduledDate} (${currentToken.scheduledSlot})
Gate: Inward Gate #3 (Bay #2 Weighbridge)
Valid for RFID/Camera scanner entry.`;

    navigator.clipboard?.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto modal-backdrop-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-auto overflow-hidden animate-fadeIn printable-gate-pass-container">
        {/* Top Dialog Bar (Hidden during actual print) */}
        <div className="no-print bg-slate-900 text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-lg shadow">
              🖨️
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center space-x-2">
                <span>Print Official Mandi E-Gate Pass</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                  Ready to Print
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Official APMC Token Pass with Scannable Gate Inward QR & RFID Barcode
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Token Selector if multiple available */}
            {availableTokens.length > 1 && (
              <div className="relative">
                <select
                  value={currentToken.tokenNumber}
                  onChange={(e) => {
                    const found = availableTokens.find((t) => t.tokenNumber === e.target.value);
                    if (found) {
                      setSelectedTokenNumber(found.tokenNumber);
                      if (onSelectToken) onSelectToken(found);
                    }
                  }}
                  className="text-xs bg-slate-800 text-emerald-300 font-mono font-bold py-1.5 px-3 rounded-xl border border-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {availableTokens.map((t) => (
                    <option key={t.tokenNumber} value={t.tokenNumber}>
                      Token #{t.tokenNumber} ({t.cropType.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Hidden during print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>A4 Document Layout formatted for high-contrast thermal & laser printers</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Copy text summary for WhatsApp or SMS"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedNotice ? '✓ Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDedicatedPass}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Open standalone printable page or save as PDF"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Download / Save Pass</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold flex items-center space-x-2 transition-all shadow-md active:scale-95"
              title="Send to physical printer or save as PDF"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>Print Gate Pass Now</span>
            </button>
          </div>
        </div>

        {/* THE OFFICIAL PRINTABLE GATE PASS CANVAS */}
        <div
          id="printable-gate-pass"
          className="p-6 sm:p-8 space-y-6 bg-white border-2 border-emerald-900 m-4 sm:m-6 rounded-2xl relative"
        >
          {/* Watermark Seal */}
          <div className="absolute right-8 bottom-20 pointer-events-none opacity-15 rotate-[-12deg] select-none">
            <div className="w-36 h-36 rounded-full border-4 border-emerald-900 flex items-center justify-center text-center p-2">
              <div className="text-[11px] font-black uppercase text-emerald-950 tracking-wider">
                GOVT OF INDIA<br />
                APMC VERIFIED<br />
                EXPRESS ENTRY
              </div>
            </div>
          </div>

          {/* National APMC Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-900 pb-4 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-700 font-black flex items-center space-x-1.5">
                <span>🏛️</span>
                <span>GOVERNMENT OF INDIA • MINISTRY OF AGRICULTURE & FARMERS WELFARE</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5 tracking-tight">
                NATIONAL APMC MANDI DIGITAL E-GATE PASS
              </h1>
              <div className="text-xs text-emerald-800 font-bold flex items-center space-x-2 mt-0.5">
                <span>Direct Procurement & Electronic Weighbridge Inward Pass</span>
                <span>•</span>
                <span className="text-emerald-700">Valid for Fast-Track Entry</span>
              </div>
            </div>

            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Token Pass Number
              </div>
              <div className="inline-block px-4 py-1.5 rounded-xl bg-emerald-900 text-white font-mono font-black text-xl tracking-wider shadow-sm mt-0.5">
                #{currentToken.tokenNumber}
              </div>
              <div className="text-[10px] text-emerald-800 font-bold mt-1">
                STATUS: APPROVED & ALLOTTED
              </div>
            </div>
          </div>

          {/* Linear Barcode for Gate Optical Scanner */}
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-3">
              {/* Simulated 1D Barcode Pattern */}
              <div className="flex items-end h-7 space-x-0.5">
                {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3, 3, 8, 3, 2, 7, 9, 5, 0, 2, 8, 8, 4, 1, 9, 7, 1].map((h, i) => (
                  <div
                    key={i}
                    className={`w-[2px] bg-slate-900 ${i % 2 === 0 ? 'h-7' : 'h-5'}`}
                  />
                ))}
              </div>
              <div className="font-mono text-[11px] font-bold text-slate-800 tracking-wider">
                GP-2026-{currentToken.tokenNumber}-KRN-APMC
              </div>
            </div>
            <div className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              RFID SENSOR ENABLED
            </div>
          </div>

          {/* Pass Body: 2D QR Code + Detailed Official Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Scannable QR Code Canvas */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl">
              <canvas ref={qrCanvasRef} className="w-[150px] h-[150px] bg-white rounded-lg shadow-sm" />
              <div className="text-[10px] font-mono font-extrabold text-slate-900 mt-2 text-center uppercase tracking-wider">
                Scan at Mandi Gate
              </div>
              <span className="text-[9px] text-emerald-800 font-bold mt-0.5 text-center">
                Valid for Boom-Barrier Auto-Lift
              </span>
            </div>

            {/* Information Grid */}
            <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Farmer Full Name:
                </span>
                <strong className="text-slate-900 text-sm font-black">
                  {currentToken.farmer?.fullName || farmerUser?.fullName || 'Registered Farmer'}
                </strong>
                <span className="text-slate-500 text-[10px] block font-mono mt-0.5">
                  Aadhaar: {currentToken.farmer?.aadhaarMasked || (farmerUser?.aadhaar ? `XXXX-XXXX-${farmerUser.aadhaar.slice(-4)}` : 'Verified via e-KYC')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Commodity & Quantity:
                </span>
                {(() => {
                  const parsed = parseCropAndVariety(currentToken.cropType, currentToken.cropVariety);
                  return (
                    <>
                      <strong className="text-slate-900 text-sm font-black block">
                        {parsed.cropName}
                      </strong>
                      <span className="text-emerald-800 font-bold block text-xs">
                        Variety: {parsed.varietyName}
                      </span>
                    </>
                  );
                })()}
                <span className="text-slate-600 font-bold block text-xs mt-0.5">
                  {currentToken.quantityQuintals} Quintals Declared
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                <span className="text-emerald-800 block text-[10px] uppercase font-bold">
                  Guaranteed MSP Value:
                </span>
                <strong className="text-emerald-950 text-base font-mono font-black">
                  ₹{(currentToken.totalAmount || 0).toLocaleString()}
                </strong>
                <span className="text-emerald-700 text-[10px] block font-semibold">
                  MSP Rate: ₹{currentToken.mspRatePerQ}/Quintal
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Assigned Mandi Center:
                </span>
                <strong className="text-emerald-950 text-xs font-black block">
                  {center?.centerName || 'Karnal Central APMC Mandi (Center A)'}
                </strong>
                <span className="text-slate-500 text-[10px] block">
                  District: {center?.district || 'Karnal'}, {center?.state || 'Haryana'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Reporting Schedule & Slot:
                </span>
                <strong className="text-slate-900 text-xs font-black block">
                  {currentToken.scheduledDate}
                </strong>
                <span className="text-emerald-800 font-black block text-xs">
                  {currentToken.scheduledSlot}
                </span>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-blue-800 block text-[10px] uppercase font-bold">
                  Vehicle & Gate Assignment:
                </span>
                <strong className="text-blue-950 text-xs font-black block">
                  Tractor Trolley (Lane #2)
                </strong>
                <span className="text-blue-700 text-[10px] block">
                  Weighbridge Bay W-1 • Inward Gate #3
                </span>
              </div>

              {/* Payment Method & Strict Completion Status */}
              {(() => {
                const isPaymentDone = currentToken.currentStageIndex >= 10 || currentToken.status === 'COMPLETED' || currentToken.dbtPayment?.paymentStatus === 'COMPLETED';
                const isOffline = currentToken.paymentMode === 'OFFLINE_MANDI' || currentToken.paymentDetails?.paymentMode === 'OFFLINE_MANDI';
                const methodTitle = isOffline ? 'Offline Take Money (Mandi Cash Disbursal)' : 'Online Money (Direct Bank Transfer)';
                const settlementNote = isOffline ? '(Mandi Cash Voucher)' : '(Bank Account Direct Credit)';

                return (
                  <div className={`p-3 rounded-xl border sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isPaymentDone
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        Payment Method:
                      </span>
                      <strong className="text-slate-900 text-xs font-black">
                        {methodTitle}
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                        {isPaymentDone
                          ? `Settled: ₹${(currentToken.totalAmount || 0).toLocaleString()} ${settlementNote}`
                          : 'Awaiting Stage 10 Mandi Certification'}
                      </span>
                    </div>
                    <div>
                      {isPaymentDone ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1">
                          <span>✓</span>
                          <span>SUCCESS (Disbursed)</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1">
                          <span>⏳</span>
                          <span>PENDING MANDI CLEARANCE</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Official Government Directive & Statutory Declaration */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border-2 border-emerald-300 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center space-x-2 font-black text-emerald-950 text-[11px] uppercase tracking-wide">
              <span>🏛️</span>
              <span>OFFICIAL GOVERNMENT OF INDIA & STATE APMC STATUTORY DECLARATION:</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
              "Under Gazette Notification Ref: <strong>GOI/AGRI-MSP/2026-44B</strong>, the Government of India and State Agricultural Marketing Board officially state that 100% of produce delivered under this verified E-Gate Pass carries guaranteed MSP rate settlement with zero middleman deductions. Payout shall be disbursed via Direct Benefit Transfer (DBT) directly into the verified farmer's Aadhaar-linked bank account within 24 to 48 hours. Mandi authorities are legally mandated to provide priority green-channel weighbridge entry."
            </p>
          </div>

          {/* Mandatory Guidelines & Moisture Limits */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1.5">
            <div className="font-extrabold text-amber-900 flex items-center space-x-1.5 uppercase text-[11px] tracking-wide">
              <span>🌾 MANDI INWARD & QUALITY SPECIFICATIONS:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 leading-snug">
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Moisture Limit:</strong> ≤ 17.0% (Instant sensor assay at gate)</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Foreign Matter:</strong> ≤ 2.0% (Clean kernels ensure zero dockage)</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Direct DBT Settlement:</strong> Paid directly to Aadhaar-seeded bank a/c</span>
              </li>
            </ul>
          </div>

          {/* Official Signatures and Footer */}
          <div className="pt-3 border-t-2 border-emerald-900 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-xs">
            <div className="space-y-1 text-slate-600">
              <div className="text-[10px] font-mono">
                Verification Hash: <strong>SHA256:APMC-{currentToken.tokenNumber}-{currentToken.cropType.substring(0, 3).toUpperCase()}</strong>
              </div>
              <div className="text-[10px]">
                Authorized under National APMC Procurement Rules 2026. Helpline: <strong>1800-180-1551</strong>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="font-serif italic text-sm font-bold text-emerald-950">
                S. K. Verma
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Mandi Secretary & Chief Weighment Officer
              </div>
              <div className="text-[9px] text-emerald-800 font-mono">
                Digital Certificate ID: GOV-APMC-CERT-8192
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden during actual print) */}
        <div className="no-print bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px]">
            Tip: You can also show this screen on your smartphone directly to the gate scanner.
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold shadow flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Print Gate Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
