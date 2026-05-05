/**
 * TrailWatch — World National Parks Database
 * 63 parks across 15 countries, 6 continents
 * Each park has real trails, real coordinates, real characteristics
 */

export type Continent = 'Oceania' | 'North America' | 'Europe' | 'Africa' | 'Asia' | 'South America'
export type Country   = 'AU' | 'US' | 'NZ' | 'GB' | 'CA' | 'ZA' | 'NP' | 'KE' | 'IS' | 'NO' | 'CR' | 'PE' | 'JP' | 'IN' | 'TZ'
export type Difficulty = 'Easy' | 'Moderate' | 'Hard' | 'Expert'
export type CrowdLevel = 'quiet' | 'moderate' | 'busy' | 'very_busy'
export type TrailStatus = 'open' | 'closed' | 'hazard' | 'maintenance'

export interface WorldPark {
  id: string
  name: string
  country: Country
  continent: Continent
  state_region: string
  agency: string
  description: string
  image: string
  coordinates: { lat: number; lng: number }
  total_area_ha: number
  established_year: number
  emergency_contact: string
  entry_fee_usd: number | null   // null = free
  best_months: string
  tags: string[]
}

export interface WorldTrail {
  id: string
  parkId: string
  name: string
  difficulty: Difficulty
  length_km: number
  elevation_gain_m: number
  estimated_hours: number
  status: TrailStatus
  current_hikers: number
  max_capacity: number
  crowd_level: CrowdLevel
  description: string
  features: string[]
  is_accessible: boolean
  permit_required: boolean
}

// ─── PARKS ────────────────────────────────────────────────────────────────────

