export type SizeChartRow = {
  size: string;
  chest: string;
  length: string;
  sleeve?: string;
};

export type SizeChart = {
  title: string;
  note: string;
  columns: Array<"chest" | "length" | "sleeve">;
  rows: SizeChartRow[];
};

/** Men's Punjabi / kurtas — body/garment guide in inches. */
const PUNJABI_CHART: SizeChart = {
  title: "Size guide",
  note: "Measurements in inches. Chest is body circumference; length is garment length.",
  columns: ["chest", "length", "sleeve"],
  rows: [
    { size: "S", chest: "38", length: "40", sleeve: "23" },
    { size: "M", chest: "40", length: "42", sleeve: "24" },
    { size: "L", chest: "42", length: "44", sleeve: "25" },
    { size: "XL", chest: "44", length: "46", sleeve: "26" },
    { size: "XXL", chest: "46", length: "48", sleeve: "27" },
  ],
};

/** Men's cotton t-shirts — inches. */
const TSHIRT_CHART: SizeChart = {
  title: "Size guide",
  note: "Measurements in inches. Pick the size closest to your chest.",
  columns: ["chest", "length"],
  rows: [
    { size: "S", chest: "36–38", length: "27" },
    { size: "M", chest: "38–40", length: "28" },
    { size: "L", chest: "40–42", length: "29" },
    { size: "XL", chest: "42–44", length: "30" },
    { size: "XXL", chest: "44–46", length: "31" },
  ],
};

const GENERIC_CHART: SizeChart = {
  title: "Size guide",
  note: "Measurements in inches.",
  columns: ["chest", "length"],
  rows: [
    { size: "S", chest: "36–38", length: "27–28" },
    { size: "M", chest: "38–40", length: "28–29" },
    { size: "L", chest: "40–42", length: "29–30" },
    { size: "XL", chest: "42–44", length: "30–31" },
    { size: "XXL", chest: "44–46", length: "31–32" },
  ],
};

const COLUMN_LABELS: Record<(typeof GENERIC_CHART.columns)[number], string> = {
  chest: "Chest",
  length: "Length",
  sleeve: "Sleeve",
};

export function getSizeChartForCategory(categorySlug: string): SizeChart {
  const slug = categorySlug.toLowerCase();
  if (slug.includes("t-shirt") || slug.includes("tshirt")) {
    return TSHIRT_CHART;
  }
  if (slug.includes("punjabi") || slug.includes("traditional")) {
    return PUNJABI_CHART;
  }
  return GENERIC_CHART;
}

export function filterChartByAvailableSizes(
  chart: SizeChart,
  availableSizes: string[]
): SizeChart {
  if (availableSizes.length === 0) return chart;
  const normalized = new Set(availableSizes.map((s) => s.toUpperCase()));
  const rows = chart.rows.filter((row) => normalized.has(row.size.toUpperCase()));
  return rows.length > 0 ? { ...chart, rows } : chart;
}

export function columnLabel(key: (typeof GENERIC_CHART.columns)[number]) {
  return COLUMN_LABELS[key];
}
