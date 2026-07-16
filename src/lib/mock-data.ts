import type {
  BlogPost,
  Category,
  Farmer,
  Product,
  Recipe,
  Testimonial,
} from "@/types";

export const categories: Category[] = [
  {
    id: "1",
    name: "Organic Foods",
    slug: "organic-foods",
    description: "Certified organic staples from Bangladeshi farms",
    image: "/images/categories/organic-foods.png",
    productCount: 48,
    featured: true,
  },
  {
    id: "2",
    name: "Fresh Fruits",
    slug: "fresh-fruits",
    description: "Seasonal fruits picked at peak ripeness",
    image: "/images/categories/fresh-fruits.png",
    productCount: 36,
    featured: true,
  },
  {
    id: "3",
    name: "Vegetables",
    slug: "vegetables",
    description: "Farm-fresh vegetables delivered daily",
    image: "/images/categories/vegetables.png",
    productCount: 52,
    featured: true,
  },
  {
    id: "4",
    name: "Rice & Grains",
    slug: "rice-grains",
    description: "Premium aromatic rice and whole grains",
    image: "/images/categories/rice-grains.png",
    productCount: 24,
    featured: true,
  },
  {
    id: "5",
    name: "Honey & Tea",
    slug: "honey-tea",
    description: "Pure honey and artisan teas",
    image: "/images/categories/honey-tea.png",
    productCount: 18,
    featured: true,
  },
  {
    id: "6",
    name: "Spices",
    slug: "spices",
    description: "Aromatic spices ground fresh",
    image: "/images/categories/spices.png",
    productCount: 32,
    featured: true,
  },
  {
    id: "7",
    name: "Traditional Clothing",
    slug: "traditional-clothing",
    description: "Handloom and artisan textiles",
    image: "/images/categories/traditional-clothing.png",
    productCount: 28,
    featured: true,
  },
  {
    id: "8",
    name: "Gift Boxes",
    slug: "gift-boxes",
    description: "Curated hampers for every occasion",
    image: "/images/categories/gift-boxes.png",
    productCount: 16,
    featured: true,
  },
];

export const farmers: Farmer[] = [
  {
    id: "1",
    name: "Abdul Karim",
    slug: "abdul-karim",
    village: "Sreemangal",
    district: "Sylhet",
    story:
      "Third-generation tea and honey farmer preserving traditional methods while embracing organic certification.",
    image: "/images/farmers/abdul-karim.png",
    gallery: [
      "/images/products/honey.png",
      "/images/products/tea.png",
    ],
    productCount: 12,
    verified: true,
  },
  {
    id: "2",
    name: "Fatima Begum",
    slug: "fatima-begum",
    village: "Rajshahi",
    district: "Rajshahi",
    story:
      "Leading organic mango cultivation in northern Bangladesh with over 200 acres of certified orchards.",
    image: "/images/farmers/fatima-begum.png",
    gallery: [
      "/images/products/mango.png",
    ],
    productCount: 8,
    verified: true,
  },
  {
    id: "3",
    name: "Rashid Ahmed",
    slug: "rashid-ahmed",
    village: "Comilla",
    district: "Comilla",
    story:
      "Heritage rice varieties preserved through community seed banks and sustainable farming practices.",
    image: "/images/farmers/rashid-ahmed.png",
    gallery: [
      "/images/products/rice.png",
    ],
    productCount: 15,
    verified: true,
  },
];

function createProduct(
  partial: Omit<Product, "category" | "farmer"> & {
    categorySlug: string;
    farmerSlug?: string;
  }
): Product {
  const category = categories.find((c) => c.slug === partial.categorySlug)!;
  const farmer = partial.farmerSlug
    ? farmers.find((f) => f.slug === partial.farmerSlug)
    : undefined;
  const { categorySlug: _, farmerSlug: __, ...rest } = partial;
  return { ...rest, category, farmer };
}

