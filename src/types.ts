export interface ProcurementCenter {
  centerId: string;
  centerName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  maxCapacityQuintals: number;
  capacityQuintals?: number;
  currentStorageQuintals: number;
  availableStorageQuintals?: number;
  activeScales: number;
  activeStaff?: number;
  weighbridgeCount?: number;
  operatingHours?: string;
  avgProcessingTimeMins?: number;
  waitingTimeMinutes?: number;
  status?: 'AVAILABLE' | 'MODERATE' | 'HIGH' | 'OVERLOADED';
  alternateCenterId?: string | null;
  createdAt?: string;
  officerInchargeName?: string;
  officerPhone?: string;
  officerMobile?: string;
  mandiSecretaryPhone?: string;
  helpdeskPhone?: string;
  fullAddress?: string;
  cropCategory?: string;
  yardType?: 'GOVT_APMC' | 'PRIVATE_YARD' | 'FPO_DIRECT';
}

export interface StageVerification {
  stageIndex: number;
  stageTitle: string;
  stageDesc: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'CLARIFIED';
  verifiedByOfficerId?: string;
  verifiedByOfficerName?: string;
  verifiedAt?: string;
  officerRemarks?: string;
}

export interface Farmer {
  farmerId: string;
  fullName: string;
  phoneNumber: string;
  aadhaarMasked: string;
  village?: string | null;
  district: string;
  state: string;
  landAreaAcres?: number | null;
  bankAccountMasked?: string | null;
  ifscCode?: string | null;
}

export interface Token {
  tokenNumber: string;
  farmerId: string;
  centerId: string;
  cropType: string;
  cropVariety?: string;
  quantityQuintals: number;
  mspRatePerQ: number;
  totalAmount: number;
  scheduledDate: string;
  scheduledSlot: string;
  queueAhead: number;
  estimatedWaitMinutes: number;
  currentStageIndex: number;
  stageName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
  farmer?: Farmer;
  center?: ProcurementCenter;
  qualityInspection?: QualityInspection;
  dbtPayment?: DbtPayment;
  paymentMode?: PaymentMode;
  bankDetails?: BankDetails;
  smsNotificationSent?: boolean;
  stageVerifications?: StageVerification[];
  paymentDetails?: {
    paymentMode: PaymentMode;
    utrNumber?: string;
    bankRef?: string;
    paymentReceiptUrl?: string;
    receiptShared?: boolean;
    offlineProofPhotoUrl?: string;
    voucherNumber?: string;
    verifiedAt?: string;
    verifiedByOfficerName?: string;
    verifiedByOfficerMobile?: string;
    amountPaid?: number;
    notes?: string;
  };
}

export interface QualityInspection {
  inspectionId: string;
  tokenNumber: string;
  moisturePercentage: number;
  foreignMatterPercentage: number;
  cropGrade: string;
  cvConfidenceScore: number;
  qcStatus: 'PASSED' | 'FLAGGED' | 'REJECTED';
  remarks?: string | null;
  inspectedBy?: string;
  inspectedAt?: string;
}

export interface DbtPayment {
  transactionUtr: string;
  tokenNumber: string;
  farmerId: string;
  disbursedAmount: number;
  paymentMode: string;
  bankName: string;
  bankAccountMasked: string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processedAt?: string;
  offlineProofPhotoUrl?: string;
  voucherNumber?: string;
  receiptShared?: boolean;
}

export interface FarmerPastBooking {
  tokenNumber: string;
  gatePassId: string;
  cropType: string;
  quantityQuintals: number;
  mspRatePerQ: number;
  totalAmount: number;
  centerName: string;
  centerId?: string;
  scheduledDate: string;
  scheduledSlot: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'WEIGHED' | 'DBT_CREDITED' | 'REJECTED';
  statusDescription: string;
  dbtUtr?: string;
  dbtBank?: string;
  dbtDisbursedAt?: string;
  qcGrade?: string;
  moistureRecorded?: number;
  createdAt: string;
}

export type PaymentMode = 'MONEY_CREDIT' | 'ONLINE_DBT' | 'OFFLINE_MANDI';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface CropInsurance {
  policyNumber: string;
  farmerName: string;
  farmerAadhaar: string;
  cropName: string;
  sownAreaAcres: number;
  sumInsured: number;
  farmerPremium: number;
  govtSubsidy: number;
  district: string;
  state: string;
  coveragePeriod: string;
  approvalSeal: string;
  status: 'ACTIVE' | 'APPROVED';
  enrolledAt: string;
  receiptId: string;
  paymentStatus?: 'PENDING' | 'CONFIRMED';
  paymentMethod?: string;
  transactionRef?: string;
  paidAt?: string;
}

export interface ColdStorageFacility {
  id: string;
  name: string;
  district: string;
  state: string;
  capacityQuintals: number;
  availableQuintals: number;
  ratePerQuintalPerDay: number;
  ratePerQuintalPerMonth: number;
  tempRange: string;
  type: string;
  accreditedBy: string;
  contactNumber: string;
}

export interface ColdStorageBooking {
  bookingId: string;
  facilityId: string;
  facilityName: string;
  cropName: string;
  quantityQuintals: number;
  durationDays: number;
  ratePerQuintalPerDay: number;
  grossRent: number;
  govtSubsidyDiscount: number;
  fumigationFee: number;
  netPayable: number;
  bayNumber: string;
  eNwrReceiptNumber: string;
  farmerName: string;
  farmerAadhaar: string;
  farmerMobile: string;
  arrivalDate: string;
  status: 'CONFIRMED' | 'ALLOCATED' | 'IN_STORE';
  createdAt: string;
  paymentStatus?: 'PENDING' | 'CONFIRMED';
  paymentMethod?: string;
  transactionRef?: string;
  paidAt?: string;
}

export interface FarmerUser {
  aadhaar: string;
  fullName: string;
  mobileNumber: string;
  village?: string;
  district: string;
  state: string;
  bankDetails?: BankDetails;
}

export interface MandiOfficerUser {
  mandiOfficeCode: string;
  mandiName: string;
  state?: string;
  district?: string;
  officerId: string;
  officerName: string;
  designation: string;
  scaleNumber: number;
  mobileNumber?: string;
  cropFocus?: string;
  yardType?: 'GOVT_APMC' | 'PRIVATE_YARD' | 'FPO_DIRECT';
}

export interface CropRegistration {
  registrationId: string;
  farmerId: string;
  stateRegistry: string;
  khasraSurveyNo: string;
  cropName: string;
  sownAreaAcres: number;
  maxProcurementQuotaQ: number;
  verificationStatus: string;
  verifiedAt?: string;
}

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'pa'
  | 'bn'
  | 'mr'
  | 'kn'
  | 'gu'
  | 'or'
  | 'ur'
  | 'ml';

export type UserRole = 'farmer' | 'officer' | 'admin';

export interface DashboardStats {
  totalTokens: number;
  completedTokens: number;
  inProgressTokens: number;
  waitingTokens: number;
  totalProcuredQuintals: number;
  totalDbtDisbursed: number;
  connectedMandis: number;
  avgWaitMinutes: number;
  waitingFarmers?: number;
  averageWaitTimeMinutes?: number;
  storageUtilizationPct?: number;
}
