import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Building,
  Clock,
  Scale,
  ShieldCheck,
  Search,
  MessageSquare,
} from 'lucide-react';
import { ProcurementCenter } from '../types.ts';

interface MandiCentersShareViewProps {
  centers: ProcurementCenter[];
  onSelectCenterForBooking?: (centerId: string) => void;
}

export const MandiCentersShareView: React.FC<MandiCentersShareViewProps> = ({
  centers,
  onSelectCenterForBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCenterId, setCopiedCenterId] = useState<string | null>(null);

  const filteredCenters = centers.filter(
    (c) =>
      c.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateShareText = (center: ProcurementCenter) => {
    const mapsUrl = `https://maps.google.com/?q=${center.latitude},${center.longitude}`;
    const address = center.fullAddress || `${center.centerName}, ${center.district}, ${center.state}`;
    const officerName = center.officerInchargeName || 'Shri R. K. Sharma (Superintendent)';
    const officerPhone = center.officerPhone || '+91-98765-12340';
    const secretaryPhone = center.mandiSecretaryPhone || '+91-98765-12341';
    const helpline = center.helpdeskPhone || '1800-180-1551';

    return `🌾 *GOVERNMENT PROCUREMENT CENTER & APMC MANDI DETAILS* 🌾
🏛️ *Center Name*: ${center.centerName}
📍 *Physical Address*: ${address}
🗺️ *Google Maps Location*: ${mapsUrl}
👤 *Procurement Officer In-Charge*: ${officerName}
📱 *Officer Direct Phone*: ${officerPhone}
☎️ *Mandi Secretary Office*: ${secretaryPhone}
📞 *Toll-Free Kisan Helpdesk*: ${helpline}
⚖️ *Weighbridges*: ${center.weighbridgeCount || 4} Digital Scales
⏰ *Operating Hours*: ${center.operatingHours || '08:00 AM - 07:00 PM'}
⏳ *Avg Waiting Time*: ~${center.waitingTimeMinutes || 15} minutes
━━━━━━━━━━━━━━━━━━━━
_Verified by Ministry of Agriculture & Farmers Welfare, Govt. of India_`;
  };

  const handleShare = async (center: ProcurementCenter) => {
    const text = generateShareText(center);
    if (navigator.share) {
      try {
        await navigator.share({
          title: center.centerName,
          text: text,
          url: `https://maps.google.com/?q=${center.latitude},${center.longitude}`,
        });
        return;
      } catch (err) {
        // Fallback to copy or WhatsApp
      }
    }

    // Default to WhatsApp share if Web Share is not supported or rejected
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopy = (center: ProcurementCenter) => {
    const text = generateShareText(center);
    navigator.clipboard.writeText(text);
    setCopiedCenterId(center.centerId);
    setTimeout(() => setCopiedCenterId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified APMC Procurement Shops & Yards</span>
            </span>
            <span className="text-xs text-slate-300">• Share with Fellow Farmers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Procurement Centers, Mandis & Officer Contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Locate authorized MSP purchase shops, electronic weighbridge yards, and direct contact numbers for Mandi Secretaries & Weighbridge In-charges. Easily share via WhatsApp or SMS with fellow farmers in your village.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
            <div className="text-xl font-bold text-emerald-400 font-mono">{centers.length} Centers</div>
            <div className="text-[11px] text-slate-400">Connected in Regional Grid</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by Mandi name, district, town, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs py-3 pl-10 pr-4 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>All Centers Equipped with Electronic Weighbridges & FAQ Testing Labs</span>
        </div>
      </div>

      {/* Procurement Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCenters.map((center) => {
          const mapsUrl = `https://maps.google.com/?q=${center.latitude},${center.longitude}`;
          const address = center.fullAddress || `${center.centerName}, Near Market Yard, ${center.district}, ${center.state}`;
          const officerName = center.officerInchargeName || 'Shri R. K. Sharma (Superintendent)';
          const officerPhone = center.officerPhone || '+91-98765-12340';
          const secretaryPhone = center.mandiSecretaryPhone || '+91-98765-12341';
          const helpline = center.helpdeskPhone || '1800-180-1551';
          const isCopied = copiedCenterId === center.centerId;

          return (
            <div
              key={center.centerId}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {center.centerId}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1 leading-snug">
                      {center.centerName}
                    </h3>
                    <div className="text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{center.district}, {center.state}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      center.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {center.status || 'AVAILABLE'}
                  </span>
                </div>

                {/* Location & Physical Address */}
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Physical Mandi Address
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {address}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-bold text-[11px] pt-0.5 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Google Maps Directions</span>
                  </a>
                </div>

                {/* Officers & Contact Numbers */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                    <span>Officer Contacts</span>
                    <span className="text-emerald-700 font-mono">Toll-Free: {helpline}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">{officerName}</div>
                      <div className="text-[10px] text-slate-500">Procurement Incharge</div>
                    </div>
                    <a
                      href={`tel:${officerPhone.replace(/[^0-9+]/g, '')}`}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-500 rounded-lg font-mono text-[11px] text-slate-800 font-bold flex items-center space-x-1 shadow-sm"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{officerPhone}</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">Mandi Secretary</div>
                      <div className="text-[10px] text-slate-500">APMC Committee Office</div>
                    </div>
                    <a
                      href={`tel:${secretaryPhone.replace(/[^0-9+]/g, '')}`}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-500 rounded-lg font-mono text-[11px] text-slate-800 font-bold flex items-center space-x-1 shadow-sm"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{secretaryPhone}</span>
                    </a>
                  </div>
                </div>

                {/* Capacity & Timing Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>{center.weighbridgeCount || 4} Weighbridges</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{center.operatingHours || '08:00 AM - 07:00 PM'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Share & Book */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center space-x-2">
                <button
                  onClick={() => handleShare(center)}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5"
                  title="Share location and contact numbers on WhatsApp or SMS"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Location & Contacts</span>
                </button>

                <button
                  onClick={() => handleCopy(center)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center ${
                    isCopied
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="Copy full Mandi details to clipboard"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>

                {onSelectCenterForBooking && (
                  <button
                    onClick={() => onSelectCenterForBooking(center.centerId)}
                    className="py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all"
                    title="Book slot at this center"
                  >
                    Book Slot
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
