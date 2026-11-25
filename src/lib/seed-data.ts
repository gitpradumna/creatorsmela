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

function formatMonthDate(ref: Date, monthsAgo: number, day: number): string {
  const dt = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - monthsAgo, day));
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Generates 24 brand deals spanning the last 6 months relative to today so
 * Analytics charts, Creator/Brand directories, and pipeline workflows are populated.
 */
export function buildSeedDeals(referenceDate = new Date()): SeedDealInput[] {
  return [
    // Month -5 (Settled Paid history)
    {
      creatorName: "Hemant Show",
      brandName: "Lenskart",
      brandSector: "EYEWEAR",
      campaignTitle: "Lenskart Air Summer Sketch",
      deliverables: "1 YT Integration + 1 IG Reel",
      dealValue: 360_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 5, 14),
      notes: "Completed and settled on schedule.",
    },
    {
      creatorName: "Carversal",
      brandName: "Ola Electric",
      brandSector: "MOBILITY",
      campaignTitle: "S1 Air Monsoon Range Run",
      deliverables: "1 YT Video + 1 Short",
      dealValue: 220_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 5, 22),
      notes: "City endurance test published; NEFT settled.",
    },
    {
      creatorName: "Shan Prasher",
      brandName: "The Man Company",
      brandSector: "GROOMING",
      campaignTitle: "Daily Grooming Satire Drop",
      deliverables: "2 IG Reels",
      dealValue: 145_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 5, 27),
      notes: "Delivered 1.9M organic views; invoice cleared.",
    },

    // Month -4 (Settled Paid history)
    {
      creatorName: "The Rajdharma",
      brandName: "Flipkart",
      brandSector: "E-COMMERCE",
      campaignTitle: "Flipkart Electronics Spotlight",
      deliverables: "1 Dedicated YT Explainer",
      dealValue: 490_000,
      agencyFeePct: 12,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 4, 9),
      notes: "12M+ reach across campaign cluster.",
    },
    {
      creatorName: "Ashu Ghai",
      brandName: "Pintola",
      brandSector: "HEALTHY SNACKS",
      campaignTitle: "Protein & Peanut Butter Lab Test",
      deliverables: "1 YT Integration + 2 Stories",
      dealValue: 250_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 4, 18),
      notes: "Educational demo cleared brand compliance and settled.",
    },
    {
      creatorName: "Lakshay Chaudhary",
      brandName: "Sprite",
      brandSector: "BEVERAGES",
      campaignTitle: "Sprite Joke-in-a-Bottle Wave",
      deliverables: "1 YT Integration + 1 Reel",
      dealValue: 310_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 4, 24),
      notes: "High engagement youth drop; payout settled.",
    },

    // Month -3
    {
      creatorName: "Lakshay Chaudhary",
      brandName: "Odoo",
      brandSector: "SOFTWARE",
      campaignTitle: "Odoo Startup Stack Integration",
      deliverables: "1 Dedicated YT Integration (90s)",
      dealValue: 340_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 3, 6),
      notes: "CRM & invoicing integration demo settled.",
    },
    {
      creatorName: "Hemant Show",
      brandName: "Netflix",
      brandSector: "STREAMING",
      campaignTitle: "Comedy Specials Parody Reel",
      deliverables: "2 IG Reels + Story Set",
      dealValue: 410_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 3, 15),
      notes: "Promo sketch went viral; payout remitted.",
    },
    {
      creatorName: "Ashu Ghai",
      brandName: "Ryze",
      brandSector: "HEALTHCARE",
      campaignTitle: "Circadian Rhythm Explainer",
      deliverables: "1 IG Reel + 2 Stories",
      dealValue: 190_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 3, 25),
      notes: "Science breakdown published and paid.",
    },
    {
      creatorName: "Shan Prasher",
      brandName: "Amazon MX Player",
      brandSector: "ENTERTAINMENT",
      campaignTitle: "Binge Watch Roast Episode",
      deliverables: "2 IG Reels + 3 Stories",
      dealValue: 175_000,
      agencyFeePct: 15,
      status: "Confirmed",
      dueDate: formatMonthDate(referenceDate, 3, 28),
      notes: "Video live; awaiting 45-day brand invoice cycle.",
    },

    // Month -2
    {
      creatorName: "The Rajdharma",
      brandName: "District by Zomato",
      brandSector: "LIVE EVENTS",
      campaignTitle: "Live Arena Tour Feature",
      deliverables: "1 YT Integration + 2 IG Stories",
      dealValue: 420_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 2, 7),
      notes: "Ticket link conversion exceeded target; settled.",
    },
    {
      creatorName: "Hemant Show",
      brandName: "Flipkart",
      brandSector: "E-COMMERCE",
      campaignTitle: "Big Sale Skit Collaboration",
      deliverables: "1 YT Video + 2 IG Reels",
      dealValue: 510_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 2, 16),
      notes: "Anchor festive drop settled.",
    },
    {
      creatorName: "Carversal",
      brandName: "Lenskart",
      brandSector: "EYEWEAR",
      campaignTitle: "Polarized Drive Sunglasses Test",
      deliverables: "1 YT Review Segment + 1 Short",
      dealValue: 245_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 2, 21),
      notes: "Night-glare driving test video settled.",
    },
    {
      creatorName: "Shan Prasher",
      brandName: "Sprite",
      brandSector: "BEVERAGES",
      campaignTitle: "Late Night Gaming Drop",
      deliverables: "2 IG Reels + Story Poll",
      dealValue: 185_000,
      agencyFeePct: 15,
      status: "Confirmed",
      dueDate: formatMonthDate(referenceDate, 2, 26),
      notes: "Deliverables approved; payout invoice raised.",
    },

    // Month -1
    {
      creatorName: "Hemant Show",
      brandName: "Lenskart",
      brandSector: "EYEWEAR",
      campaignTitle: "Lenskart Hustlr Integrated Wave",
      deliverables: "1 YT Integration + 2 IG Reels",
      dealValue: 480_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 1, 10),
      notes: "Flagship eyewear campaign — invoice settled via NEFT.",
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
      dueDate: formatMonthDate(referenceDate, 1, 14),
      notes: "Protein & almond butter nutrition breakdown — payout cleared.",
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
      dueDate: formatMonthDate(referenceDate, 1, 20),
      notes: "Focus on CRM, invoicing & e-signing workflow integration.",
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
      dueDate: formatMonthDate(referenceDate, 1, 24),
      notes: "15M+ views achieved across campaign cluster.",
    },
    {
      creatorName: "Carversal",
      brandName: "Ola Electric",
      brandSector: "MOBILITY",
      campaignTitle: "S1 Pro Long-Range Real Test",
      deliverables: "1 YT Review + 2 Shorts",
      dealValue: 260_000,
      agencyFeePct: 15,
      status: "Pending",
      dueDate: formatMonthDate(referenceDate, 1, 28),
      notes: "Awaiting final highway shoot slot approval.",
    },

    // Current Month (Month 0)
    {
      creatorName: "Shan Prasher",
      brandName: "The Man Company",
      brandSector: "GROOMING",
      campaignTitle: "Signature Scent Storytelling",
      deliverables: "1 IG Reel + Link-in-Bio",
      dealValue: 165_000,
      agencyFeePct: 15,
      status: "Paid",
      dueDate: formatMonthDate(referenceDate, 0, 5),
      notes: "Delivered 2.4M organic views; creator payout remitted.",
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
      dueDate: formatMonthDate(referenceDate, 0, 11),
      notes: "Script approved by brand team; shoot scheduled this week.",
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
      dueDate: formatMonthDate(referenceDate, 0, 16),
      notes: "Rough cut approved; go-live scheduled for 7:00 PM IST.",
    },
    {
      creatorName: "Lakshay Chaudhary",
      brandName: "Netflix",
      brandSector: "STREAMING",
      campaignTitle: "Originals Reaction Drop",
      deliverables: "1 YT Video + 1 Short",
      dealValue: 450_000,
      agencyFeePct: 15,
      status: "Pending",
      dueDate: formatMonthDate(referenceDate, 0, 21),
      notes: "Awaiting final commercial sign-off and usage rights addendum.",
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
      dueDate: formatMonthDate(referenceDate, 0, 24),
      notes: "Compliance review on medical claims in progress.",
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
      dueDate: formatMonthDate(referenceDate, 0, 27),
      notes: "Proposal sent; awaiting brand PO confirmation.",
    },
  ];
}
