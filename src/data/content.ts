import { ProductCardData } from "@/types/product";
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
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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
    id: "6",
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
  {
    id: 4,
    name: "Zanele Kumalo",
    region: "southAfrica",
    craft: "Glasswork Artist · KwaZulu",
    quote:
      "Colour is a rhythm; every bead sings a note from home.",
    video: "/videos/artisans/south-africa.webm",
    portrait:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 5,
    name: "Thandiwe Ncube",
    region: "zimbabwe",
    craft: "Metal Artisan · Harare",
    quote:
      "I translate the murals from our village walls into wearable architecture.",
    video: "/videos/artisans/zimbabwe.webm",
    portrait:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 6,
    name: "Laila Benyoussef",
    region: "morocco",
    craft: "Textile Weaver · Marrakech",
    quote:
      "We weave warmth for the desert nights and brilliance for the ceremonies at dawn.",
    video: "/videos/artisans/morocco.webm",
    portrait:
      "https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=320&q=80",
  },
];

export interface CollectionCategoryHighlight {
  title: string;
  description: string;
}

export interface CollectionCategorySpotlight {
  quote: string;
  name: string;
  role: string;
  image: string;
}

export interface CollectionCategoryCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

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
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  longDescription?: string;
  highlights?: CollectionCategoryHighlight[];
  spotlight?: CollectionCategorySpotlight;
  ctas?: CollectionCategoryCta[];
  featuredProductIds?: string[];
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
    subcategories: ["collars", "pendants", "chains", "ceremonial"],
    heroTitle: "Gallery-Forged Necklaces",
    heroDescription: "A showcase of collars, pendants, and chains shaped by master metalsmiths from East and West Africa.",
    heroImage: "https://images.unsplash.com/photo-1603188470169-6f7e80e2e6c2?auto=format&fit=crop&w=1400&q=80",
    longDescription: "From molten bronze collars inspired by the Chagga to delicate gold pendants etched with Adinkra scripts, every TAC necklace captures a cultural lineage in wearable form.",
    highlights: [
      {
        title: "Hand-cast Foundations",
        description: "Each statement piece is poured, hammered, and burnished within small family ateliers across Nairobi and Accra."
      },
      {
        title: "Cultural Glyphs",
        description: "Adinkra scripts, Tuareg constellations, and Swahili beadwork pattern every chain with ancestral stories."
      },
      {
        title: "Sustainable Metals",
        description: "Fairmined gold, recycled bronze, and reclaimed brass keep the collection luminous with low impact."
      }
    ],
    spotlight: {
      quote: "When the sun hits the bronze, I see the horizon of the Rift Valley reflected back at me.",
      name: "Achieng' Wanjiku",
      role: "Bronze Smith · Nairobi, Kenya",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80"
    },
    ctas: [
      { label: "Shop Necklaces", href: "#collection-products", variant: "primary" },
      { label: "Book Styling Session", href: "/contact", variant: "secondary" }
    ],
    featuredProductIds: ["1"]
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
    subcategories: ["signets", "wedding", "statement", "ceremonial"],
    heroTitle: "Rings & Signets",
    heroDescription: "Glyph-engraved signets and sculpted bands forged by goldsmith dynasties across the continent.",
    heroImage: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=1400&q=80",
    longDescription: "Our ring studio balances ceremonial tradition with modern silhouettes—each band is carved to honor vows, lineages, and personal milestones.",
    highlights: [
      {
        title: "Adinkra Storytelling",
        description: "Symbolic glyphs are hand-etched into gold, celebrating wisdom, unity, and remembrance."
      },
      {
        title: "Fairmined Gold",
        description: "We partner with certified mines to ensure every gram of gold uplifts artisan communities."
      },
      {
        title: "Custom Sizing",
        description: "Made-to-measure fittings are available virtually or within our Nairobi experience studio."
      }
    ],
    spotlight: {
      quote: "Each glyph is a reminder to reach back and fetch the stories of our elders.",
      name: "Kojo Mensah",
      role: "Goldsmith · Accra, Ghana",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
    },
    ctas: [
      { label: "Shop Rings", href: "#collection-products", variant: "primary" },
      { label: "Design a Custom Signet", href: "/bespoke", variant: "secondary" }
    ],
    featuredProductIds: ["2"]
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
    subcategories: ["bangles", "cuffs", "woven", "stackable"],
    heroTitle: "Bracelets & Bangles",
    heroDescription: "Stackable stories forged from Tuareg bronze, Ndebele geometry, and Zulu beadwork.",
    heroImage: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1400&q=80",
    longDescription: "Layer cuffs, bangles, and woven strands that translate regional craftsmanship into contemporary rhythm.",
    highlights: [
      {
        title: "Stacking Ready",
        description: "Curated sets balance weight and texture so you can layer bronze, bead, and leather effortlessly."
      },
      {
        title: "Artisan Geometry",
        description: "Hand-etched Dogon constellations and Ndebele murals wrap each cuff with architectural precision."
      },
      {
        title: "Conscious Materials",
        description: "Reclaimed brass and recycled glass beads keep every piece light on the earth and bold on the wrist."
      }
    ],
    spotlight: {
      quote: "Our ancestors charted stars to travel; I engrave them so their light never fades.",
      name: "Binta Traoré",
      role: "Tuareg Metalsmith · Bamako, Mali",
      image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80"
    },
    ctas: [
      { label: "Shop Bracelets", href: "#collection-products", variant: "primary" },
      { label: "Explore Styling Guides", href: "/collections", variant: "secondary" }
    ],
    featuredProductIds: ["3", "5"]
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
    subcategories: ["hoops", "drops", "studs", "statement"],
    heroTitle: "Earrings & Hoops",
    heroDescription: "Featherlight silhouettes spun from recycled glass, woven thread, and brushed gold.",
    heroImage: "https://images.unsplash.com/photo-1562157873-818bc0726f2e?auto=format&fit=crop&w=1400&q=80",
    longDescription: "From sculptural drops to everyday studs, our earring edit is curated to move with you—balancing culture-rich details and modern ease.",
    highlights: [
      {
        title: "Weightless Comfort",
        description: "Engineered for all-day wear with tension-tested hooks and lightweight recycled beads."
      },
      {
        title: "Color Stories",
        description: "Zulu rainbow palettes and Kenyan earth tones let you paint emotion with every look."
      },
      {
        title: "Versatile Pairings",
        description: "Each design is curated to mix with matching necklaces, cuffs, or hair adornments."
      }
    ],
    spotlight: {
      quote: "Colour is a rhythm; every bead sings a note from home.",
      name: "Zanele Kumalo",
      role: "Glasswork Artist · KwaZulu, South Africa",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80"
    },
    ctas: [
      { label: "Shop Earrings", href: "#collection-products", variant: "primary" },
      { label: "Discover Matching Sets", href: "/collections/matching-sets", variant: "secondary" }
    ],
    featuredProductIds: ["4"]
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
    subcategories: ["shawls", "combs", "headpieces", "ceremonial"],
    heroTitle: "Hair & Head Adornments",
    heroDescription: "Ceremonial headpieces, hand-loomed shawls, and sculptural combs that crown every ensemble.",
    heroImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
    longDescription: "Each accessory is crafted to honor rites of passage and everyday rituals—woven, carved, or cast to frame the face with intention.",
    highlights: [
      {
        title: "Loomed Textiles",
        description: "Berber weavers spin merino and desert botanicals into ultra-soft wraps with tonal gradients."
      },
      {
        title: "Heritage Combwork",
        description: "Kenyan horn carvers and Malian brass smiths sculpt heirloom combs for locs, braids, and natural curls."
      },
      {
        title: "Ceremonial Finishings",
        description: "Gold-leaf edging, bead tassels, and leather ties are hand-finished for celebratory styling."
      }
    ],
    spotlight: {
      quote: "We weave warmth for the desert nights and brilliance for the ceremonies at dawn.",
      name: "Laila Benyoussef",
      role: "Textile Weaver · Marrakech, Morocco",
      image: "https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=400&q=80"
    },
    ctas: [
      { label: "Shop Hair Accessories", href: "#collection-products", variant: "primary" },
      { label: "Request Bridal Styling", href: "/bespoke", variant: "secondary" }
    ],
    featuredProductIds: ["6"]
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
    subcategories: ["heritage", "ceremonial", "contemporary", "corporate"],
    heroTitle: "Matching Sets",
    heroDescription: "Complete stories assembled from earrings, necklaces, cuffs, and adornments that belong together.",
    heroImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=80",
    longDescription: "Curated ensembles trace entire cultural narratives—perfect for weddings, gifting suites, or stage appearances.",
    highlights: [
      {
        title: "Harmonised Palettes",
        description: "Colorways are choreographed by TAC stylists to transition from daylight ceremonies to evening galas."
      },
      {
        title: "Community Impact",
        description: "Every set sustains a minimum of three artisan families across different regions."
      },
      {
        title: "Corporate Ready",
        description: "Tailored gifting bundles are available for executive recognition and cultural milestone events."
      }
    ],
    spotlight: {
      quote: "We curate sets so the wearer steps into the room with a complete story, not just an accessory.",
      name: "Tac Accessories Styling Collective",
      role: "Creative Direction · Nairobi, Kenya",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
    },
    ctas: [
      { label: "Explore Sets", href: "/collections/matching-sets", variant: "primary" },
      { label: "Corporate Gift Concierge", href: "/collections/corporate-gifts", variant: "secondary" }
    ],
    featuredProductIds: ["1", "2", "3", "4", "5", "6"]
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
    title: "Tac Accessories Gallery Experience",
    description:
      "We unveil a digital gallery that honors artisan heritage while delivering a couture-level shopping journey.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    pattern: "beadCircles",
  },
];
