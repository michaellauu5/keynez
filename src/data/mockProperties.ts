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
  // New fields for advanced filtering
  floorLevel: string;
  buildingAge: string;
  orientation: string;
  developer: string;
  nearMTR: boolean;
  // Coordinates for map
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Hong Kong district coordinates
const districtCoordinates: Record<string, { lat: number; lng: number }> = {
  "Central": { lat: 22.2819, lng: 114.1587 },
  "Mid-Levels": { lat: 22.2776, lng: 114.1477 },
  "The Peak": { lat: 22.2759, lng: 114.1455 },
  "Happy Valley": { lat: 22.2694, lng: 114.1839 },
  "Causeway Bay": { lat: 22.2801, lng: 114.1842 },
  "Wan Chai": { lat: 22.2787, lng: 114.1732 },
  "Repulse Bay": { lat: 22.2360, lng: 114.1978 },
  "Tsim Sha Tsui": { lat: 22.2988, lng: 114.1722 },
  "Mong Kok": { lat: 22.3193, lng: 114.1694 },
  "Kowloon Tong": { lat: 22.3372, lng: 114.1756 },
  "Ho Man Tin": { lat: 22.3131, lng: 114.1798 },
  "Hung Hom": { lat: 22.3058, lng: 114.1874 },
  "Kowloon City": { lat: 22.3297, lng: 114.1872 },
  "Sha Tin": { lat: 22.3870, lng: 114.1953 },
  "Tai Po": { lat: 22.4511, lng: 114.1648 },
  "Sai Kung": { lat: 22.3815, lng: 114.2711 },
  "Ma On Shan": { lat: 22.4243, lng: 114.2325 },
  "Clearwater Bay": { lat: 22.2787, lng: 114.3019 },
  "Tsuen Wan": { lat: 22.3689, lng: 114.1197 },
  "Tuen Mun": { lat: 22.3953, lng: 113.9728 },
  "Yuen Long": { lat: 22.4445, lng: 114.0222 },
  "Discovery Bay": { lat: 22.2940, lng: 114.0155 },
  "Tung Chung": { lat: 22.2886, lng: 113.9416 },
};

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

const propertyTypes = ["Apartment", "House", "Studio", "Penthouse", "Commercial", "Villa"];

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

const floorLevelOptions = ["Low (1-10)", "Mid (11-25)", "High (26-40)", "Ultra High (40+)"];
const buildingAgeOptions = ["New (<5 years)", "Recent (5-10)", "Established (10-20)", "Older (20+)"];
const orientationOptions = ["North", "South", "East", "West"];
const developerNames = ["Sun Hung Kai", "Henderson Land", "New World", "Cheung Kong", "Sino Land", "Wheelock", "Swire Properties", "Kerry Properties"];

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

  // Get base coordinates for district with slight random offset
  const baseCoords = districtCoordinates[district] || { lat: 22.3193, lng: 114.1694 };
  const coordinates = {
    lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
    lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
  };

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
    floorLevel: getRandomItem(floorLevelOptions),
    buildingAge: getRandomItem(buildingAgeOptions),
    orientation: getRandomItem(orientationOptions),
    developer: getRandomItem(developerNames),
    nearMTR: Math.random() > 0.5,
    coordinates,
  };
}

// Generate 60 properties for better pagination testing
export const mockProperties: PropertyListing[] = Array.from(
  { length: 60 },
  (_, i) => generateProperty(i)
);

export const regionOptions = Object.entries(districts).map(([region, subDistricts]) => ({
  region,
  districts: subDistricts,
}));
