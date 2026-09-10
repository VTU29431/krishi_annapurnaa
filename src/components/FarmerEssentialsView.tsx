import React, { useState } from 'react';
import {
  Coins,
  Calculator,
  ClipboardCheck,
  Droplet,
  Printer,
  Headphones,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { MSP_RATES, ESSENTIAL_DOCUMENTS } from '../data/mockData.ts';

interface FarmerEssentialsViewProps {
  onProceedToBooking: () => void;
}

export const FarmerEssentialsView: React.FC<FarmerEssentialsViewProps> = ({
  onProceedToBooking,
}) => {
  // Calculator state
  const [selectedCropId, setSelectedCropId] = useState('paddy_grade_a');
  const [calcQty, setCalcQty] = useState<number>(50);

  // Documents checklist state
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // Quality FAQ tab
  const [activeFaqCrop, setActiveFaqCrop] = useState<'paddy' | 'wheat' | 'maize' | 'cotton'>('paddy');

  const selectedCrop = MSP_RATES.find((c) => c.id === selectedCropId) || MSP_RATES[0];
  const totalPayout = calcQty * selectedCrop.ratePerQuintal;

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedDocs).filter(Boolean).length;
  const readinessPct = Math.round((completedCount / ESSENTIAL_DOCUMENTS.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
            <Coins className="w-3.5 h-3.5" />
            <span>Government of India Approved Minimum Support Prices</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Farmer Essentials Hub (किसान आवश्यक सेवाएं)
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Approved Minimum Support Price (MSP) rate cards, mandatory documents checklist, grain moisture tolerance limits, and 24x7 toll-free farmer assistance.
          </p>
        </div>
      </div>

      {/* Sub-section 1: Official MSP Table & Calculator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              CCEA Approved Benchmark Rates
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Official MSP Ready Reckoner (2024–2026)
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              100% Direct Benefit Transfer (DBT)
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
              Zero Mandi Fee for Farmers
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table */}
          <div className="lg:col-span-8 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Commodity Crop</th>
                  <th className="p-3">Season</th>
                  <th className="p-3 text-right">Official MSP (₹/q)</th>
                  <th className="p-3 text-center">Max Moisture</th>
                  <th className="p-3 text-center">Payment Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MSP_RATES.map((crop) => (
                  <tr
                    key={crop.id}
                    className={`hover:bg-emerald-50/40 transition-colors ${
                      crop.id === selectedCropId ? 'bg-emerald-50/50 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                      <span>{crop.icon}</span>
                      <span>
                        {crop.name} <span className="text-slate-500 font-normal">({crop.hindiName})</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{crop.season}</td>
                    <td className="p-3 text-right font-extrabold text-emerald-800 font-mono">
                      ₹{crop.ratePerQuintal.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        ≤ {crop.maxMoisturePct}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-600 font-medium">
                      {crop.payoutTimeline}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instant Calculator */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Instant MSP Revenue Calculator</h3>
                  <p className="text-[10px] text-slate-500">Calculate gross payout before dispatching tractor</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Crop</label>
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {MSP_RATES.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name} (₹{crop.ratePerQuintal}/q)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    value={calcQty}
                    min={1}
                    max={1000}
                    onChange={(e) => setCalcQty(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold text-sm text-slate-900"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">MSP Benchmark:</span>
                    <span className="font-bold text-slate-800">
                      ₹{selectedCrop.ratePerQuintal.toLocaleString()} / q
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Mandi Commission:</span>
                    <span className="font-bold text-emerald-700">₹0.00 (Zero Fee)</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Total Guaranteed Payout:</span>
                    <span className="font-extrabold text-emerald-800 text-lg font-mono">
                      ₹{totalPayout.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-800 bg-emerald-100/80 p-2 rounded-lg font-medium">
                    Direct payment credited into your Aadhaar-linked Bank A/c within 48-72 hours.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onProceedToBooking}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-all"
            >
              Book Mandi Slot for this Crop
            </button>
          </div>
        </div>
      </div>

      {/* Sub-section 2: Mandatory Documents Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Gate Entry Readiness Check</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
              Mandatory Documents Checklist for Mandi Weighbridge Entry
            </h3>
          </div>
          <button
            onClick={() => window.print()}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs flex items-center space-x-1.5 hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Readiness Slip</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
            <span>Readiness Status:</span>
            <span className={readinessPct === 100 ? 'text-emerald-700' : 'text-amber-700'}>
              {completedCount} of {ESSENTIAL_DOCUMENTS.length} Documents Ready ({readinessPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${readinessPct}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ESSENTIAL_DOCUMENTS.map((doc) => (
            <label
              key={doc.id}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                checkedDocs[doc.id]
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-200 bg-white hover:border-emerald-400'
              }`}
            >
              <input
                type="checkbox"
                checked={!!checkedDocs[doc.id]}
                onChange={() => toggleDoc(doc.id)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <div className="font-bold text-slate-900 text-xs">{doc.title}</div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{doc.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Sub-section 3: Grain Quality & Moisture Standards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Droplet className="w-3.5 h-3.5" />
            <span>Fair Average Quality (FAQ) Norms</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
            Moisture Limits & Crop Quality Acceptance Tolerances
          </h3>
        </div>

        <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs">
          {[
            { id: 'paddy', label: '🌾 Paddy (धान)' },
            { id: 'wheat', label: '🌾 Wheat (गेहूं)' },
            { id: 'maize', label: '🌽 Maize (मक्का)' },
            { id: 'cotton', label: '☁️ Cotton (कपास)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFaqCrop(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFaqCrop === tab.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeFaqCrop === 'paddy' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="text-xs text-emerald-900 font-bold uppercase">Max Moisture</div>
              <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">≤ 17.0%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Ideal storage moisture is 14%. Paddy with moisture above 17% cannot be accepted by FCI due to storage fungal risk.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Foreign Matter</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">≤ 2.0%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Includes chaff, straw, mud balls, and dust. Winnow your harvest on clean tarpaulins before loading.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Damaged Grains</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">≤ 5.0%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Discolored or rain-affected kernels. Keep rain-damaged bags separate to avoid whole-load rejection.
              </p>
            </div>
          </div>
        )}

        {activeFaqCrop === 'wheat' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="text-xs text-emerald-900 font-bold uppercase">Max Moisture</div>
              <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">≤ 12.0%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Wheat requires strict dry standards (≤ 12%) for safe silo preservation and preventing weevil infestation.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Foreign Matter</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">≤ 0.75%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Inorganic dust and stones must be less than 0.25%. Ensure combine harvester sieves are calibrated.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Shriveled Grains</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">≤ 6.0%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Immature or broken kernels resulting from incorrect combine drum speeds.
              </p>
            </div>
          </div>
        )}

        {activeFaqCrop === 'maize' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="text-xs text-emerald-900 font-bold uppercase">Max Moisture</div>
              <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">≤ 14.0%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                High moisture triggers aflatoxin. Sun-dry on clean tarpaulins for 2-3 days before dispatch.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Foreign Matter</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">≤ 1.0%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Pieces of cob, husk, and soil should be separated by machine cleaner.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Damaged Grains</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">≤ 1.5%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Insect or mold attacked grains must not exceed 1.5% for Grade A MSP payment.
              </p>
            </div>
          </div>
        )}

        {activeFaqCrop === 'cotton' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="text-xs text-emerald-900 font-bold uppercase">Max Moisture</div>
              <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">≤ 8.0% - 12% Max</div>
              <p className="text-[11px] text-slate-600 mt-2">
                CCI accepts up to 8% without value cut. 8% to 12% attracts proportional moisture deduction.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Trash & Leaves</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">≤ 2.5%</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Avoid morning picking with dew. Remove yellow bracts before packing.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-700 font-bold uppercase">Staple Length</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">27.5 – 30.0 mm</div>
              <p className="text-[11px] text-slate-600 mt-2">
                Micronaire between 3.5 and 4.9 ensures top MSP grade payout.
              </p>
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <span>
            <strong>Field Pro-Tip:</strong> Never load grain directly from the combine early in the morning when dew is heavy. Sun-dry on clean tarpaulins for 4 to 6 hours to ensure your harvest clears mandi moisture sensors.
          </span>
        </div>
      </div>

      {/* Sub-section 4: 24x7 Helplines */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Headphones className="w-3.5 h-3.5" />
            <span>24x7 Farmer Assistance</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
            National & State Kisan Helpline Directory
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="font-bold text-slate-900 text-xs">National Kisan Call Centre</div>
            <div className="text-emerald-800 font-extrabold text-base font-mono mt-1">1800-180-1551</div>
            <p className="text-[11px] text-slate-500 mt-1">All India Toll-Free • 6:00 AM - 10:00 PM • 22 Languages</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 text-xs">Food & Public Distribution</div>
            <div className="text-slate-900 font-extrabold text-base font-mono mt-1">1967</div>
            <p className="text-[11px] text-slate-500 mt-1">FCI Mandi Grievance & PDS National Helpline</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 text-xs">Punjab & Haryana Agri Desk</div>
            <div className="text-slate-900 font-extrabold text-base font-mono mt-1">1800-180-2060</div>
            <p className="text-[11px] text-slate-500 mt-1">Anaaj Kharid & MFMB Token Scheduling Assistance</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 text-xs">Telangana & AP Rice Desk</div>
            <div className="text-slate-900 font-extrabold text-base font-mono mt-1">1800-425-00333</div>
            <p className="text-[11px] text-slate-500 mt-1">OPMS & Civil Supplies Token Grievance Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};
