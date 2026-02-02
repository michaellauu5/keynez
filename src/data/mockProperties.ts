export interface PropertyListing {
  id: string;
  name: string;
  address: string;
  district: string;
  region: string;
  price: number;
  priceType: "sale" | "rent";
  size: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  images: string[];
  features: string[];
  agent: {
    name: string;
    avatar: string;
    phone: string;
  };
  isNew: boolean;
  hasParking: boolean;
  petsAllowed: boolean;
  isFurnished: boolean;
}

const agentAvatars = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
];

const propertyImages = [
  [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
  ],
  [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
  ],
  [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
  ],
  [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
  ],
  [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
  ],
];

const agentNames = [
  "Michael Wong",
  "Sarah Chen",
  "David Lee",
  "Emily Lam",
  "James Cheung",
  "Lisa Ho",
  "Kevin Yip",
  "Michelle Ng",
];

const districts = {
  "Hong Kong Island": ["Central", "Mid-Levels", "The Peak", "Happy Valley", "Causeway Bay", "Wan Chai", "Repulse Bay"],
  "Kowloon": ["Tsim Sha Tsui", "Mong Kok", "Kowloon Tong", "Ho Man Tin", "Hung Hom", "Kowloon City"],
  "New Territories East": ["Sha Tin", "Tai Po", "Sai Kung", "Ma On Shan", "Clearwater Bay"],
  "New Territories West": ["Tsuen Wan", "Tuen Mun", "Yuen Long", "Discovery Bay", "Tung Chung"],
};

const propertyTypes = ["Apartment", "House", "Studio", "Penthouse", "Commercial"];

const featureOptions = [
  "Sea View",
  "Mountain View",
  "Pool",
  "Gym",
  "Balcony",
  "Garden",
  "High Floor",
  "Corner Unit",
  "Renovated",
  "Near MTR",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateProperty(index: number): PropertyListing {
  const regions = Object.keys(districts) as (keyof typeof districts)[];
  const region = getRandomItem(regions);
  const district = getRandomItem(districts[region]);
  const priceType = Math.random() > 0.5 ? "sale" : "rent";
  const bedrooms = Math.floor(Math.random() * 5) + 1;
  const size = Math.floor(Math.random() * 2500) + 400;
  
  const salePrice = Math.floor((size * (15000 + Math.random() * 25000)) / 100000) * 100000;
  const rentPrice = Math.floor((size * (25 + Math.random() * 45)) / 100) * 100;

  return {
    id: `property-${index}`,
    name: `${district} Residence ${index + 1}`,
    address: `${Math.floor(Math.random() * 200) + 1} ${district} Road, ${district}`,
    district,
    region,
    price: priceType === "sale" ? salePrice : rentPrice,
    priceType,
    size,
    bedrooms,
    bathrooms: Math.min(bedrooms, Math.floor(Math.random() * 3) + 1),
    propertyType: getRandomItem(propertyTypes),
    images: getRandomItem(propertyImages),
    features: getRandomItems(featureOptions, Math.floor(Math.random() * 4) + 2),
    agent: {
      name: getRandomItem(agentNames),
      avatar: getRandomItem(agentAvatars),
      phone: `+852 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
    },
    isNew: Math.random() > 0.7,
    hasParking: Math.random() > 0.4,
    petsAllowed: Math.random() > 0.6,
    isFurnished: Math.random() > 0.5,
  };
}

export const mockProperties: PropertyListing[] = Array.from(
  { length: 24 },
  (_, i) => generateProperty(i)
);

export const regionOptions = Object.entries(districts).map(([region, subDistricts]) => ({
  region,
  districts: subDistricts,
}));
