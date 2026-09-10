// Comprehensive in-memory repository ensuring zero ECONNREFUSED crashes when Cloud SQL is offline or unprovisioned

export interface InMemoryFarmer {
  farmerId: string;
  fullName: string;
  phoneNumber: string;
  aadhaarMasked: string;
  village?: string;
  district: string;
  state: string;
  landAreaAcres?: number;
  bankAccountMasked?: string;
  ifscCode?: string;
  createdAt: Date;
}

export interface InMemoryCenter {
  centerId: string;
  centerName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  maxCapacityQuintals: number;
  currentStorageQuintals: number;
  activeScales: number;
  activeStaff: number;
  avgProcessingTimeMins: number;
  status: string;
  alternateCenterId?: string | null;
  createdAt: Date;
}

export interface InMemoryToken {
  tokenNumber: string;
  farmerId: string;
  farmerName?: string;
  phoneNumber?: string;
  aadhaar?: string;
  district?: string;
  state?: string;
  centerId: string;
  centerName?: string;
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
  status: string; // WAITING, IN_PROGRESS, COMPLETED, REJECTED
  paymentMode?: string;
  bankDetails?: any;
  paymentDetails?: any;
  createdAt: Date;
  updatedAt: Date;
  farmer?: InMemoryFarmer;
  center?: InMemoryCenter;
  qualityInspection?: InMemoryQualityInspection;
  dbtPayment?: InMemoryDbtPayment;
}

export interface InMemoryQualityInspection {
  inspectionId: string;
  tokenNumber: string;
  moisturePercentage: number;
  foreignMatterPercentage: number;
  cropGrade: string;
  cvConfidenceScore: number;
  qcStatus: string;
  remarks: string | null;
  inspectedBy: string;
  inspectedAt: Date;
}

export interface InMemoryDbtPayment {
  transactionUtr: string;
  tokenNumber: string;
  farmerId: string;
  disbursedAmount: number;
  paymentMode: string;
  bankName: string;
  bankAccountMasked: string;
  paymentStatus: string;
  processedAt: Date;
}

export interface InMemoryCropRegistration {
  registrationId: string;
  farmerId: string;
  stateRegistry: string;
  khasraSurveyNo: string;
  cropName: string;
  sownAreaAcres: number;
  maxProcurementQuotaQ: number;
  verificationStatus: string;
  verifiedAt: Date;
}

export interface InMemoryUser {
  id: number;
  uid: string;
  email: string;
  role: string;
  fullName: string | null;
  createdAt: Date;
}

// Global in-memory state
class MandiInMemoryDatabase {
  private centers: Map<string, InMemoryCenter> = new Map();
  private farmers: Map<string, InMemoryFarmer> = new Map();
  private tokens: Map<string, InMemoryToken> = new Map();
  private qualityInspections: Map<string, InMemoryQualityInspection> = new Map();
  private dbtPayments: Map<string, InMemoryDbtPayment> = new Map();
  private cropRegistrations: Map<string, InMemoryCropRegistration> = new Map();
  private users: Map<string, InMemoryUser> = new Map();
  private userIdCounter = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Centers
    const initialCenters: InMemoryCenter[] = [
      {
        centerId: 'MND-KRN-01',
        centerName: 'Karnal Central Mandi (Center A)',
        state: 'Haryana',
        district: 'Karnal',
        latitude: 29.6857,
        longitude: 76.9905,
        maxCapacityQuintals: 50000,
        currentStorageQuintals: 41200,
        activeScales: 6,
        activeStaff: 24,
        avgProcessingTimeMins: 45,
        status: 'HIGH_LOAD',
        alternateCenterId: 'MND-NLK-02',
        createdAt: new Date(),
      },
      {
        centerId: 'MND-NLK-02',
        centerName: 'Nilokheri Sub-Mandi (Center B)',
        state: 'Haryana',
        district: 'Karnal',
        latitude: 29.8333,
        longitude: 76.9167,
        maxCapacityQuintals: 35000,
        currentStorageQuintals: 14200,
        activeScales: 4,
        activeStaff: 16,
        avgProcessingTimeMins: 15,
        status: 'AVAILABLE',
        alternateCenterId: 'MND-KRN-01',
        createdAt: new Date(),
      },
      {
        centerId: 'MND-GHR-03',
        centerName: 'Gharaunda Grain Yard (Center C)',
        state: 'Haryana',
        district: 'Karnal',
        latitude: 29.5392,
        longitude: 76.9744,
        maxCapacityQuintals: 40000,
        currentStorageQuintals: 22800,
        activeScales: 5,
        activeStaff: 18,
        avgProcessingTimeMins: 22,
        status: 'AVAILABLE',
        alternateCenterId: null,
        createdAt: new Date(),
      },
      {
        centerId: 'MND-PNP-04',
        centerName: 'Panipat Mandi Terminal (Center D)',
        state: 'Haryana',
        district: 'Panipat',
        latitude: 29.3909,
        longitude: 76.9635,
        maxCapacityQuintals: 60000,
        currentStorageQuintals: 49500,
        activeScales: 8,
        activeStaff: 30,
        avgProcessingTimeMins: 40,
        status: 'HIGH_LOAD',
        alternateCenterId: 'MND-GHR-03',
        createdAt: new Date(),
      },
    ];
    for (const c of initialCenters) {
      this.centers.set(c.centerId, c);
    }

