import React from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Phone,
  Clock,
  Warehouse,
  Scale,
  ShieldCheck,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ProcurementCenter } from '../types.ts';

interface MandiLocationMapViewProps {
  center: ProcurementCenter;
  farmerDistrict?: string;
  farmerState?: string;
}

export const MandiLocationMapView: React.FC<MandiLocationMapViewProps> = ({
  center,
  farmerDistrict = 'District',
  farmerState = 'State',
}) => {
  const lat = center.latitude || 16.3067;
  const lng = center.longitude || 80.4365;
  const storageLeft = center.availableStorageQuintals ?? Math.max(0, (center.maxCapacityQuintals || 50000) - (center.currentStorageQuintals || 21500));
  const totalCapacity = center.maxCapacityQuintals || 50000;
  const freePct = Math.round((storageLeft / totalCapacity) * 100);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-blue-600/30 text-blue-300">
              <Navigation className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-300">
              Procurement Centre Location & Transit Map
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black mt-0.5 text-white">
            {center.centerName}
          </h3>
          <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{center.fullAddress || `APMC Market Yard Complex, ${center.district}, ${center.state}`}</span>
          </p>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Live GPS in Google Maps</span>
        </a>
      </div>

      {/* Graphical Interactive Mandi Route & Layout Map */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Interactive Visual Map Canvas */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-slate-900 overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center">
          {/* Map Grid Background Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Map Layout: Highways, Approach Road, Mandi Yard */}
          <svg className="w-full h-full" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background Agricultural Area */}
            <rect width="600" height="300" fill="#0f172a" />

            {/* River / Canal Waterway */}
            <path d="M0 240 Q150 210 300 250 T600 230" stroke="#0284c7" strokeWidth="12" opacity="0.3" fill="none" />
            <text x="30" y="270" fill="#38bdf8" fontSize="10" fontWeight="bold">Canal / Irrigation Waterway</text>

            {/* National / State Highway */}
            <path d="M0 80 Q200 70 400 90 L600 80" stroke="#475569" strokeWidth="20" strokeLinecap="round" />
            <path d="M0 80 Q200 70 400 90 L600 80" stroke="#fbbf24" strokeWidth="2" strokeDasharray="8 6" />
            <text x="40" y="65" fill="#e2e8f0" fontSize="11" fontWeight="bold">National Highway (NH Transit Route)</text>

            {/* Farmer Approach Road from Village */}
            <path d="M80 200 L160 140 L250 140" stroke="#10b981" strokeWidth="6" strokeDasharray="6 4" />
            <circle cx="80" cy="200" r="8" fill="#10b981" />
            <text x="40" y="225" fill="#34d399" fontSize="10" fontWeight="bold">Farmer Origin ({farmerDistrict})</text>

            {/* Approach Link to Mandi Gate */}
            <path d="M250 140 L340 140" stroke="#38bdf8" strokeWidth="8" />

            {/* Mandi Yard Perimeter */}
            <rect x="340" y="60" width="220" height="170" rx="14" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
            <text x="355" y="85" fill="#93c5fd" fontSize="12" fontWeight="extrabold">APMC MANDI COMPOUND</text>

            {/* Gate 1 Ingress */}
            <rect x="332" y="125" width="16" height="30" rx="3" fill="#10b981" />
            <text x="285" y="132" fill="#34d399" fontSize="10" fontWeight="bold">Gate #1</text>

            {/* Electronic Weighbridge Pit Scale */}
            <rect x="375" y="115" width="45" height="50" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="382" y="135" fill="#ffffff" fontSize="9" fontWeight="bold">PIT SCALE</text>
            <text x="380" y="148" fill="#bae6fd" fontSize="8">Weighbridge</text>

            {/* Quality Assay Laboratory */}
            <rect x="435" y="95" width="50" height="40" rx="6" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.5" />
            <text x="442" y="115" fill="#ffffff" fontSize="9" fontWeight="bold">QC LAB</text>
            <text x="440" y="127" fill="#ccfbf1" fontSize="8">Assayer</text>

            {/* Covered Warehouses & Silos */}
            <rect x="435" y="145" width="110" height="65" rx="6" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <text x="445" y="165" fill="#ffffff" fontSize="10" fontWeight="bold">GRAIN SILOS</text>
            <text x="445" y="180" fill="#cbd5e1" fontSize="8">Storage Left: {storageLeft.toLocaleString()} Q</text>

            {/* Exit Gate */}
            <rect x="552" y="125" width="16" height="30" rx="3" fill="#ef4444" />
            <text x="525" y="122" fill="#fca5a5" fontSize="10" fontWeight="bold">Exit Gate</text>

            {/* Current Target Location Pin */}
            <g transform="translate(390, 130)">
              <circle cx="0" cy="0" r="16" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            </g>
          </svg>

          {/* Compass Rose */}
          <div className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-700 text-slate-300 flex items-center space-x-1 text-[10px] font-bold">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>N ↑ GPS Coords: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
          </div>
        </div>

        {/* Essential Center Transit Details & Storage Left */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Storage Capacity Left */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5 text-emerald-700" />
                <span>Available Storage Left</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                freePct > 30 ? 'bg-emerald-200 text-emerald-900' : freePct > 10 ? 'bg-amber-200 text-amber-900' : 'bg-red-200 text-red-900'
              }`}>
                {freePct}% Free
              </span>
            </div>
            <div className="text-xl font-black text-emerald-950 font-mono">
              {storageLeft.toLocaleString()} <span className="text-xs font-normal text-emerald-800">Quintals</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(5, freePct))}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-800">
              Total Yard Limit: {totalCapacity.toLocaleString()} Q • Covered Silos Ready
            </p>
          </div>

          {/* Electronic Weighbridge Scales */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-700" />
              <span>Weighbridge & Processing</span>
            </span>
            <div className="text-xl font-black text-blue-950 font-mono">
              {center.activeScales || 4} <span className="text-xs font-normal text-blue-800">Electronic Scales</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Avg Turnaround: <strong>{center.avgProcessingTimeMins || 20} mins</strong> per loaded tractor.
            </p>
            <p className="text-[10px] text-blue-700">
              Timing: <strong>{center.operatingHours || '08:00 AM – 06:00 PM'}</strong>
            </p>
          </div>

          {/* Yard Helpdesk & Officer In-Charge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Mandi Helpdesk Contact</span>
            </span>
            <div className="text-sm font-black text-slate-900">
              {center.officerInchargeName || 'Sri K. Venkata Reddy'}
            </div>
            <p className="text-[11px] font-mono text-slate-700">
              Phone: <strong>{center.contactNumber || '0863-2234-890'}</strong>
            </p>
            <p className="text-[10px] text-slate-500">
              Toll-Free Kisan Transit Helpline: 1800-180-1551
            </p>
          </div>
        </div>

        {/* Step-by-Step Directions Guide for Farmers */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h4 className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Turn-by-Turn Route Guidance to {center.centerName}</span>
          </h4>
          <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside leading-relaxed">
            <li>
              From your village in <strong>{farmerDistrict}</strong>, take the main connecting district road toward the State/National Highway corridor.
            </li>
            <li>
              Follow the APMC Mandi directional signboards along the bypass road directly to <strong>Gate #1 (Commercial Vehicle Ingress)</strong>.
            </li>
            <li>
              On arrival at the entry barrier, display the <strong>Digital QR Gate Pass</strong> on your phone to the scanner operator to raise the automated RFID barrier.
            </li>
            <li>
              Proceed to <strong>Pitless Electronic Weighbridge Scale #{center.activeScales || 1}</strong> for gross laden vehicle weight registration.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
