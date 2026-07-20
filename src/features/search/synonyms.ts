/** Bangla + English synonym map for ROOTORA catalog language */

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  honey: ["মধু", "modhu", "মধুরা", "forest honey", "flower honey"],
  মধু: ["honey", "modhu"],
  modhu: ["honey", "মধু"],
  organic: ["অর্গানিক", "organic food", "প্রাকৃতিক", "natural"],
  অর্গানিক: ["organic", "natural"],
  sweet: ["মিষ্টি", "sweets", "mishti", "dessert", "chamcham", "rosogolla"],
  sweets: ["মিষ্টি", "mishti", "sweet", "dessert"],
  মিষ্টি: ["sweets", "mishti", "sweet", "dessert"],
  mishti: ["sweets", "মিষ্টি", "sweet"],
  panjabi: ["পাঞ্জাবি", "punjabi", "fashion", "clothing", "kurta"],
  পাঞ্জাবি: ["panjabi", "punjabi", "fashion"],
  punjabi: ["panjabi", "পাঞ্জাবি"],
  fashion: ["clothing", "panjabi", "jamdani", "পাঞ্জাবি", "traditional clothing"],
  jamdani: ["জামদানি", "saree", "শাড়ি", "handloom"],
  mustard: ["সরিষা", "mustard oil", "oil"],
  সরিষা: ["mustard", "mustard oil"],
  tea: ["চা", "cha", "seven layer"],
  চা: ["tea", "cha"],
  mango: ["আম", "aam", "langra", "হimsagor"],
  আম: ["mango", "aam"],
  gift: ["গিফট", "hamper", "gift box", "box"],
  handicraft: ["handmade", "হস্তশিল্প", "artisan", "craft"],
  rice: ["চাল", "chal", "kalijira", "কালিজিরা"],
  চাল: ["rice", "chal"],
};

/** Common typo → canonical term */
export const TYPO_CORRECTIONS: Record<string, string> = {
  hony: "honey",
  honney: "honey",
  mdhu: "মধু",
  organci: "organic",
  orgnic: "organic",
  panjabi: "panjabi",
  punjabi: "panjabi",
  panjab: "panjabi",
  jamdhani: "jamdani",
  jamdani: "jamdani",
  swets: "sweets",
  sweetss: "sweets",
  misti: "mishti",
  misthi: "mishti",
  musturd: "mustard",
  mangoe: "mango",
  mangos: "mango",
};

export const POPULAR_SEARCH_TERMS = [
  "Mustard honey",
  "মধু",
  "Organic",
  "পাঞ্জাবি",
  "মিষ্টি",
  "Jamdani",
  "Gift hamper",
  "Kalojira honey",
  "Mustard oil",
  "Langra mango",
];

export const NO_RESULT_FALLBACKS = [
  "honey",
  "organic",
  "panjabi",
  "sweets",
  "gift",
];
