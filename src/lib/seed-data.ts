import type { CreatorTier, DealStatus, PlatformType } from "@/types/collab";

export interface SeedCreatorInput {
  name: string;
  handle: string;
  platform: PlatformType;
  niche: string;
  followerCount: number;
  engagementRate: number;
  baseRate: number;
  email: string;
  managerName: string;
  tier: CreatorTier;
}

export interface SeedDealInput {
  creatorName: string;
  brandName: string;
  brandSector: string;
  campaignTitle: string;
  deliverables: string;
  dealValue: number;
  agencyFeePct: number;
  status: DealStatus;
  dueDate: string;
  notes: string;
}

export interface SeedBrandInput {
  name: string;
  sector: string;
  contactName: string;
  contactEmail: string;
  website: string;
  notes: string;
}

export const SEED_BRANDS: SeedBrandInput[] = [
  { name: "Lenskart", sector: "EYEWEAR", contactName: "Aarav Mehta", contactEmail: "partnerships@lenskart.com", website: "https://www.lenskart.com", notes: "Flagship creator & eyewear campaigns" },
  { name: "Sprite", sector: "BEVERAGES", contactName: "Riya Sharma", contactEmail: "media@coca-cola.in", website: "https://www.sprite.com", notes: "Youth & gaming creator drops" },
  { name: "Odoo", sector: "SOFTWARE", contactName: "Kabir Malhotra", contactEmail: "india-growth@odoo.com", website: "https://www.odoo.com", notes: "Founder & SaaS YouTube integrations" },
  { name: "Netflix", sector: "STREAMING", contactName: "Neha Sinha", contactEmail: "creator-ops@netflix.com", website: "https://www.netflix.com", notes: "Originals reaction & promo collaborations" },
  { name: "Pintola", sector: "HEALTHY SNACKS", contactName: "Dev Patel", contactEmail: "collabs@pintola.in", website: "https://www.pintola.in", notes: "Fitness & nutrition creator storytelling" },
  { name: "Ryze", sector: "HEALTHCARE", contactName: "Sanya Arora", contactEmail: "brand@ryze.health", website: "https://www.ryze.health", notes: "Habit shift & wellness reels" },
  { name: "Amazon MX Player", sector: "ENTERTAINMENT", contactName: "Vikram Joshi", contactEmail: "creators@mxplayer.in", website: "https://www.mxplayer.in", notes: "Weekend binge & satire drops" },
  { name: "The Man Company", sector: "GROOMING", contactName: "Karan Gill", contactEmail: "influencer@themancompany.com", website: "https://www.themancompany.com", notes: "Grooming & fragrance creator videos" },
  { name: "Ola Electric", sector: "MOBILITY", contactName: "Siddharth Rao", contactEmail: "pr@olaelectric.com", website: "https://www.olaelectric.com", notes: "EV reviews & range tests" },
  { name: "Flipkart", sector: "E-COMMERCE", contactName: "Pooja Nair", contactEmail: "creator-wave@flipkart.com", website: "https://www.flipkart.com", notes: "Festive & sale creator clusters" },
  { name: "District by Zomato", sector: "LIVE EVENTS", contactName: "Zoya Khan", contactEmail: "partners@district.in", website: "https://www.district.in", notes: "Dining, movies & live events launches" },
];

export const SEED_CREATORS: SeedCreatorInput[] = [
  {
    name: "Lakshay Chaudhary",
    handle: "@lakshaychaudhary",
    platform: "YouTube",
    niche: "Commentary & Youth Culture",
    followerCount: 1_500_000,
    engagementRate: 6.8,
    baseRate: 350_000,
    email: "lakshay@creatorsmela.com",
    managerName: "Rohan Verma",
    tier: "Exclusive",
  },
  {
    name: "Hemant Show",
    handle: "@hemantshoww",
    platform: "Multi-platform",
    niche: "Comedy & Sketches",
    followerCount: 3_000_000,
    engagementRate: 7.4,
    baseRate: 420_000,
    email: "hemant@creatorsmela.com",
    managerName: "Ananya Kapoor",
    tier: "Exclusive",
  },
  {
    name: "Ashu Ghai",
    handle: "@ashughai",
    platform: "YouTube",
    niche: "Science & Edutainment",
    followerCount: 1_200_000,
    engagementRate: 5.9,
    baseRate: 280_000,
    email: "ashu@creatorsmela.com",
    managerName: "Rohan Verma",
    tier: "Exclusive",
  },
  {
    name: "Shan Prasher",
    handle: "@shanprasher",
    platform: "Instagram",
    niche: "Pop Culture & Satire",
    followerCount: 592_000,
    engagementRate: 8.1,
    baseRate: 185_000,
    email: "shan@creatorsmela.com",
    managerName: "Meera Nair",
    tier: "Exclusive",
  },
  {
    name: "Carversal",
    handle: "@carversal",
    platform: "Multi-platform",
    niche: "Auto & Mobility",
    followerCount: 1_100_000,
    engagementRate: 5.2,
    baseRate: 240_000,
    email: "carversal@creatorsmela.com",
    managerName: "Ananya Kapoor",
    tier: "Roster",
  },
  {
    name: "The Rajdharma",
    handle: "@therajdharma",
    platform: "YouTube",
    niche: "Storytelling & Current Affairs",
    followerCount: 4_900_000,
    engagementRate: 6.3,
    baseRate: 520_000,
    email: "rajdharma@creatorsmela.com",
    managerName: "Meera Nair",
    tier: "Exclusive",
  },
];