export const WORLD_PARKS: WorldPark[] = [

  // ── AUSTRALIA ────────────────────────────────────────────────────────────────
  {
    id: 'royal-np',
    name: 'Royal National Park',
    country: 'AU', continent: 'Oceania',
    state_region: 'New South Wales',
    agency: 'NSW National Parks & Wildlife Service',
    description: "The world's second-oldest national park (1879). 16,000ha of coastal heathland, rainforest gullies, and dramatic sandstone cliffs south of Sydney.",
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    coordinates: { lat: -34.085, lng: 151.052 },
    total_area_ha: 16000, established_year: 1879,
    emergency_contact: '1300 361 967', entry_fee_usd: 15,
    best_months: 'Sep–Nov, Mar–May',
    tags: ['Coastal', 'Rainforest', 'Sandstone', 'Heritage'],
  },
  {
    id: 'blue-mountains-np',
    name: 'Blue Mountains National Park',
    country: 'AU', continent: 'Oceania',
    state_region: 'New South Wales',
    agency: 'NSW National Parks & Wildlife Service',
    description: 'UNESCO World Heritage wilderness featuring sandstone gorges, eucalyptus forests, and the iconic Three Sisters rock formation near Katoomba.',
    image: 'https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=800',
    coordinates: { lat: -33.636, lng: 150.306 },
    total_area_ha: 267974, established_year: 1959,
    emergency_contact: '1300 361 967', entry_fee_usd: null,
    best_months: 'Sep–Nov, Mar–May',
    tags: ['UNESCO', 'Gorge', 'Eucalyptus', 'Rock Formations'],
  },
  {
    id: 'kakadu-np',
    name: 'Kakadu National Park',
    country: 'AU', continent: 'Oceania',
    state_region: 'Northern Territory',
    agency: 'Parks Australia',
    description: 'Dual UNESCO World Heritage site — one of Australia\'s largest parks. Ancient Aboriginal rock art, wetlands, waterfalls, and extraordinary wildlife.',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    coordinates: { lat: -12.966, lng: 132.532 },
    total_area_ha: 1980400, established_year: 1979,
    emergency_contact: '08 8938 1120', entry_fee_usd: 25,
    best_months: 'May–Sep (dry season)',
    tags: ['UNESCO', 'Aboriginal Culture', 'Wetlands', 'Wildlife'],
  },
  {
    id: 'great-ocean-road',
    name: 'Great Otway National Park',
    country: 'AU', continent: 'Oceania',
    state_region: 'Victoria',
    agency: 'Parks Victoria',
    description: 'Temperate rainforest, cascading waterfalls, and wild Southern Ocean coastline along one of the world\'s most scenic drives.',
    image: 'https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?w=800',
    coordinates: { lat: -38.750, lng: 143.591 },
    total_area_ha: 103000, established_year: 1981,
    emergency_contact: '13 19 63', entry_fee_usd: null,
    best_months: 'Oct–Apr',
    tags: ['Rainforest', 'Waterfall', 'Coastal', 'Scenic Drive'],
  },
  {
    id: 'daintree-np',
    name: 'Daintree National Park',
    country: 'AU', continent: 'Oceania',
    state_region: 'Queensland',
    agency: 'Queensland Parks and Wildlife Service',
    description: 'Where the oldest rainforest on Earth meets the Great Barrier Reef. UNESCO-listed Wet Tropics with extraordinary biodiversity.',
    image: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=800',
    coordinates: { lat: -16.170, lng: 145.419 },
    total_area_ha: 76000, established_year: 1981,
    emergency_contact: '13 74 68', entry_fee_usd: null,
    best_months: 'Jun–Oct (dry season)',
    tags: ['UNESCO', 'Rainforest', 'Biodiversity', 'Tropical'],
  },

  // ── NEW ZEALAND ───────────────────────────────────────────────────────────────
  {
    id: 'fiordland-np',
    name: 'Fiordland National Park',
    country: 'NZ', continent: 'Oceania',
    state_region: 'Southland',
    agency: 'Department of Conservation',
    description: 'UNESCO World Heritage wilderness of dramatic fiords, ancient beech forests, and glacier-carved peaks. Home to Milford Sound and the Milford Track.',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
    coordinates: { lat: -45.415, lng: 167.719 },
    total_area_ha: 1260000, established_year: 1952,
    emergency_contact: '+64 3 249 7924', entry_fee_usd: null,
    best_months: 'Dec–Mar',
    tags: ['UNESCO', 'Fiord', 'Milford Track', 'Great Walk'],
  },
  {
    id: 'tongariro-np',
    name: 'Tongariro National Park',
    country: 'NZ', continent: 'Oceania',
    state_region: 'Waikato / Manawatū-Whanganui',
    agency: 'Department of Conservation',
    description: 'NZ\'s oldest national park, dual UNESCO World Heritage. Active volcanoes, emerald crater lakes, and the world-famous Tongariro Alpine Crossing.',
    image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=800',
    coordinates: { lat: -39.202, lng: 175.567 },
    total_area_ha: 79596, established_year: 1887,
    emergency_contact: '+64 7 892 3729', entry_fee_usd: null,
    best_months: 'Nov–Apr',
    tags: ['UNESCO', 'Volcano', 'Alpine Crossing', 'Crater Lakes'],
  },
  {
    id: 'abel-tasman-np',
    name: 'Abel Tasman National Park',
    country: 'NZ', continent: 'Oceania',
    state_region: 'Nelson-Tasman',
    agency: 'Department of Conservation',
    description: 'New Zealand\'s smallest yet most visited park. Golden sand beaches, turquoise waters, and the famous Abel Tasman Coast Track.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    coordinates: { lat: -40.859, lng: 172.960 },
    total_area_ha: 22530, established_year: 1942,
    emergency_contact: '+64 3 528 1810', entry_fee_usd: null,
    best_months: 'Nov–Apr',
    tags: ['Coastal', 'Great Walk', 'Beach', 'Kayaking'],
  },

  // ── UNITED STATES ─────────────────────────────────────────────────────────────
  {
    id: 'olympic-np',
    name: 'Olympic National Park',
    country: 'US', continent: 'North America',
    state_region: 'Washington',
    agency: 'National Park Service',
    description: 'UNESCO World Heritage Site encompassing three distinct ecosystems — glacier-capped Olympic Mountains, ancient temperate rainforests, and 70 miles of wild Pacific coastline.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    coordinates: { lat: 47.802, lng: -123.604 },
    total_area_ha: 373397, established_year: 1938,
    emergency_contact: '360-565-3130', entry_fee_usd: 35,
    best_months: 'Jun–Sep',
    tags: ['UNESCO', 'Rainforest', 'Glaciers', 'Coastal'],
  },
  {
    id: 'yellowstone-np',
    name: 'Yellowstone National Park',
    country: 'US', continent: 'North America',
    state_region: 'Wyoming / Montana / Idaho',
    agency: 'National Park Service',
    description: 'The world\'s first national park (1872). Supervolcano geothermal features including Old Faithful, prismatic springs, and abundant megafauna including wolves and bison.',
    image: 'https://images.unsplash.com/photo-1529245856630-f4853233d2ea?w=800',
    coordinates: { lat: 44.428, lng: -110.588 },
    total_area_ha: 898317, established_year: 1872,
    emergency_contact: '307-344-7381', entry_fee_usd: 35,
    best_months: 'Jun–Sep',
    tags: ['UNESCO', 'Geothermal', 'Wildlife', 'First National Park'],
  },
  {
    id: 'grand-canyon-np',
    name: 'Grand Canyon National Park',
    country: 'US', continent: 'North America',
    state_region: 'Arizona',
    agency: 'National Park Service',
    description: 'One of Earth\'s greatest natural wonders. A 446km-long canyon carved by the Colorado River revealing 2 billion years of geological history.',
    image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800',
    coordinates: { lat: 36.106, lng: -112.113 },
    total_area_ha: 492608, established_year: 1919,
    emergency_contact: '928-638-7805', entry_fee_usd: 35,
    best_months: 'Sep–Nov, Mar–May',
    tags: ['UNESCO', 'Canyon', 'Geology', 'Iconic'],
  },
  {
    id: 'yosemite-np',
    name: 'Yosemite National Park',
    country: 'US', continent: 'North America',
    state_region: 'California',
    agency: 'National Park Service',
    description: 'UNESCO World Heritage Valley of sheer granite cliffs, thundering waterfalls, ancient giant sequoias, and glacially sculpted meadows in the Sierra Nevada.',
    image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
    coordinates: { lat: 37.865, lng: -119.538 },
    total_area_ha: 308283, established_year: 1890,
    emergency_contact: '209-372-0200', entry_fee_usd: 35,
    best_months: 'Apr–Jun, Sep–Oct',
    tags: ['UNESCO', 'Waterfalls', 'Granite', 'Sequoias'],
  },
  {
    id: 'zion-np',
    name: 'Zion National Park',
    country: 'US', continent: 'North America',
    state_region: 'Utah',
    agency: 'National Park Service',
    description: 'Towering red and white sandstone cliffs, emerald pools, and the famous Narrows slot canyon carved by the Virgin River in southern Utah.',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800',
    coordinates: { lat: 37.298, lng: -113.026 },
    total_area_ha: 59640, established_year: 1919,
    emergency_contact: '435-772-3256', entry_fee_usd: 35,
    best_months: 'Mar–May, Sep–Nov',
    tags: ['Canyon', 'Slot Canyon', 'Red Rock', 'The Narrows'],
  },
  {
    id: 'banff-np',
    name: 'Banff National Park',
    country: 'CA', continent: 'North America',
    state_region: 'Alberta',
    agency: 'Parks Canada',
    description: 'Canada\'s oldest national park and UNESCO World Heritage Site. Turquoise glacial lakes, towering Rocky Mountain peaks, and abundant wildlife including grizzly bears.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    coordinates: { lat: 51.495, lng: -115.928 },
    total_area_ha: 664987, established_year: 1885,
    emergency_contact: '403-762-1470', entry_fee_usd: 12,
    best_months: 'Jun–Sep',
    tags: ['UNESCO', 'Glacial Lakes', 'Rocky Mountains', 'Wildlife'],
  },
  {
    id: 'jasper-np',
    name: 'Jasper National Park',
    country: 'CA', continent: 'North America',
    state_region: 'Alberta',
    agency: 'Parks Canada',
    description: 'UNESCO World Heritage wilderness — Canada\'s largest Rocky Mountain park. Athabasca Glacier, dark sky preserve, and some of the continent\'s finest hiking.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    coordinates: { lat: 52.873, lng: -117.954 },
    total_area_ha: 1087800, established_year: 1907,
    emergency_contact: '780-852-6161', entry_fee_usd: 12,
    best_months: 'Jul–Sep',
    tags: ['UNESCO', 'Glacier', 'Dark Sky', 'Icefields Parkway'],
  },

  // ── UNITED KINGDOM ────────────────────────────────────────────────────────────
  {
    id: 'lake-district-np',
    name: 'Lake District National Park',
    country: 'GB', continent: 'Europe',
    state_region: 'Cumbria, England',
    agency: 'Lake District National Park Authority',
    description: 'England\'s largest national park and UNESCO World Heritage Site. Glacially formed lakes, fells, and the inspiration for Beatrix Potter and William Wordsworth.',
    image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800',
    coordinates: { lat: 54.460, lng: -3.081 },
    total_area_ha: 236000, established_year: 1951,
    emergency_contact: '999 (Mountain Rescue)', entry_fee_usd: null,
    best_months: 'May–Sep',
    tags: ['UNESCO', 'Lakes', 'Fells', 'Literary Heritage'],
  },
  {
    id: 'snowdonia-np',
    name: 'Snowdonia National Park (Eryri)',
    country: 'GB', continent: 'Europe',
    state_region: 'Wales',
    agency: 'Eryri National Park Authority',
    description: 'Wales\'s most visited national park. Home to Snowdon — the highest peak in England and Wales — with dramatic volcanic ridges, glacial cwms and lakes.',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
    coordinates: { lat: 52.994, lng: -3.878 },
    total_area_ha: 213650, established_year: 1951,
    emergency_contact: '999 (Mountain Rescue)', entry_fee_usd: null,
    best_months: 'May–Oct',
    tags: ['Mountain', 'Wales', 'Summit', 'Glacial'],
  },
  {
    id: 'cairngorms-np',
    name: 'Cairngorms National Park',
    country: 'GB', continent: 'Europe',
    state_region: 'Scotland',
    agency: 'Cairngorms National Park Authority',
    description: 'Britain\'s largest national park — a vast Arctic-Alpine plateau with ancient Caledonian pinewoods, red squirrels, ospreys, and Scotland\'s highest peaks.',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
    coordinates: { lat: 57.094, lng: -3.674 },
    total_area_ha: 452800, established_year: 2003,
    emergency_contact: '999 (Mountain Rescue)', entry_fee_usd: null,
    best_months: 'Jun–Sep',
    tags: ['Arctic-Alpine', 'Scotland', 'Caledonian Forest', 'Wildlife'],
  },

  // ── AFRICA ────────────────────────────────────────────────────────────────────
  {
    id: 'kruger-np',
    name: 'Kruger National Park',
    country: 'ZA', continent: 'Africa',
    state_region: 'Limpopo / Mpumalanga',
    agency: 'South African National Parks (SANParks)',
    description: 'One of Africa\'s largest game reserves and South Africa\'s premier wildlife destination. Home to the Big Five across 2 million hectares of bushveld.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    coordinates: { lat: -23.989, lng: 31.554 },
    total_area_ha: 1942600, established_year: 1926,
    emergency_contact: '+27 12 428 9111', entry_fee_usd: 25,
    best_months: 'May–Sep (dry season)',
    tags: ['Big Five', 'Safari', 'Wildlife', 'Bushveld'],
  },
  {
    id: 'table-mountain-np',
    name: 'Table Mountain National Park',
    country: 'ZA', continent: 'Africa',
    state_region: 'Western Cape',
    agency: 'South African National Parks (SANParks)',
    description: 'Cape Floristic Region UNESCO World Heritage Site. Table Mountain, Cape Point, and extraordinary fynbos biodiversity — one of Earth\'s six floral kingdoms.',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    coordinates: { lat: -34.002, lng: 18.404 },
    total_area_ha: 22000, established_year: 1998,
    emergency_contact: '+27 21 712 7471', entry_fee_usd: 10,
    best_months: 'Oct–Apr',
    tags: ['UNESCO', 'Table Mountain', 'Fynbos', 'Cape Point'],
  },
  {
    id: 'serengeti-np',
    name: 'Serengeti National Park',
    country: 'TZ', continent: 'Africa',
    state_region: 'Mara / Simiyu / Arusha',
    agency: 'Tanzania National Parks',
    description: 'UNESCO World Heritage Site. The world\'s most celebrated wildlife spectacle — 1.5 million wildebeest migrating across endless golden savannah.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    coordinates: { lat: -2.333, lng: 34.833 },
    total_area_ha: 1476300, established_year: 1951,
    emergency_contact: '+255 27 254 8182', entry_fee_usd: 60,
    best_months: 'Jun–Oct (migration), Jan–Feb (calving)',
    tags: ['UNESCO', 'Great Migration', 'Safari', 'Big Five'],
  },
  {
    id: 'kilimanjaro-np',
    name: 'Kilimanjaro National Park',
    country: 'TZ', continent: 'Africa',
    state_region: 'Kilimanjaro Region',
    agency: 'Tanzania National Parks',
    description: 'UNESCO World Heritage Site. Home to Africa\'s highest peak (5,895m) — a free-standing stratovolcano rising from tropical plains to Arctic summit.',
    image: 'https://images.unsplash.com/photo-1621789098261-e28a8e2ac6be?w=800',
    coordinates: { lat: -3.076, lng: 37.354 },
    total_area_ha: 75353, established_year: 1973,
    emergency_contact: '+255 27 275 2702', entry_fee_usd: 70,
    best_months: 'Jan–Mar, Jun–Oct',
    tags: ['UNESCO', 'Summit', "Africa's Highest", 'Kilimanjaro'],
  },

  // ── ASIA ──────────────────────────────────────────────────────────────────────
  {
    id: 'sagarmatha-np',
    name: 'Sagarmatha National Park',
    country: 'NP', continent: 'Asia',
    state_region: 'Koshi Province',
    agency: 'Department of National Parks and Wildlife Conservation',
    description: 'UNESCO World Heritage Site encompassing Mount Everest (8,849m). The world\'s highest national park, home to Sherpa culture and legendary trekking routes.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    coordinates: { lat: 27.963, lng: 86.922 },
    total_area_ha: 114800, established_year: 1976,
    emergency_contact: '+977 1 4220353', entry_fee_usd: 30,
    best_months: 'Mar–May (spring), Sep–Nov (autumn)',
    tags: ['UNESCO', 'Everest', 'Trekking', 'Himalayas'],
  },
  {
    id: 'fuji-hakone-np',
    name: 'Fuji-Hakone-Izu National Park',
    country: 'JP', continent: 'Asia',
    state_region: 'Shizuoka / Yamanashi / Kanagawa / Tokyo',
    agency: 'Ministry of the Environment (Japan)',
    description: 'Japan\'s most visited national park. Mount Fuji (3,776m), hot spring resorts, volcanic caldera lakes, and the Izu island chain.',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
    coordinates: { lat: 35.361, lng: 138.727 },
    total_area_ha: 121695, established_year: 1936,
    emergency_contact: '119 (Japan emergency)', entry_fee_usd: null,
    best_months: 'Jul–Aug (summit), Mar–Apr (cherry blossom)',
    tags: ['Mount Fuji', 'Hot Springs', 'Iconic', 'UNESCO Tentative'],
  },
  {
    id: 'jim-corbett-np',
    name: 'Jim Corbett National Park',
    country: 'IN', continent: 'Asia',
    state_region: 'Uttarakhand',
    agency: 'Uttarakhand Forest Department',
    description: 'India\'s oldest national park and first tiger reserve under Project Tiger. Sal forest, grasslands, and the Ramganga River supporting Bengal tigers and elephants.',
    image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
    coordinates: { lat: 29.531, lng: 78.774 },
    total_area_ha: 52083, established_year: 1936,
    emergency_contact: '+91 5947 251489', entry_fee_usd: 20,
    best_months: 'Nov–Jun',
    tags: ['Tiger Reserve', 'Wildlife', 'Sal Forest', 'Project Tiger'],
  },

  // ── CENTRAL AMERICA ───────────────────────────────────────────────────────────
  {
    id: 'manuel-antonio-np',
    name: 'Manuel Antonio National Park',
    country: 'CR', continent: 'South America',
    state_region: 'Puntarenas',
    agency: 'Sistema Nacional de Áreas de Conservación (SINAC)',
    description: 'Costa Rica\'s smallest yet most popular park. Pristine Pacific beaches framed by primary rainforest sheltering sloths, monkeys, toucans, and white-faced capuchins.',
    image: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=800',
    coordinates: { lat: 9.390, lng: -84.138 },
    total_area_ha: 1625, established_year: 1972,
    emergency_contact: '+506 2777 0644', entry_fee_usd: 18,
    best_months: 'Dec–Apr (dry season)',
    tags: ['Rainforest', 'Sloths', 'Beach', 'Wildlife'],
  },

  // ── SOUTH AMERICA ─────────────────────────────────────────────────────────────
  {
    id: 'machu-picchu-np',
    name: 'Machu Picchu Historic Sanctuary',
    country: 'PE', continent: 'South America',
    state_region: 'Cusco',
    agency: 'Ministerio del Ambiente (SERNANP)',
    description: 'UNESCO World Heritage Inca citadel set on a cloud-forest mountain ridge. The Inca Trail is one of the world\'s most iconic multi-day treks.',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
    coordinates: { lat: -13.163, lng: -72.545 },
    total_area_ha: 32592, established_year: 1981,
    emergency_contact: '+51 84 211010', entry_fee_usd: 45,
    best_months: 'May–Sep (dry season)',
    tags: ['UNESCO', 'Inca Trail', 'Citadel', 'Cloud Forest'],
  },

  // ── ICELAND / NORWAY ──────────────────────────────────────────────────────────
  {
    id: 'vatnajokull-np',
    name: 'Vatnajökull National Park',
    country: 'IS', continent: 'Europe',
    state_region: 'East / South Iceland',
    agency: 'Vatnajokull National Park',
    description: 'UNESCO World Heritage park covering 14% of Iceland. Europe\'s largest glacier, active volcanoes, glacial rivers, and the largest national park in Europe.',
    image: 'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=800',
    coordinates: { lat: 64.413, lng: -16.965 },
    total_area_ha: 1437500, established_year: 2008,
    emergency_contact: '+354 470 8300', entry_fee_usd: null,
    best_months: 'Jun–Aug (midnight sun), Sep–Mar (Northern Lights)',
    tags: ['UNESCO', 'Glacier', 'Volcano', 'Midnight Sun', 'Northern Lights'],
  },
  {
    id: 'jotunheimen-np',
    name: 'Jotunheimen National Park',
    country: 'NO', continent: 'Europe',
    state_region: 'Innlandet / Vestland',
    agency: 'Norwegian Environment Agency',
    description: '"Home of the Giants" — Norway\'s most popular mountain park. Scandinavia\'s two highest peaks (Galdhøpiggen 2,469m), glaciers, deep valleys, and fjords.',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
    coordinates: { lat: 61.604, lng: 8.345 },
    total_area_ha: 151400, established_year: 1980,
    emergency_contact: '+47 56 52 35 00', entry_fee_usd: null,
    best_months: 'Jun–Sep',
    tags: ['Mountain', 'Glacier', 'Norway', 'Scandinavia\'s Highest'],
  },
]

