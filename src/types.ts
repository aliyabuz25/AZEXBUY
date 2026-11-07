export type Locale = 'EN' | 'AZ' | 'TR' | 'RU' | 'AR' | 'ES';

export type ViewMode =
  | 'home'
  | 'buyers'
  | 'producers'
  | 'services'
  | 'products'
  | 'how-it-works'
  | 'about'
  | 'insights'
  | 'contact'
  | 'dossiers'
  | 'ai-desk'
  | 'articles';

export interface Article {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  viewCount: number;
}

export type IncotermCode = 'EXW' | 'FCA' | 'FOB' | 'CIF' | 'DAP' | 'DDP';

export type LeadWorkflowStatus = 'New' | 'In Progress' | 'Contacted' | 'Closed';

export interface LocalizedText {
  EN: string;
  AZ: string;
  RU: string;
  TR?: string;
  AR?: string;
  ES?: string;
}

export const getLocalizedText = (
  textObj: LocalizedText | Record<string, string> | undefined | null,
  locale: Locale
): string => {
  if (!textObj) return '';
  const obj = textObj as Record<string, string>;
  return obj[locale] || obj['EN'] || obj['AZ'] || obj['RU'] || '';
};

export interface ProductItem {
  id: string;
  featured: boolean;
  hsCode: string;
  categoryKey: 'agro' | 'textile' | 'construction' | 'metals' | 'chemicals';
  name: LocalizedText;
  categoryLabel: LocalizedText;
  shortDesc: LocalizedText;
  originRegion: LocalizedText;
  image: string;
  minOrderQty: string;
  annualCapacity: string;
  verifiedSuppliersCount: number;
  incoterms: IncotermCode[];
  certifications: string[];
  leadTimeDays: string;
  packaging: LocalizedText;
  gradeSpecs: LocalizedText;
}

export interface StepItem {
  number: number;
  title: LocalizedText;
  detailTitle: LocalizedText;
  description: LocalizedText;
  deliverable: LocalizedText;
  sla: string;
  authority: string;
}

export interface ServicePillar {
  id: string;
  iconClass: string;
  colorClass: string;
  linkColorClass: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  items: LocalizedText[];
  deliverables: LocalizedText[];
  turnaround: string;
}

export interface RFQLineItem {
  productId: string;
  productName: string;
  hsCode: string;
  quantity: string;
  unit: 'MT' | '20ft FCL' | '40ft FCL' | 'm²' | 'Units';
}

export interface RFQSubmission {
  id: string;
  createdAt: string;
  buyerCompany: string;
  country: string;
  contactName: string;
  email: string;
  phone: string;
  incoterm: IncotermCode;
  destinationPort: string;
  corridorRoute: string;
  requiredCertifications: string[];
  items: RFQLineItem[];
  notes: string;
  status: string;
  assignedTo?: string;
  internalNotes?: string[];
}

export interface CmsService {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: LocalizedText;
  description: LocalizedText;
  scope: { AZ: string[]; EN: string[]; TR: string[]; RU: string[] };
  targetAudience: LocalizedText;
  iconClass: string;
  colorClass: string;
  serviceType: 'primary' | 'secondary';
  isActive: boolean;
  sortOrder: number;
}

export interface ServiceApplication {
  id: string;
  createdAt: string;
  fullName: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  details: string;
  selectedServices: string[];
  status: string;
}

export interface ProducerApplication {
  id: string;
  createdAt: string;
  companyName: string;
  voenTin: string;
  economicRegion: string;
  contactPerson: string;
  email: string;
  phone: string;
  productName: string;
  hsCode: string;
  categoryKey: string;
  monthlyCapacity: string;
  certifications: string[];
  targetMarkets: string[];
  outsourcedDeskRequested: boolean;
  readinessScore: number;
  status: string;
  assignedTo?: string;
  internalNotes?: string[];
}
