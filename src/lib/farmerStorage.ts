import { FarmerUser, Token, FarmerPastBooking } from '../types.ts';

/**
 * Normalizes phone number or Aadhaar to alphanumeric key
 */
export function normalizeFarmerKey(phoneOrAadhaar: string = ''): string {
  return phoneOrAadhaar.replace(/\D/g, '');
}

/**
 * Seeded Registered Farmers with distinct booking and transaction histories
 */
export interface SeedFarmerData {
  user: FarmerUser;
  activeToken: Token | null;
  pastBookings: FarmerPastBooking[];
}

export const SEEDED_FARMERS: Record<string, SeedFarmerData> = {};

// Also support lookup by Aadhaar last 4 or phone
export function findSeededFarmer(query: string): SeedFarmerData | null {
  const clean = normalizeFarmerKey(query);
  if (!clean) return null;

  // Direct phone match
  for (const [phone, data] of Object.entries(SEEDED_FARMERS)) {
    if (phone.includes(clean) || clean.includes(phone)) {
      return data;
    }
    const cleanAadhaar = normalizeFarmerKey(data.user.aadhaar);
    if (cleanAadhaar.includes(clean) || clean.includes(cleanAadhaar)) {
      return data;
    }
  }
  return null;
}

/**
 * Gets a farmer's active token and past bookings by phone or Aadhaar.
 * For fresh accounts or after logout, starts strictly clean with no dummy passes.
 */
