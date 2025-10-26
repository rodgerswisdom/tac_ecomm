import { ProductCardData } from "@/components/ProductCard";
export interface ArtisanProfile {
  id: number;
  name: string;
  region: "kenya" | "ghana" | "mali" | "southAfrica" | "zimbabwe" | "morocco" | string;
  craft: string;
  quote: string;
  video: string;
  portrait: string;
}
import { LegacyMilestone } from "@/components/LegacyTimeline";

export const featuredProducts: ProductCardData[] = [
  {
    id: 1,
    name: "Kilimanjaro Bronze Collar",
    slug: "kilimanjaro-bronze-collar",
    price: 45000,
    originalPrice: 52000,
    image:
      "https://images.unsplash.com/photo-1603188470169-6f7e80e2e6c2?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1603188470169-6f7e80e2e6c2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516637090014-cb1ab0d08fc7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "A sculpted bronze collar inspired by Chagga armor, hand-burnished for a molten glow and finished with Maasai bead inlays.",
    origin: "Kenya",
    materials: ["Bronze", "Maasai glass beads", "24k gold wash"],
    category: "necklaces",
    subcategory: "collars",
    productType: "ready-to-wear",
    isCorporateGift: true,
    communityImpact: "Supports 3 artisan families in Nairobi",
    sourcingStory: "Hand-cast using traditional Chagga techniques passed down through generations",
    artisan: {
      name: "Achieng' Wanjiku",
      region: "kenya",
      regionLabel: "Nairobi, Kenya",
      quote:
        "When the sun hits the bronze, I see the horizon of the Rift Valley reflected back at me.",
      portrait:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: 2,
    name: "Sankofa Adinkra Signet",
    slug: "sankofa-adinkra-signet",
    price: 28500,
    originalPrice: 32000,
    image:
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Hand-carved signet ring featuring the Sankofa glyph surrounded by hammered gold, symbolising wisdom reclaimed.",
    origin: "Ghana",
    materials: ["18k Fairmined gold", "Adinkra etching", "Ebony inlay"],
    category: "rings",
    subcategory: "signets",
    productType: "ready-to-wear",
    isCorporateGift: false,
    communityImpact: "Supports 2 goldsmith families in Accra",
    sourcingStory: "Crafted using traditional Akan goldsmithing techniques with ethically sourced Fairmined gold",
    artisan: {
      name: "Kojo Mensah",
      region: "ghana",
      regionLabel: "Accra, Ghana",
      quote:
        "Each glyph is a reminder to return and fetch the stories of our elders.",
      portrait:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: 3,
    name: "Timbuktu Desert Bangles",
    slug: "timbuktu-desert-bangles",
    price: 19500,
    originalPrice: 21400,
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518544889280-4e3b0c6b1a61?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Stackable bangles from hand-poured Tuareg bronze, etched with celestial maps of the Sahara caravan routes.",
    origin: "Mali",
    materials: ["Tuareg bronze", "Fine sand casting", "Indigo patina"],
    category: "bracelets",
    subcategory: "bangles",
    productType: "ready-to-wear",
    isCorporateGift: false,
    communityImpact: "Supports 4 Tuareg artisan families in Bamako",
    sourcingStory: "Hand-cast using traditional Tuareg sand-casting methods with celestial engravings",
    artisan: {
      name: "Binta Traoré",
      region: "mali",
      regionLabel: "Bamako, Mali",
      quote:
        "Our ancestors charted stars to travel; I engrave them so their light never fades.",
      portrait:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: 4,
    name: "Zulu Glasswork Hoop",
    slug: "zulu-glasswork-hoop",
    price: 16800,
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f2e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Lightweight hoop earrings woven with recycled glass beads from KwaZulu artisans, trimmed in brushed gold.",
    origin: "South Africa",
    materials: ["Recycled glass", "Brushed gold", "Hand-spun thread"],
    category: "earrings",
    subcategory: "hoops",
    productType: "ready-to-wear",
    isCorporateGift: false,
    communityImpact: "Supports 5 Zulu artisan families in KwaZulu",
    sourcingStory: "Hand-woven using traditional Zulu beadwork techniques with recycled glass",
    artisan: {
      name: "Zanele Kumalo",
      region: "southAfrica",
      regionLabel: "KwaZulu, South Africa",
      quote:
        "Colour is a rhythm; every bead sings a note from home.",
      portrait:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: 5,
    name: "Ndebele Prism Cuff",
    slug: "ndebele-prism-cuff",
    price: 23600,
    originalPrice: 25800,
    image:
      "https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518544889280-4e3b0c6b1a61?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Architectural cuff inspired by Ndebele mural geometry, finished in a matte sand texture with gold leaf edges.",
    origin: "Zimbabwe",
    materials: ["Reclaimed brass", "Gold leaf", "Ndebele etching"],
    category: "bracelets",
    subcategory: "cuffs",
    productType: "ready-to-wear",
    isCorporateGift: true,
    communityImpact: "Supports 3 Ndebele artisan families in Harare",
    sourcingStory: "Hand-etched using traditional Ndebele geometric patterns with reclaimed brass",
    artisan: {
      name: "Thandiwe Ncube",
      region: "zimbabwe",
      regionLabel: "Harare, Zimbabwe",
      quote:
        "I translate the murals from our village walls into wearable architecture.",
      portrait:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: 6,
    name: "Atlas Desert Shawl",
    slug: "atlas-desert-shawl",
    price: 31200,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Hand-loomed merino shawl dyed with desert saffron and henna, finished with leather tassels from Marrakech.",
    origin: "Morocco",
    materials: ["Merino wool", "Henna dye", "Hand-cut leather"],
    category: "hair-accessories",
    subcategory: "shawls",
    productType: "ready-to-wear",
    isCorporateGift: false,
    communityImpact: "Supports 2 Berber weaving families in Marrakech",
    sourcingStory: "Hand-loomed using traditional Berber weaving techniques with natural desert dyes",
    artisan: {
      name: "Yasmina El Idrissi",
      region: "morocco",
      regionLabel: "Marrakech, Morocco",
      quote:
        "Our looms carry the wind songs of the Sahara into every weave.",
      portrait:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    },
  },
];

export const artisanSpotlight: ArtisanProfile[] = [
  {
    id: 1,
    name: "Achieng’ Wanjiku",
    region: "kenya",
    craft: "Bronze Smith · Nairobi",
    quote:
      "We pour stories of the savannah into every molten collar we cast.",
    video: "/videos/artisans/kenya.webm",
    portrait:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 2,
    name: "Kojo Mensah",
    region: "ghana",
    craft: "Goldsmith · Accra",
    quote:
      "The Sankofa reminds us to reach back — I carve it so future generations remember.",
    video: "/videos/artisans/ghana.webm",
    portrait:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 3,
    name: "Binta Traoré",
    region: "mali",
    craft: "Tuareg Metalwork · Bamako",
    quote:
      "Indigo-stained hands carry the constellations of the Sahara.",
    video: "/videos/artisans/mali.webm",
    portrait:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80",
  },
];

export interface CollectionCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  featuredRegions: string[];
  artisanCount: number;
  category: string;
  subcategories: string[];
}

export const featuredCollections: CollectionCategory[] = [
  {
    id: 1,
    name: "Necklaces & Chains",
    slug: "necklaces",
    description: "Sculptural collars, ceremonial chains, and contemporary pendants that honor African metalwork traditions.",
    image: "https://images.unsplash.com/photo-1603188470169-6f7e80e2e6c2?auto=format&fit=crop&w=900&q=80",
    itemCount: 24,
    featuredRegions: ["Kenya", "Ghana", "Mali"],
    artisanCount: 8,
    category: "necklaces",
    subcategories: ["collars", "pendants", "chains", "ceremonial"]
  },
  {
    id: 2,
    name: "Rings & Signets",
    slug: "rings",
    description: "Hand-carved signets featuring Adinkra symbols, traditional wedding bands, and contemporary statement rings.",
    image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=900&q=80",
    itemCount: 18,
    featuredRegions: ["Ghana", "Morocco", "Zimbabwe"],
    artisanCount: 6,
    category: "rings",
    subcategories: ["signets", "wedding", "statement", "ceremonial"]
  },
  {
    id: 3,
    name: "Bracelets & Bangles",
    slug: "bracelets",
    description: "Stackable bangles, architectural cuffs, and woven bracelets that celebrate diverse African craftsmanship.",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
    itemCount: 22,
    featuredRegions: ["Mali", "Zimbabwe", "South Africa"],
    artisanCount: 7,
    category: "bracelets",
    subcategories: ["bangles", "cuffs", "woven", "stackable"]
  },
  {
    id: 4,
    name: "Earrings & Hoops",
    slug: "earrings",
    description: "Lightweight hoops, statement drops, and traditional studs crafted with recycled materials and contemporary flair.",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f2e?auto=format&fit=crop&w=900&q=80",
    itemCount: 20,
    featuredRegions: ["South Africa", "Kenya", "Ghana"],
    artisanCount: 5,
    category: "earrings",
    subcategories: ["hoops", "drops", "studs", "statement"]
  },
  {
    id: 5,
    name: "Hair Accessories",
    slug: "hair-accessories",
    description: "Hand-loomed shawls, decorative combs, and ceremonial headpieces that blend tradition with modern style.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    itemCount: 15,
    featuredRegions: ["Morocco", "Kenya", "Mali"],
    artisanCount: 4,
    category: "hair-accessories",
    subcategories: ["shawls", "combs", "headpieces", "ceremonial"]
  },
  {
    id: 6,
    name: "Matching Sets",
    slug: "matching-sets",
    description: "Curated collections that tell complete cultural stories through harmoniously matched pieces.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
    itemCount: 12,
    featuredRegions: ["All Regions"],
    artisanCount: 12,
    category: "sets",
    subcategories: ["heritage", "ceremonial", "contemporary", "corporate"]
  }
];

export const legacyMilestones: LegacyMilestone[] = [
  {
    id: 1,
    year: "1952",
    region: "Old Town Mombasa",
    title: "The first bead kiln",
    description:
      "Our founders fired recycled glass along the Swahili coast, forging sea-washed beads that inspired modern Maasai palettes.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    pattern: "beadCircles",
  },
  {
    id: 2,
    year: "1978",
    region: "Kumasi Royal Quarter",
    title: "Adinkra reborn",
    description:
      "Goldsmiths in Ghana partnered with master cloth dyers, imprinting Sankofa glyphs into hammered cuffs for the global stage.",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=900&q=80",
    pattern: "adinkraGlyph",
  },
  {
    id: 3,
    year: "1999",
    region: "Dogon Country, Mali",
    title: "Sky map etchings",
    description:
      "Tuareg silversmiths etched the celestial maps of the Sahara into cuffs, blending astronomy with adornment.",
    image:
      "https://images.unsplash.com/photo-1451934403379-ffeff84932da?auto=format&fit=crop&w=900&q=80",
    pattern: "kubaGrid",
  },
  {
    id: 4,
    year: "2024",
    region: "Global",
    title: "TAC Gallery Experience",
    description:
      "We unveil a digital gallery that honors artisan heritage while delivering a couture-level shopping journey.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    pattern: "beadCircles",
  },
];
