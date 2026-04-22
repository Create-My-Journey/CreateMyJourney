export const TRIP_DETAILS = {
    id: 1,
    location: "Tokyo, Japan",
    startDate: "2026-05-15", // Matches your logic for the fmt function
    endDate: "2026-05-22", 
    status: "Planning",
    nights: 3,
    people: 2
};


export const ATTRACTIONS = [
  {
    id: 1,
    name: 'Senso-ji Temple',
    category: 'Temple',
    hours: 'Open 24h (main hall 6:00–17:00)',
    price: 'Free',
    rating: 4.8,
    tags: ['Cultural', 'Historic', 'Iconic'],
    description:
      "Tokyo's oldest and most significant Buddhist temple, nestled in the heart of Asakusa. Walk beneath the thunderous Kaminarimon gate, down the Nakamise shopping street lined with traditional crafts and snacks, and into a complex that has stood since 645 AD. Especially magical at dawn before the crowds arrive.",
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=440&q=80',
  },
  {
    id: 2,
    name: 'Shibuya Crossing',
    category: 'Landmark',
    hours: 'Always open',
    price: 'Free',
    rating: 4.7,
    tags: ['Urban', 'Iconic', 'Nightlife'],
    description:
      "The world's busiest pedestrian crossing, where up to 3,000 people cross at once when the lights turn green. Surrounded by towering neon screens and buzzing department stores, it perfectly encapsulates Tokyo's electric energy. Head to a nearby rooftop for the ultimate bird's-eye view.",
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=440&q=80',
  },
  {
    id: 3,
    name: 'Tsukiji Outer Market',
    category: 'Market',
    hours: '5:00–14:00 (most stalls)',
    price: 'Free entry',
    rating: 4.6,
    tags: ['Food', 'Culture', 'Morning'],
    description:
      "Even after the inner wholesale market relocated to Toyosu, Tsukiji's outer market remains one of Tokyo's most vibrant culinary destinations. Wander lanes packed with fishmongers, tamagoyaki stalls, knife shops, and street-food vendors. Arrive early for the freshest sushi and the best atmosphere.",
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=440&q=80',
  },
  {
    id: 4,
    name: 'Shinjuku Gyoen',
    category: 'Park',
    hours: '9:00–16:30 (closed Mon)',
    price: '¥500 (~$3)',
    rating: 4.8,
    tags: ['Nature', 'Relaxing', 'Gardens'],
    description:
      'A masterpiece of landscape design blending French formal, English landscape, and traditional Japanese garden styles across 58 hectares. One of Japan\'s most celebrated cherry-blossom spots in spring, and a lush green sanctuary year-round.',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=440&q=80',
  },
  {
    id: 5,
    name: 'teamLab Planets',
    category: 'Art Installation',
    hours: '10:00–22:00',
    price: '¥3,200 (~$22)',
    rating: 4.9,
    tags: ['Art', 'Immersive', 'Modern'],
    description:
      'Walk barefoot through four immense rooms where your body becomes part of a living digital artwork. Wade through knee-deep water mirrored with infinite koi, lie on a floor dissolving into the cosmos, and stand inside a room of cascading flowers. Book well in advance.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=440&q=80',
  },
  {
    id: 6,
    name: 'Meiji Jingu Shrine',
    category: 'Shrine',
    hours: 'Sunrise–Sunset',
    price: 'Free',
    rating: 4.7,
    tags: ['Spiritual', 'Nature', 'Historic'],
    description:
      'A serene Shinto shrine dedicated to Emperor Meiji and Empress Shoken, set within a dense forested park in the heart of Harajuku. The forested approach along towering cedar-lined paths provides an extraordinary contrast to the surrounding city.',
    image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=440&q=80',
  },
  {
    id: 7,
    name: 'Akihabara Electric Town',
    category: 'District',
    hours: 'Most shops: 10:00–21:00',
    price: 'Free entry',
    rating: 4.5,
    tags: ['Tech', 'Anime', 'Shopping'],
    description:
      "Tokyo's legendary electronics and otaku culture district, where multi-storey arcades, anime merchandise shops, retro game stores, and maid cafes crowd every block. From vintage Famicom cartridges to the latest graphics cards — Akihabara has it all.",
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=440&q=80',
  },
  {
    id: 8,
    name: 'Hamarikyu Gardens',
    category: 'Garden',
    hours: '9:00–17:00',
    price: '¥300 (~$2)',
    rating: 4.6,
    tags: ['Nature', 'Historic', 'Peaceful'],
    description:
      'A stunning feudal-era garden reclaimed from Tokyo Bay, where a traditional teahouse sits on an island in a tidal pond that still ebbs and flows with the ocean. Surrounded on all sides by gleaming skyscrapers, the contrast between ancient garden and modern cityscape is unforgettable.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=440&q=80',
  },
]