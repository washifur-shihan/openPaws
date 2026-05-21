export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  gallery: string[];
  category: string;
  rating: number;
  stock: number;
  badges: string[];
  features: string[];
  basePrice?: number;
  discountPrice?: number;
  discountActive?: boolean;
  isActive?: boolean;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
};