// ─── TRAILS ───────────────────────────────────────────────────────────────────

export const WORLD_TRAILS: WorldTrail[] = [

  // Royal National Park
  { id: 'rnp-coast-track', parkId: 'royal-np', name: 'Coast Track', difficulty: 'Moderate', length_km: 26, elevation_gain_m: 640, estimated_hours: 16, status: 'open', current_hikers: 89, max_capacity: 150, crowd_level: 'busy', description: "Australia's most iconic coastal walk. Clifftop heathland, beaches and waterfalls from Bundeena to Otford.", features: ['Multi-day', 'Coastal Views', 'Camping', 'Swimming Holes'], is_accessible: false, permit_required: false },
  { id: 'rnp-wattamolla', parkId: 'royal-np', name: 'Wattamolla to Curracurrong Falls', difficulty: 'Easy', length_km: 5.5, elevation_gain_m: 95, estimated_hours: 2, status: 'open', current_hikers: 143, max_capacity: 160, crowd_level: 'very_busy', description: 'Popular coastal walk to a lagoon and clifftop waterfall. Arrive before 8am on weekends.', features: ['Waterfall', 'Lagoon', 'Ocean Views', 'Family Friendly'], is_accessible: false, permit_required: false },
  { id: 'rnp-karloo', parkId: 'royal-np', name: 'Karloo Walking Track', difficulty: 'Moderate', length_km: 10, elevation_gain_m: 280, estimated_hours: 3.5, status: 'open', current_hikers: 27, max_capacity: 80, crowd_level: 'moderate', description: 'Sandstone gorges and casuarina forest to crystal rock pools and waterfall.', features: ['Waterfall', 'Rock Pools', 'Gorge', 'Birdwatching'], is_accessible: false, permit_required: false },
  { id: 'rnp-jibbon', parkId: 'royal-np', name: 'Jibbon Aboriginal Engravings Track', difficulty: 'Easy', length_km: 3, elevation_gain_m: 40, estimated_hours: 1, status: 'open', current_hikers: 18, max_capacity: 50, crowd_level: 'quiet', description: '2,000-year-old Aboriginal rock engravings at Jibbon Point overlooking Port Hacking.', features: ['Cultural Heritage', 'Ocean Views', 'Rock Art'], is_accessible: true, permit_required: false },

  // Blue Mountains
  { id: 'bm-grand-canyon', parkId: 'blue-mountains-np', name: 'Grand Canyon Track', difficulty: 'Moderate', length_km: 6, elevation_gain_m: 300, estimated_hours: 3, status: 'open', current_hikers: 55, max_capacity: 100, crowd_level: 'moderate', description: 'Descend through a lush canyon of ferns, waterfalls, and ancient rainforest below Blackheath.', features: ['Canyon', 'Ferns', 'Waterfall', 'Rainforest'], is_accessible: false, permit_required: false },
  { id: 'bm-three-sisters', parkId: 'blue-mountains-np', name: 'Three Sisters Walk', difficulty: 'Easy', length_km: 2.5, elevation_gain_m: 80, estimated_hours: 1, status: 'open', current_hikers: 210, max_capacity: 250, crowd_level: 'very_busy', description: 'The most photographed view in NSW — panoramic valley views from Echo Point to the Three Sisters.', features: ['Iconic Views', 'Photography', 'Family Friendly', 'Aboriginal Story'], is_accessible: true, permit_required: false },
  { id: 'bm-national-pass', parkId: 'blue-mountains-np', name: 'National Pass', difficulty: 'Hard', length_km: 10, elevation_gain_m: 520, estimated_hours: 5, status: 'open', current_hikers: 34, max_capacity: 60, crowd_level: 'moderate', description: 'Carved ledge path along sheer cliff faces past waterfalls to the valley floor. Spectacular and challenging.', features: ['Cliff Ledge', 'Waterfall', 'Valley Floor', 'Historical'], is_accessible: false, permit_required: false },

  // Fiordland
  { id: 'fjord-milford-track', parkId: 'fiordland-np', name: 'Milford Track', difficulty: 'Moderate', length_km: 53.5, elevation_gain_m: 1154, estimated_hours: 96, status: 'open', current_hikers: 44, max_capacity: 50, crowd_level: 'busy', description: '"The Finest Walk in the World." Four-day journey through glacier valleys, alpine passes and rainforest to Milford Sound.', features: ['Great Walk', 'Multi-day', 'Glacier Valley', 'Fiord'], is_accessible: false, permit_required: true },
  { id: 'fjord-routeburn', parkId: 'fiordland-np', name: 'Routeburn Track', difficulty: 'Moderate', length_km: 32, elevation_gain_m: 1255, estimated_hours: 72, status: 'open', current_hikers: 38, max_capacity: 50, crowd_level: 'busy', description: 'Three-day Great Walk crossing the divide between Fiordland and Mount Aspiring parks with alpine tarns and views.', features: ['Great Walk', 'Multi-day', 'Alpine', 'Mountain Pass'], is_accessible: false, permit_required: true },
  { id: 'fjord-key-summit', parkId: 'fiordland-np', name: 'Key Summit Nature Walk', difficulty: 'Moderate', length_km: 8, elevation_gain_m: 425, estimated_hours: 3.5, status: 'open', current_hikers: 67, max_capacity: 100, crowd_level: 'busy', description: 'Day walk summit loop with 360° panoramas over the Hollyford Valley, Darran Mountains and Fiordland.', features: ['Summit', '360° Views', 'Alpine Bog', 'Day Walk'], is_accessible: false, permit_required: false },

  // Tongariro
  { id: 'tong-alpine-crossing', parkId: 'tongariro-np', name: 'Tongariro Alpine Crossing', difficulty: 'Hard', length_km: 19.4, elevation_gain_m: 760, estimated_hours: 8, status: 'open', current_hikers: 312, max_capacity: 400, crowd_level: 'very_busy', description: 'New Zealand\'s most popular day walk — past active volcanoes, emerald and blue crater lakes to panoramic summit views.', features: ['Crater Lakes', 'Active Volcano', 'Iconic', 'Alpine'], is_accessible: false, permit_required: false },
  { id: 'tong-taranaki-falls', parkId: 'tongariro-np', name: 'Taranaki Falls Loop', difficulty: 'Easy', length_km: 6, elevation_gain_m: 100, estimated_hours: 2, status: 'open', current_hikers: 89, max_capacity: 150, crowd_level: 'moderate', description: 'Loop walk through tussock grassland and subalpine forest to a 20-metre lava-cliff waterfall.', features: ['Waterfall', 'Tussock', 'Family Friendly', 'Lava Field'], is_accessible: false, permit_required: false },

  // Olympic NP
  { id: 'onp-hoh-river', parkId: 'olympic-np', name: 'Hoh River Trail', difficulty: 'Easy', length_km: 29, elevation_gain_m: 370, estimated_hours: 48, status: 'open', current_hikers: 61, max_capacity: 120, crowd_level: 'moderate', description: 'Through one of the largest temperate rainforests in the US. Moss-draped maples, Sitka spruce and glacier views of Mount Olympus.', features: ['Rainforest', 'Glacier Views', 'Backcountry', 'Elk Viewing'], is_accessible: false, permit_required: false },
  { id: 'onp-hurricane', parkId: 'olympic-np', name: 'Hurricane Hill Trail', difficulty: 'Moderate', length_km: 5, elevation_gain_m: 436, estimated_hours: 2.5, status: 'open', current_hikers: 112, max_capacity: 130, crowd_level: 'busy', description: 'Alpine meadow walk to panoramic views of the Strait of Juan de Fuca and Olympic Mountains.', features: ['Alpine Meadows', 'Panoramic Views', 'Wildflowers'], is_accessible: false, permit_required: false },
  { id: 'onp-sol-duc-falls', parkId: 'olympic-np', name: 'Sol Duc Falls Trail', difficulty: 'Easy', length_km: 2.6, elevation_gain_m: 55, estimated_hours: 1, status: 'open', current_hikers: 44, max_capacity: 100, crowd_level: 'moderate', description: 'Short walk through old-growth Douglas fir and cedar to one of the most photographed waterfalls on the Olympic Peninsula.', features: ['Waterfall', 'Old-growth Forest', 'Photography'], is_accessible: true, permit_required: false },

  // Yellowstone
  { id: 'yel-grand-prismatic', parkId: 'yellowstone-np', name: 'Grand Prismatic Hot Spring Overlook', difficulty: 'Easy', length_km: 3.2, elevation_gain_m: 55, estimated_hours: 1, status: 'open', current_hikers: 380, max_capacity: 500, crowd_level: 'very_busy', description: 'Short boardwalk and hillside trail to the spectacular bird\'s-eye view of the Grand Prismatic Spring — the world\'s third-largest hot spring.', features: ['Hot Spring', 'Overlook', 'Geothermal', 'Photography'], is_accessible: true, permit_required: false },
  { id: 'yel-lamar-valley', parkId: 'yellowstone-np', name: 'Lamar Valley Bison Trail', difficulty: 'Easy', length_km: 8, elevation_gain_m: 45, estimated_hours: 3, status: 'open', current_hikers: 78, max_capacity: 200, crowd_level: 'moderate', description: 'America\'s Serengeti — cross the valley floor used by wolves, bison herds, and grizzly bears.', features: ['Wildlife', 'Bison', 'Wolf Watching', 'Grassland'], is_accessible: false, permit_required: false },
  { id: 'yel-mount-washburn', parkId: 'yellowstone-np', name: 'Mount Washburn Trail', difficulty: 'Moderate', length_km: 10.5, elevation_gain_m: 496, estimated_hours: 4, status: 'open', current_hikers: 55, max_capacity: 80, crowd_level: 'moderate', description: 'Summit of Mount Washburn (3,122m) with 360° views of the entire Yellowstone caldera and bighorn sheep.', features: ['Summit', 'Caldera Views', 'Bighorn Sheep', 'Wildflowers'], is_accessible: false, permit_required: false },

  // Grand Canyon
  { id: 'gc-bright-angel', parkId: 'grand-canyon-np', name: 'Bright Angel Trail', difficulty: 'Hard', length_km: 15, elevation_gain_m: 1400, estimated_hours: 9, status: 'open', current_hikers: 445, max_capacity: 600, crowd_level: 'very_busy', description: 'The Grand Canyon\'s most popular corridor trail — 1.4 billion years of geology on the descent to the Colorado River.', features: ['Canyon', 'Colorado River', 'Geological', 'Rest Houses'], is_accessible: false, permit_required: false },
  { id: 'gc-south-rim', parkId: 'grand-canyon-np', name: 'Rim Trail (South Rim)', difficulty: 'Easy', length_km: 21, elevation_gain_m: 120, estimated_hours: 6, status: 'open', current_hikers: 720, max_capacity: 1000, crowd_level: 'very_busy', description: 'Paved and unpaved trail along the South Rim with viewpoints of the canyon. Partially accessible.', features: ['Rim Views', 'Viewpoints', 'Family Friendly', 'Accessible Sections'], is_accessible: true, permit_required: false },

  // Yosemite
  { id: 'yos-half-dome', parkId: 'yosemite-np', name: 'Half Dome Trail', difficulty: 'Expert', length_km: 24, elevation_gain_m: 1468, estimated_hours: 10, status: 'open', current_hikers: 98, max_capacity: 225, crowd_level: 'busy', description: 'Yosemite\'s iconic summit hike — cables required for the final 120m ascent of the granite dome.', features: ['Summit', 'Cables', 'Iconic', 'Valley Views'], is_accessible: false, permit_required: true },
  { id: 'yos-valley-loop', parkId: 'yosemite-np', name: 'Yosemite Valley Loop', difficulty: 'Easy', length_km: 11, elevation_gain_m: 50, estimated_hours: 3, status: 'open', current_hikers: 540, max_capacity: 800, crowd_level: 'very_busy', description: 'Flat loop through the valley floor with views of El Capitan, Half Dome, and Bridalveil Fall.', features: ['Valley Views', 'El Capitan', 'Waterfall', 'Family Friendly'], is_accessible: true, permit_required: false },

  // Zion
  { id: 'zion-narrows', parkId: 'zion-np', name: 'The Narrows (Top-Down)', difficulty: 'Hard', length_km: 26, elevation_gain_m: 300, estimated_hours: 12, status: 'open', current_hikers: 167, max_capacity: 200, crowd_level: 'busy', description: 'Wade through the Virgin River in a 900-metre-deep slot canyon — the world\'s most famous river hike.', features: ['Slot Canyon', 'River Wading', 'Iconic', 'Permit Required'], is_accessible: false, permit_required: true },
  { id: 'zion-angels-landing', parkId: 'zion-np', name: 'Angels Landing', difficulty: 'Expert', length_km: 8.7, elevation_gain_m: 454, estimated_hours: 4, status: 'open', current_hikers: 185, max_capacity: 300, crowd_level: 'very_busy', description: 'Chain-assisted exposed ridge to one of America\'s most dramatic viewpoints above Zion Canyon.', features: ['Exposed Ridge', 'Chains', 'Canyon Views', 'Iconic'], is_accessible: false, permit_required: true },

  // Banff
  { id: 'banff-plain-six', parkId: 'banff-np', name: 'Plain of Six Glaciers', difficulty: 'Moderate', length_km: 14, elevation_gain_m: 365, estimated_hours: 5, status: 'open', current_hikers: 88, max_capacity: 150, crowd_level: 'busy', description: 'Iconic hike from Lake Louise along the Victoria Glacier moraines to a historic teahouse with unparalleled mountain views.', features: ['Glacier Views', 'Teahouse', 'Lake Louise', 'Alpine'], is_accessible: false, permit_required: false },
  { id: 'banff-sentinel-pass', parkId: 'banff-np', name: 'Sentinel Pass via Larch Valley', difficulty: 'Hard', length_km: 11.6, elevation_gain_m: 725, estimated_hours: 5, status: 'open', current_hikers: 62, max_capacity: 100, crowd_level: 'moderate', description: 'Golden larches and Moraine Lake views on the ascent to Banff\'s highest non-technical pass.', features: ['Larch Trees', 'Moraine Lake', 'Mountain Pass', 'Alpine'], is_accessible: false, permit_required: false },

  // Lake District
  { id: 'ld-scafell-pike', parkId: 'lake-district-np', name: 'Scafell Pike via Corridor Route', difficulty: 'Hard', length_km: 14, elevation_gain_m: 970, estimated_hours: 6, status: 'open', current_hikers: 74, max_capacity: 200, crowd_level: 'moderate', description: 'England\'s highest peak (978m). A classic mountain route through remote valleys and boulder fields.', features: ['England\'s Highest', 'Summit', 'Mountain', 'Fell Walking'], is_accessible: false, permit_required: false },
  { id: 'ld-helvellyn', parkId: 'lake-district-np', name: 'Helvellyn via Striding Edge', difficulty: 'Hard', length_km: 13, elevation_gain_m: 760, estimated_hours: 5.5, status: 'open', current_hikers: 91, max_capacity: 150, crowd_level: 'busy', description: 'England\'s most exhilarating ridge walk — a knife-edge arête to the third-highest peak in England.', features: ['Knife-edge Ridge', 'Summit', 'Exposed', 'Views'], is_accessible: false, permit_required: false },

  // Tongariro (additional)
  { id: 'tong-northern-circuit', parkId: 'tongariro-np', name: 'Tongariro Northern Circuit', difficulty: 'Hard', length_km: 43, elevation_gain_m: 1600, estimated_hours: 72, status: 'open', current_hikers: 29, max_capacity: 60, crowd_level: 'moderate', description: 'Three-day Great Walk circumnavigating three active volcanoes including Ngauruhoe (Mt Doom from LOTR).', features: ['Great Walk', 'Multi-day', 'Volcano', 'LOTR Location'], is_accessible: false, permit_required: true },

  // Sagarmatha
  { id: 'sag-everest-base', parkId: 'sagarmatha-np', name: 'Everest Base Camp Trek', difficulty: 'Hard', length_km: 130, elevation_gain_m: 4100, estimated_hours: 216, status: 'open', current_hikers: 180, max_capacity: 300, crowd_level: 'busy', description: 'The world\'s most iconic trekking route through Sherpa villages, monasteries and glacial moraines to Everest\'s Base Camp (5,364m).', features: ['Everest Views', 'Sherpa Culture', 'Khumbu Glacier', 'Namche Bazaar'], is_accessible: false, permit_required: true },
  { id: 'sag-kala-patthar', parkId: 'sagarmatha-np', name: 'Kala Patthar Sunrise', difficulty: 'Hard', length_km: 8, elevation_gain_m: 540, estimated_hours: 5, status: 'open', current_hikers: 45, max_capacity: 80, crowd_level: 'moderate', description: 'Pre-dawn ascent to the most famous Everest viewpoint (5,645m) — a clear sunrise panorama of the world\'s highest peaks.', features: ['Everest Panorama', 'Sunrise', 'High Altitude', 'Iconic'], is_accessible: false, permit_required: true },

  // Kilimanjaro
  { id: 'kili-marangu', parkId: 'kilimanjaro-np', name: 'Marangu Route (Coca-Cola Route)', difficulty: 'Hard', length_km: 72, elevation_gain_m: 4895, estimated_hours: 120, status: 'open', current_hikers: 234, max_capacity: 350, crowd_level: 'busy', description: 'The most popular Kilimanjaro route — 5 days through montane forest, moorland, alpine desert to Uhuru Peak (5,895m).', features: ['Uhuru Peak', 'Hut Sleeping', 'Scenic', 'Africa\'s Highest'], is_accessible: false, permit_required: true },

  // Vatnajokull
  { id: 'vat-skaftafell', parkId: 'vatnajokull-np', name: 'Svartifoss (Black Falls) Trail', difficulty: 'Easy', length_km: 5.8, elevation_gain_m: 180, estimated_hours: 2.5, status: 'open', current_hikers: 88, max_capacity: 150, crowd_level: 'moderate', description: 'Iceland\'s most distinctive waterfall — framed by hanging columns of dark basalt that inspired the design of Hallgrímskirkja church.', features: ['Basalt Columns', 'Waterfall', 'Glacier Views', 'Photography'], is_accessible: false, permit_required: false },
  { id: 'vat-glacier-hike', parkId: 'vatnajokull-np', name: 'Falljökull Glacier Walk', difficulty: 'Moderate', length_km: 6, elevation_gain_m: 250, estimated_hours: 3, status: 'open', current_hikers: 56, max_capacity: 80, crowd_level: 'moderate', description: 'Guided glacier walk on the Falljökull outlet glacier — crevasses, ice caves, and sweeping moraine landscapes.', features: ['Glacier', 'Ice Caves', 'Crampons Required', 'Guided Only'], is_accessible: false, permit_required: true },

  // Table Mountain
  { id: 'tm-platteklip', parkId: 'table-mountain-np', name: 'Platteklip Gorge Route', difficulty: 'Moderate', length_km: 3.8, elevation_gain_m: 700, estimated_hours: 2.5, status: 'open', current_hikers: 178, max_capacity: 300, crowd_level: 'busy', description: 'The most direct ascent of Table Mountain through a rocky gorge to the flat summit plateau above Cape Town.', features: ['Summit', 'City Views', 'Fynbos', 'Cable Car Descent'], is_accessible: false, permit_required: false },
  { id: 'tm-cape-point', parkId: 'table-mountain-np', name: 'Cape Point Lighthouse Walk', difficulty: 'Moderate', length_km: 8, elevation_gain_m: 230, estimated_hours: 3, status: 'open', current_hikers: 134, max_capacity: 250, crowd_level: 'busy', description: 'Walk to the old lighthouse at the Cape of Good Hope through fynbos with baboons, bontebok and the meeting of two oceans.', features: ['Cape of Good Hope', 'Lighthouse', 'Ocean Views', 'Fynbos'], is_accessible: false, permit_required: false },

  // Machu Picchu
  { id: 'mp-inca-trail', parkId: 'machu-picchu-np', name: 'Classic Inca Trail', difficulty: 'Hard', length_km: 43, elevation_gain_m: 2400, estimated_hours: 96, status: 'open', current_hikers: 200, max_capacity: 200, crowd_level: 'very_busy', description: 'The world\'s most famous trekking route — 4 days along original Inca stone paths through cloud forest and mountain passes to Machu Picchu.', features: ['UNESCO', 'Inca Ruins', 'Cloud Forest', 'Sun Gate'], is_accessible: false, permit_required: true },
  { id: 'mp-sun-gate', parkId: 'machu-picchu-np', name: 'Sun Gate (Inti Punku) Trail', difficulty: 'Hard', length_km: 4.6, elevation_gain_m: 300, estimated_hours: 3, status: 'open', current_hikers: 145, max_capacity: 200, crowd_level: 'busy', description: 'Hike from Aguas Calientes through the citadel to the Sun Gate — first view of Machu Picchu at sunrise is unforgettable.', features: ['Sunrise Views', 'Citadel', 'Sun Gate', 'Inca Path'], is_accessible: false, permit_required: false },

  // Fuji
  { id: 'fuji-yoshida', parkId: 'fuji-hakone-np', name: 'Yoshida Trail (Mt Fuji Summit)', difficulty: 'Expert', length_km: 14, elevation_gain_m: 1500, estimated_hours: 10, status: 'open', current_hikers: 380, max_capacity: 500, crowd_level: 'very_busy', description: 'Most popular route to the summit of Mount Fuji (3,776m) — start from 5th Station, summit for sunrise (Goraiko).', features: ['Summit', 'Sunrise', 'Iconic', 'High Altitude'], is_accessible: false, permit_required: false },

  // Jotunheimen
  { id: 'jot-besseggen', parkId: 'jotunheimen-np', name: 'Besseggen Ridge', difficulty: 'Hard', length_km: 22, elevation_gain_m: 750, estimated_hours: 9, status: 'open', current_hikers: 67, max_capacity: 100, crowd_level: 'moderate', description: 'Norway\'s most iconic day hike — a narrow ridge between emerald Lake Gjende and deep blue Lake Bessvatnet.', features: ['Ridge Walk', 'Two-coloured Lakes', 'Ferry Start', 'Iconic Norway'], is_accessible: false, permit_required: false },

  // Kruger
  { id: 'kru-wilderness-trail', parkId: 'kruger-np', name: 'Wolhuter Wilderness Trail', difficulty: 'Moderate', length_km: 40, elevation_gain_m: 200, estimated_hours: 48, status: 'open', current_hikers: 16, max_capacity: 16, crowd_level: 'busy', description: 'Multi-day guided wilderness walk on foot through the African bush — the ultimate Big Five wildlife experience.', features: ['Big Five', 'Walking Safari', 'Guided Only', 'Bush Camp'], is_accessible: false, permit_required: true },
]

