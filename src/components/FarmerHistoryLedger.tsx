import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Building,
  Calendar,
  Printer,
  ShieldCheck,
  Receipt,
  Filter,
  RefreshCw,
  Search,
  Download,
  ExternalLink,
  ChevronDown,
  X,
  Scale,
  Sparkles,
  Award,
  CreditCard,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { FarmerPastBooking, FarmerUser, Token } from '../types.ts';

interface FarmerHistoryLedgerProps {
  farmerUser: FarmerUser | null;
  pastBookings: FarmerPastBooking[];
  onOpenPrintGatePass?: (token?: Token | null) => void;
  onBookNewSlot?: () => void;
  onRefreshRecords?: () => void;
}

/**
 * Calculates Indian Agricultural Crop Year (July 1 to June 30)
 * Example:
 *  - Date: 2026-09-10 -> Crop Year 2026–27
 *  - Date: 2026-04-12 -> Crop Year 2025–26
 *  - Date: 2025-10-18 -> Crop Year 2025–26
 *  - Date: 2024-11-04 -> Crop Year 2024–25
 *  - Date: 2023-10-25 -> Crop Year 2023–24
 */
export function getCropYear(dateStr: string = ''): string {
  if (!dateStr) return '2025–26';
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1] || '7', 10);
  if (isNaN(year)) return '2025–26';
  if (month >= 7) {
    const nextYr = (year + 1).toString().slice(-2);
    return `${year}–${nextYr}`;
  } else {
    const prevYr = year - 1;
    const curYr = year.toString().slice(-2);
    return `${prevYr}–${curYr}`;
  }
}

/**
 * Returns Indian agricultural season (Kharif / Rabi) based on crop and date
 */
export function getCropSeason(cropType: string = '', dateStr: string = ''): string {
  const lower = cropType.toLowerCase();
  if (
    lower.includes('wheat') ||
    lower.includes('mustard') ||
    lower.includes('gram') ||
    lower.includes('barley') ||
    lower.includes('rabi')
  ) {
    return 'Rabi Season';
  }
  if (
    lower.includes('paddy') ||
    lower.includes('cotton') ||
    lower.includes('maize') ||
    lower.includes('soybean') ||
    lower.includes('bajra') ||
    lower.includes('kharif')
  ) {
    return 'Kharif Season';
  }
  return 'Kharif / Rabi';
}

