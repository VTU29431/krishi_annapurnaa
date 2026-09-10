export interface MspRate {
  id: string;
  name: string;
  hindiName: string;
  season: 'Kharif' | 'Rabi';
  ratePerQuintal: number;
  maxMoisturePct: number;
  payoutTimeline: string;
  icon: string;
}

export const MSP_RATES: MspRate[] = [
  {
    id: 'paddy_grade_a',
    name: 'Paddy (Grade A)',
    hindiName: 'धान (ग्रेड ए)',
    season: 'Kharif',
    ratePerQuintal: 2320,
    maxMoisturePct: 17.0,
    payoutTimeline: '48-72 hrs DBT',
    icon: '🌾',
  },
  {
    id: 'paddy_common',
    name: 'Paddy (Common)',
    hindiName: 'धान (सामान्य)',
    season: 'Kharif',
    ratePerQuintal: 2300,
    maxMoisturePct: 17.0,
    payoutTimeline: '48-72 hrs DBT',
    icon: '🌾',
  },
  {
    id: 'wheat',
    name: 'Wheat (Buffer)',
    hindiName: 'गेहूं (केंद्रीय पूल)',
    season: 'Rabi',
    ratePerQuintal: 2275,
    maxMoisturePct: 12.0,
    payoutTimeline: '48-72 hrs DBT',
    icon: '🌾',
  },
  {
    id: 'maize',
    name: 'Maize (Makka)',
    hindiName: 'मक्का',
    season: 'Kharif',
    ratePerQuintal: 2090,
    maxMoisturePct: 14.0,
    payoutTimeline: '48-72 hrs DBT',
    icon: '🌽',
  },
  {
    id: 'cotton_med',
    name: 'Cotton (Medium Staple)',
    hindiName: 'कपास (मध्यम रेशा)',
    season: 'Kharif',
    ratePerQuintal: 7121,
    maxMoisturePct: 8.0,
    payoutTimeline: '48-72 hrs DBT',
    icon: '☁️',
  },
  {
    id: 'soybean',
    name: 'Soybean (Yellow)',
    hindiName: 'सोयाबीन (पीला)',
    season: 'Kharif',
    ratePerQuintal: 4892,
    maxMoisturePct: 12.0,
    payoutTimeline: '48-72 hrs DBT',
    icon: '🥜',
  },
  {
    id: 'moong',
    name: 'Moong (Green Gram)',
    hindiName: 'मूंग दाल',
    season: 'Kharif',
    ratePerQuintal: 8682,
    maxMoisturePct: 12.0,
    payoutTimeline: '48-72 hrs DBT',
    icon: '🥣',
  },
];

export const PROCUREMENT_STAGES = [
  { index: 1, title: 'Registration', desc: 'Crop & Land verified', icon: '📝' },
  { index: 2, title: 'Slot Scheduled', desc: 'Assigned 30m window', icon: '🎫' },
  { index: 3, title: 'Arrived at Gate', desc: 'Scanned at Weighbridge', icon: '🚜' },
  { index: 4, title: 'Quality Assay', desc: 'Moisture & Foreign Matter', icon: '🔬' },
  { index: 5, title: 'Gross Weight', desc: 'Digital scale measurement', icon: '⚖️' },
  { index: 6, title: 'Produce Accepted', desc: 'Quality parameters met', icon: '✅' },
  { index: 7, title: 'Tare Weight', desc: 'Net quintals computed', icon: '📊' },
  { index: 8, title: 'e-J-Form Issued', desc: 'Mandi purchase memo', icon: '📄' },
  { index: 9, title: 'APBS Initiated', desc: 'PFMS bank transmission', icon: '🏦' },
  { index: 10, title: 'DBT Completed', desc: 'Credited to bank A/c', icon: '💰' },
];

