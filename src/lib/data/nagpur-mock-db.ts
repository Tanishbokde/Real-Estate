import {
  Property,
  PropertyLocation,
  AgentBroker,
  Customer,
  Inquiry,
  VisitRequest,
  PropertyView,
  FollowUp,
  AppNotification,
  AuditLog,
  InquiryStatus,
  VisitStatus,
  FollowUpStatus
} from "../types/database";
import { supabaseService, toUuid } from "../supabase/service";
import { isSupabaseConfigured } from "../supabase/client";
import { isMatchingId, fromUuid } from "../utils";

export const INITIAL_LOCALITIES: PropertyLocation[] = [
  { id: "loc-1", name: "Dharampeth", zone: "West Nagpur", pincode: "440010", popular_landmarks: ["Futala Lake", "Gokulpeth Market", "Traffic Park", "Coffee House Square"], latitude: 21.1432, longitude: 79.0620, is_active: true },
  { id: "loc-2", name: "Civil Lines", zone: "Central Nagpur", pincode: "440001", popular_landmarks: ["High Court Nagpur Bench", "Vidhan Bhavan", "Ladies Club", "Nagpur Club"], latitude: 21.1578, longitude: 79.0725, is_active: true },
  { id: "loc-3", name: "Ramdaspeth", zone: "Central Nagpur", pincode: "440010", popular_landmarks: ["Central Mall", "Hotel Centre Point", "Kachipura Garden", "Lendra Park"], latitude: 21.1352, longitude: 79.0734, is_active: true },
  { id: "loc-4", name: "Sadar", zone: "North Nagpur", pincode: "440001", popular_landmarks: ["Mount Road", "Sadar Bazaar", "SFS Cathedral", "Residency Road"], latitude: 21.1625, longitude: 79.0812, is_active: true },
  { id: "loc-5", name: "Pratap Nagar", zone: "South-West Nagpur", pincode: "440022", popular_landmarks: ["Pratap Nagar Square", "Orange City Hospital", "Pioneer Society", "VNIT Campus"], latitude: 21.1198, longitude: 79.0564, is_active: true },
  { id: "loc-6", name: "Manish Nagar", zone: "South Nagpur", pincode: "440015", popular_landmarks: ["Manish Nagar Railway Underbridge", "Beltarodi Road", "Purti Supermarket"], latitude: 21.0967, longitude: 79.0782, is_active: true },
  { id: "loc-7", name: "Trimurti Nagar", zone: "South-West Nagpur", pincode: "440022", popular_landmarks: ["Trimurti Square", "NIT Garden", "Ring Road Junction"], latitude: 21.1145, longitude: 79.0498, is_active: true },
  { id: "loc-8", name: "Wardha Road", zone: "South Nagpur", pincode: "440015", popular_landmarks: ["Dr. Babasaheb Ambedkar Airport", "Aqua Line Metro", "Chhatrapati Square", "Hotel Pride"], latitude: 21.0921, longitude: 79.0684, is_active: true },
  { id: "loc-9", name: "Somalwada", zone: "South Nagpur", pincode: "440025", popular_landmarks: ["Ujjwal Nagar Metro", "Wardha Road Junction", "Airport Metro"], latitude: 21.0954, longitude: 79.0645, is_active: true },
  { id: "loc-10", name: "Besa", zone: "South Nagpur", pincode: "440037", popular_landmarks: ["Besa Square", "Ghogli Road", "Podar International School"], latitude: 21.0845, longitude: 79.0882, is_active: true },
  { id: "loc-11", name: "Dhantoli", zone: "Central Nagpur", pincode: "440012", popular_landmarks: ["Yashwant Stadium", "Dhantoli Garden", "Congress Nagar Metro"], latitude: 21.1378, longitude: 79.0845, is_active: true },
  { id: "loc-12", name: "Sitabuldi", zone: "Central Nagpur", pincode: "440012", popular_landmarks: ["Sitabuldi Metro Interchange", "Zero Mile Stone", "Eternity Mall", "Maharajbagh Zoo"], latitude: 21.1462, longitude: 79.0835, is_active: true },
  { id: "loc-13", name: "Bajaj Nagar", zone: "West Nagpur", pincode: "440010", popular_landmarks: ["Laxmi Nagar Square", "Abhyankar Nagar Petrol Pump", "VNIT Gate"], latitude: 21.1278, longitude: 79.0612, is_active: true },
  { id: "loc-14", name: "Khamla", zone: "South-West Nagpur", pincode: "440025", popular_landmarks: ["Khamla Market", "Deo Nagar Square", "Orange City Street"], latitude: 21.1152, longitude: 79.0658, is_active: true },
  { id: "loc-15", name: "Hingna Road", zone: "West Nagpur", pincode: "440016", popular_landmarks: ["Lata Mangeshkar Hospital", "CRPF Gate", "Subhash Nagar Metro"], latitude: 21.1098, longitude: 79.0154, is_active: true },
  { id: "loc-16", name: "Mahal", zone: "East Nagpur", pincode: "440032", popular_landmarks: ["Gandhi Gate", "Kalyaneshwar Mandir", "Tilak Statue Square"], latitude: 21.1448, longitude: 79.1065, is_active: true },
  { id: "loc-17", name: "Nandanvan", zone: "East Nagpur", pincode: "440009", popular_landmarks: ["KDK College of Engineering", "Gurudev Nagar", "Sakkardara Lake"], latitude: 21.1298, longitude: 79.1245, is_active: true },
  { id: "loc-18", name: "Wathoda", zone: "East Nagpur", pincode: "440035", popular_landmarks: ["Symbiosis University Nagpur", "Tarodi Ring Road", "Dighori Square"], latitude: 21.1215, longitude: 79.1520, is_active: true },
  { id: "loc-19", name: "Zingabai Takli", zone: "North Nagpur", pincode: "440030", popular_landmarks: ["Godhani Road", "Mankapur Sports Complex", "Koradi Road"], latitude: 21.1945, longitude: 79.0720, is_active: true },
  { id: "loc-20", name: "Ayodhya Nagar", zone: "South-East Nagpur", pincode: "440024", popular_landmarks: ["Shatabdi Square", "Manewada Ring Road", "Ayodhya Nagar Ground"], latitude: 21.1075, longitude: 79.1032, is_active: true },
  { id: "loc-21", name: "Gandhibagh", zone: "Central-East Nagpur", pincode: "440002", popular_landmarks: ["Gandhibagh Garden", "Cloth Market Itwari", "Agrasen Square"], latitude: 21.1512, longitude: 79.1012, is_active: true },
];