export const FarmerHistoryLedger: React.FC<FarmerHistoryLedgerProps> = ({
  farmerUser,
  pastBookings,
  onOpenPrintGatePass,
  onBookNewSlot,
  onRefreshRecords,
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropYear, setSelectedCropYear] = useState<string>('ALL');
  const [selectedSeason, setSelectedSeason] = useState<string>('ALL');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null);

  // Modal State for Full Digital Mandi Receipt View
  const [activeReceipt, setActiveReceipt] = useState<FarmerPastBooking | null>(null);

  // Compute all distinct Crop Years available in bookings
  const availableCropYears = useMemo(() => {
    const cropYearsSet = new Set<string>();
    pastBookings.forEach((b) => {
      const date = b.scheduledDate || b.createdAt || '';
      const cy = getCropYear(date);
      if (cy) cropYearsSet.add(cy);
    });
    // Ensure chronological ordering descending
    return Array.from(cropYearsSet).sort((a, b) => b.localeCompare(a));
  }, [pastBookings]);

  // Handle Fetch / Re-sync button
  const handleFetchRecords = () => {
    setIsFetching(true);
    setFetchSuccessMessage(null);
    setTimeout(() => {
      if (onRefreshRecords) onRefreshRecords();
      setIsFetching(false);
      setFetchSuccessMessage(
        `Successfully fetched ${pastBookings.length} verified procurement records from National Mandi Registry`
      );
      setTimeout(() => setFetchSuccessMessage(null), 4000);
    }, 650);
  };

  // Filter receipts by selected Crop Year, Season, and Search Query
  const filteredBookings = useMemo(() => {
    return pastBookings.filter((b) => {
      const bookingCropYear = getCropYear(b.scheduledDate || b.createdAt || '');
      const bookingSeason = getCropSeason(b.cropType, b.scheduledDate || '');

      // Crop Year Match
      if (selectedCropYear !== 'ALL' && bookingCropYear !== selectedCropYear) {
        return false;
      }

      // Season Match
      if (selectedSeason !== 'ALL') {
        if (selectedSeason === 'Kharif' && !bookingSeason.includes('Kharif')) return false;
        if (selectedSeason === 'Rabi' && !bookingSeason.includes('Rabi')) return false;
      }

      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchToken = b.tokenNumber.toLowerCase().includes(query);
        const matchGatePass = (b.gatePassId || '').toLowerCase().includes(query);
        const matchCrop = b.cropType.toLowerCase().includes(query);
        const matchCenter = (b.centerName || '').toLowerCase().includes(query);
        const matchUtr = (b.dbtUtr || '').toLowerCase().includes(query);
        if (!matchToken && !matchGatePass && !matchCrop && !matchCenter && !matchUtr) {
          return false;
        }
      }

      return true;
    });
  }, [pastBookings, selectedCropYear, selectedSeason, searchQuery]);

  // Aggregate Calculations for Selected Crop Year
  const totalQuintals = filteredBookings.reduce((sum, b) => sum + b.quantityQuintals, 0);
  const totalDbtAmount = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const completedCount = filteredBookings.filter((b) => b.status === 'COMPLETED').length;

  // Convert past booking item to Token format for printing gate pass
  const handlePrintPastBooking = (b: FarmerPastBooking) => {
    if (!onOpenPrintGatePass) return;
    const simulatedToken: Token = {
      tokenNumber: b.tokenNumber,
      farmerId: farmerUser?.aadhaar || 'AP-KRN-78219',
      farmer: {
        farmerId: 'AP-KRN-78219',
        fullName: farmerUser?.fullName || 'Farmer',
        phoneNumber: farmerUser?.mobileNumber || '9876543210',
        aadhaarMasked: farmerUser?.aadhaar
          ? `XXXX-XXXX-${farmerUser.aadhaar.slice(-4)}`
          : 'XXXX-XXXX-8192',
        district: farmerUser?.district || 'Karnal',
        state: farmerUser?.state || 'Haryana',
      },
      cropType: b.cropType,
      quantityQuintals: b.quantityQuintals,
      mspRatePerQ: b.mspRatePerQ,
      totalAmount: b.totalAmount,
      centerId: b.centerId || 'center_main',
      center: {
        centerId: b.centerId || 'center_main',
        centerName: b.centerName || 'APMC Main Procurement Yard',
        district: farmerUser?.district || 'Karnal',
        state: farmerUser?.state || 'Haryana',
        latitude: 29.6857,
        longitude: 76.9905,
        maxCapacityQuintals: 5000,
        currentStorageQuintals: 2100,
        activeScales: 6,
      },
      scheduledDate: b.scheduledDate,
      scheduledSlot: b.scheduledSlot,
      queueAhead: 0,
      estimatedWaitMinutes: 0,
      currentStageIndex: 10,
      stageName: b.statusDescription || 'DBT Payment Disbursed',
      status: b.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
      paymentMode: 'ONLINE_DBT',
    };
    onOpenPrintGatePass(simulatedToken);
  };

  return (
    <div id="previous-years-booking-section" className="space-y-6">
      {/* SECTION HEADER & ARCHIVE METADATA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold">
            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dedicated Farmer Archives • National Mandi Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Previous Years' Booking Records & Receipts</span>
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Review past years' procurement passes, weighbridge tickets, and verified PFMS Direct
            Benefit Transfer (DBT) receipts. Filter records by agricultural Crop Year and Season.
          </p>
          {farmerUser && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
              <span>
                Farmer: <strong className="text-slate-900">{farmerUser.fullName}</strong>
              </span>
              <span>•</span>
              <span>
                Mobile: <strong className="font-mono text-slate-900">+91 {farmerUser.mobileNumber}</strong>
              </span>
              <span>•</span>
              <span>
                District: <strong className="text-slate-900">{farmerUser.district}, {farmerUser.state}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Controls: Refresh from Registry & Book New Slot CTA */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            id="fetch-mandi-records-btn"
            onClick={handleFetchRecords}
            disabled={isFetching}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all border border-slate-200 shadow-sm"
            title="Fetch latest verified booking records from Mandi database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Fetching Records...' : 'Fetch / Refresh Records'}</span>
          </button>

          {onBookNewSlot && (
            <button
              type="button"
              id="goto-new-booking-slot-btn"
              onClick={onBookNewSlot}
              className="py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition-all"
            >
              <span>+ Book New Mandi Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Fetch Notice */}
      {fetchSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center space-x-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{fetchSuccessMessage}</span>
        </div>
      )}

      {/* FILTER CONTROLS BAR: FILTERABLE 'CROP YEAR' SELECTOR & SEASON */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span className="font-extrabold text-slate-900 text-sm">
              Filter Records by Crop Year & Season
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Agricultural Crop Year runs July 1 – June 30
          </span>
        </div>

        {/* The 'Crop Year' Filter Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Select Crop Year:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCropYear('ALL')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                selectedCropYear === 'ALL'
                  ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              🌾 All Crop Years ({pastBookings.length})
            </button>

            {availableCropYears.map((cy) => {
              const count = pastBookings.filter(
                (b) => getCropYear(b.scheduledDate || b.createdAt || '') === cy
              ).length;
              const isSelected = selectedCropYear === cy;

              return (
                <button
                  key={cy}
                  type="button"
                  onClick={() => setSelectedCropYear(cy)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 opacity-80" />
                  <span>Crop Year {cy}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters: Season & Search Query */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Season Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Harvest Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Seasons (Kharif & Rabi)</option>
              <option value="Kharif">Kharif Season (Monsoon: Paddy, Cotton)</option>
              <option value="Rabi">Rabi Season (Winter: Wheat, Mustard)</option>
            </select>
          </div>

          {/* Search by Token, Gate Pass, Crop */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Search by Token No, Gate Pass, Crop, or Mandi
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. TKN-2025, Paddy, Wheat, PFMS..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC KPI SUMMARY FOR THE SELECTED CROP YEAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold block text-[11px]">
            {selectedCropYear === 'ALL'
              ? 'Total Mandi Deliveries'
              : `Deliveries (CY ${selectedCropYear})`}
          </span>
          <div className="text-2xl font-black text-slate-900 flex items-baseline space-x-1.5">
            <span>{filteredBookings.length}</span>
            <span className="text-xs font-normal text-slate-500">Deliveries</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            {completedCount} Settled & Disbursed
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold block text-[11px]">
            {selectedCropYear === 'ALL' ? 'Lifetime Grain Sold' : `Sold in ${selectedCropYear}`}
          </span>
          <div className="text-2xl font-black text-slate-900 flex items-baseline space-x-1.5">
            <span>{totalQuintals}</span>
            <span className="text-xs font-normal text-slate-500">Quintals</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            Weighbridge Certified
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold block text-[11px]">
            {selectedCropYear === 'ALL' ? 'Total Guaranteed MSP' : `CY ${selectedCropYear} Payout`}
          </span>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            ₹{totalDbtAmount.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            100% PFMS Direct Credit
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold block text-[11px]">
            Quality & Moisture Assay
          </span>
          <div className="text-2xl font-black text-blue-900 flex items-center space-x-1">
            <span>100%</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-blue-700 font-bold block">
            All Batches Grade A
          </span>
        </div>
      </div>

      {/* RECORDS LIST CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>
                {selectedCropYear === 'ALL'
                  ? 'All Previous Years Procurement Records'
                  : `Crop Year ${selectedCropYear} Procurement Records`}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredBookings.length} verified government records with official gate passes & payment proofs
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
              Crop Year: <strong className="text-emerald-800">{selectedCropYear}</strong>
            </span>
          </div>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              📋
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">
              No Records Found for Selected Filter
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No previous bookings matched Crop Year <strong>{selectedCropYear}</strong>.
              Try resetting the Crop Year filter or adjusting your search keywords.
            </p>
            <div className="pt-2 flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCropYear('ALL');
                  setSelectedSeason('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          /* Records Table / Cards */
          <div className="divide-y divide-slate-200">
            {filteredBookings.map((b, idx) => {
              const isCompleted = b.status === 'COMPLETED';
              const cropYear = getCropYear(b.scheduledDate || b.createdAt || '');
              const season = getCropSeason(b.cropType, b.scheduledDate || '');

              return (
                <div
                  key={b.tokenNumber + idx}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                >
                  {/* Left Column: Token, Pass, Crop, Year and Quality */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-300">
                        Token: {b.tokenNumber}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        Gate Pass: {b.gatePassId || `GP-${b.tokenNumber}`}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        Crop Year {cropYear}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {season}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>{isCompleted ? '✓ Completed & Disbursed' : b.statusDescription}</span>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                          : 'bg-amber-50 text-amber-950 border-amber-300'
                      }`}>
                        <span>Payment Method: Direct DBT •</span>
                        <strong className={isCompleted ? 'text-emerald-800 font-black' : 'text-amber-800 font-bold'}>
                          {isCompleted ? '✓ SUCCESS' : '⏳ PENDING'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-800 font-medium">
                      <span className="font-extrabold text-slate-900 text-sm">{b.cropType}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">{b.quantityQuintals} Quintals</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-slate-600">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.centerName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Arrival Date: {b.scheduledDate} ({b.scheduledSlot})</span>
                      </span>
                    </div>

                    {/* Quality Assay & PFMS Settlement Details */}
                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                      <span className="text-emerald-800 font-bold flex items-center space-x-1">
                        <CreditCard className="w-3 h-3 text-emerald-600" />
                        <span>
                          {b.dbtUtr
                            ? `PFMS UTR: ${b.dbtUtr}`
                            : 'DBT Bank Settlement Confirmed'}
                        </span>
                      </span>
                      <span>•</span>
                      <span>Bank: <strong>{b.dbtBank || 'State Bank of India'}</strong></span>
                      <span>•</span>
                      <span>Disbursed: {b.dbtDisbursedAt || 'Settled'}</span>
                      <span>•</span>
                      <span className="text-blue-900 font-semibold">
                        QC: {b.qcGrade || 'Grade A Passed'} (Moisture: {b.moistureRecorded || 13.0}%)
                      </span>
                    </div>
                  </div>

                  {/* Right Column: MSP Total & Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end space-x-4 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Guaranteed MSP Amount
                      </div>
                      <div className="font-mono font-black text-lg text-emerald-800">
                        ₹{b.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Rate: ₹{b.mspRatePerQ}/Quintal
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(b)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1 transition-colors border border-slate-200"
                        title="View Full Digital APMC Mandi Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-600" />
                        <span>View Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintPastBooking(b)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
                        title="Print Official Government Gate Pass"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Gate Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Official Statutory Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              Ministry of Agriculture & Farmers Welfare • Government of India e-NAM APMC Ledger
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold text-emerald-800">Audited by CAG & PFMS</span>
            <span className="text-slate-400">•</span>
            <span>Digital Ledger Retention: 7 Years</span>
          </div>
        </div>
      </div>

      {/* FULL DIGITAL MANDI RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 bg-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Official Mandi Procurement Receipt</h3>
                  <p className="text-[11px] text-emerald-200">
                    Token #{activeReceipt.tokenNumber} • Gate Pass #{activeReceipt.gatePassId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Center & Year Header */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Agricultural Produce Market Committee (APMC)
                </div>
                <div className="font-black text-slate-900 text-sm">
                  {activeReceipt.centerName}
                </div>
                <div className="text-[11px] text-slate-600">
                  Crop Year: <strong className="text-emerald-900">{getCropYear(activeReceipt.scheduledDate || activeReceipt.createdAt)}</strong> • Season: <strong className="text-amber-900">{getCropSeason(activeReceipt.cropType)}</strong>
                </div>
              </div>

              {/* Farmer & Lot Details */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Farmer Name</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {farmerUser?.fullName || 'Farmer'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Aadhaar (Masked)</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    •••• •••• {farmerUser?.aadhaar?.slice(-4) || '8192'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Produce Crop</span>
                  <span className="font-extrabold text-emerald-950 text-xs">{activeReceipt.cropType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Quantity Delivered</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {activeReceipt.quantityQuintals} Quintals
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Delivery Date</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {activeReceipt.scheduledDate} ({activeReceipt.scheduledSlot})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Quality Assay</span>
                  <span className="font-bold text-blue-900 text-xs">
                    {activeReceipt.qcGrade || 'Grade A'} (Moisture: {activeReceipt.moistureRecorded || 12.8}%)
                  </span>
                </div>
              </div>

              {/* Payment & MSP Settlement */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Guaranteed MSP Rate:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{activeReceipt.mspRatePerQ}/Quintal
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-emerald-200/80 pt-2">
                  <span className="text-slate-700 font-bold text-xs">Payment Method:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <span className="text-slate-900 text-xs">Direct DBT (APBS)</span>
                    {activeReceipt.status === 'COMPLETED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px] shadow-sm">
                        ✓ SUCCESS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                        ⏳ PENDING
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-emerald-200/80 pt-2">
                  <span className="font-bold text-slate-900 text-xs">Total Net Disbursed:</span>
                  <span className="font-mono font-black text-base text-emerald-900">
                    ₹{activeReceipt.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 pt-1 space-y-1 border-t border-emerald-200/80">
                  <div>PFMS Ref UTR: <strong className="font-mono text-emerald-950">{activeReceipt.dbtUtr || 'PFMS-SETTLED'}</strong></div>
                  <div>Credit Bank: <strong>{activeReceipt.dbtBank || 'State Bank of India'}</strong></div>
                  <div>Disbursed On: <strong>{activeReceipt.dbtDisbursedAt || 'Confirmed'}</strong></div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Close Receipt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePrintPastBooking(activeReceipt);
                    setActiveReceipt(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Gate Pass & Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
