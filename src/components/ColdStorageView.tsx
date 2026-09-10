import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Snowflake,
  Calendar,
  Clock,
  Printer,
  Volume2,
  CheckCircle2,
  Building,
  DollarSign,
  ShieldCheck,
  ThermometerSnowflake,
  Package,
  MapPin,
  Phone,
  HelpCircle,
  Bell,
} from 'lucide-react';
import { ColdStorageBooking, ColdStorageFacility, LanguageCode, FarmerUser } from '../types.ts';
import { COLD_STORAGE_FACILITIES } from '../data/coldStorageData.ts';
import { speakText } from '../lib/speech.ts';
import { GovtPaymentGatewayModal } from './GovtPaymentGatewayModal.tsx';

interface ColdStorageViewProps {
  farmerUser: FarmerUser | null;
  lang: LanguageCode;
  langText: Record<string, string>;
}

export const ColdStorageView: React.FC<ColdStorageViewProps> = ({
  farmerUser,
  lang,
  langText,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form State
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    COLD_STORAGE_FACILITIES[0].id
  );
  const [cropName, setCropName] = useState('Paddy (Common)');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(60);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [arrivalDate, setArrivalDate] = useState('2026-09-12');
  const [paymentOption, setPaymentOption] = useState<'AT_GATE' | 'ONLINE_DBT'>('AT_GATE');
  const [farmerName, setFarmerName] = useState(farmerUser?.fullName || '');
  const [farmerAadhaar, setFarmerAadhaar] = useState(farmerUser?.aadhaar || '');
  const [farmerMobile, setFarmerMobile] = useState(farmerUser?.mobileNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);

  // Sync with farmerUser or clear on logout
  useEffect(() => {
    if (farmerUser) {
      setFarmerName(farmerUser.fullName || '');
      setFarmerAadhaar(farmerUser.aadhaar || '');
      setFarmerMobile(farmerUser.mobileNumber || '');
    } else {
      setFarmerName('');
      setFarmerAadhaar('');
      setFarmerMobile('');
      setActiveBooking(null);
    }
  }, [farmerUser]);

  // Government Payment Gateway State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Active Confirmed Booking e-NWR - null until farmer books
  const [activeBooking, setActiveBooking] = useState<ColdStorageBooking | null>(null);

  const selectedFacility =
    COLD_STORAGE_FACILITIES.find((f) => f.id === selectedFacilityId) ||
    COLD_STORAGE_FACILITIES[0];

  // Pricing calculations
  const dailyRate = selectedFacility.ratePerQuintalPerDay;
  const grossRent = Math.round(quantityQuintals * dailyRate * durationDays);
  const fumigationFee = 120; // standard WDRA scientific preservation fee
  const govtSubsidyDiscount = Math.round(grossRent * 0.3); // 30% AIF / Small Farmer subsidy
  const netPayable = grossRent + fumigationFee - govtSubsidyDiscount;

  // Render QR Code onto canvas
  useEffect(() => {
    if (activeBooking && qrCanvasRef.current) {
      const qrData = JSON.stringify({
        booking: activeBooking.bookingId,
        eNwr: activeBooking.eNwrReceiptNumber,
        facility: activeBooking.facilityName,
        farmer: activeBooking.farmerName,
        crop: activeBooking.cropName,
        qty: activeBooking.quantityQuintals,
        bay: activeBooking.bayNumber,
        days: activeBooking.durationDays,
        netPayable: activeBooking.netPayable,
      });

      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 130,
        margin: 1,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff',
        },
      });
    }
  }, [activeBooking]);

  const handleReadAloud = () => {
    const text = `Cold Storage and Scientific Warehousing booking. Store your unsold produce safely to get better market prices. Daily charge is rupees ${dailyRate} per quintal per day. For ${quantityQuintals} quintals for ${durationDays} days, total payable after government 30 percent subsidy is only rupees ${netPayable}.`;
    speakText(text, lang);
  };

  const handleBookStorage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentResult: {
    transactionRef: string;
    challanNumber: string;
    paymentMethod: string;
    paidAt: string;
    amountPaid: number;
  }) => {
    const newBooking: ColdStorageBooking = {
      bookingId: `CS-BKG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      cropName,
      quantityQuintals,
      durationDays,
      ratePerQuintalPerDay: dailyRate,
      grossRent,
      fumigationFee,
      govtSubsidyDiscount,
      netPayable,
      bayNumber: `Chamber ${Math.floor(1 + Math.random() * 4)}, Bay #${Math.floor(
        10 + Math.random() * 80
      )}`,
      eNwrReceiptNumber: paymentResult.challanNumber,
      farmerName,
      farmerAadhaar: farmerAadhaar.replace(/.(?=.{4})/g, 'X'),
      farmerMobile,
      arrivalDate,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      paymentStatus: 'CONFIRMED',
      paymentMethod: paymentResult.paymentMethod,
      transactionRef: paymentResult.transactionRef,
      paidAt: paymentResult.paidAt,
    };

    setActiveBooking(newBooking);

    const smsMsg = `Kisan ${farmerName}, payment of ₹${netPayable} confirmed for Cold Storage booking #${newBooking.bookingId} at ${selectedFacility.name}. Rate: ₹${dailyRate}/Q/day. ${quantityQuintals}Q space reserved for ${durationDays} days. Gate Bay: ${newBooking.bayNumber}. Ref: ${paymentResult.transactionRef}`;
    setSmsSentNotice(smsMsg);

    const spoken = `Cold storage payment of rupees ${netPayable} confirmed successfully at ${selectedFacility.name}. E-Challan receipt issued.`;
    speakText(spoken, lang);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white p-6 rounded-2xl shadow-xl border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/30 text-sky-300 font-bold border border-sky-400/30 flex items-center space-x-1">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-400" />
              <span>WDRA / CWC Scientific Storage</span>
            </span>
            <span className="text-xs text-sky-200">Avoid Distress Selling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Accredited Cold Storage & Grain Warehousing
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            If your produce is not sold immediately or mandi prices are low, book temperature-controlled godowns and silos. Transparent pricing <strong>per quintal per day</strong> with 30% Agriculture Infrastructure Fund (AIF) subsidy.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReadAloud}
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 transition-all border border-blue-600/50"
            title="Listen to cold storage charges in selected language"
          >
            <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>🔊 Read Aloud</span>
          </button>

          {activeBooking && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-blue-800" />
              <span>Print e-NWR Pass</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-World Price Transparency Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-500 font-semibold">Standard Daily Charge</div>
          <div className="text-lg font-extrabold text-blue-900 font-mono mt-0.5">
            ₹0.70 – ₹1.10 <span className="text-xs font-normal text-slate-500">/Q/day</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Real-world mandi godown rate</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-500 font-semibold">Monthly Package Discount</div>
          <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
            ₹20 – ₹30 <span className="text-xs font-normal text-slate-500">/Q/month</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Save 15% on long-term holding</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-500 font-semibold">Govt. Storage Subsidy</div>
          <div className="text-lg font-extrabold text-amber-600 font-mono mt-0.5">
            30% Rebate
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Subsidized under Agri Infra Fund</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-500 font-semibold">Pledge Loan Support</div>
          <div className="text-lg font-extrabold text-purple-700 font-mono mt-0.5">
            e-NWR Verified
          </div>
          <div className="text-[10px] text-slate-500 mt-1">70% bank loan against stored produce</div>
        </div>
      </div>

      {/* Grid: 1-Side Booking Form (Left) & Confirmed e-NWR Receipt Pass (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Cold Storage Booking Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Snowflake className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                Reserve Cold Storage Space
              </h2>
              <p className="text-xs text-slate-500">
                Direct space allocation with official electronic warehouse receipt
              </p>
            </div>
          </div>

          <form onSubmit={handleBookStorage} className="space-y-4 text-xs">
            {/* Facility Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Select Cold Storage / Warehouse Facility <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
              >
                {COLD_STORAGE_FACILITIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — ₹{f.ratePerQuintalPerDay}/Q/day ({f.district}, {f.state})
                  </option>
                ))}
              </select>

              <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-0.5">
                <div className="font-bold flex items-center justify-between">
                  <span>Temperature: {selectedFacility.tempRange}</span>
                  <span className="text-emerald-700">Available: {selectedFacility.availableQuintals} Q</span>
                </div>
                <div>Accreditation: {selectedFacility.accreditedBy}</div>
                <div>Helpline: {selectedFacility.contactNumber}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Crop Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Paddy (Common)">Paddy (Common)</option>
                  <option value="Paddy (Grade A)">Paddy (Grade A)</option>
                  <option value="Wheat (Buffer)">Wheat (Buffer)</option>
                  <option value="Potato (Kufri)">Potato (Table / Seed - Kufri)</option>
                  <option value="Onion (Nasik Red)">Onion (Rabi Red)</option>
                  <option value="Soybean (Yellow)">Soybean (Yellow)</option>
                  <option value="Maize (Makka)">Maize (Makka)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity (in Quintals) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={2000}
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(parseFloat(e.target.value) || 10)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Storage Duration (Days) <span className="text-red-500">*</span>
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value={7}>7 Days (Short Holding)</option>
                  <option value={15}>15 Days (Price Rebound Window)</option>
                  <option value={30}>30 Days (1 Month Package)</option>
                  <option value={60}>60 Days (2 Months)</option>
                  <option value={90}>90 Days (Quarterly Season)</option>
                  <option value={180}>180 Days (Long-term Seed Preservation)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Planned Inward Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Aadhaar Registered Mobile
                </label>
                <input
                  type="tel"
                  value={farmerMobile}
                  onChange={(e) => setFarmerMobile(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>

            {/* Payment Choice */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                    paymentOption === 'AT_GATE'
                      ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400/40 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="storagePay"
                    checked={paymentOption === 'AT_GATE'}
                    onChange={() => setPaymentOption('AT_GATE')}
                    className="accent-blue-600"
                  />
                  <span>Pay at Warehouse Inward Gate</span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                    paymentOption === 'ONLINE_DBT'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/40 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="storagePay"
                    checked={paymentOption === 'ONLINE_DBT'}
                    onChange={() => setPaymentOption('ONLINE_DBT')}
                    className="accent-emerald-600"
                  />
                  <span>Online Bank Transfer (DBT)</span>
                </label>
              </div>
            </div>

            {/* Real-World Price Calculation Card */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                <span>Real-World Cost Breakdown:</span>
                <span className="text-emerald-400 font-mono">
                  ₹{dailyRate}/Q × {quantityQuintals}Q × {durationDays} days
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Storage Rental:</span>
                  <span className="font-mono">₹{grossRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Fumigation & Preservation:</span>
                  <span className="font-mono">₹{fumigationFee}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Govt. 30% AIF Subsidy Rebate:</span>
                  <span className="font-mono">-₹{govtSubsidyDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-400 text-sm border-t border-slate-800 pt-1.5">
                  <span>Net Farmer Payable:</span>
                  <span className="font-mono">₹{netPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-800 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Snowflake className="w-4 h-4" />
              <span>{isSubmitting ? 'Allocating Bay & Space...' : 'Confirm Space & Generate e-NWR Receipt'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Official e-NWR Receipt Pass & Gate Pass */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {smsSentNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <div>
                <strong>SMS Dispatched:</strong> {smsSentNotice}
              </div>
            </div>
          )}

          {activeBooking ? (
            <div className="border-2 border-blue-900 p-6 rounded-2xl bg-sky-50/20 relative space-y-5">
              <div className="flex items-center justify-between border-b-2 border-blue-900 pb-3">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-600 font-extrabold">
                    GOVERNMENT OF INDIA • WDRA
                  </div>
                  <h3 className="text-base font-extrabold text-blue-950">
                    Electronic Negotiable Warehouse Receipt (e-NWR)
                  </h3>
                  <div className="text-[10px] text-blue-800 font-semibold">
                    Accredited Cold Storage Allocation
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-950 font-mono font-extrabold text-xs border border-blue-300">
                    {activeBooking.eNwrReceiptNumber}
                  </span>
                  <div className="text-[9px] text-emerald-700 font-bold mt-1">
                    STATUS: ALLOCATED & CONFIRMED
                  </div>
                </div>
              </div>

              {/* QR and Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
                  <canvas ref={qrCanvasRef} className="w-[120px] h-[120px]" />
                  <div className="text-[9px] text-slate-500 font-mono mt-1 text-center">
                    Scan at Cold Storage Inward Gate
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Farmer:</span>
                    <strong className="text-slate-900 ml-1">{activeBooking.farmerName}</strong>
                    <span className="text-slate-400 text-[10px] ml-1">
                      ({activeBooking.farmerAadhaar})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Facility:</span>
                    <strong className="text-blue-900 ml-1">{activeBooking.facilityName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Crop & Space:</span>
                    <strong className="text-slate-900 ml-1">{activeBooking.cropName}</strong> —{' '}
                    {activeBooking.quantityQuintals} Quintals
                  </div>
                  <div>
                    <span className="text-slate-500">Duration & Inward:</span>
                    <strong className="text-slate-900 ml-1">
                      {activeBooking.durationDays} Days (From {activeBooking.arrivalDate})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Assigned Bay:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-xs ml-1 border border-amber-300 font-mono">
                      {activeBooking.bayNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Net Payable:</span>
                    <strong className="text-emerald-800 ml-1 font-mono font-bold">
                      ₹{activeBooking.netPayable.toLocaleString()}
                    </strong>{' '}
                    <span className="text-[10px] text-slate-500 font-medium">
                      (Govt 30% subsidy applied)
                    </span>
                  </div>
                </div>
              </div>

              {/* Warehouse Advisory */}
              <div className="p-3 bg-blue-950 text-white rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Warehouse Pledge Finance Notice</span>
                  <span className="text-sky-300">Bank Loan Eligible</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Using this e-NWR receipt, farmers can avail instant short-term pledge credit up to 70% of produce value from public sector banks at 7% concessional interest rate.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>WDRA Digital Seal: #WDRA-IN-2026-OK</span>
                <span className="font-mono">{new Date(activeBooking.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Snowflake className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p>No storage booked yet. Choose your parameters on the left to allocate space.</p>
            </div>
          )}
        </div>
      </div>

      {/* Govt Payment Gateway Modal */}
      <GovtPaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceTitle={`Cold Storage Booking - ${selectedFacility.name}`}
        serviceCategory="COLD_STORAGE"
        beneficiaryAgency="Warehousing Development and Regulatory Authority (WDRA)"
        totalAmount={netPayable}
        breakdown={[
          { label: `Base Storage (${quantityQuintals} Qtl × ${durationDays} Days @ ₹${dailyRate}/day)`, amount: grossRent },
          { label: 'Scientific Fumigation & Quality Preservation Fee', amount: fumigationFee },
          { label: 'Agriculture Infrastructure Fund (AIF) 30% Govt Subsidy', amount: govtSubsidyDiscount, isDiscount: true },
        ]}
        farmerName={farmerUser?.fullName || farmerName || 'Registered Farmer'}
        farmerAadhaar={farmerUser?.aadhaar || farmerAadhaar || 'XXXX-XXXX-0000'}
        farmerMobile={farmerUser?.mobileNumber || farmerMobile || '98765-00000'}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
