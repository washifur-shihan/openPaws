import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "cat-teaser-wand-001",
    slug: "feather-teaser-wand",
    name: "Feather Teaser Wand",
    tagline: "Interactive play for active cats",
    description: "A lightweight teaser wand with soft feathers and a flexible string that keeps cats jumping, chasing, and exercising indoors.",
    price: 220,
    compareAtPrice: 280,
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=1200&auto=format&fit=crop"
    ],
    category: "Teaser Toys",
    rating: 4.8,
    stock: 35,
    badges: ["Best Seller", "Indoor Play"],
    features: ["Flexible wand", "Soft feather lure", "Good for exercise", "Suitable for kittens and adult cats"]
  },
  {
    id: "cat-ball-bell-002",
    slug: "rolling-bell-ball-set",
    name: "Rolling Bell Ball Set",
    tagline: "Small balls, big curiosity",
    description: "Colorful rolling balls with a gentle bell sound. Great for solo play and for cats who love chasing moving objects.",
    price: 180,
    compareAtPrice: 240,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1200&auto=format&fit=crop"
    ],
    category: "Ball Toys",
    rating: 4.6,
    stock: 50,
    badges: ["Budget Pick"],
    features: ["Pack of 3", "Gentle bell sound", "Lightweight", "Easy to clean"]
  },
  {
    id: "cat-scratch-mouse-003",
    slug: "catnip-mouse-toy",
    name: "Catnip Mouse Toy",
    tagline: "Soft bite-sized fun",
    description: "A plush mouse toy with catnip scent that encourages pouncing, biting, and relaxed playtime.",
    price: 150,
    image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?q=80&w=1200&auto=format&fit=crop"
    ],
    category: "Catnip Toys",
    rating: 4.7,
    stock: 44,
    badges: ["Catnip"],
    features: ["Soft plush body", "Catnip scent", "Good for bite play", "Easy to carry"]
  },
  {
    id: "cat-tunnel-004",
    slug: "foldable-cat-tunnel",
    name: "Foldable Cat Tunnel",
    tagline: "Hide, run, and surprise",
    description: "A foldable tunnel for cats who love hiding, running, and ambush games. Perfect for apartment play spaces.",
    price: 650,
    compareAtPrice: 780,
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=1200&auto=format&fit=crop"
    ],
    category: "Activity Toys",
    rating: 4.9,
    stock: 15,
    badges: ["Premium", "Foldable"],
    features: ["Foldable design", "Crinkle texture", "Great for multiple cats", "Easy storage"]
  },
  {
    id: "cat-fish-005",
    slug: "floppy-fish-kicker",
    name: "Floppy Fish Kicker",
    tagline: "Kicker toy for playful paws",
    description: "A soft fish-shaped kicker toy made for cats who enjoy bunny-kicking, wrestling, and carrying toys around.",
    price: 320,
    compareAtPrice: 390,
    image: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1200&auto=format&fit=crop"
    ],
    category: "Kicker Toys",
    rating: 4.5,
    stock: 25,
    badges: ["Soft Toy"],
    features: ["Long kicker shape", "Soft fabric", "Great for wrestling", "Lightweight"]
  },
  {
    id: "cat-laser-006",
    slug: "mini-laser-pointer",
    name: "Mini Laser Pointer",
    tagline: "Quick exercise, endless chase",
    description: "A compact laser pointer for short supervised play sessions. Helps energetic cats burn off extra energy.",
    price: 280,
    image: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=1200&auto=format&fit=crop"
    ],
    category: "Interactive Toys",
    rating: 4.4,
    stock: 30,
    badges: ["Interactive"],
    features: ["Compact size", "Supervised play", "Good for active cats", "Easy to carry"]
  }
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