export const products: Product[] = [
  createProduct({
    id: "1",
    name: "Sundarbans Wild Honey",
    slug: "sundarbans-wild-honey",
    description:
      "Pure wild honey harvested from the mangrove forests of Sundarbans. Rich, complex flavor with natural antibacterial properties.",
    shortDescription: "Pure wild honey from Sundarbans mangroves",
    price: 850,
    originalPrice: 950,
    images: [
      "/images/products/honey.png",
      "/images/products/honey.png",
    ],
    categorySlug: "honey-tea",
    farmerSlug: "abdul-karim",
    rating: 4.9,
    reviewCount: 128,
    inStock: true,
    stockCount: 45,
    organic: true,
    tags: ["organic", "wild", "premium"],
    unit: "500g jar",
    origin: "Khulna, Bangladesh",
    featured: true,
    bestSeller: true,
  }),
  createProduct({
    id: "2",
    name: "Premium Kalijira Rice",
    slug: "premium-kalijira-rice",
    description:
      "Aromatic Kalijira rice — the prince of rice — grown in the fertile plains of Dinajpur using traditional methods.",
    shortDescription: "Aromatic prince of rice from Dinajpur",
    price: 320,
    images: ["/images/products/rice.png"],
    categorySlug: "rice-grains",
    farmerSlug: "rashid-ahmed",
    rating: 4.8,
    reviewCount: 256,
    inStock: true,
    stockCount: 120,
    organic: true,
    tags: ["organic", "aromatic", "heritage"],
    unit: "5kg bag",
    origin: "Dinajpur, Bangladesh",
    bestSeller: true,
    featured: true,
  }),
  createProduct({
    id: "3",
    name: "Langra Mango — Premium",
    slug: "langra-mango-premium",
    description:
      "Hand-picked Langra mangoes at perfect ripeness. Sweet, fiberless flesh with the authentic taste of Bangladeshi summer.",
    shortDescription: "Hand-picked premium Langra mangoes",
    price: 450,
    originalPrice: 550,
    images: ["/images/products/mango.png"],
    categorySlug: "fresh-fruits",
    farmerSlug: "fatima-begum",
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    stockCount: 30,
    organic: true,
    tags: ["seasonal", "organic", "fresh"],
    unit: "1kg (4-5 pcs)",
    origin: "Rajshahi, Bangladesh",
    freshToday: true,
    seasonal: true,
    featured: true,
  }),
  createProduct({
    id: "4",
    name: "Sylhet Seven Layer Tea",
    slug: "sylhet-seven-layer-tea",
    description:
      "Artisan seven-layer tea blend from Sreemangal tea gardens. A visual and sensory masterpiece of Bangladeshi tea culture.",
    shortDescription: "Artisan seven-layer tea from Sreemangal",
    price: 680,
    images: ["/images/products/tea.png"],
    categorySlug: "honey-tea",
    farmerSlug: "abdul-karim",
    rating: 4.7,
    reviewCount: 64,
    inStock: true,
    stockCount: 55,
    organic: false,
    tags: ["artisan", "premium", "gift"],
    unit: "100g tin",
    origin: "Sylhet, Bangladesh",
    featured: true,
  }),
  createProduct({
    id: "5",
    name: "Organic Mustard Oil",
    slug: "organic-mustard-oil",
    description:
      "Cold-pressed organic mustard oil with the authentic pungent aroma essential to Bengali cuisine.",
    shortDescription: "Cold-pressed organic mustard oil",
    price: 280,
    images: ["/images/products/mustard-oil.png"],
    categorySlug: "organic-foods",
    rating: 4.6,
    reviewCount: 192,
    inStock: true,
    stockCount: 80,
    organic: true,
    tags: ["organic", "cold-pressed", "staple"],
    unit: "1L bottle",
    origin: "Comilla, Bangladesh",
    bestSeller: true,
  }),
  createProduct({
    id: "6",
    name: "Handloom Jamdani Saree",
    slug: "handloom-jamdani-saree",
    description:
      "Exquisite handwoven Jamdani saree crafted by master weavers in Narayanganj. UNESCO intangible cultural heritage.",
    shortDescription: "Handwoven Jamdani saree by master weavers",
    price: 12500,
    originalPrice: 15000,
    images: ["/images/products/saree.png"],
    categorySlug: "traditional-clothing",
    rating: 5.0,
    reviewCount: 24,
    inStock: true,
    stockCount: 5,
    organic: false,
    tags: ["handmade", "heritage", "luxury"],
    unit: "1 piece",
    origin: "Narayanganj, Bangladesh",
    featured: true,
  }),
  createProduct({
    id: "7",
    name: "Fresh Organic Spinach",
    slug: "fresh-organic-spinach",
    description:
      "Crisp, nutrient-rich organic spinach harvested this morning from pesticide-free farms near Dhaka.",
    shortDescription: "Farm-fresh organic spinach",
    price: 45,
    images: ["/images/products/spinach.png"],
    categorySlug: "vegetables",
    rating: 4.5,
    reviewCount: 78,
    inStock: true,
    stockCount: 200,
    organic: true,
    tags: ["fresh", "organic", "daily"],
    unit: "500g bunch",
    origin: "Dhaka, Bangladesh",
    freshToday: true,
  }),
  createProduct({
    id: "8",
    name: "Premium Spice Collection",
    slug: "premium-spice-collection",
    description:
      "Curated set of 12 essential Bengali spices — turmeric, cumin, coriander, cardamom, and more — stone-ground fresh.",
    shortDescription: "12 essential Bengali spices, stone-ground",
    price: 1200,
    originalPrice: 1400,
    images: ["/images/products/spices.png"],
    categorySlug: "spices",
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    stockCount: 40,
    organic: true,
    tags: ["organic", "gift", "collection"],
    unit: "12 jars set",
    origin: "Various, Bangladesh",
    bestSeller: true,
    featured: true,
  }),
  createProduct({
    id: "9",
    name: "ROOTORA Premium Gift Hamper",
    slug: "rootora-gift-hamper",
    description:
      "A beautifully curated gift hamper featuring Sundarbans wild honey, premium Kalijira rice, artisan spice collection, and Sylhet seven-layer tea — the perfect introduction to ROOTORA.",
    shortDescription: "Curated premium hamper for every occasion",
    price: 3500,
    images: ["/images/gift-box.png"],
    categorySlug: "gift-boxes",
    rating: 4.9,
    reviewCount: 42,
    inStock: true,
    stockCount: 25,
    organic: true,
    tags: ["gift", "organic", "collection"],
    unit: "1 hamper",
    origin: "Various, Bangladesh",
    featured: true,
  }),
];

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Honey-Glazed Langra Mango Salad",
    slug: "honey-glazed-langra-mango-salad",
    description:
      "A refreshing summer salad combining sweet Langra mangoes with Sundarbans honey and fresh mint.",
    image: "/images/recipes/mango-salad.png",
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    difficulty: "Easy",
    tags: ["summer", "healthy", "quick"],
  },
  {
    id: "2",
    title: "Kalijira Rice Khichuri",
    slug: "kalijira-rice-khichuri",
    description:
      "Comfort food at its finest — aromatic Kalijira rice cooked with moong dal and Bengali spices.",
    image: "/images/recipes/khichuri.png",
    prepTime: 20,
    cookTime: 40,
    servings: 6,
    difficulty: "Medium",
    tags: ["comfort", "traditional", "monsoon"],
  },
  {
    id: "3",
    title: "Seven Layer Tea Latte",
    slug: "seven-layer-tea-latte",
    description:
      "A modern twist on Sylhet's famous seven-layer tea, perfect for afternoon gatherings.",
    image: "/images/recipes/tea-latte.png",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "Medium",
    tags: ["beverage", "artisan", "tea"],
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Journey from Farm to Your Table",
    slug: "farm-to-table-journey",
    excerpt:
      "Discover how ROOTORA connects you directly with Bangladeshi farmers, ensuring freshness and fair prices.",
    image: "/images/blog/farm-to-table.png",
    author: "ROOTORA Editorial",
    category: "Sustainability",
    publishedAt: "2026-07-01",
    readTime: 5,
  },
  {
    id: "2",
    title: "Why Organic Matters in Bangladesh",
    slug: "why-organic-matters",
    excerpt:
      "Understanding the health and environmental benefits of choosing certified organic products.",
    image: "/images/blog/organic.png",
    author: "Dr. Samira Khan",
    category: "Health",
    publishedAt: "2026-06-28",
    readTime: 7,
  },
  {
    id: "3",
    title: "Preserving Bangladeshi Food Heritage",
    slug: "preserving-food-heritage",
    excerpt:
      "How traditional farming methods and heirloom varieties are being protected for future generations.",
    image: "/images/blog/heritage.png",
    author: "ROOTORA Editorial",
    category: "Culture",
    publishedAt: "2026-06-20",
    readTime: 6,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Nusrat Jahan",
    location: "Dhaka",
    avatar: "/images/avatars/nusrat.png",
    rating: 5,
    comment:
      "The Sundarbans honey is absolutely divine. You can taste the difference — pure, unadulterated, and delivered with such care.",
  },
  {
    id: "2",
    name: "Imran Hossain",
    location: "Chittagong",
    avatar: "/images/avatars/imran.png",
    rating: 5,
    comment:
      "Finally, a platform that celebrates Bangladeshi produce with the premium experience it deserves. The Langra mangoes were perfect.",
  },
  {
    id: "3",
    name: "Sarah Ahmed",
    location: "Sylhet",
    avatar: "/images/avatars/sarah.png",
    rating: 5,
    comment:
      "ROOTORA feels like Whole Foods met Bangladeshi heritage. Beautiful packaging, transparent sourcing, and exceptional quality.",
  },
];

export const instagramPosts = [
  "/images/instagram-01-vegetables.png",
  "/images/instagram-02-honey.png",
  "/images/instagram-03-mangoes.png",
  "/images/instagram-04-rice.png",
  "/images/instagram-05-textile.png",
  "/images/instagram-06-spices.png",
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getBestSellers(): Product[] {
  return products.filter((p) => p.bestSeller);
}

export function getFreshToday(): Product[] {
  return products.filter((p) => p.freshToday);
}

export function getSeasonalProducts(): Product[] {
  return products.filter((p) => p.seasonal);
}

export function getOrganicProducts(): Product[] {
  return products.filter((p) => p.organic);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category.slug === product.category.slug && p.id !== product.id)
    .slice(0, limit);
}


export function getFarmerBySlug(slug: string): Farmer | undefined {
  return farmers.find((f) => f.slug === slug);
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((b) => b.slug === slug);
}

export function getProductsByFarmer(farmerSlug: string): Product[] {
  return products.filter((p) => p.farmer?.slug === farmerSlug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