export const ESSENTIAL_DOCUMENTS = [
  {
    id: 'doc_aadhaar',
    title: '1. Aadhaar Card (OTP & Biometric Active)',
    description: 'Original or photocopy with active mobile link to receive automated queue alerts and SMS token updates.',
  },
  {
    id: 'doc_land',
    title: '2. Land Ownership Record (7/12, RoR, Khasra-Khatauni)',
    description: 'Government land registry extract or certified Tenancy / Batai agreement for tenant farmers.',
  },
  {
    id: 'doc_bank',
    title: '3. Bank Passbook (NPCI Aadhaar Seeded)',
    description: 'Bank account in the farmer\'s name mapped on NPCI Aadhaar Bridge for 48-72h direct benefit transfer.',
  },
  {
    id: 'doc_sowing',
    title: '4. Sowing Certificate / e-Girdawari Record',
    description: 'Crop acreage verification issued by Patwari, Village Agriculture Officer, or state MFMB / Dharani receipt.',
  },
];

export const ALL_MENUS = [
  { id: 'M01', view: 'home', title: 'Home Overview', category: 'Core', desc: 'National procurement KPIs, problem vs AI solution, and 7-step operational lifecycle.', icon: 'Home' },
  { id: 'M02', view: 'crop-registration', title: 'How Farmers Can Register Crop', category: 'Registration', desc: '3 official channels (Self Online, PACS helpdesk, CSC) + Live Land e-KYC Simulator.', icon: 'FileText' },
  { id: 'M03', view: 'farmer-essentials', title: 'Farmer Essentials Hub', category: 'Support', desc: 'Official MSP 2024-2026 rates, instant revenue calculator, documents checklist, moisture norms.', icon: 'Award' },
  { id: 'M04', view: 'farmer', title: 'Book Slot & Produce Token', category: 'Farmer', desc: 'Reserve procurement arrival slot, calculate guaranteed MSP payout, and create database record.', icon: 'Calendar' },
  { id: 'M05', view: 'farmer', subTarget: 'token-pass', title: 'Digital Token Gate Pass & QR', category: 'Farmer', desc: 'Scannable QR code pass for express RFID/Camera mandi entry with tractor details.', icon: 'QrCode' },
  { id: 'M06', view: 'farmer', subTarget: 'queue', title: 'Live Virtual Queue Tracker', category: 'Farmer', desc: 'Real-time countdown of farmers ahead, dynamic waiting time, and live notifications.', icon: 'Users' },
  { id: 'M07', view: 'farmer', subTarget: 'stepper', title: '10-Stage Status Stepper', category: 'Farmer', desc: 'End-to-end milestone tracking from harvest to warehouse unloading and bank credit.', icon: 'GitCommit' },
  { id: 'M08', view: 'officer', title: 'Mandi Operations Terminal', category: 'Officer', desc: 'Live officer cockpit: Scheduled vs arrived tractors, completed weighings, storage saturation.', icon: 'Building' },
  { id: 'M09', view: 'officer', subTarget: 'call-next', title: 'Digital Token Calling Console', category: 'Officer', desc: 'Call next token with browser Text-to-Speech audio loudspeaker announcement & Socket.io broadcast.', icon: 'Megaphone' },
  { id: 'M10', view: 'officer', subTarget: 'qc', title: 'Quality Assay & Moisture Station', category: 'Officer', desc: 'Moisture %, foreign matter %, grain grading, and computer vision decision support.', icon: 'FlaskConical' },
  { id: 'M11', view: 'officer', subTarget: 'storage', title: 'Storage Capacity Early Warning', category: 'Officer', desc: 'Warehouse utilization gauge with automated overload trigger at 85% capacity.', icon: 'Warehouse' },
  { id: 'M13', view: 'cold-storage', title: 'Accredited Cold Storage Booking', category: 'Storage', desc: 'Store unsold produce in scientific silos and godowns at standard per-quintal per-day rates with e-NWR receipt.', icon: 'Snowflake' },
];
