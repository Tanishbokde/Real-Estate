-- ============================================================================
-- NAGPUR REAL ESTATE PLATFORM - SEED DATA
-- Real Nagpur localities, authentic Vidarbha/Maharashtra broker & customer data
-- ============================================================================

-- 1. NAGPUR LOCALITIES
INSERT INTO public.property_locations (id, name, zone, pincode, popular_landmarks, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111001', 'Dharampeth', 'West Nagpur', '440010', ARRAY['Futala Lake', 'Gokulpeth Market', 'Traffic Park', 'Coffee House Square'], 21.1432000, 79.0620000),
('11111111-1111-1111-1111-111111111002', 'Civil Lines', 'Central Nagpur', '440001', ARRAY['High Court of Bombay Nagpur Bench', 'Vidhan Bhavan', 'Ladies Club Square', 'Nagpur Club'], 21.1578000, 79.0725000),
('11111111-1111-1111-1111-111111111003', 'Ramdaspeth', 'Central Nagpur', '440010', ARRAY['Central Mall', 'Hotel Centre Point', 'Kachipura Garden', 'Lendra Park'], 21.1352000, 79.0734000),
('11111111-1111-1111-1111-111111111004', 'Sadar', 'North Nagpur', '440001', ARRAY['Mount Road', 'Sadar Bazaar', 'St. Francis De Sales Cathedral', 'Residency Road'], 21.1625000, 79.0812000),
('11111111-1111-1111-1111-111111111005', 'Pratap Nagar', 'South-West Nagpur', '440022', ARRAY['Pratap Nagar Square', 'Orange City Hospital', 'Pioneer Society', 'VNIT Campus'], 21.1198000, 79.0564000),
('11111111-1111-1111-1111-111111111006', 'Manish Nagar', 'South Nagpur', '440015', ARRAY['Manish Nagar Railway Underbridge', 'Beltarodi Road', 'Purti Supermarket', 'Besa Canal Road'], 21.0967000, 79.0782000),
('11111111-1111-1111-1111-111111111007', 'Trimurti Nagar', 'South-West Nagpur', '440022', ARRAY['Trimurti Square', 'NIT Garden', 'Ring Road Junction', 'Orange City Park'], 21.1145000, 79.0498000),
('11111111-1111-1111-1111-111111111008', 'Wardha Road', 'South Nagpur', '440015', ARRAY['Dr. Babasaheb Ambedkar Airport', 'Nagpur Metro Aqua Line', 'Chhatrapati Square', 'Hotel Pride'], 21.0921000, 79.0684000),
('11111111-1111-1111-1111-111111111009', 'Somalwada', 'South Nagpur', '440025', ARRAY['Ujjwal Nagar Metro', 'Wardha Road Junction', 'Shri Krishna Temple', 'Airport Metro'], 21.0954000, 79.0645000),
('11111111-1111-1111-1111-111111111010', 'Besa', 'South Nagpur', '440037', ARRAY['Besa Square', 'Ghogli Road', 'Podar International School', 'Manish Nagar Link Road'], 21.0845000, 79.0882000),
('11111111-1111-1111-1111-111111111011', 'Dhantoli', 'Central Nagpur', '440012', ARRAY['Yashwant Stadium', 'Dhantoli Garden', 'Mehadia Square', 'Congress Nagar Metro'], 21.1378000, 79.0845000),
('11111111-1111-1111-1111-111111111012', 'Sitabuldi', 'Central Nagpur', '440012', ARRAY['Sitabuldi Interchange Metro', 'Zero Mile Stone', 'Eternity Mall', 'Maharajbagh Zoo'], 21.1462000, 79.0835000),
('11111111-1111-1111-1111-111111111013', 'Bajaj Nagar', 'West Nagpur', '440010', ARRAY['Laxmi Nagar Square', 'Abhyankar Nagar Petrol Pump', 'VNIT College Gate', 'Shankar Nagar Square'], 21.1278000, 79.0612000),
('11111111-1111-1111-1111-111111111014', 'Khamla', 'South-West Nagpur', '440025', ARRAY['Khamla Vegetable Market', 'Deo Nagar Square', 'Orange City Street', 'Pande Layout'], 21.1152000, 79.0658000),
('11111111-1111-1111-1111-111111111015', 'Hingna Road', 'West Nagpur', '440016', ARRAY['Lata Mangeshkar Hospital', 'CRPF Gate', 'ICAD Academy', 'Subhash Nagar Metro'], 21.1098000, 79.0154000),
('11111111-1111-1111-1111-111111111016', 'Mahal', 'East Nagpur', '440032', ARRAY['Gandhi Gate', 'Kalyaneshwar Mandir', 'Tilak Statue Square', 'Kotwali Police Station'], 21.1448000, 79.1065000),
('11111111-1111-1111-1111-111111111017', 'Nandanvan', 'East Nagpur', '440009', ARRAY['KDK College of Engineering', 'Gurudev Nagar', 'Hasanbagh Square', 'Sakkardara Lake'], 21.1298000, 79.1245000),
('11111111-1111-1111-1111-111111111018', 'Wathoda', 'East Nagpur', '440035', ARRAY['Symbiosis University Nagpur', 'Tarodi Ring Road', 'Pardi Flyover', 'Dighori Square'], 21.1215000, 79.1520000),
('11111111-1111-1111-1111-111111111019', 'Zingabai Takli', 'North Nagpur', '440030', ARRAY['Godhani Road', 'Mankapur Sports Complex', 'Koradi Road Toll Plaza', 'Farooq Nagar'], 21.1945000, 79.0720000),
('11111111-1111-1111-1111-111111111020', 'Ayodhya Nagar', 'South-East Nagpur', '440024', ARRAY['Shatabdi Square', 'Manewada Ring Road', 'Ayodhya Nagar Ground', 'Omkar Nagar Square'], 21.1075000, 79.1032000),
('11111111-1111-1111-1111-111111111021', 'Gandhibagh', 'Central-East Nagpur', '440002', ARRAY['Gandhibagh Garden', 'Cloth Market Itwari', 'Chitar Oli', 'Agrasen Square'], 21.1512000, 79.1012000)
ON CONFLICT (name) DO NOTHING;

-- 2. AGENTS & BROKERS
INSERT INTO public.agents_brokers (id, name, phone, email, agency, rating, area_specialization, license_no, bio, total_deals, is_active) VALUES
('22222222-2222-2222-2222-222222222001', 'Amit Sharma', '+91 98230 45612', 'amit.sharma@nagpurrealty.in', 'Dharampeth Realty Advisors', 4.9, 'Dharampeth & West Nagpur Luxury Flats', 'MAHARERA-A50500018921', '14+ years in premium residential properties in Dharampeth, Ramdaspeth, and Civil Lines.', 84, true),
('22222222-2222-2222-2222-222222222002', 'Sneha Kulkarni', '+91 97644 12890', 'sneha.k@orangecityestates.com', 'Orange City Estates', 4.8, 'Wardha Road, Besa & Manish Nagar Growth Corridor', 'MAHARERA-A50500021450', 'Specialized in high-ROI apartments, builder floors and gated communities near MIHAN SEZ & Airport.', 62, true),
('22222222-2222-2222-2222-222222222003', 'Vikram Deshmukh', '+91 98901 77334', 'vikram.deshmukh@vidarbhahomes.in', 'Vidarbha Homes & Infra', 4.7, 'Commercial Spaces & Commercial Plots across Nagpur', 'MAHARERA-A50500015502', 'Specialist in commercial retail spaces in Sadar, Sitabuldi, and industrial land along Hingna & Wardha road.', 53, true),
('22222222-2222-2222-2222-222222222004', 'Nilesh Tiwari', '+91 98222 39011', 'nilesh.tiwari@nagpurrealty.in', 'Premier Nagpur Brokers', 4.8, 'Affordable 2/3 BHK & Rental Homes in South Nagpur', 'MAHARERA-A50500029881', 'Focused on ready-to-move family apartments and high quality rental leases in Pratap Nagar & Khamla.', 41, true)
ON CONFLICT (email) DO NOTHING;

-- 3. CUSTOMERS
INSERT INTO public.customers (id, name, phone, email, preferences, status) VALUES
('33333333-3333-3333-3333-333333333001', 'Priya Deshmukh', '+91 98231 99012', 'priya.deshmukh@gmail.com', '{"budget_min": 6000000, "budget_max": 12000000, "preferred_localities": ["Dharampeth", "Civil Lines", "Ramdaspeth"], "bhk": [3, 4]}'::jsonb, 'active'),
('33333333-3333-3333-3333-333333333002', 'Rahul Joshi', '+91 94221 88345', 'rahul.joshi@tcs.com', '{"budget_min": 3500000, "budget_max": 6500000, "preferred_localities": ["Manish Nagar", "Besa", "Wardha Road"], "bhk": [2, 3]}'::jsonb, 'active'),
('33333333-3333-3333-3333-333333333003', 'Sunita Patil', '+91 98902 44119', 'sunita.patil.dr@yahoo.com', '{"budget_min": 15000000, "budget_max": 30000000, "preferred_localities": ["Civil Lines", "Ramdaspeth"], "bhk": [4]}'::jsonb, 'active'),
('33333333-3333-3333-3333-333333333004', 'Anand Verma', '+91 97654 32109', 'anand.verma@gmail.com', '{"budget_min": 15000, "budget_max": 28000, "preferred_localities": ["Pratap Nagar", "Khamla", "Trimurti Nagar"], "listing_type": "rent"}'::jsonb, 'active')
ON CONFLICT (email) DO NOTHING;

-- 4. PROPERTIES (12 diverse, authentic Nagpur listings)
INSERT INTO public.properties (id, title, description, type, category, listing_type, bhk, price, price_range, area_sqft, status, locality, address, latitude, longitude, agent_id, images, features, is_featured, views_count) VALUES
(
  '44444444-4444-4444-4444-444444444001',
  'Luxury 3 BHK Skyline Apartment in Dharampeth',
  'Exclusive east-facing 3 BHK luxury flat with marble flooring, modular Italian kitchen, 2 balconies with scenic Futala Lake views, and 2 designated covered car parking spaces. Just 300m from Gokulpeth Market.',
  'residential', 'apartment', 'buy', 3, 11500000.00, '₹1.0Cr - ₹1.25Cr', 1850.00, 'available',
  'Dharampeth', '4th Floor, Shiv Regency, West High Court Road, Dharampeth, Nagpur - 440010',
  21.1441000, 79.0632000,
  '22222222-2222-2222-2222-222222222001',
  ARRAY[
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Lake View', 'Nagpur Metro 800m', '100% Vastu Compliant', 'Italian Marble Flooring', '2 Covered Car Parks', '24/7 Security & CCTV', 'Power Backup'],
  true, 342
),
(
  '44444444-4444-4444-4444-444444444002',
  'Smart 2 BHK Flat near Airport Metro Station',
  'Well-planned 2 BHK apartment in a premium gated complex on Wardha Road. Ideal for IT professionals working at MIHAN SEZ, Infosys, and TCS. 5 minutes to Dr. Babasaheb Ambedkar International Airport.',
  'residential', 'apartment', 'buy', 2, 4800000.00, '₹45L - ₹55L', 1050.00, 'available',
  'Wardha Road', 'Tower B, Orange Heights, Near Chhatrapati Square, Wardha Road, Nagpur - 440015',
  21.0934000, 79.0691000,
  '22222222-2222-2222-2222-222222222002',
  ARRAY[
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['5 Min to Airport', 'Near Aqua Line Metro', 'Clubhouse & Gym', 'Children Play Area', 'Rooftop Solar Lights'],
  true, 289
),
(
  '44444444-4444-4444-4444-444444444003',
  'Stately 4 BHK Independent Villa in Civil Lines',
  'Opulent colonial-style modern bungalow in the serene VIP greenery of Civil Lines. Features private landscaped garden, home theatre room, servant quarters, and solar water heating. Close to High Court.',
  'residential', 'villa', 'buy', 4, 32500000.00, '₹3.0Cr - ₹3.5Cr', 3600.00, 'available',
  'Civil Lines', 'Bungalow No. 12, Palm Avenue, Near Ladies Club, Civil Lines, Nagpur - 440001',
  21.1585000, 79.0718000,
  '22222222-2222-2222-2222-222222222001',
  ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Private Lawn', 'Servant Room', 'Gated VIP Enclave', 'Teak Wood Finishing', 'Solar Powered Grid', 'Rainwater Harvesting'],
  true, 512
),
(
  '44444444-4444-4444-4444-444444444004',
  'Modern 3 BHK Flat in Manish Nagar Beltarodi',
  'Spacious ready-to-move 3 BHK flat with expansive balconies, modern interiors, and high-speed OTIS elevators. Walking distance to schools, markets, and newly inaugurated railway flyover.',
  'residential', 'apartment', 'buy', 3, 6800000.00, '₹65L - ₹75L', 1420.00, 'available',
  'Manish Nagar', 'Flat 302, Sai Vihar Arcade, Beltarodi Main Road, Manish Nagar, Nagpur - 440015',
  21.0975000, 79.0791000,
  '22222222-2222-2222-2222-222222222002',
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Modular Kitchen Included', 'Near D-Mart Besa', 'Covered Car Park', 'Intercom System', 'Borewell & Corporation Water'],
  false, 198
),
(
  '44444444-4444-4444-4444-444444444005',
  'Prime Commercial Showroom on Residency Road Sadar',
  'High-footfall ground floor commercial retail showroom space in the heart of Sadar retail market. Frontage of 35 feet, heavy foot-traffic, dedicated customer parking, and 3-phase commercial electrical line.',
  'commercial', 'apartment', 'buy', null, 24000000.00, '₹2.2Cr - ₹2.5Cr', 2100.00, 'available',
  'Sadar', 'Ground Floor, Sadar Trade Hub, Residency Road, Sadar, Nagpur - 440001',
  21.1631000, 79.0825000,
  '22222222-2222-2222-2222-222222222003',
  ARRAY[
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['35ft Road Frontage', 'High Footfall Zone', 'Customer Parking', 'Central AC Provisions', 'Fire Safety Compliant'],
  true, 430
),
(
  '44444444-4444-4444-4444-444444444006',
  'Affordable 2 BHK Furnished Flat for Rent in Pratap Nagar',
  'Tastefully furnished 2 BHK apartment with sofa, beds, RO water purifier, 42-inch TV, refrigerator, and 1.5-ton split AC. Convenient walking distance to Orange City Hospital and VNIT college gate.',
  'residential', 'apartment', 'rent', 2, 22000.00, '₹20K - ₹25K/mo', 980.00, 'available',
  'Pratap Nagar', 'Flat 201, Shanti Niketan, Near Ring Road Square, Pratap Nagar, Nagpur - 440022',
  21.1205000, 79.0578000,
  '22222222-2222-2222-2222-222222222004',
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Fully Furnished', 'Split AC in Master Bed', 'VNIT College 700m', 'Lift with Power Backup', 'Family/Working Professional Preferred'],
  false, 154
),
(
  '44444444-4444-4444-4444-444444444007',
  'NIT Sanctioned Residential Plot in Besa',
  'Clear title 2400 sqft residential plot with East-North corner orientation inside an established layout with asphalt roads, underground drainage, water connections, and streetlights. Bank loan approved.',
  'residential', 'plot', 'buy', null, 5400000.00, '₹50L - ₹60L', 2400.00, 'available',
  'Besa', 'Plot No. 45, Greenfield Enclave, Near Podar International School, Besa, Nagpur - 440037',
  21.0851000, 79.0894000,
  '22222222-2222-2222-2222-222222222002',
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['NIT Sanctioned', 'Corner Plot (East-North)', '30ft Wide Road', 'Bank Loan Approved (SBI/HDFC)', 'Water & Electricity Connected'],
  false, 187
),
(
  '44444444-4444-4444-4444-444444444008',
  'Premium 3 BHK Flat in Ramdaspeth Medical Hub',
  'High-end 3 BHK flat situated in premier Ramdaspeth, close to Lendra Park and prominent multispecialty hospitals. Features French windows, wooden flooring in master bedroom, and video door phone.',
  'residential', 'apartment', 'buy', 3, 13800000.00, '₹1.25Cr - ₹1.5Cr', 1950.00, 'pending',
  'Ramdaspeth', 'B-wing 5th Floor, Royal Palms, Canal Road, Ramdaspeth, Nagpur - 440010',
  21.1362000, 79.0741000,
  '22222222-2222-2222-2222-222222222001',
  ARRAY[
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Video Door Security', 'Lendra Park 200m', 'Gym & Terrace Garden', '2 Reserved Parking', 'Piped Natural Gas (MGL)'],
  true, 310
),
(
  '44444444-4444-4444-4444-444444444009',
  'Spacious 4 BHK Row House Villa in Trimurti Nagar',
  'Triplex 4 BHK row house with attached terraces, modular kitchen, wooden wardrobes, and private covered porch for SUV. Located in quiet, upscale residential neighborhood near Ring Road.',
  'residential', 'villa', 'buy', 4, 18500000.00, '₹1.75Cr - ₹2.0Cr', 2600.00, 'sold',
  'Trimurti Nagar', 'Row House No. 7, Vasant Enclave, Trimurti Nagar, Nagpur - 440022',
  21.1158000, 79.0512000,
  '22222222-2222-2222-2222-222222222004',
  ARRAY[
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Triplex Architecture', 'Private Terrace Garden', 'SUV Covered Parking', '100% Vastu Approved'],
  false, 412
),
(
  '44444444-4444-4444-4444-444444444010',
  'Ready Commercial Office Space in Sitabuldi Interchange',
  'Furnished 1650 sqft commercial office with reception, conference room, 2 director cabins, 24 workstations, and server room. Located 150m from Sitabuldi Metro Interchange Station.',
  'commercial', 'apartment', 'rent', null, 75000.00, '₹60K - ₹80K/mo', 1650.00, 'available',
  'Sitabuldi', '3rd Floor, Metro Pinnacle Tower, Opposite Zero Mile, Sitabuldi, Nagpur - 440012',
  21.1469000, 79.0842000,
  '22222222-2222-2222-2222-222222222003',
  ARRAY[
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['150m from Metro Interchange', 'Furnished 24 Workstations', 'High Speed Fibre', 'Conference Room with AV', 'Central Air Conditioning'],
  true, 275
),
(
  '44444444-4444-4444-4444-444444444011',
  'Budget 2 BHK Flat for Rent in Somalwada',
  'Semi-furnished 2 BHK apartment with kitchen trolley, fans, lighting, and wardrobe in master bedroom. Quiet society with 24/7 security and municipal water supply. Easy access to airport and Wardha road.',
  'residential', 'apartment', 'rent', 2, 16000.00, '₹15K - ₹20K/mo', 920.00, 'rented',
  'Somalwada', 'Flat 103, Gokul Regency, Wardha Road Bypass, Somalwada, Nagpur - 440025',
  21.0961000, 79.0652000,
  '22222222-2222-2222-2222-222222222004',
  ARRAY[
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Lift Available', 'Corporation Water', '24/7 Security Guard', 'Car Parking', 'Low Maintenance'],
  false, 168
),
(
  '44444444-4444-4444-4444-444444444012',
  'Highway Commercial Land Plot on Hingna Road',
  '12000 sqft commercial/industrial plot with direct 100ft road frontage on Hingna Main Road. Prime location suitable for automobile showroom, warehouse, hospital, or institutional building.',
  'commercial', 'land', 'buy', null, 42000000.00, '₹4.0Cr - ₹4.5Cr', 12000.00, 'available',
  'Hingna Road', 'Survey No. 88, Near Lata Mangeshkar Hospital, Hingna Road, Nagpur - 440016',
  21.1085000, 79.0142000,
  '22222222-2222-2222-2222-222222222003',
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['100ft Highway Frontage', 'MIDC Non-Agricultural (NA) Order', 'Water & High Tension Power', 'Heavy Vehicle Access'],
  false, 219
)
ON CONFLICT (id) DO NOTHING;

-- 5. FAVORITES
INSERT INTO public.favorites (customer_id, property_id) VALUES
('33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444001'),
('33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444008'),
('33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444002'),
('33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444004'),
('33333333-3333-3333-3333-333333333003', '44444444-4444-4444-4444-444444444003')
ON CONFLICT DO NOTHING;

-- 6. INQUIRIES
INSERT INTO public.inquiries (id, customer_id, property_id, agent_id, message, status, agent_reply, created_at) VALUES
(
  '55555555-5555-5555-5555-555555555001',
  '33333333-3333-3333-3333-333333333001',
  '44444444-4444-4444-4444-444444444001',
  '22222222-2222-2222-2222-222222222001',
  'Hello Amit ji, is the price for the Dharampeth 3 BHK flat negotiable? Also wanted to know if SBI home loan is sanctioned for this building.',
  'in_progress',
  'Namaste Priya ji! Yes, SBI and HDFC both have approved project files. There is a slight negotiation possible on spot token. When would you like to visit?',
  NOW() - INTERVAL '1 day'
),
(
  '55555555-5555-5555-5555-555555555002',
  '33333333-3333-3333-3333-333333333002',
  '44444444-4444-4444-4444-444444444002',
  '22222222-2222-2222-2222-222222222002',
  'Hi Sneha, does this Wardha Road 2 BHK flat have covered parking for 4-wheelers? What is the maintenance charge per month?',
  'new',
  null,
  NOW() - INTERVAL '4 hours'
);

-- 7. VISIT REQUESTS
INSERT INTO public.visit_requests (id, customer_id, property_id, agent_id, scheduled_date, time_slot, status, notes) VALUES
(
  '66666666-6666-6666-6666-666666666001',
  '33333333-3333-3333-3333-333333333001',
  '44444444-4444-4444-4444-444444444001',
  '22222222-2222-2222-2222-222222222001',
  CURRENT_DATE + INTERVAL '1 day',
  '11:00 AM - 12:30 PM',
  'confirmed',
  'Customer will arrive with family for inspection of the balcony view and parking bay.'
),
(
  '66666666-6666-6666-6666-666666666002',
  '33333333-3333-3333-3333-333333333003',
  '44444444-4444-4444-4444-444444444003',
  '22222222-2222-2222-2222-222222222001',
  CURRENT_DATE + INTERVAL '2 days',
  '04:30 PM - 06:00 PM',
  'pending',
  'Client requested weekend site visit to check the private garden and neighborhood layout.'
);

-- 8. PROPERTY VIEWS (Demonstrating 48-72h views for the automated follow-up engine)
INSERT INTO public.property_views (id, customer_id, property_id, viewed_at) VALUES
-- View 52 hours ago: Priya viewed Ramdaspeth flat with NO inquiry or visit -> triggers follow-up!
('77777777-7777-7777-7777-777777777001', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444008', NOW() - INTERVAL '52 hours'),
-- View 58 hours ago: Rahul viewed Manish Nagar 3 BHK with NO inquiry or visit -> triggers follow-up!
('77777777-7777-7777-7777-777777777002', '33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444004', NOW() - INTERVAL '58 hours'),
-- Recent view 3 hours ago: Sunita viewed Civil Lines Villa
('77777777-7777-7777-7777-777777777003', '33333333-3333-3333-3333-333333333003', '44444444-4444-4444-4444-444444444003', NOW() - INTERVAL '3 hours');

-- 9. FOLLOW-UPS (Initial seeded follow-up record)
INSERT INTO public.follow_ups (id, customer_id, property_id, triggered_at, status, notified_admin, notified_customer, resolution_notes) VALUES
(
  '88888888-8888-8888-8888-888888888001',
  '33333333-3333-3333-3333-333333333001',
  '44444444-4444-4444-4444-444444444008',
  NOW() - INTERVAL '4 hours',
  'pending',
  true,
  true,
  'Automated follow-up triggered: Customer viewed 3 BHK in Ramdaspeth 52h ago without scheduling a visit.'
);

-- 10. NOTIFICATIONS
-- We can add standard sample notification records