export const SEED_DEALS: SeedDealInput[] = [
  {
    creatorName: "Hemant Show",
    brandName: "Lenskart",
    brandSector: "EYEWEAR",
    campaignTitle: "Lenskart Hustlr Integrated Wave",
    deliverables: "1 YT Integration + 2 IG Reels",
    dealValue: 480_000,
    agencyFeePct: 15,
    status: "Paid",
    dueDate: "2026-11-10",
    notes: "Flagship 1B+ views eyewear campaign — invoice settled via NEFT.",
  },
  {
    creatorName: "Hemant Show",
    brandName: "Sprite",
    brandSector: "BEVERAGES",
    campaignTitle: "Sprite Chill Late-Night Drop",
    deliverables: "2 IG Reels + Story Set",
    dealValue: 320_000,
    agencyFeePct: 15,
    status: "Confirmed",
    dueDate: "2026-12-05",
    notes: "Script approved by brand team; shoot scheduled this Friday.",
  },
  {
    creatorName: "Lakshay Chaudhary",
    brandName: "Odoo",
    brandSector: "SOFTWARE",
    campaignTitle: "Odoo for Indian Founders",
    deliverables: "1 Dedicated YT Integration (90s)",
    dealValue: 390_000,
    agencyFeePct: 15,
    status: "Confirmed",
    dueDate: "2026-12-02",
    notes: "Focus on CRM, invoicing & e-signing workflow integration.",
  },
  {
    creatorName: "Lakshay Chaudhary",
    brandName: "Netflix",
    brandSector: "STREAMING",
    campaignTitle: "Q4 Originals Reaction Drop",
    deliverables: "1 YT Video + 1 Short",
    dealValue: 450_000,
    agencyFeePct: 15,
    status: "Pending",
    dueDate: "2026-12-14",
    notes: "Awaiting final commercial sign-off and usage rights addendum.",
  },
  {
    creatorName: "Ashu Ghai",
    brandName: "Pintola",
    brandSector: "HEALTHY SNACKS",
    campaignTitle: "Clean Fuel Lab Breakdown",
    deliverables: "1 YT Integration + 1 IG Reel",
    dealValue: 295_000,
    agencyFeePct: 15,
    status: "Paid",
    dueDate: "2026-11-12",
    notes: "Protein & almond butter nutrition breakdown — payout cleared.",
  },
  {
    creatorName: "Ashu Ghai",
    brandName: "Ryze",
    brandSector: "HEALTHCARE",
    campaignTitle: "Habit Shift Science Series",
    deliverables: "1 Dedicated Explainer Reel",
    dealValue: 210_000,
    agencyFeePct: 15,
    status: "Pending",
    dueDate: "2026-12-18",
    notes: "Compliance review on medical claims in progress.",
  },
  {
    creatorName: "Shan Prasher",
    brandName: "Amazon MX Player",
    brandSector: "ENTERTAINMENT",
    campaignTitle: "Weekend Binge Satire Reel",
    deliverables: "2 IG Reels + 3 Stories",
    dealValue: 195_000,
    agencyFeePct: 15,
    status: "Confirmed",
    dueDate: "2026-12-01",
    notes: "Rough cut approved; go-live locked for 7:00 PM IST.",
  },
  {
    creatorName: "Shan Prasher",
    brandName: "The Man Company",
    brandSector: "GROOMING",
    campaignTitle: "Signature Scent Storytelling",
    deliverables: "1 IG Reel + Link-in-Bio",
    dealValue: 165_000,
    agencyFeePct: 15,
    status: "Paid",
    dueDate: "2026-11-08",
    notes: "Delivered 2.4M organic views; creator payout remitted.",
  },
  {
    creatorName: "Carversal",
    brandName: "Ola Electric",
    brandSector: "MOBILITY",
    campaignTitle: "S1 Pro Long-Range Real Test",
    deliverables: "1 YT Review + 2 Shorts",
    dealValue: 260_000,
    agencyFeePct: 15,
    status: "Confirmed",
    dueDate: "2026-12-09",
    notes: "Media vehicle pickup confirmed in Noida Sector 142.",
  },
  {
    creatorName: "The Rajdharma",
    brandName: "Flipkart",
    brandSector: "E-COMMERCE",
    campaignTitle: "Flipkart Days Creator Wave",
    deliverables: "1 YT Integration + 2 IG Reels",
    dealValue: 540_000,
    agencyFeePct: 12,
    status: "Paid",
    dueDate: "2026-11-04",
    notes: "15M+ views achieved across campaign cluster.",
  },
  {
    creatorName: "The Rajdharma",
    brandName: "District by Zomato",
    brandSector: "LIVE EVENTS",
    campaignTitle: "Winter Culture Pass Launch",
    deliverables: "1 YT Integration + 1 Story",
    dealValue: 375_000,
    agencyFeePct: 15,
    status: "Pending",
    dueDate: "2026-12-20",
    notes: "Proposal sent; awaiting brand PO confirmation.",
  },
];
