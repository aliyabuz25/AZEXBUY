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
  textObj: LocalizedText | ServicePillarItem | Record<string, any> | string | undefined | null,
  locale: Locale
): string => {
  if (!textObj) return '';
  if (typeof textObj === 'string') return textObj;
  if (typeof textObj === 'number') return String(textObj);
  const obj = textObj as Record<string, string>;
  return (
    obj[locale] ||
    obj['EN'] ||
    obj['AZ'] ||
    obj['TR'] ||
    obj['RU'] ||
    obj['AR'] ||
    obj['ES'] ||
    Object.values(obj)[0] ||
    ''
  );
};

export interface ProductItem {
  id: string;
  featured: boolean;
  hsCode: string;
  categoryKey: 'agro' | 'textile' | 'construction' | 'metals' | 'chemicals' | 'food' | 'industrial' | 'packaging' | string;
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

export interface ServicePillarItem {
  [key: string]: any;
  EN?: string;
  AZ?: string;
  TR?: string;
  RU?: string;
  AR?: string;
  ES?: string;
  title?: LocalizedText;
  desc?: LocalizedText;
  description?: LocalizedText;
}

export interface ServicePillar {
  id: string;
  iconClass: string;
  colorClass: string;
  linkColorClass: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  items: (LocalizedText | ServicePillarItem)[];
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

export interface TeamMember {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  role: LocalizedText | Record<string, string>;
  bio: LocalizedText | Record<string, string>;
  photo: string;
  email: string;
  linkedin: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AboutPillar {
  icon: string;
  label: LocalizedText | Record<string, string>;
}

export interface AboutActivity {
  icon: string;
  color: string;
  title: LocalizedText | Record<string, string>;
  desc: LocalizedText | Record<string, string>;
}

export interface AboutValue {
  icon: string;
  color: string;
  title: LocalizedText | Record<string, string>;
  desc: LocalizedText | Record<string, string>;
}

export interface AboutSector {
  icon: string;
  color: string;
  title: LocalizedText | Record<string, string>;
  desc: LocalizedText | Record<string, string>;
  image: string;
}

export interface AboutPartner {
  icon: string;
  color: string;
  title: LocalizedText | Record<string, string>;
  desc: LocalizedText | Record<string, string>;
}

export interface AboutGrowthItem {
  num: string;
  icon: string;
  title: LocalizedText | Record<string, string>;
  desc: LocalizedText | Record<string, string>;
}

export interface AboutStep {
  step: string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  title: LocalizedText | Record<string, string>;
  desc: LocalizedText | Record<string, string>;
}

export interface AboutPageContent {
  whoWeAre: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    p1: LocalizedText | Record<string, string>;
    p2: LocalizedText | Record<string, string>;
    p3: LocalizedText | Record<string, string>;
    pillars: AboutPillar[];
    image: string;
    imageTagline: LocalizedText | Record<string, string>;
    imageSub: LocalizedText | Record<string, string>;
  };
  activities: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
    items: AboutActivity[];
  };
  missionVision: {
    missionBadge: LocalizedText | Record<string, string>;
    missionTitle: LocalizedText | Record<string, string>;
    missionDesc: LocalizedText | Record<string, string>;
    missionImage: string;
    visionBadge: LocalizedText | Record<string, string>;
    visionTitle: LocalizedText | Record<string, string>;
    visionDesc: LocalizedText | Record<string, string>;
    visionImage: string;
  };
  serviceModel: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
    steps: AboutStep[];
    bottomNote: LocalizedText | Record<string, string>;
  };
  sectors: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
    items: AboutSector[];
  };
  values: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
    items: AboutValue[];
  };
  partnership: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
    items: AboutPartner[];
  };
  growth: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
    items: AboutGrowthItem[];
  };
  team: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
  };
  cta: {
    badge: LocalizedText | Record<string, string>;
    title: LocalizedText | Record<string, string>;
    desc: LocalizedText | Record<string, string>;
    buyerBtn: LocalizedText | Record<string, string>;
    producerBtn: LocalizedText | Record<string, string>;
    contactBtn: LocalizedText | Record<string, string>;
  };
}
