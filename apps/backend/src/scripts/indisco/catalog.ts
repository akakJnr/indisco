import type { Shape } from "./art"

export type CategoryKey =
  | "groceries"
  | "beverages"
  | "dairy"
  | "fresh"
  | "meat"
  | "household"
  | "personal"
  | "baby"
  | "lab"

export const CATEGORY_STYLE: Record<
  CategoryKey,
  { name: string; color: string; tint: string }
> = {
  groceries: { name: "Groceries & Staples", color: "#F59E0B", tint: "#FEF3C7" },
  beverages: { name: "Beverages", color: "#0EA5E9", tint: "#E0F2FE" },
  dairy: { name: "Dairy & Breakfast", color: "#3B82F6", tint: "#DBEAFE" },
  fresh: { name: "Fresh Produce", color: "#16A34A", tint: "#DCFCE7" },
  meat: { name: "Meat & Fish", color: "#DC2626", tint: "#FEE2E2" },
  household: { name: "Household", color: "#8B5CF6", tint: "#EDE9FE" },
  personal: { name: "Personal Care", color: "#EC4899", tint: "#FCE7F3" },
  baby: { name: "Baby & Kids", color: "#06B6D4", tint: "#CFFAFE" },
  lab: { name: "Laboratory", color: "#0F766E", tint: "#CCFBF1" },
}

/** Laboratory sub-categories. Lab products sit in "Laboratory" and one of these. */
export const LAB_SUBCATEGORIES = [
  "Lab Consumables",
  "Glassware",
  "Reagents & Chemicals",
  "Lab Equipment",
  "Safety & PPE",
] as const

export type CollectionKey = "pantry" | "fresh" | "deals" | "lab"

export const COLLECTIONS: Record<CollectionKey, string> = {
  pantry: "Pantry Essentials",
  fresh: "Fresh & Farm",
  deals: "Home & Family",
  lab: "Lab Essentials",
}

export type CatalogProduct = {
  cat: CategoryKey
  sub?: (typeof LAB_SUBCATEGORIES)[number]
  title: string
  /** Short pack-size text, shown on the image and as the variant name. */
  size: string
  shape: Shape
  /** Price in naira for a single-variant product. */
  price: number
  desc: string
  /** Multi-variant products: [size label, price in naira]. */
  variants?: [string, number][]
  /** Optional colour override for the illustration. */
  color?: string
}

const g = (
  title: string,
  size: string,
  shape: Shape,
  price: number,
  desc: string,
  extra: Partial<CatalogProduct> = {}
): CatalogProduct => ({ cat: "groceries", title, size, shape, price, desc, ...extra })

const mk =
  (cat: CategoryKey) =>
  (
    title: string,
    size: string,
    shape: Shape,
    price: number,
    desc: string,
    extra: Partial<CatalogProduct> = {}
  ): CatalogProduct => ({ cat, title, size, shape, price, desc, ...extra })

const bev = mk("beverages")
const dai = mk("dairy")
const fre = mk("fresh")
const mea = mk("meat")
const hou = mk("household")
const per = mk("personal")
const bab = mk("baby")
const lab = (
  sub: (typeof LAB_SUBCATEGORIES)[number],
  title: string,
  size: string,
  shape: Shape,
  price: number,
  desc: string,
  extra: Partial<CatalogProduct> = {}
): CatalogProduct => ({ cat: "lab", sub, title, size, shape, price, desc, ...extra })