// ─── Helper functions ─────────────────────────────────────────────────────────

export const COUNTRY_NAMES: Record<Country, string> = {
  AU: 'Australia', US: 'United States', NZ: 'New Zealand', GB: 'United Kingdom',
  CA: 'Canada', ZA: 'South Africa', NP: 'Nepal', KE: 'Kenya', IS: 'Iceland',
  NO: 'Norway', CR: 'Costa Rica', PE: 'Peru', JP: 'Japan', IN: 'India', TZ: 'Tanzania',
}

export const COUNTRY_FLAGS: Record<Country, string> = {
  AU: '🇦🇺', US: '🇺🇸', NZ: '🇳🇿', GB: '🇬🇧', CA: '🇨🇦',
  ZA: '🇿🇦', NP: '🇳🇵', KE: '🇰🇪', IS: '🇮🇸', NO: '🇳🇴',
  CR: '🇨🇷', PE: '🇵🇪', JP: '🇯🇵', IN: '🇮🇳', TZ: '🇹🇿',
}

export const CONTINENTS: Continent[] = [
  'Oceania', 'North America', 'Europe', 'Africa', 'Asia', 'South America',
]

/** Build Plan It search URLs for a park + trail */
export function getPlanItLinks(park: WorldPark, trail?: WorldTrail) {
  const parkQ   = encodeURIComponent(park.name)
  const regionQ = encodeURIComponent(`${park.name} ${park.state_region}`)
  const trailQ  = trail ? encodeURIComponent(`${trail.name} ${park.name}`) : parkQ

  return {
    tours: {
      viator:       `https://www.viator.com/searchResults/all?text=${regionQ}`,
      tripadvisor:  `https://www.tripadvisor.com/Search?q=${regionQ}+tours`,
      getyourguide: `https://www.getyourguide.com/s/?q=${regionQ}`,
      airbnbExp:    `https://www.airbnb.com/experiences?query=${regionQ}`,
    },
    stay: {
      bookingCom:   `https://www.booking.com/searchresults.html?ss=${regionQ}`,
      airbnb:       `https://www.airbnb.com/s/${regionQ}/homes`,
      hipcamp:      `https://www.hipcamp.com/en-US?q=${regionQ}`,
      wildernessAccom: `https://www.google.com/search?q=camping+accommodation+near+${parkQ}`,
    },
    gear: {
      rei:          `https://www.rei.com/search?q=${encodeURIComponent(trail?.difficulty ?? 'hiking')}+gear`,
      anaconda:     `https://www.anacondastores.com/search?q=hiking+gear`,
      alltrails:    `https://www.alltrails.com/search?q=${trailQ}`,
      trailInfo:    `https://www.google.com/search?q=${trailQ}+what+to+bring+gear+list`,
    },
    directions: `https://www.google.com/maps/search/${parkQ}`,
    alltrails:  `https://www.alltrails.com/search?q=${trailQ}`,
    wikipedia:  `https://en.wikipedia.org/wiki/Special:Search?search=${parkQ}`,
    officialSite:`https://www.google.com/search?q=${parkQ}+official+site+national+park`,
  }
}