    // 2. Farmers
    const initialFarmers: InMemoryFarmer[] = [
      {
        farmerId: 'AP-KRN-78219',
        fullName: 'Ravi Sharma',
        phoneNumber: '9812054321',
        aadhaarMasked: 'XXXX-XXXX-1892',
        village: 'Taraori',
        district: 'Karnal',
        state: 'Haryana',
        landAreaAcres: 5.5,
        bankAccountMasked: 'SBIN0001234-****3918',
        ifscCode: 'SBIN0001234',
        createdAt: new Date(),
      },
      {
        farmerId: 'AP-KRN-54312',
        fullName: 'Balwinder Singh',
        phoneNumber: '9876543210',
        aadhaarMasked: 'XXXX-XXXX-4521',
        village: 'Indri',
        district: 'Karnal',
        state: 'Haryana',
        landAreaAcres: 8.0,
        bankAccountMasked: 'PUNB0005678-****7721',
        ifscCode: 'PUNB0005678',
        createdAt: new Date(),
      },
      {
        farmerId: 'AP-KRN-89211',
        fullName: 'Suresh Kumar',
        phoneNumber: '9845123987',
        aadhaarMasked: 'XXXX-XXXX-8901',
        village: 'Nissing',
        district: 'Karnal',
        state: 'Haryana',
        landAreaAcres: 4.2,
        bankAccountMasked: 'HDFC0001122-****1124',
        ifscCode: 'HDFC0001122',
        createdAt: new Date(),
      },
    ];
    for (const f of initialFarmers) {
      this.farmers.set(f.farmerId, f);
    }

