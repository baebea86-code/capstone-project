/**
 * Seed script — creates sample listings for JHB, CPT, Paris, Bali, New York, Tokyo.
 * Usage: node seed.js <email> <password>
 * Example: node seed.js admin@example.com mypassword
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node seed.js <email> <password>');
  process.exit(1);
}

/* ── Listings to seed ────────────────────────────────────────────────────── */
const listings = [
  // ── Johannesburg ──────────────────────────────────────────────────────────
  {
    title: 'Modern Apartment in Sandton',
    location: 'Johannesburg',
    description: 'Sleek, fully furnished apartment in the heart of Sandton CBD. Walking distance to Nelson Mandela Square, top restaurants, and the Gautrain station.',
    type: 'Entire apartment',
    price: 950,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ['WiFi', 'Air conditioning', 'Kitchen', 'TV', 'Washer'],
    weeklyDiscount: 10,
    cleaningFee: 200,
    serviceFee: 100,
    occupancyTaxes: 0,
    enhancedCleaning: true,
    selfCheckIn: true,
  },
  {
    title: 'Cozy Studio in Maboneng Precinct',
    location: 'Johannesburg',
    description: 'Artsy studio in the vibrant Maboneng Precinct. Surrounded by galleries, craft markets, and some of Joburg\'s best street food.',
    type: 'Entire studio',
    price: 600,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'TV'],
    weeklyDiscount: 5,
    cleaningFee: 150,
    serviceFee: 75,
    occupancyTaxes: 0,
    enhancedCleaning: false,
    selfCheckIn: true,
  },
  {
    title: 'Luxury Villa in Fourways',
    location: 'Johannesburg',
    description: 'Spacious luxury villa with a private pool and manicured garden in the secure estate of Fourways. Perfect for families or groups.',
    type: 'Entire villa',
    price: 2500,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    amenities: ['Pool', 'WiFi', 'Kitchen', 'Air conditioning', 'Gym', 'Free parking', 'Garden'],
    weeklyDiscount: 15,
    cleaningFee: 500,
    serviceFee: 200,
    occupancyTaxes: 0,
    enhancedCleaning: true,
    selfCheckIn: false,
  },

  // ── Cape Town ─────────────────────────────────────────────────────────────
  {
    title: 'Sea-View Apartment in Sea Point',
    location: 'Cape Town',
    description: 'Bright apartment with stunning Atlantic Ocean views. Steps from the Sea Point promenade, restaurants, and the famous outdoor pools.',
    type: 'Entire apartment',
    price: 1400,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ['WiFi', 'Air conditioning', 'Kitchen', 'Balcony', 'TV', 'Washer'],
    weeklyDiscount: 10,
    cleaningFee: 300,
    serviceFee: 150,
    occupancyTaxes: 0,
    enhancedCleaning: true,
    selfCheckIn: true,
  },
  {
    title: 'Charming Cottage in Bo-Kaap',
    location: 'Cape Town',
    description: 'Stay in one of Cape Town\'s most iconic neighbourhoods. This colourful cottage is a short walk from the V&A Waterfront and Signal Hill.',
    type: 'Entire cottage',
    price: 1100,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ['WiFi', 'Kitchen', 'Garden', 'TV'],
    weeklyDiscount: 8,
    cleaningFee: 250,
    serviceFee: 120,
    occupancyTaxes: 0,
    enhancedCleaning: false,
    selfCheckIn: true,
  },
  {
    title: 'Clifton Beach House',
    location: 'Cape Town',
    description: 'Stunning beach house with direct access to Clifton 4th Beach — consistently ranked among the world\'s most beautiful beaches.',
    type: 'Entire house',
    price: 3500,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ['WiFi', 'Beach access', 'Kitchen', 'Air conditioning', 'Pool', 'Balcony'],
    weeklyDiscount: 20,
    cleaningFee: 600,
    serviceFee: 250,
    occupancyTaxes: 0,
    enhancedCleaning: true,
    selfCheckIn: false,
  },

  // ── Paris ─────────────────────────────────────────────────────────────────
  {
    title: 'Charming Studio in Montmartre',
    location: 'Paris',
    description: 'Live like a true Parisian in this cosy studio nestled in the bohemian neighbourhood of Montmartre. Steps from Sacré-Cœur and local cafés.',
    type: 'Entire studio',
    price: 140,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'TV'],
    weeklyDiscount: 8,
    cleaningFee: 30,
    serviceFee: 22,
    occupancyTaxes: 15,
    enhancedCleaning: false,
    selfCheckIn: true,
  },
  {
    title: 'Elegant Apartment near the Eiffel Tower',
    location: 'Paris',
    description: 'Classic Haussmann-style apartment with Eiffel Tower views from the living room. Walking distance to Champ de Mars and top Parisian bistros.',
    type: 'Entire apartment',
    price: 320,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ['WiFi', 'Kitchen', 'TV', 'Washer', 'Air conditioning'],
    weeklyDiscount: 12,
    cleaningFee: 60,
    serviceFee: 40,
    occupancyTaxes: 20,
    enhancedCleaning: true,
    selfCheckIn: true,
  },
  {
    title: 'Luxury Penthouse in Le Marais',
    location: 'Paris',
    description: 'Spectacular penthouse in the historic Le Marais district with rooftop terrace overlooking Parisian rooftops. Minutes from the Centre Pompidou.',
    type: 'Entire penthouse',
    price: 650,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'TV', 'Washer', 'Air conditioning'],
    weeklyDiscount: 15,
    cleaningFee: 120,
    serviceFee: 80,
    occupancyTaxes: 35,
    enhancedCleaning: true,
    selfCheckIn: false,
  },

  // ── Bali ──────────────────────────────────────────────────────────────────
  {
    title: 'Beachfront Bungalow in Seminyak',
    location: 'Bali',
    description: 'Wake up to the sound of the ocean in this stunning beachfront bungalow in Seminyak. Direct beach access and a private plunge pool.',
    type: 'Entire bungalow',
    price: 290,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    amenities: ['Pool', 'WiFi', 'Beach access', 'Kitchen', 'Air conditioning', 'Breakfast'],
    weeklyDiscount: 12,
    cleaningFee: 40,
    serviceFee: 38,
    occupancyTaxes: 25,
    enhancedCleaning: true,
    selfCheckIn: true,
  },
  {
    title: 'Rice Terrace Villa in Ubud',
    location: 'Bali',
    description: 'Immerse yourself in Bali\'s lush interior at this serene villa overlooking iconic rice terraces in Ubud. Includes a private infinity pool.',
    type: 'Entire villa',
    price: 420,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ['Pool', 'WiFi', 'Kitchen', 'Garden', 'Air conditioning', 'Breakfast'],
    weeklyDiscount: 15,
    cleaningFee: 80,
    serviceFee: 55,
    occupancyTaxes: 30,
    enhancedCleaning: true,
    selfCheckIn: false,
  },
  {
    title: 'Surf Cottage in Canggu',
    location: 'Bali',
    description: 'Hip cottage in Canggu, Bali\'s favourite surf and digital nomad hub. A short walk to Echo Beach and surrounded by great cafés and co-working spaces.',
    type: 'Entire cottage',
    price: 180,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'TV'],
    weeklyDiscount: 10,
    cleaningFee: 25,
    serviceFee: 20,
    occupancyTaxes: 15,
    enhancedCleaning: false,
    selfCheckIn: true,
  },

  // ── New York ──────────────────────────────────────────────────────────────
  {
    title: 'Modern Apartment in Manhattan',
    location: 'New York',
    description: 'Stay in the heart of New York City in this stunning modern apartment. Walking distance to Central Park, Times Square, and world-class dining.',
    type: 'Entire apartment',
    price: 320,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Washer', 'TV', 'Free parking'],
    weeklyDiscount: 10,
    cleaningFee: 50,
    serviceFee: 45,
    occupancyTaxes: 30,
    enhancedCleaning: true,
    selfCheckIn: true,
  },
  {
    title: 'Cosy Brooklyn Brownstone',
    location: 'New York',
    description: 'Beautiful brownstone apartment in the heart of Brooklyn. Close to Prospect Park, excellent restaurants, and a short subway ride to Manhattan.',
    type: 'Entire apartment',
    price: 210,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['WiFi', 'Kitchen', 'Washer', 'TV', 'Garden'],
    weeklyDiscount: 8,
    cleaningFee: 40,
    serviceFee: 30,
    occupancyTaxes: 25,
    enhancedCleaning: false,
    selfCheckIn: true,
  },
  {
    title: 'Luxury Penthouse in Midtown',
    location: 'New York',
    description: 'Breathtaking penthouse with panoramic views of the Manhattan skyline. Floor-to-ceiling windows, rooftop terrace, and premium finishes throughout.',
    type: 'Entire penthouse',
    price: 900,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Gym', 'Concierge', 'TV', 'Balcony'],
    weeklyDiscount: 20,
    cleaningFee: 150,
    serviceFee: 100,
    occupancyTaxes: 60,
    enhancedCleaning: true,
    selfCheckIn: false,
  },

  // ── Tokyo ─────────────────────────────────────────────────────────────────
  {
    title: 'Traditional Ryokan in Asakusa',
    location: 'Tokyo',
    description: 'Experience authentic Japanese hospitality in a beautifully preserved ryokan in Asakusa. Tatami rooms, yukata robes, and a seasonal breakfast served in your room.',
    type: 'Private room',
    price: 210,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['WiFi', 'Breakfast', 'Garden', 'TV'],
    weeklyDiscount: 0,
    cleaningFee: 25,
    serviceFee: 32,
    occupancyTaxes: 18,
    enhancedCleaning: true,
    selfCheckIn: false,
  },
  {
    title: 'Modern Studio in Shinjuku',
    location: 'Tokyo',
    description: 'Compact but well-designed studio in Shinjuku, Tokyo\'s most dynamic district. Superb transport links and steps from great food, shopping and nightlife.',
    type: 'Entire studio',
    price: 160,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'TV', 'Washer'],
    weeklyDiscount: 5,
    cleaningFee: 20,
    serviceFee: 25,
    occupancyTaxes: 15,
    enhancedCleaning: true,
    selfCheckIn: true,
  },
  {
    title: 'Spacious Family Apartment in Shibuya',
    location: 'Tokyo',
    description: 'Spacious apartment perfect for families exploring Tokyo. Minutes from Shibuya Crossing, Harajuku, and some of the world\'s best ramen shops.',
    type: 'Entire apartment',
    price: 280,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'TV', 'Washer', 'Balcony'],
    weeklyDiscount: 10,
    cleaningFee: 50,
    serviceFee: 40,
    occupancyTaxes: 22,
    enhancedCleaning: false,
    selfCheckIn: true,
  },
];

/* ── HTTP helpers ────────────────────────────────────────────────────────── */
function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/* ── Main ────────────────────────────────────────────────────────────────── */
async function main() {
  // 1. Login
  console.log(`\nLogging in as ${email}…`);
  const loginBody = JSON.stringify({ email, password });
  const loginRes = await request(
    `${BASE_URL}/users/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) },
    },
    loginBody
  );

  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes.body);
    process.exit(1);
  }

  const token = loginRes.body.token;
  console.log('Login successful.\n');

  // 2. Create each listing
  let created = 0;
  let failed = 0;

  for (const listing of listings) {
    const body = JSON.stringify(listing);
    const res = await request(
      `${BASE_URL}/accommodations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      body
    );

    if (res.status === 201) {
      console.log(`✓  ${listing.location} — ${listing.title}`);
      created++;
    } else {
      console.error(`✗  ${listing.location} — ${listing.title}: ${JSON.stringify(res.body)}`);
      failed++;
    }
  }

  console.log(`\nDone. ${created} created, ${failed} failed.`);
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
