export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;
}

export interface Farmer {
  id: string;
  name: string;
  slug: string;
  village: string;
  district: string;
  story: string;
  image: string;
  gallery: string[];
  productCount: number;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  farmer?: Farmer;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  organic: boolean;
  tags: string[];
  unit: string;
  origin: string;
  featured?: boolean;
  bestSeller?: boolean;
  freshToday?: boolean;
  seasonal?: boolean;
  variants?: ProductVariantOption[];
}

export interface ProductVariantOption {
  id: string;
  name: string;
  value: string;
  image?: string | null;
  price?: number | null;
  salePrice?: number | null;
  stockCount: number;
  sku?: string | null;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  author: string;
  category: string;
  publishedAt: string;
  readTime: number;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  createdAt: string;
}
