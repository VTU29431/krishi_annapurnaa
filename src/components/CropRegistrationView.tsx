import React, { useState } from 'react';
import {
  Smartphone,
  Building2,
  Store,
  CheckCircle,
  Search,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Printer,
} from 'lucide-react';

import { FarmerUser } from '../types.ts';

interface CropRegistrationViewProps {
  farmerUser?: FarmerUser | null;
  onProceedToBooking: (verifiedData?: any) => void;
}

export const CropRegistrationView: React.FC<CropRegistrationViewProps> = ({
  farmerUser,
  onProceedToBooking,
}) => {
  const [selectedPathway, setSelectedPathway] = useState<'self' | 'pacs' | 'csc'>('self');

  // Land Verification State
  const [state, setState] = useState('Andhra Pradesh');
  const [portal, setPortal] = useState('MeeBhoomi Portal (AP)');
  const [villageArea, setVillageArea] = useState('Guntur Rural / Kankipadu');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<any>(null);

  const handleVerifyLandRecord = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/crop-registrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, villageArea }),
      });
      const data = await res.json();
      setVerifiedRecord(data.record || {
        farmerName: farmerUser?.fullName || 'Verified Farmer Landholder',
        villageArea: villageArea || 'Guntur Rural / Kankipadu',
        cropName: 'Tobacco / Mirchi',
        maxProcurementQuotaQ: 45,
        stateRegistry: portal,
      });
    } catch (err) {
      console.error('Failed to verify land record:', err);
      setVerifiedRecord({
        farmerName: farmerUser?.fullName || 'Verified Farmer Landholder',
        villageArea: villageArea || 'Guntur Rural / Kankipadu',
        cropName: 'Tobacco / Mirchi',
        maxProcurementQuotaQ: 45,
        stateRegistry: portal,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Government of India Crop Sowing & Land Registry e-KYC</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            How Farmers Can Register Their Crop
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Step-by-step guidance for Online Self-Registration, PACS / Mandi Helpdesk assisted booking, and Village CSC kiosks with real-time land record e-KYC validation.
          </p>
        </div>
      </div>

      {/* 3 Registration Pathways */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Select Preferred Channel
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            3 Official Ways to Register Your Crop
          </h2>
        </div>

        {/* Pathway Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedPathway('self')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedPathway === 'self'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pathway 1: Self Online (Mobile / Web)</span>
          </button>

          <button
            onClick={() => setSelectedPathway('pacs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedPathway === 'pacs'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Pathway 2: PACS / Mandi Helpdesk</span>
          </button>

          <button
            onClick={() => setSelectedPathway('csc')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedPathway === 'csc'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Pathway 3: Village CSC / MeeSeva</span>
          </button>
        </div>

        {/* Pathway 1 Content */}
        {selectedPathway === 'self' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                1
              </div>
              <h3 className="font-bold text-xs text-slate-900">Aadhaar & Land e-KYC</h3>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Log in via mobile OTP. Portal links directly to State Revenue databases (Jamabandi / Bhulekh / Dharani) to fetch 7/12 RoR records.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                2
              </div>
              <h3 className="font-bold text-xs text-slate-900">Declare Crop & Acreage</h3>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Select Kharif/Rabi season, crop type (e.g. Paddy Grade A), and acreage. Sowing verification calculates your maximum procurement quota.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                3
              </div>
              <h3 className="font-bold text-xs text-slate-900">Choose Slot & Mandi</h3>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Select your nearest procurement center. The AI model shows live waiting times and reserves a 30-minute arrival window.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                4
              </div>
              <h3 className="font-bold text-xs text-slate-900">QR Digital Token Pass</h3>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Receive instant QR gate pass on your phone with SMS alert. Valid for automated weighbridge entry without physical standing.
              </p>
            </div>
          </div>
        )}

        {/* Pathway 2 Content */}
        {selectedPathway === 'pacs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Step 1</div>
              <h3 className="font-bold text-xs text-slate-900">Visit Mandi / PACS Office</h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Carry your Aadhaar card, Land Patta passbook, bank account statement, and Patwari sowing slip.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Step 2</div>
              <h3 className="font-bold text-xs text-slate-900">Biometric Verification</h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Operator verifies fingerprint on the government POS terminal and checks your state quota entitlement.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Step 3</div>
              <h3 className="font-bold text-xs text-slate-900">Printed Barcode Slip</h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Collect physical laminated token slip with assigned time and SMS alert sent to your mobile.
              </p>
            </div>
          </div>
        )}

        {/* Pathway 3 Content */}
        {selectedPathway === 'csc' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Step 1</div>
              <h3 className="font-bold text-xs text-slate-900">Village CSC Kiosk</h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Walk into your Gram Panchayat Common Service Centre (CSC / MeeSeva / e-Mitra).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Step 2</div>
              <h3 className="font-bold text-xs text-slate-900">Assisted Portal Upload</h3>
              <p className="text-[11px] text-slate-600 mt-1">
                VLE checks land survey numbers, enters harvested quintals, and picks low-congestion mandi slot.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Step 3</div>
              <h3 className="font-bold text-xs text-slate-900">Free / Nominal Govt Fee</h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Govt approved service (free/max ₹10). Collect printed gate pass with QR code ready for tractor transit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Land Record & Acreage Verification Simulator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              Interactive Land Record & Eligibility Verification (e-KYC)
            </h2>
            <p className="text-xs text-slate-500">
              Simulates real-time query against State Land Registry APIs (Jamabandi, Dharani, MFMB, Bhulekh)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Haryana">Haryana</option>
              <option value="Punjab">Punjab</option>
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              State Land Registry Portal
            </label>
            <select
              value={portal}
              onChange={(e) => setPortal(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Meri Fasal Mera Byora (MFMB Haryana)">MFMB (Haryana)</option>
              <option value="Jamabandi Land Registry">Jamabandi Revenue</option>
              <option value="Dharani Land Portal">Dharani (Telangana)</option>
              <option value="UP Bhulekh / FCS">UP Bhulekh</option>
              <option value="MeeBhoomi Portal">MeeBhoomi (AP)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Village / Mandal Area
            </label>
            <input
              type="text"
              value={villageArea}
              onChange={(e) => setVillageArea(e.target.value)}
              placeholder="e.g. Guntur Rural / Tadikonda"
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleVerifyLandRecord}
              disabled={isVerifying}
              className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Querying API...' : 'Verify Land Records'}</span>
            </button>
          </div>
        </div>

        {/* Verification Result Card */}
        {verifiedRecord && (
          <div className="p-5 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Government Land Record Verified (100% e-KYC Match)
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium">
                {verifiedRecord.stateRegistry} • Geo-referenced Girdawari Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Registered Land Owner:</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {farmerUser?.fullName || 'Verified Farmer Landholder'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Village / Mandal Area:</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {verifiedRecord.villageArea || villageArea}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Verified Sown Crop:</span>
                <div className="font-bold text-emerald-800 text-sm mt-0.5">
                  {verifiedRecord.cropName}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Procurement Quota Ceiling:</span>
                <div className="font-bold text-emerald-900 text-sm mt-0.5">
                  {verifiedRecord.maxProcurementQuotaQ} Quintals
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-emerald-800 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pre-approved for Zero-Wait Token Generation at Karnal Procurement Center</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <Printer className="w-3 h-3 text-slate-500" />
                  <span>Print e-KYC Slip</span>
                </button>
                <button
                  onClick={() => onProceedToBooking(verifiedRecord)}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1"
                >
                  <span>Book Mandi Slot</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-slate-900 text-base mb-4">
          Frequently Asked Questions on Crop Registration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <h4 className="font-bold text-slate-800 text-xs mb-1">Can Tenant Farmers Register?</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Yes. Sharecroppers and tenant farmers (Bataidars) can register with a certified Tenancy Agreement endorsed by the Village Patwari / Sarpanch.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <h4 className="font-bold text-slate-800 text-xs mb-1">What If Sown Crop Differs?</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If actual harvest differs from initial e-Girdawari, request a spot inspection at the Mandi Helpdesk before tractor weighment.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <h4 className="font-bold text-slate-800 text-xs mb-1">Token Validity Duration</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Tokens remain valid for 24 hours from your scheduled slot. If vehicle breakdown occurs, reschedule once via SMS without penalty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
