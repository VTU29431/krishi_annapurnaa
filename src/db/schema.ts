import { relations } from 'drizzle-orm';
import { doublePrecision, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table (Firebase Auth linked)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').notNull().default('farmer'), // 'farmer' | 'officer' | 'admin'
  fullName: text('full_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Farmers Registry table
export const farmers = pgTable('farmers', {
  farmerId: text('farmer_id').primaryKey(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  aadhaarMasked: text('aadhaar_masked').notNull(),
  village: text('village'),
  district: text('district').notNull(),
  state: text('state').notNull(),
  landAreaAcres: doublePrecision('land_area_acres').default(2.5),
  bankAccountMasked: text('bank_account_masked'),
  ifscCode: text('ifsc_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Procurement Centers (Mandis) table
export const procurementCenters = pgTable('procurement_centers', {
  centerId: text('center_id').primaryKey(),
  centerName: text('center_name').notNull(),
  state: text('state').notNull(),
  district: text('district').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  maxCapacityQuintals: doublePrecision('max_capacity_quintals').notNull(),
  currentStorageQuintals: doublePrecision('current_storage_quintals').default(0),
  activeScales: integer('active_scales').default(3),
  activeStaff: integer('active_staff').default(6),
  avgProcessingTimeMins: integer('avg_processing_time_mins').default(40),
  status: text('status').default('AVAILABLE'), // AVAILABLE, MODERATE, HIGH, OVERLOADED
  alternateCenterId: text('alternate_center_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Produce Procurement Tokens table
export const tokens = pgTable('tokens', {
  tokenNumber: text('token_number').primaryKey(),
  farmerId: text('farmer_id')
    .references(() => farmers.farmerId)
    .notNull(),
  centerId: text('center_id')
    .references(() => procurementCenters.centerId)
    .notNull(),
  cropType: text('crop_type').notNull(),
  quantityQuintals: doublePrecision('quantity_quintals').notNull(),
  mspRatePerQ: doublePrecision('msp_rate_per_q').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  scheduledDate: text('scheduled_date').notNull(), // YYYY-MM-DD
  scheduledSlot: text('scheduled_slot').notNull(),
  queueAhead: integer('queue_ahead').default(0),
  estimatedWaitMinutes: integer('estimated_wait_minutes').default(0),
  currentStageIndex: integer('current_stage_index').default(1),
  stageName: text('stage_name').default('Token Generated'),
  status: text('status').default('WAITING'), // WAITING, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Quality & Moisture Assay Inspections table
export const qualityInspections = pgTable('quality_inspections', {
  inspectionId: text('inspection_id').primaryKey(),
  tokenNumber: text('token_number')
    .references(() => tokens.tokenNumber)
    .notNull(),
  moisturePercentage: doublePrecision('moisture_percentage').notNull(),
  foreignMatterPercentage: doublePrecision('foreign_matter_percentage').notNull(),
  cropGrade: text('crop_grade').notNull(),
  cvConfidenceScore: doublePrecision('cv_confidence_score').default(95.0),
  qcStatus: text('qc_status').notNull().default('PASSED'), // PASSED, FLAGGED, REJECTED
  remarks: text('remarks'),
  inspectedBy: text('inspected_by').default('Mandi Quality Officer'),
  inspectedAt: timestamp('inspected_at').defaultNow(),
});

// 6. Direct Benefit Transfer (DBT) Payments table
export const dbtPayments = pgTable('dbt_payments', {
  transactionUtr: text('transaction_utr').primaryKey(),
  tokenNumber: text('token_number')
    .references(() => tokens.tokenNumber)
    .notNull(),
  farmerId: text('farmer_id')
    .references(() => farmers.farmerId)
    .notNull(),
  disbursedAmount: doublePrecision('disbursed_amount').notNull(),
  paymentMode: text('payment_mode').default('Aadhaar Payment Bridge (APBS)'),
  bankName: text('bank_name').default('State Bank of India'),
  bankAccountMasked: text('bank_account_masked').notNull(),
  paymentStatus: text('payment_status').default('COMPLETED'), // PENDING, PROCESSING, COMPLETED, FAILED
  processedAt: timestamp('processed_at').defaultNow(),
});

// 7. Crop Land Registrations table
export const cropRegistrations = pgTable('crop_registrations', {
  registrationId: text('registration_id').primaryKey(),
  farmerId: text('farmer_id')
    .references(() => farmers.farmerId)
    .notNull(),
  stateRegistry: text('state_registry').notNull(),
  khasraSurveyNo: text('khasra_survey_no').notNull(),
  cropName: text('crop_name').notNull(),
  sownAreaAcres: doublePrecision('sown_area_acres').notNull(),
  maxProcurementQuotaQ: doublePrecision('max_procurement_quota_q').notNull(),
  verificationStatus: text('verification_status').default('VERIFIED'),
  verifiedAt: timestamp('verified_at').defaultNow(),
});

// Relations
export const tokensRelations = relations(tokens, ({ one, many }) => ({
  farmer: one(farmers, {
    fields: [tokens.farmerId],
    references: [farmers.farmerId],
  }),
  center: one(procurementCenters, {
    fields: [tokens.centerId],
    references: [procurementCenters.centerId],
  }),
  inspection: one(qualityInspections, {
    fields: [tokens.tokenNumber],
    references: [qualityInspections.tokenNumber],
  }),
  payment: one(dbtPayments, {
    fields: [tokens.tokenNumber],
    references: [dbtPayments.tokenNumber],
  }),
}));

export const farmersRelations = relations(farmers, ({ many }) => ({
  tokens: many(tokens),
  cropRegistrations: many(cropRegistrations),
  payments: many(dbtPayments),
}));

export const procurementCentersRelations = relations(procurementCenters, ({ many }) => ({
  tokens: many(tokens),
}));