export const PRODUCTS: CatalogProduct[] = [
  // Groceries & Staples
  g("Long Grain Parboiled Rice", "5kg", "bag", 9500, "Clean, stone-free long grain parboiled rice. Cooks fluffy and separate for jollof, fried rice and white rice.", {
    variants: [["5kg", 9500], ["10kg", 18000], ["25kg", 43500]],
  }),
  g("Brown Beans (Oloyin)", "2kg", "bag", 4800, "Sweet, quick-cooking brown beans, hand sorted. Perfect for beans pottage, moi moi and akara."),
  g("White Garri (Ijebu)", "2kg", "bag", 2200, "Crisp, sour-fermented white garri. Ideal for eba or soaking with groundnut and milk."),
  g("Semovita", "2kg", "bag", 2800, "Smooth wheat semolina flour for soft, lump-free swallow."),
  g("Wheat Flour", "2kg", "bag", 3200, "All-purpose wheat flour for bread, chin chin, puff puff and pastries."),
  g("Granulated Sugar", "1kg", "bag", 1900, "Fine white granulated sugar for tea, baking and cooking."),
  g("Iodised Table Salt", "500g", "bag", 600, "Free-flowing iodised salt for everyday cooking."),
  g("Spaghetti Pasta", "500g", "box", 1300, "Quality durum wheat spaghetti that stays firm when cooked.", { color: "#F97316" }),
  g("Instant Noodles, Chicken Flavour", "Carton of 40", "box", 11500, "Quick, tasty chicken flavour instant noodles. A full carton of 40 packs for the household or shop.", { color: "#EF4444" }),
  g("Pure Vegetable Oil", "5L", "bottle", 13500, "Refined, cholesterol-free vegetable oil for frying and cooking.", {
    color: "#EAB308",
    variants: [["1L", 3200], ["3L", 8200], ["5L", 13500]],
  }),
  g("Red Palm Oil", "3L", "bottle", 8000, "Rich, natural red palm oil for stews, ofada sauce and traditional soups.", { color: "#EA580C" }),
  g("Tomato Paste Tin", "400g", "can", 1200, "Thick, concentrated tomato paste for rich stews and jollof.", { color: "#DC2626" }),
  g("Seasoning Cubes", "Box of 50", "box", 1500, "Savoury seasoning cubes that lift every soup, stew and rice dish.", { color: "#B45309" }),
  g("Groundnut (Peanuts), Roasted", "500g", "bag", 2600, "Crunchy roasted groundnuts. A classic Nigerian snack.", { color: "#B45309" }),

  // Beverages
  bev("Bottled Table Water", "75cl x 12", "bottle", 2400, "Purified bottled water, pack of 12 x 75cl.", { color: "#38BDF8" }),
  bev("Malt Drink", "33cl x 6", "can", 6500, "Smooth, non-alcoholic malt drink. Pack of 6 cans.", { color: "#7C2D12" }),
  bev("Cola Soft Drink", "50cl x 12", "bottle", 4200, "Chilled-ready cola soft drink, crate of 12 x 50cl.", { color: "#7F1D1D" }),
  bev("Orange Juice Drink", "1L", "bottle", 2200, "Refreshing orange juice drink made with real fruit.", { color: "#F97316" }),
  bev("Instant Cocoa Beverage", "900g", "jar", 6800, "Rich chocolate malt beverage powder for the whole family.", { color: "#92400E" }),
  bev("Green Tea Bags", "25 bags", "box", 1800, "Light, refreshing green tea. 25 individually wrapped bags.", { color: "#65A30D" }),
  bev("Instant Coffee", "100g", "jar", 3900, "Smooth instant coffee, ready in seconds.", { color: "#78350F" }),

  // Dairy & Breakfast
  dai("Powdered Milk", "900g", "can", 9500, "Full cream powdered milk. Dissolves easily for tea, cereal and cooking.", { color: "#2563EB" }),
  dai("Evaporated Milk Tin", "170g x 6", "can", 3600, "Creamy evaporated milk, pack of 6 tins.", { color: "#60A5FA" }),
  dai("Corn Flakes Cereal", "500g", "box", 4500, "Crispy golden corn flakes, a quick and wholesome breakfast.", { color: "#F59E0B" }),
  dai("Rolled Oats", "500g", "box", 3400, "Whole grain rolled oats for a hearty, filling breakfast.", { color: "#A16207" }),
  dai("Farm Eggs", "Crate of 30", "tray", 5800, "Fresh farm eggs, graded and packed in a crate of 30."),
  dai("Margarine", "500g", "jar", 2600, "Soft, spreadable margarine for bread, baking and cooking.", { color: "#FBBF24" }),
  dai("Sliced Bread", "Large", "bag", 1800, "Soft sliced white bread, baked fresh daily.", { color: "#D97706" }),

  // Fresh Produce
  fre("Ripe Plantain", "Bunch", "long", 3000, "Sweet ripe plantain bunch, perfect for dodo and boli.", { color: "#FACC15" }),
  fre("Yam Tuber", "Large", "long", 4500, "Fresh, firm white yam tuber for boiling, pounding and frying.", { color: "#A16207" }),
  fre("Fresh Tomatoes", "1kg", "round", 1800, "Ripe, juicy tomatoes for stews and salads.", { color: "#EF4444" }),
  fre("Onions", "1kg", "round", 1600, "Firm, pungent red onions.", { color: "#A855F7" }),
  fre("Fresh Pepper (Tatashe)", "500g", "round", 1500, "Fresh red tatashe peppers for stews and sauces.", { color: "#DC2626" }),
  fre("Fresh Pineapple", "Each", "pineapple", 1800, "Sweet, juicy pineapple, ready to slice and enjoy.", { color: "#F59E0B" }),
  fre("Sweet Oranges", "1kg", "round", 2000, "Juicy sweet oranges, full of vitamin C.", { color: "#F97316" }),
  fre("Irish Potatoes", "2kg", "round", 3200, "Firm Irish potatoes for chips, porridge and stews.", { color: "#CA8A04" }),

  // Meat & Fish
  mea("Frozen Chicken", "1kg", "bag", 6500, "Cleaned, whole frozen chicken pieces.", { color: "#F87171" }),
  mea("Frozen Mackerel (Titus)", "1kg", "bag", 7500, "Frozen titus fish, rich and meaty for stews and pepper soup.", { color: "#3B82F6" }),
  mea("Fresh Beef", "1kg", "bag", 9000, "Fresh cut beef for stews, suya and soups.", { color: "#B91C1C" }),
  mea("Smoked Catfish", "500g", "bag", 6000, "Smoked catfish with a deep, traditional flavour.", { color: "#78350F" }),
  mea("Turkey Wings", "1kg", "bag", 8200, "Meaty frozen turkey wings for frying, grilling and soups.", { color: "#DC2626" }),

  // Household
  hou("Laundry Detergent Powder", "2kg", "bag", 4800, "Powerful stain-fighting detergent for hand and machine wash.", { color: "#2563EB" }),
  hou("Dishwashing Liquid", "750ml", "bottle", 1700, "Cuts grease fast and is gentle on hands.", { color: "#16A34A" }),
  hou("Toilet Tissue", "Pack of 10", "box", 3500, "Soft, strong 2-ply toilet rolls.", { color: "#8B5CF6" }),
  hou("Thick Bleach", "1L", "bottle", 1400, "Disinfects and whitens. Kills 99.9% of germs.", { color: "#0EA5E9" }),
  hou("Air Freshener Spray", "300ml", "can", 2200, "Long-lasting fresh scent for every room.", { color: "#A855F7" }),
  hou("Kitchen Aluminium Foil", "10m", "box", 2400, "Heavy-duty foil for cooking, grilling and storing food.", { color: "#64748B" }),

  // Personal Care
  per("Bathing Soap", "Pack of 4", "box", 2400, "Moisturising bathing soap with a fresh, long-lasting fragrance.", { color: "#EC4899" }),
  per("Toothpaste", "120g", "box", 1300, "Fluoride toothpaste for strong teeth and fresh breath.", { color: "#0EA5E9" }),
  per("Body Lotion", "400ml", "bottle", 3800, "Rich body lotion that keeps skin soft all day.", { color: "#F472B6" }),
  per("Hair Shampoo", "400ml", "bottle", 3200, "Gentle shampoo for clean, healthy, shiny hair.", { color: "#8B5CF6" }),
  per("Roll-on Deodorant", "50ml", "bottle", 1900, "All-day protection against sweat and odour.", { color: "#14B8A6" }),
  per("Sanitary Pads", "Pack of 10", "box", 1800, "Soft, ultra-absorbent pads with leak protection.", { color: "#F43F5E" }),

  // Baby & Kids
  bab("Baby Diapers", "Size 3, 50 pcs", "box", 14500, "Soft, dry and comfortable diapers with up to 12 hours of protection.", { color: "#06B6D4" }),
  bab("Baby Wipes", "80 wipes", "box", 2600, "Gentle, alcohol-free wipes for delicate skin.", { color: "#22D3EE" }),
  bab("Infant Formula", "400g", "can", 9800, "Nutritionally complete infant milk formula, stage 1.", { color: "#0891B2" }),
  bab("Baby Cereal", "400g", "box", 4600, "Fortified baby cereal with essential vitamins and iron.", { color: "#F59E0B" }),

  // Laboratory - Consumables
  lab("Lab Consumables", "Disposable Nitrile Gloves", "Box of 100", "box", 9500, "Powder-free nitrile examination gloves. Chemical resistant and latex-free.", {
    color: "#14B8A6",
    variants: [["S, Box of 100", 9500], ["M, Box of 100", 9500], ["L, Box of 100", 9500]],
  }),
  lab("Lab Consumables", "Microscope Slides", "Box of 50", "box", 3200, "Plain glass microscope slides, 76 x 26mm, ground edges.", { color: "#0EA5E9" }),
  lab("Lab Consumables", "Cover Slips", "Box of 100", "box", 2800, "Thin glass cover slips, 22 x 22mm.", { color: "#38BDF8" }),
  lab("Lab Consumables", "Test Tubes, 15ml", "Pack of 100", "tubes", 8500, "Clear plastic test tubes with caps for sampling and storage.", { color: "#10B981" }),
  lab("Lab Consumables", "Petri Dishes, 90mm", "Pack of 20", "dish", 6500, "Sterile, disposable polystyrene petri dishes for culture work.", { color: "#F59E0B" }),
  lab("Lab Consumables", "Filter Paper", "Box of 100", "box", 4200, "Qualitative filter paper circles, 90mm, medium flow.", { color: "#94A3B8" }),
  lab("Lab Consumables", "pH Indicator Strips", "Pack of 100", "box", 3900, "pH 1 to 14 test strips for quick, reliable readings.", { color: "#F43F5E" }),

  // Laboratory - Glassware
  lab("Glassware", "Beaker, Borosilicate Glass", "250ml", "beaker", 3800, "Graduated borosilicate beaker, heat and chemical resistant.", { color: "#0EA5E9" }),
  lab("Glassware", "Conical Flask (Erlenmeyer)", "500ml", "flask", 5200, "Narrow-neck borosilicate conical flask with white graduation marks.", { color: "#8B5CF6" }),
  lab("Glassware", "Measuring Cylinder", "100ml", "beaker", 4500, "Class B graduated measuring cylinder with a hexagonal base.", { color: "#22C55E" }),
  lab("Glassware", "Glass Test Tubes", "Pack of 20", "tubes", 5600, "Heat-resistant borosilicate glass test tubes, 16 x 150mm.", { color: "#F97316" }),

  // Laboratory - Reagents & Chemicals
  lab("Reagents & Chemicals", "Distilled Water", "5L", "bottle", 3500, "Laboratory-grade distilled water for dilutions, rinsing and reagent prep.", { color: "#38BDF8" }),
  lab("Reagents & Chemicals", "Ethanol 70%", "1L", "bottle", 4800, "70% ethanol solution for disinfection and general lab use.", { color: "#6366F1" }),
  lab("Reagents & Chemicals", "Methylene Blue Stain", "100ml", "bottle", 6200, "Aqueous methylene blue solution for staining and microscopy.", { color: "#1D4ED8" }),
  lab("Reagents & Chemicals", "Hand Sanitizer, Lab Grade", "5L", "bottle", 9500, "Alcohol-based sanitizer refill for lab and clinic use.", { color: "#14B8A6" }),

  // Laboratory - Equipment
  lab("Lab Equipment", "Compound Microscope", "1000x", "microscope", 145000, "Binocular compound microscope with LED illumination and 4 objective lenses up to 1000x.", { color: "#0F766E" }),
  lab("Lab Equipment", "Digital Precision Balance", "0.01g", "scale", 38000, "Compact laboratory balance with 0.01g readability and a stainless steel pan.", { color: "#475569" }),
  lab("Lab Equipment", "Hot Plate Magnetic Stirrer", "1 unit", "plate", 125000, "Heated magnetic stirrer with digital temperature control for solution prep.", { color: "#334155" }),
  lab("Lab Equipment", "Digital Lab Thermometer", "-50 to 300 C", "tubes", 14500, "Stainless steel probe thermometer with fast readout.", { color: "#EF4444" }),

  // Laboratory - Safety & PPE
  lab("Safety & PPE", "Laboratory Coat", "White", "coat", 12500, "Durable, knee-length white lab coat with snap buttons and pockets.", {
    color: "#0F766E",
    variants: [["S", 12500], ["M", 12500], ["L", 12500], ["XL", 13500]],
  }),
  lab("Safety & PPE", "Safety Goggles", "1 pair", "goggles", 4500, "Anti-fog, impact-resistant goggles with indirect ventilation.", { color: "#0EA5E9" }),
  lab("Safety & PPE", "Disposable Face Masks", "Box of 50", "box", 3000, "3-ply disposable face masks with soft ear loops.", { color: "#38BDF8" }),
]