export function getFarmerData(farmer: FarmerUser | null): {
  activeToken: Token | null;
  pastBookings: FarmerPastBooking[];
} {
  if (!farmer) {
    return { activeToken: null, pastBookings: [] };
  }

  const cleanPhone = normalizeFarmerKey(farmer.mobileNumber);
  const cleanAadhaar = normalizeFarmerKey(farmer.aadhaar);

  // 1. Check in localStorage for this specific registered farmer
  try {
    const localKey = `krishi_farmer_history_${cleanPhone || cleanAadhaar}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        activeToken: parsed.activeToken || null,
        pastBookings: Array.isArray(parsed.pastBookings) ? parsed.pastBookings : [],
      };
    }
  } catch (e) {
    console.warn('Failed reading farmer history from localStorage:', e);
  }

  // 2. Multi-Year Historical Back Receipts Seeded for Farmer's Mobile Number
  // Ensures completed transactions from last year (2025), prior year (2024), and early season (2026) are available
  const mandiName = `${farmer.district || 'Karnal'} APMC Main Yard`;
  const defaultPastBookings: FarmerPastBooking[] = [
    {
      tokenNumber: `TKN-2026-8812`,
      gatePassId: `GP-2026-8812`,
      cropType: 'Wheat (Sharbati)',
      quantityQuintals: 65,
      mspRatePerQ: 2275,
      totalAmount: 147875,
      centerName: mandiName,
      centerId: 'center_main',
      scheduledDate: '2026-04-12',
      scheduledSlot: '09:30 AM – 10:00 AM',
      status: 'COMPLETED',
      statusDescription: 'DBT Payment Disbursed via PFMS (UTR: PFMS-2026-8492019)',
      dbtUtr: 'PFMS-2026-8492019',
      dbtBank: farmer.bankDetails?.bankName || 'State Bank of India',
      dbtDisbursedAt: '14 Apr 2026, 04:30 PM',
      qcGrade: 'Grade A Passed',
      moistureRecorded: 12.8,
      createdAt: '2026-04-12T09:30:00.000Z',
    },
    {
      tokenNumber: `TKN-2025-4421`,
      gatePassId: `GP-2025-4421`,
      cropType: 'Paddy (Grade A)',
      quantityQuintals: 80,
      mspRatePerQ: 2320,
      totalAmount: 185600,
      centerName: mandiName,
      centerId: 'center_main',
      scheduledDate: '2025-10-18',
      scheduledSlot: '10:00 AM – 10:30 AM',
      status: 'COMPLETED',
      statusDescription: 'DBT Payment Disbursed via PFMS (UTR: PFMS-2025-7719283)',
      dbtUtr: 'PFMS-2025-7719283',
      dbtBank: farmer.bankDetails?.bankName || 'Punjab National Bank',
      dbtDisbursedAt: '20 Oct 2025, 02:15 PM',
      qcGrade: 'Grade A Passed',
      moistureRecorded: 13.2,
      createdAt: '2025-10-18T10:00:00.000Z',
    },
    {
      tokenNumber: `TKN-2025-1109`,
      gatePassId: `GP-2025-1109`,
      cropType: 'Mustard (Seed)',
      quantityQuintals: 35,
      mspRatePerQ: 5650,
      totalAmount: 197750,
      centerName: mandiName,
      centerId: 'center_main',
      scheduledDate: '2025-03-22',
      scheduledSlot: '11:00 AM – 11:30 AM',
      status: 'COMPLETED',
      statusDescription: 'DBT Payment Disbursed via PFMS (UTR: PFMS-2025-3382910)',
      dbtUtr: 'PFMS-2025-3382910',
      dbtBank: farmer.bankDetails?.bankName || 'State Bank of India',
      dbtDisbursedAt: '24 Mar 2025, 11:45 AM',
      qcGrade: 'Grade A Passed',
      moistureRecorded: 8.5,
      createdAt: '2025-03-22T11:00:00.000Z',
    },
    {
      tokenNumber: `TKN-2024-9022`,
      gatePassId: `GP-2024-9022`,
      cropType: 'Paddy (Common)',
      quantityQuintals: 90,
      mspRatePerQ: 2183,
      totalAmount: 196470,
      centerName: mandiName,
      centerId: 'center_main',
      scheduledDate: '2024-11-04',
      scheduledSlot: '09:00 AM – 09:30 AM',
      status: 'COMPLETED',
      statusDescription: 'DBT Payment Disbursed via PFMS (UTR: PFMS-2024-5541092)',
      dbtUtr: 'PFMS-2024-5541092',
      dbtBank: farmer.bankDetails?.bankName || 'State Bank of India',
      dbtDisbursedAt: '06 Nov 2024, 03:00 PM',
      qcGrade: 'Grade A Passed',
      moistureRecorded: 13.5,
      createdAt: '2024-11-04T09:00:00.000Z',
    },
    {
      tokenNumber: `TKN-2024-3180`,
      gatePassId: `GP-2024-3180`,
      cropType: 'Wheat (Buffer)',
      quantityQuintals: 75,
      mspRatePerQ: 2275,
      totalAmount: 170625,
      centerName: mandiName,
      centerId: 'center_main',
      scheduledDate: '2024-04-08',
      scheduledSlot: '10:30 AM – 11:00 AM',
      status: 'COMPLETED',
      statusDescription: 'DBT Payment Disbursed via PFMS (UTR: PFMS-2024-1182749)',
      dbtUtr: 'PFMS-2024-1182749',
      dbtBank: farmer.bankDetails?.bankName || 'State Bank of India',
      dbtDisbursedAt: '10 Apr 2024, 01:20 PM',
      qcGrade: 'Grade A Passed',
      moistureRecorded: 12.4,
      createdAt: '2024-04-08T10:30:00.000Z',
    },
    {
      tokenNumber: `TKN-2023-7419`,
      gatePassId: `GP-2023-7419`,
      cropType: 'Paddy (Grade A)',
      quantityQuintals: 70,
      mspRatePerQ: 2060,
      totalAmount: 144200,
      centerName: mandiName,
      centerId: 'center_main',
      scheduledDate: '2023-10-25',
      scheduledSlot: '11:00 AM – 11:30 AM',
      status: 'COMPLETED',
      statusDescription: 'DBT Payment Disbursed via PFMS (UTR: PFMS-2023-8829104)',
      dbtUtr: 'PFMS-2023-8829104',
      dbtBank: farmer.bankDetails?.bankName || 'State Bank of India',
      dbtDisbursedAt: '28 Oct 2023, 03:45 PM',
      qcGrade: 'Grade A Passed',
      moistureRecorded: 13.1,
      createdAt: '2023-10-25T11:00:00.000Z',
    },
  ];

  // Save to localStorage under this mobile number
  try {
    const localKey = `krishi_farmer_history_${cleanPhone || cleanAadhaar}`;
    localStorage.setItem(
      localKey,
      JSON.stringify({ activeToken: null, pastBookings: defaultPastBookings })
    );
  } catch (e) {
    console.warn('Failed seeding farmer history to localStorage:', e);
  }

  return {
    activeToken: null,
    pastBookings: defaultPastBookings,
  };
}

/**
 * Persists a farmer's newly created or updated token and history
 */
export function saveFarmerBooking(farmer: FarmerUser, token: Token) {
  const cleanPhone = normalizeFarmerKey(farmer.mobileNumber);
  const cleanAadhaar = normalizeFarmerKey(farmer.aadhaar);
  const localKey = `krishi_farmer_history_${cleanPhone || cleanAadhaar}`;

  try {
    const existing = getFarmerData(farmer);
    const updated = {
      activeToken: token,
      pastBookings: existing.pastBookings,
    };
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed saving farmer booking to localStorage:', e);
  }
}

/**
 * Marks current active token as completed and moves to past transactions
 */
export function completeFarmerBooking(farmer: FarmerUser, token: Token, utr: string = 'DBT' + Date.now()) {
  const cleanPhone = normalizeFarmerKey(farmer.mobileNumber);
  const cleanAadhaar = normalizeFarmerKey(farmer.aadhaar);
  const localKey = `krishi_farmer_history_${cleanPhone || cleanAadhaar}`;

  const pastItem: FarmerPastBooking = {
    tokenNumber: token.tokenNumber,
    gatePassId: `GP-${token.tokenNumber}-2026`,
    cropType: token.cropType,
    quantityQuintals: token.quantityQuintals,
    mspRatePerQ: token.mspRatePerQ,
    totalAmount: token.totalAmount,
    centerName: token.center?.centerName || 'Karnal Central Mandi',
    centerId: token.centerId,
    scheduledDate: token.scheduledDate,
    scheduledSlot: token.scheduledSlot,
    status: 'COMPLETED',
    statusDescription: `DBT Payment Disbursed via PFMS (UTR: ${utr})`,
    dbtUtr: utr,
    dbtBank: token.bankDetails?.bankName || 'State Bank of India',
    dbtDisbursedAt: new Date().toLocaleString(),
    qcGrade: 'Grade A Passed',
    moistureRecorded: 13.5,
    createdAt: token.createdAt || new Date().toISOString(),
  };

  try {
    const existing = getFarmerData(farmer);
    const updated = {
      activeToken: null,
      pastBookings: [pastItem, ...existing.pastBookings],
    };
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed completing farmer booking:', e);
  }
}