    // 3. Tokens
    const today = new Date().toISOString().split('T')[0];
    const initialTokens: InMemoryToken[] = [
      {
        tokenNumber: 'P-1021',
        farmerId: 'AP-KRN-78219',
        centerId: 'MND-KRN-01',
        cropType: 'Paddy (Grade A)',
        quantityQuintals: 65,
        mspRatePerQ: 2320,
        totalAmount: 150800,
        scheduledDate: today,
        scheduledSlot: '10:30 AM – 11:00 AM',
        queueAhead: 1,
        estimatedWaitMinutes: 20,
        currentStageIndex: 4,
        stageName: 'Quality Assay & Moisture Check',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(),
      },
      {
        tokenNumber: 'P-1022',
        farmerId: 'AP-KRN-54312',
        centerId: 'MND-KRN-01',
        cropType: 'Wheat (Buffer)',
        quantityQuintals: 85,
        mspRatePerQ: 2275,
        totalAmount: 193375,
        scheduledDate: today,
        scheduledSlot: '11:00 AM – 11:30 AM',
        queueAhead: 2,
        estimatedWaitMinutes: 35,
        currentStageIndex: 2,
        stageName: 'Scheduled Slot',
        status: 'WAITING',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
      },
      {
        tokenNumber: 'P-1020',
        farmerId: 'AP-KRN-89211',
        centerId: 'MND-NLK-02',
        cropType: 'Paddy (Common)',
        quantityQuintals: 45,
        mspRatePerQ: 2300,
        totalAmount: 103500,
        scheduledDate: today,
        scheduledSlot: '09:30 AM – 10:00 AM',
        queueAhead: 0,
        estimatedWaitMinutes: 0,
        currentStageIndex: 10,
        stageName: 'DBT Payment Completed',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 3600000 * 4),
        updatedAt: new Date(),
      },
    ];
    for (const t of initialTokens) {
      this.tokens.set(t.tokenNumber, t);
    }

    // 4. Quality inspections
    this.qualityInspections.set('QC-2026-1021', {
      inspectionId: 'QC-2026-1021',
      tokenNumber: 'P-1021',
      moisturePercentage: 13.4,
      foreignMatterPercentage: 0.7,
      cropGrade: 'Grade A',
      cvConfidenceScore: 97.4,
      qcStatus: 'PASSED',
      remarks: 'Grain quality standards verified. Optimal for central pool storage.',
      inspectedBy: 'Mandi Quality Officer',
      inspectedAt: new Date(),
    });

    // 5. DBT Payments
    this.dbtPayments.set('UTR-SBI-20260905-891234', {
      transactionUtr: 'UTR-SBI-20260905-891234',
      tokenNumber: 'P-1020',
      farmerId: 'AP-KRN-89211',
      disbursedAmount: 103500,
      paymentMode: 'Aadhaar Payment Bridge (APBS)',
      bankName: 'State Bank of India',
      bankAccountMasked: 'HDFC0001122-****1124',
      paymentStatus: 'COMPLETED',
      processedAt: new Date(),
    });

    // 6. Crop Registrations
    this.cropRegistrations.set('142/1A', {
      registrationId: 'REG-HR-2026-142',
      farmerId: 'AP-KRN-78219',
      stateRegistry: 'Haryana Revenue & e-Girdawari Portal',
      khasraSurveyNo: '142/1A',
      cropName: 'Paddy (Grade A)',
      sownAreaAcres: 5.5,
      maxProcurementQuotaQ: 110.0,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
    });
  }

  // Centers
  public getCenters(): InMemoryCenter[] {
    return Array.from(this.centers.values());
  }

  public getCenter(centerId: string): InMemoryCenter | undefined {
    return this.centers.get(centerId);
  }

  public ensureCenter(centerData: Partial<InMemoryCenter> & { centerId: string }): InMemoryCenter {
    let c = this.centers.get(centerData.centerId);
    if (!c) {
      c = {
        centerId: centerData.centerId,
        centerName: centerData.centerName || `Mandi Yard ${centerData.centerId}`,
        state: centerData.state || 'Andhra Pradesh',
        district: centerData.district || 'Guntur',
        latitude: centerData.latitude || 16.3067,
        longitude: centerData.longitude || 80.4365,
        maxCapacityQuintals: centerData.maxCapacityQuintals || 50000,
        currentStorageQuintals: centerData.currentStorageQuintals || 21500,
        activeScales: centerData.activeScales || 6,
        activeStaff: centerData.activeStaff || 24,
        avgProcessingTimeMins: centerData.avgProcessingTimeMins || 25,
        status: centerData.status || 'AVAILABLE',
        alternateCenterId: centerData.alternateCenterId || null,
        createdAt: new Date(),
      };
      this.centers.set(centerData.centerId, c);
    }
    return c;
  }

  public saveToken(token: InMemoryToken): InMemoryToken {
    const hydrated = this.hydrateToken(token);
    this.tokens.set(token.tokenNumber, hydrated);
    return hydrated;
  }

  // Farmers
  public getFarmer(farmerId: string): InMemoryFarmer | undefined {
    return this.farmers.get(farmerId);
  }

  public ensureFarmer(
    farmerId: string,
    fullName: string,
    phoneNumber: string,
    district?: string,
    state?: string,
    aadhaar?: string
  ): InMemoryFarmer {
    let f = this.farmers.get(farmerId);
    const maskedAadhaar = aadhaar
      ? (aadhaar.includes('X') ? aadhaar : `XXXX-XXXX-${aadhaar.replace(/\s+/g, '').slice(-4)}`)
      : `XXXX-XXXX-${farmerId.replace(/\s+/g, '').slice(-4) || '1234'}`;

    if (!f || (fullName && f.fullName !== fullName)) {
      f = {
        farmerId,
        fullName: fullName || f?.fullName || 'Farmer',
        phoneNumber: phoneNumber || f?.phoneNumber || '',
        aadhaarMasked: maskedAadhaar,
        district: district || f?.district || 'Karnal',
        state: state || f?.state || 'Haryana',
        landAreaAcres: f?.landAreaAcres || 4.5,
        bankAccountMasked: f?.bankAccountMasked || `SBIN0001234-****${Math.floor(1000 + Math.random() * 9000)}`,
        ifscCode: f?.ifscCode || 'SBIN0001234',
        createdAt: f?.createdAt || new Date(),
      };
      this.farmers.set(farmerId, f);
    }
    return f;
  }

  public hydrateToken(t: InMemoryToken): InMemoryToken {
    const farmer = this.farmers.get(t.farmerId);
    const center = this.centers.get(t.centerId);
    const qc = this.getQualityInspectionForToken(t.tokenNumber);
    const dbt = this.getDbtPaymentForToken(t.tokenNumber);

    const hydratedFarmer: InMemoryFarmer = farmer || {
      farmerId: t.farmerId,
      fullName: t.farmerName || t.farmerId,
      phoneNumber: t.phoneNumber || '',
      aadhaarMasked: t.aadhaar || `XXXX-XXXX-${t.farmerId.slice(-4)}`,
      district: t.district || 'Karnal',
      state: t.state || 'Haryana',
      createdAt: t.createdAt,
    };

    const hydratedCenter: InMemoryCenter = center || {
      centerId: t.centerId,
      centerName: t.centerName || 'Karnal Central Mandi (Center A)',
      district: t.district || 'Karnal',
      state: t.state || 'Haryana',
      latitude: 29.6857,
      longitude: 76.9905,
      maxCapacityQuintals: 5000,
      currentStorageQuintals: 2100,
      activeScales: 4,
      activeStaff: 12,
      avgProcessingTimeMins: 20,
      status: 'AVAILABLE',
      createdAt: t.createdAt,
    };

    return {
      ...t,
      farmer: hydratedFarmer,
      center: hydratedCenter,
      farmerName: t.farmerName || hydratedFarmer.fullName,
      phoneNumber: t.phoneNumber || hydratedFarmer.phoneNumber,
      aadhaar: t.aadhaar || hydratedFarmer.aadhaarMasked,
      district: t.district || hydratedCenter.district,
      state: t.state || hydratedCenter.state,
      centerName: t.centerName || hydratedCenter.centerName,
      qualityInspection: qc || t.qualityInspection,
      dbtPayment: dbt || t.dbtPayment,
      paymentDetails: t.paymentDetails,
    };
  }

  // Tokens
  public getTokens(filter?: { centerId?: string; farmerId?: string; status?: string }): InMemoryToken[] {
    let list = Array.from(this.tokens.values());
    if (filter?.centerId) {
      list = list.filter((t) => t.centerId === filter.centerId);
    }
    if (filter?.farmerId) {
      list = list.filter((t) => t.farmerId === filter.farmerId);
    }
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }
    return list
      .map((t) => this.hydrateToken(t))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getToken(tokenNumber: string): InMemoryToken | undefined {
    const t = this.tokens.get(tokenNumber);
    return t ? this.hydrateToken(t) : undefined;
  }

  public createToken(payload: {
    farmerId: string;
    farmerName: string;
    phoneNumber: string;
    aadhaar?: string;
    district?: string;
    state?: string;
    cropType: string;
    cropVariety?: string;
    quantityQuintals: number;
    centerId: string;
    centerName?: string;
    scheduledDate?: string;
    scheduledSlot?: string;
    paymentMode?: string;
    bankDetails?: any;
  }): InMemoryToken {
    const farmer = this.ensureFarmer(
      payload.farmerId,
      payload.farmerName,
      payload.phoneNumber,
      payload.district,
      payload.state,
      payload.aadhaar
    );

    // If center doesn't exist yet in registry, ensure it
    let center = this.centers.get(payload.centerId);
    if (!center && payload.centerName) {
      center = {
        centerId: payload.centerId,
        centerName: payload.centerName,
        district: payload.district || 'Karnal',
        state: payload.state || 'Haryana',
        latitude: 29.6857,
        longitude: 76.9905,
        maxCapacityQuintals: 5000,
        currentStorageQuintals: 1800,
        activeScales: 4,
        activeStaff: 12,
        avgProcessingTimeMins: 20,
        status: 'AVAILABLE',
        createdAt: new Date(),
      };
      this.centers.set(payload.centerId, center);
    }

    const mspMap: Record<string, number> = {
      'Paddy (Grade A)': 2320,
      'Paddy (Common)': 2300,
      'Wheat (Buffer)': 2275,
      'Maize (Makka)': 2090,
      'Soybean (Yellow)': 4892,
      'Cotton (Medium)': 7121,
    };
    const mspRate = (payload as any).mspRatePerQ || mspMap[payload.cropType] || 2320;
    const totalAmount = (payload as any).totalAmount || (payload.quantityQuintals * mspRate);

    const centerTokens = this.getTokens({ centerId: payload.centerId });
    const waitingAhead = centerTokens.filter((t) => t.status === 'WAITING').length;
    const estimatedWaitMins = Math.max(15, waitingAhead * 3 + 10);

    const distCode = (payload.district || 'APMC').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'TK';
    const nextNum = 1030 + this.tokens.size;
    const tokenNumber = (payload as any).tokenNumber || `TK-${distCode}-${nextNum}`;

    const slotHours = [
      '09:30 AM – 10:00 AM',
      '10:30 AM – 11:00 AM',
      '11:30 AM – 12:00 PM',
      '02:00 PM – 02:30 PM',
    ];
    const scheduledSlot = payload.scheduledSlot || slotHours[waitingAhead % slotHours.length];

    const token: InMemoryToken = {
      tokenNumber,
      farmerId: payload.farmerId,
      farmerName: payload.farmerName || farmer.fullName,
      phoneNumber: payload.phoneNumber || farmer.phoneNumber,
      aadhaar: payload.aadhaar || farmer.aadhaarMasked,
      district: payload.district || farmer.district,
      state: payload.state || farmer.state,
      centerId: payload.centerId,
      centerName: payload.centerName || center?.centerName || 'Karnal Central Mandi',
      cropType: payload.cropType,
      cropVariety: payload.cropVariety,
      quantityQuintals: payload.quantityQuintals,
      mspRatePerQ: mspRate,
      totalAmount,
      scheduledDate: payload.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledSlot,
      queueAhead: waitingAhead,
      estimatedWaitMinutes: estimatedWaitMins,
      currentStageIndex: 2,
      stageName: 'Scheduled Slot',
      status: 'WAITING',
      paymentMode: payload.paymentMode,
      bankDetails: payload.bankDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const hydrated = this.hydrateToken(token);
    this.tokens.set(tokenNumber, hydrated);
    return hydrated;
  }

  public advanceStage(tokenNumber: string, targetStageIndex?: number, paymentDetails?: any): {
    token: InMemoryToken;
    stageIndex: number;
    stageName: string;
    status: string;
  } | null {
    const token = this.tokens.get(tokenNumber);
    if (!token) return null;

    const STAGES = [
      'Registration',
      'Slot Scheduled',
      'Arrived at Gate',
      'Quality Assay',
      'Gross Weight',
      'Produce Accepted',
      'Tare Weight',
      'e-J-Form Issued',
      'APBS Initiated',
      'DBT Completed',
    ];

    const nextStageIndex =
      typeof targetStageIndex === 'number' && targetStageIndex >= 1 && targetStageIndex <= 10
        ? targetStageIndex
        : Math.min(STAGES.length, token.currentStageIndex + 1);
    const nextStageName = STAGES[nextStageIndex - 1];
    const newStatus = nextStageIndex >= 10 ? 'COMPLETED' : 'IN_PROGRESS';

    token.currentStageIndex = nextStageIndex;
    token.stageName = nextStageName;
    token.status = newStatus;
    token.updatedAt = new Date();
    if (paymentDetails) {
      token.paymentDetails = paymentDetails;
      if (paymentDetails.paymentMode === 'OFFLINE_MANDI') {
        token.paymentMode = 'OFFLINE_MANDI';
      }
    }

    // Stage 5 QC
    if (nextStageIndex >= 5 && !this.qualityInspections.has(`QC-2026-${tokenNumber}`)) {
      this.qualityInspections.set(`QC-2026-${tokenNumber}`, {
        inspectionId: `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        tokenNumber,
        moisturePercentage: 13.4,
        foreignMatterPercentage: 0.7,
        cropGrade: 'Grade A',
        cvConfidenceScore: 96.5,
        qcStatus: 'PASSED',
        remarks: 'Grain quality standards verified. Optimal for FCI storage.',
        inspectedBy: 'Mandi Quality Officer',
        inspectedAt: new Date(),
      });
    }

    // Stage 10 Payment Completion (Online DBT or Offline Cash)
    if (nextStageIndex >= 10) {
      const isOffline = paymentDetails?.paymentMode === 'OFFLINE_MANDI' || token.paymentMode === 'OFFLINE_MANDI';
      const finalUtr = isOffline 
        ? (paymentDetails?.voucherNumber || `CSH-VCHR-${tokenNumber}`)
        : (paymentDetails?.utrNumber || `UTR-RBI-20260910-${Math.floor(100000 + Math.random() * 900000)}`);

      this.dbtPayments.set(finalUtr, {
        transactionUtr: finalUtr,
        tokenNumber,
        farmerId: token.farmerId,
        disbursedAmount: paymentDetails?.amountPaid || token.totalAmount,
        paymentMode: isOffline ? 'Mandi Direct Cash Handover' : 'Aadhaar Payment Bridge (APBS / Online DBT)',
        bankName: isOffline ? 'Mandi Treasury Cash Office' : (paymentDetails?.bankName || 'State Bank of India'),
        bankAccountMasked: isOffline ? 'Direct Cash to Farmer Hand' : 'SBIN0001234-****3918',
        paymentStatus: 'COMPLETED',
        processedAt: new Date(),
        offlineProofPhotoUrl: paymentDetails?.offlineProofPhotoUrl,
        voucherNumber: paymentDetails?.voucherNumber,
      } as any);
    }

    const hydratedToken = this.hydrateToken(token);
    this.tokens.set(tokenNumber, hydratedToken);

    return {
      token: hydratedToken,
      stageIndex: nextStageIndex,
      stageName: nextStageName,
      status: newStatus,
    };
  }

  public callNextToken(centerId?: string): InMemoryToken | null {
    const list = Array.from(this.tokens.values())
      .filter((t) => t.status === 'WAITING' && (!centerId || t.centerId === centerId))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (!list.length) return null;

    const token = list[0];
    token.status = 'IN_PROGRESS';
    token.currentStageIndex = 3;
    token.stageName = 'Arrived at Mandi (Admitted at Gate)';
    token.updatedAt = new Date();
    const hydrated = this.hydrateToken(token);
    this.tokens.set(token.tokenNumber, hydrated);
    return hydrated;
  }

  public saveQualityInspection(data: {
    tokenNumber: string;
    moisturePercentage: number;
    foreignMatterPercentage: number;
    cropGrade?: string;
    remarks?: string;
  }): InMemoryQualityInspection {
    const inspectionId = `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const isPassed = data.moisturePercentage <= 17.0 && data.foreignMatterPercentage <= 2.0;
    const inspection: InMemoryQualityInspection = {
      inspectionId,
      tokenNumber: data.tokenNumber,
      moisturePercentage: data.moisturePercentage,
      foreignMatterPercentage: data.foreignMatterPercentage,
      cropGrade: data.cropGrade || 'Grade A',
      cvConfidenceScore: 97.2,
      qcStatus: isPassed ? 'PASSED' : 'REJECTED',
      remarks:
        data.remarks ||
        (isPassed
          ? 'Produce meets Fair Average Quality standards.'
          : 'Moisture exceeds prescribed 17% maximum threshold.'),
      inspectedBy: 'Mandi Quality Officer',
      inspectedAt: new Date(),
    };
    this.qualityInspections.set(inspectionId, inspection);
    return inspection;
  }

  public getQualityInspectionForToken(tokenNumber: string): InMemoryQualityInspection | undefined {
    return Array.from(this.qualityInspections.values()).find((q) => q.tokenNumber === tokenNumber);
  }

  public getDbtPaymentForToken(tokenNumber: string): InMemoryDbtPayment | undefined {
    return Array.from(this.dbtPayments.values()).find((p) => p.tokenNumber === tokenNumber);
  }

  public verifyCropRegistration(
    state: string,
    khasraNo: string
  ): {
    verified: boolean;
    record: InMemoryCropRegistration;
    source: string;
    quota: number;
  } {
    const cleanKhasra = String(khasraNo || '142/1A').trim();
    let reg = this.cropRegistrations.get(cleanKhasra);
    if (!reg) {
      const regId = `REG-${(state || 'HR').toUpperCase().slice(0, 2)}-2026-${Math.floor(100 + Math.random() * 900)}`;
      reg = {
        registrationId: regId,
        farmerId: 'AP-KRN-78219',
        stateRegistry: `${state || 'Haryana'} Revenue & e-Girdawari Portal`,
        khasraSurveyNo: cleanKhasra,
        cropName: 'Paddy (Grade A)',
        sownAreaAcres: 4.5,
        maxProcurementQuotaQ: 90.0,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      };
      this.cropRegistrations.set(cleanKhasra, reg);
    }
    return {
      verified: true,
      record: reg,
      source: reg.stateRegistry,
      quota: reg.maxProcurementQuotaQ,
    };
  }

  public getStats() {
    const allTokens = Array.from(this.tokens.values());
    const allPayments = Array.from(this.dbtPayments.values());
    const allCenters = Array.from(this.centers.values());

    const totalTokens = allTokens.length;
    const completedTokens = allTokens.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTokens = allTokens.filter((t) => t.status === 'IN_PROGRESS').length;
    const waitingTokens = allTokens.filter((t) => t.status === 'WAITING').length;

    const totalProcuredQuintals = allTokens
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + (t.quantityQuintals || 0), 0);

    const totalDbtDisbursed = allPayments.reduce((sum, p) => sum + (p.disbursedAmount || 0), 0);

    return {
      totalTokens,
      completedTokens,
      inProgressTokens,
      waitingTokens,
      totalProcuredQuintals: totalProcuredQuintals || 195,
      totalDbtDisbursed: totalDbtDisbursed || 103500,
      connectedMandis: allCenters.length,
      avgWaitMinutes: 32,
      waitingFarmers: waitingTokens,
      averageWaitTimeMinutes: 32,
      storageUtilizationPct: 78,
    };
  }

  public getOrCreateUser(uid: string, email: string, role = 'farmer', fullName?: string): InMemoryUser {
    let user = this.users.get(uid);
    if (!user) {
      user = {
        id: this.userIdCounter++,
        uid,
        email,
        role,
        fullName: fullName || null,
        createdAt: new Date(),
      };
      this.users.set(uid, user);
    } else {
      user.email = email;
      if (fullName) user.fullName = fullName;
    }
    return user;
  }

  private chatMessages: Array<{
    id: string;
    sender: string;
    role: 'farmer' | 'officer' | 'system';
    text: string;
    centerId?: string;
    timestamp: string;
  }> = [
    {
      id: 'msg-init-1',
      sender: 'Mandi Control Room',
      role: 'system',
      text: 'National APMC Real-Time Electronic Weighbridge Network Active. All electronic scales reporting nominal telemetry.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'msg-init-2',
      sender: 'Karnal Gate 1 Officer',
      role: 'officer',
      text: 'Tokens TK-KRN-1020 through TK-KRN-1035 please maintain scheduled 30-min lane alignment.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  public addChatMessage(msg: {
    id?: string;
    sender: string;
    role: 'farmer' | 'officer' | 'system';
    text: string;
    centerId?: string;
    timestamp?: string;
  }) {
    const newMsg = {
      id: msg.id || `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      sender: msg.sender || 'Mandi User',
      role: msg.role || 'farmer',
      text: msg.text || '',
      centerId: msg.centerId,
      timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.chatMessages.push(newMsg);
    if (this.chatMessages.length > 200) {
      this.chatMessages.shift();
    }
    return newMsg;
  }

  public getChatMessages(limit = 50) {
    return this.chatMessages.slice(-limit);
  }
}

export const inMemoryStore = new MandiInMemoryDatabase();
