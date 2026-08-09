export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  remark?: string;
  assignedTo: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  supplierName?: string;
  supplierId?: string;
  assignedToUserId: string;
}

export interface MilkMetrics {
  quantity?: number;
  fat?: number;
  snf?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  ownership: 'Self' | 'Company';
  status?: string;
}

export interface TankItem {
  id: string;
  label: string;
  capacity: string;
}

export interface TankerLogItem {
  id: string;
  tankerNo: string;
  arrivalTime: string;
  departureTime: string;
  qtyFilled: string;
}

export interface CompetitorData {
  id: string;
  name: string;
  count: string;
  producers: string;
  milk: string;
  status: string;
}

export interface SurveyData {
  animals?: {
    total: string;
    cows: string;
    buffaloes: string;
    milking: string;
    dry: string;
    others: string;
  };
  producers?: {
    total: string;
    regular: string;
    new: string;
    potential: string;
  };
  competitors?: CompetitorData[];
  our_facilities?: {
    feed: boolean;
    vet: boolean;
    ai: boolean;
    insurance: boolean;
    loan: boolean;
    training: boolean;
    bonus: boolean;
    other: string;
  };
  comp_facilities?: {
    feed: boolean;
    vet: boolean;
    bonus: boolean;
    rate: boolean;
    loan: boolean;
    free: boolean;
    other: string;
  };
  other_info?: {
    situation: string;
    opportunity: string;
    problems: string;
    observation: string;
    official_note: string;
    remarks: string;
  };
}

export type SupplierType = 'Gavali' | 'Gotha' | 'Center';

export interface ProducerCenterAdditionalDetails extends SurveyData {
  morning_collection_time?: string;
  evening_collection_time?: string;
  start_year?: string;
  total_producers?: number;
  active_producers?: number;
  inactive_producers?: number;
  total_animals?: number;
  cows?: number;
  buffalo?: number;
  calves?: number;
  long_term_producers?: any[];
  decreasing_producers?: any[];
  local_employees?: any[];
  dairy_employees?: any[];
  local_gavali?: any[];
  lss_details?: any[];
  competitor_dairies?: any[];
  competitor_facilities?: any[];
  sub_routes?: any[];
  collection_areas?: any[];
  capable_gotha_producers?: any[];
  high_milk_producers?: any[];
  milk_decrease_reasons?: string;
  efforts_taken?: string;
  required_actions?: string;
  internal_gothas?: any[];
  sub_gavali_info?: any[];
  gotha_total_area?: string;
  gotha_fodder_area?: string;
  gotha_milking_shift_morning?: string;
  gotha_milking_shift_evening?: string;
  gotha_hygiene_checklist?: Record<string, boolean>;
  gotha_breed_info?: any[];
  foundation_year?: string;
}

export interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  address: string;
  mobile: string;
  routeId: string;
  supplierType: SupplierType;
  competition?: string;
  additionalInfo?: string;
  cowMilk?: MilkMetrics;
  buffaloMilk?: MilkMetrics;
  iceBlocks?: number;
  scaleBrand?: string;
  fatMachineBrand?: string;
  cattleFeedBrand?: string;
  fssaiNumber?: string;
  fssaiExpiry?: string;
  operatorName?: string;
  paymentCycle?: string;
  spaceOwnership?: 'Self' | 'Rented';
  hygieneGrade?: string;
  chemicalsStock?: string;
  batteryCondition?: string;
  equipment?: EquipmentItem[];
  computerAvailable?: boolean;
  upsInverterAvailable?: boolean;
  solarAvailable?: boolean;
  adulterationKitInfo?: string;
  milkCansCount?: number;
  producer_center?: {
    additional_details?: ProducerCenterAdditionalDetails;
  };
  updatedAt: string;
  isOpen?: boolean; // UI State
  isSurveyOpen?: boolean; // UI State for surveys
}

export interface ChillingRouteItem extends SurveyData {
  id: string;
  routeName: string;
  producerCount: string;
  cows: string;
  buffaloes: string;
  distanceKm: string;
  collectionArea: string;
  milkmanNames: string;
  isSurveyOpen?: boolean;
  cowMilk?: MilkMetrics;
  buffaloMilk?: MilkMetrics;
}

export interface ChillingCenter extends SurveyData {
  id: string;
  name: string;
  ownerName?: string;
  code: string;
  address: string;
  mobile: string;
  cowMilk: MilkMetrics;
  buffaloMilk: MilkMetrics;
  hasBmc: boolean;
  hasIbt: boolean;
  hasEtp: boolean;
  hasSolar: boolean;
  hasHotWater: boolean;
  hasDrainage: boolean;
  hasLab: boolean;
  hasLab_new?: boolean;
  staffUniform: boolean;
  tanks: TankItem[];
  tankerLogs: TankerLogItem[];
  morningTime: string;
  eveningTime: string;
  supplierCount: string;
  fatMachineBrand: string;
  otherDairySupply: string;
  fssaiNumber?: string;
  fssaiExpiry?: string;
  waterSource?: string;
  powerBackup?: string;
  hygieneGrade?: string;
  hasTransportLicenses: boolean;
  pestControlDone: boolean;
  staffHealthCheckDone: boolean;
  calibrationDone: boolean;
  fireSafetyOk: boolean;
  routes?: ChillingRouteItem[];
  gavaliSuppliers?: Supplier[];
  gothaSuppliers?: Supplier[];
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  distanceKm: number;
  vehicle: string;
  costPerKm: number;
  supplierIds: string[];
  iceBlocks?: number;
  updatedAt?: string;
}

export type ReportType = 'Daily Office Work' | 'Field Visit' | 'Route Visit' | 'Daily Task' | 'Breakdown' | 'Custom Form' | 'Collection Center Audit' | 'FSSAI Center Inspection' | 'Seizure & Penalty' | 'Milk Procurement Survey' | 'Chilling Report' | 'Transport Breakdown Report' | 'Daily Work Report' | 'Official Document' | 'Route Allocation Report';

export interface Report {
  id: string;
  type: ReportType;
  date: string;
  reportDate: string;
  generatedByUserId: string;
  summary: string;
  overallSummary: string;
  fullData?: any;
  createdAt: string;
  updatedAt?: string;
}

export type MonitoringReason = 'Repeated Adulteration' | 'Excessive Odor' | 'Late Milk Arrival' | 'Poor Milk Quality' | 'High Bacterial Contamination' | 'Irregular Milk Supply' | 'Other';

export interface QualityMonitoringEntry {
  id: string;
  supplierType: 'Gavali' | 'Gotha' | 'Route';
  supplierName: string;
  villageName: string;
  chillingCenterName: string;
  observationDate: string;
  reason: MonitoringReason;
  detailedRemarks: string;
  status: 'Active' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}