export const INITIAL_AGENTS: AgentBroker[] = [
  {
    id: "agent-1",
    user_id: "usr-agent-1",
    name: "Amit Sharma",
    phone: "+91 98230 45612",
    email: "amit.sharma@nagpurrealty.in",
    agency: "Dharampeth Realty Advisors",
    rating: 4.9,
    area_specialization: "Dharampeth & West Nagpur Luxury Flats",
    license_no: "MAHARERA-A50500018921",
    bio: "14+ years in premium residential properties in Dharampeth, Ramdaspeth, and Civil Lines. Top-rated broker for luxury homes in Nagpur.",
    total_deals: 84,
    is_active: true,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString()
  },
  {
    id: "agent-2",
    user_id: "usr-agent-2",
    name: "Sneha Kulkarni",
    phone: "+91 97644 12890",
    email: "sneha.k@orangecityestates.com",
    agency: "Orange City Estates",
    rating: 4.8,
    area_specialization: "Wardha Road, Besa & Manish Nagar Growth Corridor",
    license_no: "MAHARERA-A50500021450",
    bio: "Specialized in high-ROI apartments, builder floors and gated communities near MIHAN SEZ & Dr. Babasaheb Ambedkar Airport.",
    total_deals: 62,
    is_active: true,
    created_at: new Date(Date.now() - 280 * 86400000).toISOString()
  },
  {
    id: "agent-3",
    user_id: "usr-agent-3",
    name: "Vikram Deshmukh",
    phone: "+91 98901 77334",
    email: "vikram.deshmukh@vidarbhahomes.in",
    agency: "Vidarbha Homes & Infra",
    rating: 4.7,
    area_specialization: "Commercial Spaces & Plots across Nagpur",
    license_no: "MAHARERA-A50500015502",
    bio: "Commercial retail & office advisor in Sadar, Sitabuldi, and industrial land along Hingna & Wardha road.",
    total_deals: 53,
    is_active: true,
    created_at: new Date(Date.now() - 210 * 86400000).toISOString()
  },
  {
    id: "agent-4",
    user_id: "usr-agent-4",
    name: "Nilesh Tiwari",
    phone: "+91 98222 39011",
    email: "nilesh.tiwari@nagpurrealty.in",
    agency: "Premier Nagpur Brokers",
    rating: 4.8,
    area_specialization: "Affordable 2/3 BHK & Rental Homes in South Nagpur",
    license_no: "MAHARERA-A50500029881",
    bio: "Focused on ready-to-move family apartments and high quality rental leases in Pratap Nagar, Khamla & Trimurti Nagar.",
    total_deals: 41,
    is_active: true,
    created_at: new Date(Date.now() - 150 * 86400000).toISOString()
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    user_id: "usr-cust-1",
    name: "Priya Deshmukh",
    phone: "+91 98231 99012",
    email: "priya.deshmukh@gmail.com",
    preferences: {
      budget_min: 6000000,
      budget_max: 12500000,
      preferred_localities: ["Dharampeth", "Civil Lines", "Ramdaspeth"],
      bhk: [3, 4],
      listing_type: "buy"
    },
    status: "active",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: "cust-2",
    user_id: "usr-cust-2",
    name: "Rahul Joshi",
    phone: "+91 94221 88345",
    email: "rahul.joshi@tcs.com",
    preferences: {
      budget_min: 3500000,
      budget_max: 7000000,
      preferred_localities: ["Manish Nagar", "Besa", "Wardha Road"],
      bhk: [2, 3],
      listing_type: "buy"
    },
    status: "active",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: "cust-3",
    user_id: "usr-cust-3",
    name: "Dr. Sunita Patil",
    phone: "+91 98902 44119",
    email: "sunita.patil.dr@yahoo.com",
    preferences: {
      budget_min: 15000000,
      budget_max: 35000000,
      preferred_localities: ["Civil Lines", "Ramdaspeth"],
      bhk: [4],
      listing_type: "buy"
    },
    status: "active",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: "cust-4",
    user_id: "usr-cust-4",
    name: "Anand Verma",
    phone: "+91 97654 32109",
    email: "anand.verma@gmail.com",
    preferences: {
      budget_min: 15000,
      budget_max: 30000,
      preferred_localities: ["Pratap Nagar", "Khamla", "Trimurti Nagar"],
      listing_type: "rent"
    },
    status: "active",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "Luxury 3 BHK Skyline Apartment in Dharampeth",
    description: "Exclusive east-facing 3 BHK luxury flat with Italian marble flooring, modular kitchen, 2 balconies overlooking Futala Lake, and 2 designated covered car parks. Just 300m from Gokulpeth Market and 800m from Dharampeth Metro Station.",
    type: "residential",
    category: "apartment",
    listing_type: "buy",
    bhk: 3,
    price: 11500000,
    price_range: "₹1.0Cr - ₹1.25Cr",
    area_sqft: 1850,
    status: "available",
    locality: "Dharampeth",
    address: "4th Floor, Shiv Regency, West High Court Road, Dharampeth, Nagpur - 440010",
    latitude: 21.1441,
    longitude: 79.0632,
    agent_id: "agent-1",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Futala Lake View", "Nagpur Metro 800m", "100% Vastu Compliant", "Italian Marble Flooring", "2 Covered Car Parks", "24/7 Security & CCTV", "Power Backup"],
    is_featured: true,
    views_count: 342,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-2",
    title: "Smart 2 BHK Flat near Airport Metro Station",
    description: "Well-planned 2 BHK apartment in a premium gated complex on Wardha Road. Ideal for IT professionals working at MIHAN SEZ, Infosys, and TCS. 5 minutes to Dr. Babasaheb Ambedkar International Airport.",
    type: "residential",
    category: "apartment",
    listing_type: "buy",
    bhk: 2,
    price: 4800000,
    price_range: "₹45L - ₹55L",
    area_sqft: 1050,
    status: "available",
    locality: "Wardha Road",
    address: "Tower B, Orange Heights, Near Chhatrapati Square, Wardha Road, Nagpur - 440015",
    latitude: 21.0934,
    longitude: 79.0691,
    agent_id: "agent-2",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["5 Min to Airport", "Near Aqua Line Metro", "Clubhouse & Gym", "Children Play Area", "Rooftop Solar Lights"],
    is_featured: true,
    views_count: 289,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-3",
    title: "Stately 4 BHK Independent Villa in Civil Lines",
    description: "Opulent colonial-style modern bungalow in the serene VIP greenery of Civil Lines. Features private landscaped garden, home theatre room, servant quarters, and solar water heating. Close to High Court.",
    type: "residential",
    category: "villa",
    listing_type: "buy",
    bhk: 4,
    price: 32500000,
    price_range: "₹3.0Cr - ₹3.5Cr",
    area_sqft: 3600,
    status: "available",
    locality: "Civil Lines",
    address: "Bungalow No. 12, Palm Avenue, Near Ladies Club, Civil Lines, Nagpur - 440001",
    latitude: 21.1585,
    longitude: 79.0718,
    agent_id: "agent-1",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Private Lawn", "Servant Room", "Gated VIP Enclave", "Teak Wood Finishing", "Solar Powered Grid", "Rainwater Harvesting"],
    is_featured: true,
    views_count: 512,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-4",
    title: "Modern 3 BHK Flat in Manish Nagar Beltarodi",
    description: "Spacious ready-to-move 3 BHK flat with expansive balconies, modern interiors, and high-speed OTIS elevators. Walking distance to schools, markets, and newly inaugurated railway flyover.",
    type: "residential",
    category: "apartment",
    listing_type: "buy",
    bhk: 3,
    price: 6800000,
    price_range: "₹65L - ₹75L",
    area_sqft: 1420,
    status: "available",
    locality: "Manish Nagar",
    address: "Flat 302, Sai Vihar Arcade, Beltarodi Main Road, Manish Nagar, Nagpur - 440015",
    latitude: 21.0975,
    longitude: 79.0791,
    agent_id: "agent-2",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Modular Kitchen Included", "Near D-Mart Besa", "Covered Car Park", "Intercom System", "Borewell & Corporation Water"],
    is_featured: false,
    views_count: 198,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-5",
    title: "Prime Commercial Showroom on Residency Road Sadar",
    description: "High-footfall ground floor commercial retail showroom space in the heart of Sadar retail market. Frontage of 35 feet, heavy foot-traffic, dedicated customer parking, and 3-phase commercial electrical line.",
    type: "commercial",
    category: "apartment",
    listing_type: "buy",
    bhk: null,
    price: 24000000,
    price_range: "₹2.2Cr - ₹2.5Cr",
    area_sqft: 2100,
    status: "available",
    locality: "Sadar",
    address: "Ground Floor, Sadar Trade Hub, Residency Road, Sadar, Nagpur - 440001",
    latitude: 21.1631,
    longitude: 79.0825,
    agent_id: "agent-3",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["35ft Road Frontage", "High Footfall Zone", "Customer Parking", "Central AC Provisions", "Fire Safety Compliant"],
    is_featured: true,
    views_count: 430,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-6",
    title: "Affordable 2 BHK Furnished Flat for Rent in Pratap Nagar",
    description: "Tastefully furnished 2 BHK apartment with sofa, beds, RO water purifier, 42-inch TV, refrigerator, and 1.5-ton split AC. Convenient walking distance to Orange City Hospital and VNIT college gate.",
    type: "residential",
    category: "apartment",
    listing_type: "rent",
    bhk: 2,
    price: 22000,
    price_range: "₹20K - ₹25K/mo",
    area_sqft: 980,
    status: "available",
    locality: "Pratap Nagar",
    address: "Flat 201, Shanti Niketan, Near Ring Road Square, Pratap Nagar, Nagpur - 440022",
    latitude: 21.1205,
    longitude: 79.0578,
    agent_id: "agent-4",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Fully Furnished", "Split AC in Master Bed", "VNIT College 700m", "Lift with Power Backup", "Family/Working Professional Preferred"],
    is_featured: false,
    views_count: 154,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-7",
    title: "NIT Sanctioned Residential Plot in Besa",
    description: "Clear title 2400 sqft residential plot with East-North corner orientation inside an established layout with asphalt roads, underground drainage, water connections, and streetlights. Bank loan approved.",
    type: "residential",
    category: "plot",
    listing_type: "buy",
    bhk: null,
    price: 5400000,
    price_range: "₹50L - ₹60L",
    area_sqft: 2400,
    status: "available",
    locality: "Besa",
    address: "Plot No. 45, Greenfield Enclave, Near Podar International School, Besa, Nagpur - 440037",
    latitude: 21.0851,
    longitude: 79.0894,
    agent_id: "agent-2",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["NIT Sanctioned", "Corner Plot (East-North)", "30ft Wide Road", "Bank Loan Approved (SBI/HDFC)", "Water & Electricity Connected"],
    is_featured: false,
    views_count: 187,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-8",
    title: "Premium 3 BHK Flat in Ramdaspeth Medical Hub",
    description: "High-end 3 BHK flat situated in premier Ramdaspeth, close to Lendra Park and prominent multispecialty hospitals. Features French windows, wooden flooring in master bedroom, and video door phone.",
    type: "residential",
    category: "apartment",
    listing_type: "buy",
    bhk: 3,
    price: 13800000,
    price_range: "₹1.25Cr - ₹1.5Cr",
    area_sqft: 1950,
    status: "pending",
    locality: "Ramdaspeth",
    address: "B-wing 5th Floor, Royal Palms, Canal Road, Ramdaspeth, Nagpur - 440010",
    latitude: 21.1362,
    longitude: 79.0741,
    agent_id: "agent-1",
    images: [
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Video Door Security", "Lendra Park 200m", "Gym & Terrace Garden", "2 Reserved Parking", "Piped Natural Gas (MGL)"],
    is_featured: true,
    views_count: 310,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-9",
    title: "Spacious 4 BHK Row House Villa in Trimurti Nagar",
    description: "Triplex 4 BHK row house with attached terraces, modular kitchen, wooden wardrobes, and private covered porch for SUV. Located in quiet, upscale residential neighborhood near Ring Road.",
    type: "residential",
    category: "villa",
    listing_type: "buy",
    bhk: 4,
    price: 18500000,
    price_range: "₹1.75Cr - ₹2.0Cr",
    area_sqft: 2600,
    status: "sold",
    locality: "Trimurti Nagar",
    address: "Row House No. 7, Vasant Enclave, Trimurti Nagar, Nagpur - 440022",
    latitude: 21.1158,
    longitude: 79.0512,
    agent_id: "agent-4",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Triplex Architecture", "Private Terrace Garden", "SUV Covered Parking", "100% Vastu Approved"],
    is_featured: false,
    views_count: 412,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-10",
    title: "Ready Commercial Office Space in Sitabuldi Interchange",
    description: "Furnished 1650 sqft commercial office with reception, conference room, 2 director cabins, 24 workstations, and server room. Located 150m from Sitabuldi Metro Interchange Station.",
    type: "commercial",
    category: "apartment",
    listing_type: "rent",
    bhk: null,
    price: 75000,
    price_range: "₹60K - ₹80K/mo",
    area_sqft: 1650,
    status: "available",
    locality: "Sitabuldi",
    address: "3rd Floor, Metro Pinnacle Tower, Opposite Zero Mile, Sitabuldi, Nagpur - 440012",
    latitude: 21.1469,
    longitude: 79.0842,
    agent_id: "agent-3",
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["150m from Metro Interchange", "Furnished 24 Workstations", "High Speed Fibre", "Conference Room with AV", "Central Air Conditioning"],
    is_featured: true,
    views_count: 275,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-11",
    title: "Budget 2 BHK Flat for Rent in Somalwada",
    description: "Semi-furnished 2 BHK apartment with kitchen trolley, fans, lighting, and wardrobe in master bedroom. Quiet society with 24/7 security and municipal water supply. Easy access to airport and Wardha road.",
    type: "residential",
    category: "apartment",
    listing_type: "rent",
    bhk: 2,
    price: 16000,
    price_range: "₹15K - ₹20K/mo",
    area_sqft: 920,
    status: "rented",
    locality: "Somalwada",
    address: "Flat 103, Gokul Regency, Wardha Road Bypass, Somalwada, Nagpur - 440025",
    latitude: 21.0961,
    longitude: 79.0652,
    agent_id: "agent-4",
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Lift Available", "Corporation Water", "24/7 Security Guard", "Car Parking", "Low Maintenance"],
    is_featured: false,
    views_count: 168,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prop-12",
    title: "Highway Commercial Land Plot on Hingna Road",
    description: "12000 sqft commercial/industrial plot with direct 100ft road frontage on Hingna Main Road. Prime location suitable for automobile showroom, warehouse, hospital, or institutional building.",
    type: "commercial",
    category: "land",
    listing_type: "buy",
    bhk: null,
    price: 42000000,
    price_range: "₹4.0Cr - ₹4.5Cr",
    area_sqft: 12000,
    status: "available",
    locality: "Hingna Road",
    address: "Survey No. 88, Near Lata Mangeshkar Hospital, Hingna Road, Nagpur - 440016",
    latitude: 21.1085,
    longitude: 79.0142,
    agent_id: "agent-3",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["100ft Highway Frontage", "MIDC Non-Agricultural (NA) Order", "Water & High Tension Power", "Heavy Vehicle Access"],
    is_featured: false,
    views_count: 219,
    created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_FAVORITES = [
  { id: "fav-1", customer_id: "cust-1", property_id: "prop-1", created_at: new Date().toISOString() },
  { id: "fav-2", customer_id: "cust-1", property_id: "prop-8", created_at: new Date().toISOString() },
  { id: "fav-3", customer_id: "cust-2", property_id: "prop-2", created_at: new Date().toISOString() },
  { id: "fav-4", customer_id: "cust-2", property_id: "prop-4", created_at: new Date().toISOString() },
  { id: "fav-5", customer_id: "cust-3", property_id: "prop-3", created_at: new Date().toISOString() }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    customer_id: "cust-1",
    property_id: "prop-1",
    agent_id: "agent-1",
    message: "Hello Amit ji, is the price for the Dharampeth 3 BHK flat negotiable? Also wanted to know if SBI home loan is sanctioned for this building.",
    status: "in_progress",
    agent_reply: "Namaste Priya ji! Yes, SBI and HDFC both have approved project files. There is a slight negotiation possible on spot token. When would you like to visit?",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "inq-2",
    customer_id: "cust-2",
    property_id: "prop-2",
    agent_id: "agent-2",
    message: "Hi Sneha, does this Wardha Road 2 BHK flat have covered parking for 4-wheelers? What is the maintenance charge per month?",
    status: "new",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_VISITS: VisitRequest[] = [
  {
    id: "visit-1",
    customer_id: "cust-1",
    property_id: "prop-1",
    agent_id: "agent-1",
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time_slot: "11:00 AM - 12:30 PM",
    status: "confirmed",
    notes: "Customer will arrive with family for inspection of the balcony view and parking bay.",
    agent_notes: "Meeting at Dharampeth coffee house square before showing.",
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "visit-2",
    customer_id: "cust-3",
    property_id: "prop-3",
    agent_id: "agent-1",
    scheduled_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    time_slot: "04:30 PM - 06:00 PM",
    status: "pending",
    notes: "Client requested weekend site visit to check the private garden and neighborhood layout.",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PROPERTY_VIEWS: PropertyView[] = [
  { id: "pv-1", customer_id: "cust-1", property_id: "prop-8", viewed_at: new Date(Date.now() - 52 * 3600000).toISOString() },
  { id: "pv-2", customer_id: "cust-2", property_id: "prop-4", viewed_at: new Date(Date.now() - 58 * 3600000).toISOString() },
  { id: "pv-3", customer_id: "cust-3", property_id: "prop-3", viewed_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "pv-4", customer_id: "cust-4", property_id: "prop-6", viewed_at: new Date(Date.now() - 65 * 3600000).toISOString() }
];

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: "fu-1",
    customer_id: "cust-1",
    property_id: "prop-8",
    triggered_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: "pending",
    notified_admin: true,
    notified_customer: true,
    resolution_notes: "Automated follow-up triggered: Customer viewed 3 BHK in Ramdaspeth 52h ago without scheduling a visit."
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    user_id: "usr-admin",
    type: "follow_up",
    message: "Lead alert: Priya Deshmukh viewed 'Premium 3 BHK Flat in Ramdaspeth Medical Hub' 52h ago without booking an inquiry.",
    read_status: false,
    link: "/admin",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: "notif-2",
    user_id: "usr-cust-1",
    type: "follow_up",
    message: "Still interested in Premium 3 BHK Flat in Ramdaspeth? Schedule a direct site visit with our local Nagpur broker today.",
    read_status: false,
    link: "/properties/prop-8",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: "notif-3",
    user_id: "usr-cust-1",
    type: "visit_request",
    message: "Your site visit for 'Luxury 3 BHK Skyline Apartment in Dharampeth' has been confirmed for tomorrow 11:00 AM.",
    read_status: true,
    link: "/customer",
    created_at: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: "notif-4",
    user_id: "usr-agent-1",
    type: "inquiry",
    message: "New customer inquiry received from Priya Deshmukh for Dharampeth Skyline 3 BHK.",
    read_status: true,
    link: "/admin",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: "log-1", user_name: "Rajesh Agrawal (Admin)", role: "admin", action: "Approved Listing", details: "Approved Luxury 3 BHK Skyline Apartment in Dharampeth", timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: "log-2", user_name: "Amit Sharma (Agent)", role: "agent", action: "Confirmed Visit", details: "Confirmed site visit for Priya Deshmukh on Dharampeth flat", timestamp: new Date(Date.now() - 10 * 3600000).toISOString() },
  { id: "log-3", user_name: "System Job", role: "admin", action: "Follow-Up Auto Trigger", details: "Auto-generated 48h lead follow-up for Priya Deshmukh on Ramdaspeth 3 BHK", timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "log-4", user_name: "Priya Deshmukh (Customer)", role: "customer", action: "Submitted Inquiry", details: "Inquired about loan sanction and price on prop-1", timestamp: new Date(Date.now() - 24 * 3600000).toISOString() }
];


export interface AuthAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "agent" | "customer";
  agentId?: string;
  customerId?: string;
  agency?: string;
  phone?: string;
}

export const INITIAL_AUTH_ACCOUNTS: AuthAccount[] = [
  {
    id: "usr-admin",
    email: "rajesh.admin@nagpurrealty.in",
    password: "admin123",
    name: "Rajesh Agrawal",
    role: "admin",
    phone: "+91 98220 11223"
  },
  {
    id: "usr-agent-1",
    email: "amit.sharma@nagpurrealty.in",
    password: "agent123",
    name: "Amit Sharma",
    role: "agent",
    agentId: "agent-1",
    agency: "Dharampeth Realty Advisors",
    phone: "+91 98230 45612"
  },
  {
    id: "usr-agent-2",
    email: "sneha.k@orangecityestates.com",
    password: "agent123",
    name: "Sneha Kulkarni",
    role: "agent",
    agentId: "agent-2",
    agency: "Orange City Estates",
    phone: "+91 97644 12890"
  },
  {
    id: "usr-agent-3",
    email: "vikram.deshmukh@vidarbhahomes.in",
    password: "agent123",
    name: "Vikram Deshmukh",
    role: "agent",
    agentId: "agent-3",
    agency: "Vidarbha Homes & Infra",
    phone: "+91 98901 77334"
  },
  {
    id: "usr-agent-4",
    email: "nilesh.tiwari@nagpurrealty.in",
    password: "agent123",
    name: "Nilesh Tiwari",
    role: "agent",
    agentId: "agent-4",
    agency: "Premier Nagpur Brokers",
    phone: "+91 98222 39011"
  },
  {
    id: "usr-cust-1",
    email: "priya.deshmukh@gmail.com",
    password: "customer123",
    name: "Priya Deshmukh",
    role: "customer",
    customerId: "cust-1",
    phone: "+91 98231 99012"
  },
  {
    id: "usr-cust-2",
    email: "rahul.joshi@tcs.com",
    password: "customer123",
    name: "Rahul Joshi",
    role: "customer",
    customerId: "cust-2",
    phone: "+91 94221 88345"
  },
  {
    id: "usr-cust-3",
    email: "sunita.patil.dr@yahoo.com",
    password: "customer123",
    name: "Dr. Sunita Patil",
    role: "customer",
    customerId: "cust-3",
    phone: "+91 98902 44119"
  },
  {
    id: "usr-cust-4",
    email: "anand.verma@gmail.com",
    password: "customer123",
    name: "Anand Verma",
    role: "customer",
    customerId: "cust-4",
    phone: "+91 97654 32109"
  }
];

class NagpurDatabaseStore {
  private properties: Property[] = [...INITIAL_PROPERTIES];
  private localities: PropertyLocation[] = [...INITIAL_LOCALITIES];
  private agents: AgentBroker[] = [...INITIAL_AGENTS];
  private customers: Customer[] = [...INITIAL_CUSTOMERS];
  private favorites: typeof INITIAL_FAVORITES = [...INITIAL_FAVORITES];
  private inquiries: Inquiry[] = [...INITIAL_INQUIRIES];
  private visits: VisitRequest[] = [...INITIAL_VISITS];
  private views: PropertyView[] = [...INITIAL_PROPERTY_VIEWS];
  private followUps: FollowUp[] = [...INITIAL_FOLLOW_UPS];
  private notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private authAccounts: AuthAccount[] = [...INITIAL_AUTH_ACCOUNTS];
  private initialized = false;
  private isSyncing = false;
  private lastSyncedAt: string | null = null;
  private realtimeSubscribed = false;
  private isConnectedToSupabase = false;

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  public isUsingLiveSupabase(): boolean {
    return this.isConnectedToSupabase && isSupabaseConfigured;
  }

  public getLastSyncTime(): string | null {
    return this.lastSyncedAt;
  }

  public syncAuthAccounts() {
    const existingEmails = new Set(this.authAccounts.map(a => a.email.toLowerCase()));

    // Ensure all brokers have auth credentials
    for (const ag of this.agents) {
      if (!existingEmails.has(ag.email.toLowerCase())) {
        this.authAccounts.push({
          id: ag.user_id || "usr-" + ag.id,
          email: ag.email,
          password: "agent123",
          name: ag.name,
          role: "agent",
          agentId: ag.id,
          agency: ag.agency,
          phone: ag.phone
        });
        existingEmails.add(ag.email.toLowerCase());
      }
    }

    // Ensure all customers have auth credentials
    for (const cu of this.customers) {
      if (!existingEmails.has(cu.email.toLowerCase())) {
        this.authAccounts.push({
          id: cu.user_id || "usr-" + cu.id,
          email: cu.email,
          password: "customer123",
          name: cu.name,
          role: "customer",
          customerId: cu.id,
          phone: cu.phone
        });
        existingEmails.add(cu.email.toLowerCase());
      }
    }
  }

  public async syncFromSupabase(): Promise<{ success: boolean; message: string; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase not configured in .env.local" };
    }
    if (this.isSyncing) {
      return { success: true, message: "Sync already in progress" };
    }

    this.isSyncing = true;
    try {
      if (this.isClient()) {
        // In browser: fetch from our secure server route (uses SUPABASE_SERVICE_ROLE_KEY without RLS restriction)
        const res = await fetch("/api/supabase/sync", {
          cache: "no-store",
          headers: { Pragma: "no-cache" }
        });
        if (!res.ok) {
          this.isSyncing = false;
          return { success: false, message: `Sync API responded with status ${res.status}` };
        }
        const json = await res.json();
        if (json.success && json.data) {
          const { properties, agents, customers, visits, inquiries, auditLogs, localities } = json.data;

          if (properties && properties.length > 0) {
            this.properties = properties;
          }
          if (agents && agents.length > 0) {
            this.agents = agents;
          }
          if (customers && customers.length > 0) {
            const custMap = new Map(this.customers.map(c => [c.email.toLowerCase(), c]));
            customers.forEach((c: Customer) => custMap.set(c.email.toLowerCase(), c));
            this.customers = Array.from(custMap.values());
          }
          if (localities && localities.length > 0) {
            this.localities = localities;
          }
          if (visits && visits.length > 0) {
            this.visits = visits;
          }
          if (inquiries && inquiries.length > 0) {
            this.inquiries = inquiries;
          }
          if (auditLogs && auditLogs.length > 0) {
            this.auditLogs = auditLogs;
          }

          this.syncAuthAccounts();
          this.lastSyncedAt = new Date().toISOString();
          this.isConnectedToSupabase = true;
          this.saveToStorage();

          if (!this.realtimeSubscribed) {
            this.realtimeSubscribed = true;
            supabaseService.subscribeToChanges("properties", () => this.syncFromSupabase());
            supabaseService.subscribeToChanges("inquiries", () => this.syncFromSupabase());
            supabaseService.subscribeToChanges("visit_requests", () => this.syncFromSupabase());
            supabaseService.subscribeToChanges("audit_logs", () => this.syncFromSupabase());
          }

          this.isSyncing = false;
          return {
            success: true,
            message: json.message || "Successfully synchronized with Supabase!"
          };
        }
      } else {
        // On server: query Supabase via service role key
        const [propsRes, agentsRes, custsRes, locsRes, inqsRes, visitsRes, auditRes] = await Promise.all([
          supabaseService.getProperties(),
          supabaseService.getAgents(),
          supabaseService.getCustomers(),
          supabaseService.getLocalities(),
          supabaseService.getInquiries(),
          supabaseService.getVisitRequests(),
          supabaseService.getAuditLogs()
        ]);

        if (propsRes.data && propsRes.data.length > 0) this.properties = propsRes.data;
        if (agentsRes.data && agentsRes.data.length > 0) this.agents = agentsRes.data;
        if (custsRes.data && custsRes.data.length > 0) {
          const custMap = new Map(this.customers.map(c => [c.email.toLowerCase(), c]));
          custsRes.data.forEach(c => custMap.set(c.email.toLowerCase(), c));
          this.customers = Array.from(custMap.values());
        }
        if (locsRes.data && locsRes.data.length > 0) this.localities = locsRes.data;
        if (inqsRes.data && inqsRes.data.length > 0) this.inquiries = inqsRes.data;
        if (visitsRes.data && visitsRes.data.length > 0) this.visits = visitsRes.data;
        if (auditRes.data && auditRes.data.length > 0) this.auditLogs = auditRes.data;

        this.syncAuthAccounts();
        this.lastSyncedAt = new Date().toISOString();
        this.isConnectedToSupabase = true;
        this.isSyncing = false;
        return { success: true, message: "Server synchronized with Supabase" };
      }
    } catch (err: any) {
      this.isSyncing = false;
      console.warn("syncFromSupabase notice:", err?.message || err);
      return { success: false, message: "Sync failed", error: err?.message };
    }
    this.isSyncing = false;
    return { success: true, message: "Sync complete" };
  }

  private loadFromStorage() {
    if (!this.isClient() || this.initialized) return;
    try {
      const stored = localStorage.getItem("nagpur_realty_db_v1");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.properties) this.properties = data.properties;
        if (data.agents) this.agents = data.agents;
        if (data.customers) this.customers = data.customers;
        if (data.favorites) this.favorites = data.favorites;
        if (data.inquiries) this.inquiries = data.inquiries;
        if (data.visits) this.visits = data.visits;
        if (data.views) this.views = data.views;
        if (data.followUps) this.followUps = data.followUps;
        if (data.notifications) this.notifications = data.notifications;
        if (data.auditLogs) this.auditLogs = data.auditLogs;
        if (data.authAccounts) this.authAccounts = data.authAccounts;
      }
      this.initialized = true;

      // Automatically sync from Supabase if configured
      if (isSupabaseConfigured) {
        this.syncFromSupabase().catch(() => {});
      }
    } catch (e) {
      console.error("Failed to load Nagpur store from localStorage", e);
    }
  }

  private saveToStorage() {
    if (!this.isClient()) return;
    try {
      localStorage.setItem("nagpur_realty_db_v1", JSON.stringify({
        properties: this.properties,
        agents: this.agents,
        customers: this.customers,
        favorites: this.favorites,
        inquiries: this.inquiries,
        visits: this.visits,
        views: this.views,
        followUps: this.followUps,
        notifications: this.notifications,
        auditLogs: this.auditLogs,
        authAccounts: this.authAccounts
      }));
      window.dispatchEvent(new Event("nagpur_db_updated"));
    } catch (e) {
      console.error("Failed to save Nagpur store to localStorage", e);
    }
  }

  getProperties(): Property[] {
    this.loadFromStorage();
    return [...this.properties];
  }

  getPropertyById(id: string): Property | undefined {
    this.loadFromStorage();
    return this.properties.find(p => isMatchingId(p.id, id));
  }

  createProperty(prop: Omit<Property, "id" | "views_count" | "created_at" | "updated_at">): Property {
    this.loadFromStorage();
    const newProp: Property = {
      ...prop,
      id: "prop-" + Date.now(),
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.properties.unshift(newProp);
    this.addAuditLog("Rajesh Agrawal (Admin)", "admin", "Created Property", `Created listing "${newProp.title}" in ${newProp.locality}`);
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.createProperty(newProp).then((res) => {
        if (res.data?.id) {
          newProp.id = res.data.id;
          this.saveToStorage();
        }
      }).catch((err) => console.error("Supabase property creation failed:", err));
    }

    return newProp;
  }

  updateProperty(id: string, updates: Partial<Property>, authorName?: string): Property | null {
    this.loadFromStorage();
    const idx = this.properties.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const oldTitle = this.properties[idx].title;
    this.properties[idx] = { ...this.properties[idx], ...updates, updated_at: new Date().toISOString() };
    
    // Construct informative audit details
    const keys = Object.keys(updates).filter(k => k !== "updated_at");
    const changeSummary = keys.length > 0 ? `Changed fields: ${keys.join(", ")}` : "Saved edits";
    this.addAuditLog(
      authorName || "Rajesh Agrawal (Admin)",
      "admin",
      "Updated Property",
      `Edited listing "${this.properties[idx].title || oldTitle}" (${changeSummary})`
    );
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.updateProperty(id, updates).catch((err) =>
        console.error(`Supabase property update (${id}) failed:`, err)
      );
    }

    return this.properties[idx];
  }

  deleteProperty(id: string, authorName?: string): boolean {
    this.loadFromStorage();
    const prop = this.properties.find(p => p.id === id);
    this.properties = this.properties.filter(p => p.id !== id);
    if (prop) {
      this.addAuditLog(authorName || "Rajesh Agrawal (Admin)", "admin", "Deleted Property", `Deleted listing "${prop.title}"`);
    }
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.deleteProperty(id).catch((err) =>
        console.error(`Supabase property deletion (${id}) failed:`, err)
      );
    }

    return true;
  }

  reassignPropertyAgent(propertyId: string, newAgentId: string): boolean {
    this.loadFromStorage();
    const prop = this.properties.find(p => p.id === propertyId);
    const agent = this.agents.find(a => a.id === newAgentId);
    if (!prop || !agent) return false;
    prop.agent_id = newAgentId;
    prop.updated_at = new Date().toISOString();
    this.addAuditLog("Rajesh Agrawal (Admin)", "admin", "Reassigned Property", `Reassigned "${prop.title}" to broker ${agent.name}`);
    this.saveToStorage();
    return true;
  }

  getLocalities(): PropertyLocation[] {
    return [...this.localities];
  }

  getAgents(): AgentBroker[] {
    this.loadFromStorage();
    return [...this.agents];
  }

  getAgentById(id: string): AgentBroker | undefined {
    this.loadFromStorage();
    return this.agents.find(a => isMatchingId(a.id, id) || a.user_id === id);
  }

  createAgent(agentData: Omit<AgentBroker, "id" | "created_at">): AgentBroker {
    this.loadFromStorage();
    const newAgent: AgentBroker = {
      ...agentData,
      id: "agent-" + Date.now(),
      created_at: new Date().toISOString()
    };
    this.agents.push(newAgent);
    this.addAuditLog("Rajesh Agrawal (Admin)", "admin", "Added Agent", `Onboarded broker ${newAgent.name} (${newAgent.agency})`);
    this.saveToStorage();
    return newAgent;
  }

  updateAgent(id: string, updates: Partial<AgentBroker>): AgentBroker | null {
    this.loadFromStorage();
    const idx = this.agents.findIndex(a => isMatchingId(a.id, id));
    if (idx === -1) return null;
    this.agents[idx] = { ...this.agents[idx], ...updates };
    this.addAuditLog("Rajesh Agrawal (Admin)", "admin", "Updated Agent", `Updated agent info for ${this.agents[idx].name}`);
    this.saveToStorage();
    return this.agents[idx];
  }

  deleteAgent(id: string, reassignToAgentId?: string): boolean {
    this.loadFromStorage();
    const agent = this.agents.find(a => isMatchingId(a.id, id));
    if (reassignToAgentId) {
      this.properties.forEach(p => {
        if (isMatchingId(p.agent_id, id)) p.agent_id = reassignToAgentId;
      });
    }
    this.agents = this.agents.filter(a => !isMatchingId(a.id, id));
    if (agent) {
      this.addAuditLog("Rajesh Agrawal (Admin)", "admin", "Removed Agent", `Removed agent ${agent.name}`);
    }
    this.saveToStorage();
    return true;
  }

  getCustomers(): Customer[] {
    this.loadFromStorage();
    return [...this.customers];
  }

  getCustomerById(id: string): Customer | undefined {
    this.loadFromStorage();
    return this.customers.find(c => isMatchingId(c.id, id) || c.user_id === id);
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    this.loadFromStorage();
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.customers[idx] = { ...this.customers[idx], ...updates };
    this.saveToStorage();
    return this.customers[idx];
  }

  deleteCustomer(id: string): boolean {
    this.loadFromStorage();
    this.customers = this.customers.filter(c => c.id !== id);
    this.saveToStorage();
    return true;
  }

  getFavorites(customerId: string): string[] {
    this.loadFromStorage();
    return this.favorites.filter(f => f.customer_id === customerId).map(f => f.property_id);
  }

  toggleFavorite(customerId: string, propertyId: string): boolean {
    this.loadFromStorage();
    const idx = this.favorites.findIndex(f => f.customer_id === customerId && f.property_id === propertyId);
    let isFav = false;
    if (idx !== -1) {
      this.favorites.splice(idx, 1);
      isFav = false;
    } else {
      this.favorites.push({
        id: "fav-" + Date.now(),
        customer_id: customerId,
        property_id: propertyId,
        created_at: new Date().toISOString()
      });
      isFav = true;
    }
    this.saveToStorage();
    return isFav;
  }

  getInquiries(): Inquiry[] {
    this.loadFromStorage();
    return [...this.inquiries];
  }

  createInquiry(inq: Omit<Inquiry, "id" | "created_at" | "updated_at">, authorName?: string): Inquiry {
    this.loadFromStorage();
    const newInq: Inquiry = {
      ...inq,
      id: "inq-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.inquiries.unshift(newInq);

    this.createNotification({
      user_id: "usr-admin",
      type: "inquiry",
      message: `New customer inquiry received for property #${newInq.property_id}`,
      read_status: false,
      link: "/admin"
    });

    const prop = this.properties.find(p => p.id === inq.property_id);
    const cust = this.customers.find(c => c.id === inq.customer_id);
    const callerName = authorName || cust?.name || "Customer";
    this.addAuditLog(callerName, "customer", "Submitted Inquiry", `Inquired on "${prop?.title || inq.property_id}"`);
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.createInquiry(newInq).then((res) => {
        if (res.data?.id) {
          newInq.id = res.data.id;
          this.saveToStorage();
        }
      }).catch((err) => console.error("Supabase inquiry creation failed:", err));
    }

    return newInq;
  }

  updateInquiryStatus(id: string, status: InquiryStatus, agentReply?: string, authorName?: string): Inquiry | null {
    this.loadFromStorage();
    const idx = this.inquiries.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.inquiries[idx].status = status;
    if (agentReply !== undefined) {
      this.inquiries[idx].agent_reply = agentReply;
    }
    this.inquiries[idx].updated_at = new Date().toISOString();

    const cust = this.customers.find(c => c.id === this.inquiries[idx].customer_id);
    const prop = this.properties.find(p => p.id === this.inquiries[idx].property_id);

    if (cust?.user_id) {
      this.createNotification({
        user_id: cust.user_id,
        type: "inquiry",
        message: `Your inquiry has been updated to "${status}". ${agentReply ? `Agent reply: "${agentReply}"` : ""}`,
        read_status: false,
        link: "/customer"
      });
    }

    this.addAuditLog(
      authorName || "Broker / Admin",
      "agent",
      "Updated Inquiry Status",
      `Inquiry for "${prop?.title || 'Property'}" (${cust?.name || 'Customer'}) set to "${status}"${agentReply ? ` | Reply: "${agentReply.slice(0, 40)}..."` : ""}`
    );

    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.updateInquiryStatus(id, status, agentReply).catch((err) =>
        console.error(`Supabase inquiry update (${id}) failed:`, err)
      );
    }

    return this.inquiries[idx];
  }

  reassignInquiryAgent(inquiryId: string, newAgentId: string): boolean {
    this.loadFromStorage();
    const inq = this.inquiries.find(i => i.id === inquiryId);
    if (!inq) return false;
    inq.agent_id = newAgentId;
    inq.updated_at = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  getVisitRequests(): VisitRequest[] {
    this.loadFromStorage();
    return [...this.visits];
  }

  createVisitRequest(visit: Omit<VisitRequest, "id" | "created_at" | "updated_at">, authorName?: string): VisitRequest {
    this.loadFromStorage();
    const newVisit: VisitRequest = {
      ...visit,
      id: "visit-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.visits.unshift(newVisit);

    this.createNotification({
      user_id: "usr-admin",
      type: "visit_request",
      message: `Site visit requested on ${newVisit.scheduled_date} (${newVisit.time_slot}) for property #${newVisit.property_id}`,
      read_status: false,
      link: "/admin"
    });

    const prop = this.properties.find(p => p.id === visit.property_id);
    const cust = this.customers.find(c => c.id === visit.customer_id);
    const callerName = authorName || cust?.name || "Customer";
    this.addAuditLog(callerName, "customer", "Requested Site Visit", `Booked visit on ${visit.scheduled_date} for "${prop?.title || ''}"`);
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.createVisitRequest(newVisit).then((res) => {
        if (res.data?.id) {
          newVisit.id = res.data.id;
          this.saveToStorage();
        }
      }).catch((err) => console.error("Supabase visit creation failed:", err));
    }

    return newVisit;
  }

  updateVisitStatus(
    id: string,
    status: VisitStatus,
    agentNotes?: string,
    reschedule?: { scheduled_date?: string; time_slot?: string },
    authorName?: string
  ): VisitRequest | null {
    this.loadFromStorage();
    const idx = this.visits.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.visits[idx].status = status;
    if (agentNotes !== undefined) {
      this.visits[idx].agent_notes = agentNotes;
    }
    if (reschedule?.scheduled_date) {
      this.visits[idx].scheduled_date = reschedule.scheduled_date;
    }
    if (reschedule?.time_slot) {
      this.visits[idx].time_slot = reschedule.time_slot;
    }
    this.visits[idx].updated_at = new Date().toISOString();

    const cust = this.customers.find(c => c.id === this.visits[idx].customer_id);
    const prop = this.properties.find(p => p.id === this.visits[idx].property_id);

    if (cust?.user_id) {
      this.createNotification({
        user_id: cust.user_id,
        type: "visit_request",
        message: `Your property visit request for ${this.visits[idx].scheduled_date} has been updated to "${status}".`,
        read_status: false,
        link: "/customer"
      });
    }

    const actionName = reschedule?.scheduled_date ? "Rescheduled Site Visit" : "Updated Visit Status";
    const detailMsg = reschedule?.scheduled_date
      ? `Rescheduled visit for "${prop?.title || 'Property'}" (${cust?.name || 'Customer'}) to ${this.visits[idx].scheduled_date} at ${this.visits[idx].time_slot} [${status}]`
      : `Marked visit for "${prop?.title || 'Property'}" (${cust?.name || 'Customer'}) as "${status}"${agentNotes ? ` | Notes: ${agentNotes}` : ""}`;

    this.addAuditLog(
      authorName || "Broker / Admin",
      "agent",
      actionName,
      detailMsg
    );

    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.updateVisitStatus(id, status, agentNotes, reschedule).catch((err) =>
        console.error(`Supabase visit update (${id}) failed:`, err)
      );
    }

    return this.visits[idx];
  }

  reassignVisitAgent(visitId: string, newAgentId: string): boolean {
    this.loadFromStorage();
    const visit = this.visits.find(v => v.id === visitId);
    if (!visit) return false;
    visit.agent_id = newAgentId;
    visit.updated_at = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  logPropertyView(customerId: string, propertyId: string) {
    this.loadFromStorage();
    const prop = this.properties.find(p => p.id === propertyId);
    if (prop) {
      prop.views_count = (prop.views_count || 0) + 1;
      this.views.push({
        id: "view-" + Date.now(),
        customer_id: customerId,
        property_id: propertyId,
        viewed_at: new Date().toISOString()
      });
      this.saveToStorage();
    }

    if (isSupabaseConfigured) {
      supabaseService.logPropertyView(customerId, propertyId).catch(() => {});
    }
  }

  getPropertyViews(): PropertyView[] {
    this.loadFromStorage();
    return [...this.views];
  }

  getFollowUps(): FollowUp[] {
    this.loadFromStorage();
    return [...this.followUps];
  }

  resolveFollowUp(id: string, status: FollowUpStatus, resolutionNotes?: string): FollowUp | null {
    this.loadFromStorage();
    const idx = this.followUps.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.followUps[idx].status = status;
    if (resolutionNotes) this.followUps[idx].resolution_notes = resolutionNotes;
    this.followUps[idx].resolved_at = new Date().toISOString();
    this.addAuditLog("Rajesh Agrawal (Admin)", "admin", "Resolved Follow-Up", `Resolved follow-up lead #${id} as ${status}`);
    this.saveToStorage();
    return this.followUps[idx];
  }

  runFollowUpAutomation(): { generatedCount: number; newFollowUps: FollowUp[] } {
    this.loadFromStorage();
    const cutoffTime = Date.now() - 48 * 3600000;
    const candidates: PropertyView[] = [];

    for (const view of this.views) {
      const viewTime = new Date(view.viewed_at).getTime();
      if (viewTime <= cutoffTime) {
        const hasInq = this.inquiries.some(i => i.customer_id === view.customer_id && i.property_id === view.property_id);
        const hasVisit = this.visits.some(v => v.customer_id === view.customer_id && v.property_id === view.property_id);
        const hasFollowUp = this.followUps.some(f => f.customer_id === view.customer_id && f.property_id === view.property_id);

        if (!hasInq && !hasVisit && !hasFollowUp) {
          if (!candidates.some(c => c.customer_id === view.customer_id && c.property_id === view.property_id)) {
            candidates.push(view);
          }
        }
      }
    }

    const created: FollowUp[] = [];
    for (const c of candidates) {
      const prop = this.properties.find(p => p.id === c.property_id);
      const cust = this.customers.find(cu => cu.id === c.customer_id);

      const fu: FollowUp = {
        id: "fu-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        customer_id: c.customer_id,
        property_id: c.property_id,
        triggered_at: new Date().toISOString(),
        status: "pending",
        notified_admin: true,
        notified_customer: true,
        resolution_notes: `Auto-scan: ${cust?.name || 'Customer'} viewed "${prop?.title || 'Property'}" 48h+ ago without inquiry or visit.`
      };

      this.followUps.unshift(fu);
      created.push(fu);

      this.createNotification({
        user_id: "usr-admin",
        type: "follow_up",
        message: `Automated Lead: ${cust?.name || 'Customer'} viewed "${prop?.title || 'Property'}" (${prop?.locality}) 48h ago without taking action.`,
        read_status: false,
        link: "/admin"
      });

      if (cust?.user_id) {
        this.createNotification({
          user_id: cust.user_id,
          type: "follow_up",
          message: `Still interested in ${prop?.locality}? Book a direct site visit for "${prop?.title || ''}" with our local Nagpur broker.`,
          read_status: false,
          link: `/properties/${c.property_id}`
        });
      }
    }

    if (created.length > 0) {
      this.addAuditLog("System Automation", "admin", "Executed Follow-Up Scan", `Generated ${created.length} new automated follow-up leads.`);
      this.saveToStorage();
    }

    return { generatedCount: created.length, newFollowUps: created };
  }

  getNotifications(userId?: string): AppNotification[] {
    this.loadFromStorage();
    if (!userId) return [...this.notifications];
    return this.notifications.filter(n => n.user_id === userId || n.user_id === "usr-admin");
  }

  createNotification(notif: Omit<AppNotification, "id" | "created_at">): AppNotification {
    this.loadFromStorage();
    const newNotif: AppNotification = {
      ...notif,
      id: "notif-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.saveToStorage();
    return newNotif;
  }

  markNotificationAsRead(id: string) {
    this.loadFromStorage();
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read_status = true;
    this.saveToStorage();
  }

  markAllNotificationsAsRead(userId?: string) {
    this.loadFromStorage();
    this.notifications.forEach(n => {
      if (!userId || n.user_id === userId) n.read_status = true;
    });
    this.saveToStorage();
  }

  getAuditLogs(): AuditLog[] {
    this.loadFromStorage();
    return [...this.auditLogs];
  }

  addAuditLog(userName: string, role: "admin" | "agent" | "customer", action: string, details: string) {
    const log: AuditLog = {
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      user_name: userName,
      role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    this.saveToStorage();

    // Persist to Supabase audit_logs table immediately
    if (isSupabaseConfigured) {
      supabaseService.createAuditLog(log).catch((err) => {
        console.warn("Supabase createAuditLog background sync:", err);
      });
    }
  }

  resetToSeed() {
    this.properties = [...INITIAL_PROPERTIES];
    this.localities = [...INITIAL_LOCALITIES];
    this.agents = [...INITIAL_AGENTS];
    this.customers = [...INITIAL_CUSTOMERS];
    this.favorites = [...INITIAL_FAVORITES];
    this.inquiries = [...INITIAL_INQUIRIES];
    this.visits = [...INITIAL_VISITS];
    this.views = [...INITIAL_PROPERTY_VIEWS];
    this.followUps = [...INITIAL_FOLLOW_UPS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.saveToStorage();
  }

  public authenticateUser(role: "admin" | "agent" | "customer", email: string, password?: string): { success: boolean; message?: string; user?: any } {
    this.loadFromStorage();
    const cleanEmail = (email || "").trim().toLowerCase();
    
    // Find account
    let account = this.authAccounts.find(a => a.email.toLowerCase() === cleanEmail && a.role === role);

    // Dynamic recovery: check if user exists in agents table
    if (!account && role === "agent") {
      const ag = this.agents.find(a => a.email.toLowerCase() === cleanEmail);
      if (ag) {
        account = {
          id: ag.user_id || "usr-" + ag.id,
          email: ag.email,
          password: "agent123",
          name: ag.name,
          role: "agent",
          agentId: ag.id,
          agency: ag.agency,
          phone: ag.phone
        };
        this.authAccounts.push(account);
        this.saveToStorage();
      }
    }

    // Dynamic recovery: check if user exists in customers table
    if (!account && role === "customer") {
      const cust = this.customers.find(c => c.email.toLowerCase() === cleanEmail);
      if (cust) {
        account = {
          id: cust.user_id || "usr-" + cust.id,
          email: cust.email,
          password: "customer123",
          name: cust.name,
          role: "customer",
          customerId: cust.id,
          phone: cust.phone
        };
        this.authAccounts.push(account);
        this.saveToStorage();
      }
    }

    if (!account) {
      return { success: false, message: `No ${role} account found with email "${email}". Please verify or register.` };
    }

    if (password && account.password && account.password !== password) {
      return { success: false, message: "Invalid password. Please check your credentials." };
    }

    return {
      success: true,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        agency: account.agency,
        agentId: account.agentId,
        customerId: account.customerId,
        phone: account.phone
      }
    };
  }

  public createCustomer(customerData: Omit<Customer, "id" | "created_at">): Customer {
    this.loadFromStorage();
    const newCust: Customer = {
      ...customerData,
      id: "cust-" + Date.now(),
      created_at: new Date().toISOString()
    };
    this.customers.push(newCust);
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.createCustomer(newCust).catch(err => console.error("Supabase customer create error:", err));
    }
    return newCust;
  }

  public createCustomerWithAuth(
    data: {
      name: string;
      email: string;
      phone: string;
      password?: string;
      preferences?: any;
    },
    passwordParam?: string
  ): { success: boolean; message?: string; user?: any; customer?: Customer } {
    this.loadFromStorage();
    const cleanEmail = data.email.trim().toLowerCase();
    
    // Check if email already taken
    const existing = this.customers.find(c => c.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: `An account with email "${data.email}" already exists. Please sign in.` };
    }

    const customerId = "cust-" + Date.now();
    const userId = "usr-cust-" + Date.now();
    const finalPassword = data.password || passwordParam || "customer123";

    const newCustomer: Customer = {
      id: customerId,
      user_id: userId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      preferences: data.preferences || {
        budget_min: 2500000,
        budget_max: 8500000,
        preferred_localities: ["Dharampeth", "Besa", "Wardha Road"],
        bhk: [2, 3],
        listing_type: "buy"
      },
      status: "active",
      created_at: new Date().toISOString()
    };

    this.customers.push(newCustomer);

    const authAccount: AuthAccount = {
      id: userId,
      email: data.email,
      password: finalPassword,
      name: data.name,
      role: "customer",
      customerId: customerId,
      phone: data.phone
    };

    this.authAccounts.push(authAccount);
    this.addAuditLog(data.name + " (Customer)", "customer", "Created Account", `Registered new customer account ${data.email}`);
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.createCustomer(newCustomer).then((res) => {
        if (res.data?.id) {
          newCustomer.id = res.data.id;
          authAccount.customerId = res.data.id;
          this.saveToStorage();
        }
      }).catch(err => console.error("Supabase customer create error:", err));
    }

    return {
      success: true,
      user: {
        id: userId,
        email: data.email,
        name: data.name,
        role: "customer",
        customerId: customerId,
        phone: data.phone
      },
      customer: newCustomer
    };
  }

  public createAgentWithAuth(
    agentData: Omit<AgentBroker, "id" | "created_at">,
    password?: string
  ): { success: boolean; message?: string; agent: AgentBroker; credentials: { email: string; password: string } } {
    this.loadFromStorage();
    const agentId = "agent-" + Date.now();
    const userId = "usr-agent-" + Date.now();
    const finalPassword = password || "agent123";

    const newAgent: AgentBroker = {
      ...agentData,
      id: agentId,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    this.agents.push(newAgent);

    const authAccount: AuthAccount = {
      id: userId,
      email: agentData.email,
      password: finalPassword,
      name: agentData.name,
      role: "agent",
      agentId: agentId,
      agency: agentData.agency,
      phone: agentData.phone
    };

    this.authAccounts.push(authAccount);
    this.addAuditLog("Rajesh Agrawal (Admin)", "admin", "Onboarded Broker", `Onboarded broker ${newAgent.name} (${newAgent.agency}) with login credentials`);
    this.saveToStorage();

    if (isSupabaseConfigured) {
      supabaseService.createAgent(newAgent).catch(err => console.error("Supabase agent create error:", err));
    }

    return {
      success: true,
      agent: newAgent,
      credentials: {
        email: agentData.email,
        password: finalPassword
      }
    };
  }
}

export const nagpurDb = new NagpurDatabaseStore();
