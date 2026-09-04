/**
 * fixListings.js
 * 1. Repairs broken image URLs
 * 2. Fixes "Johannesburg, Gauteng" location to "Johannesburg"
 * 3. Adds missing Tokyo listing (Spacious Family Apartment in Shibuya)
 * Usage: node fixListings.js <email> <password>
 */
const http = require('http');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const BASE_URL = 'http://localhost:5000/api';
const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node fixListings.js <email> <password>');
  process.exit(1);
}

/* ── Image fixes: title → new images array ───────────────────────────────── */
const imageFixes = {
  // Bali — Rice Terrace Villa photo-1604999565976 returns 404, replace all 3
  'Rice Terrace Villa in Ubud': [
    'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=800',
    'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
  ],
};

/* ── Missing listings to create ─────────────────────────────────────────── */
const missingListings = [
  {
    title: 'Spacious Family Apartment in Shibuya',
    location: 'Tokyo',
    description: "Spacious apartment perfect for families exploring Tokyo. Minutes from Shibuya Crossing, Harajuku, and some of the world's best ramen shops.",
    type: 'Entire apartment',
    price: 280,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'TV', 'Washer', 'Balcony'],
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    ],
    weeklyDiscount: 10,
    cleaningFee: 50,
    serviceFee: 40,
    occupancyTaxes: 22,
    enhancedCleaning: false,
    selfCheckIn: true,
  },
];

/* ── HTTP helper ─────────────────────────────────────────────────────────── */
function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // 1. Login
  console.log(`\nLogging in as ${email}…`);
  const loginBody = JSON.stringify({ email, password });
  const loginRes = await request(
    `${BASE_URL}/users/login`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) } },
    loginBody
  );
  if (loginRes.status !== 200) { console.error('Login failed:', loginRes.body); process.exit(1); }
  const token = loginRes.body.token;
  console.log('Login successful.\n');

  // 2. Fetch all listings
  const listRes = await request(`${BASE_URL}/accommodations?limit=50`, { method: 'GET' });
  const listings = listRes.body.data || listRes.body;
  console.log(`Found ${listings.length} listings.\n`);

  // 3. Fix broken images
  console.log('── Fixing broken images ─────────────────────────────────');
  for (const listing of listings) {
    const newImages = imageFixes[listing.title];
    if (!newImages) continue;

    const body = JSON.stringify({ images: newImages });
    const res = await request(
      `${BASE_URL}/accommodations/${listing._id}`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(body) } },
      body
    );
    if (res.status === 200) {
      console.log(`  ✓  Fixed images: ${listing.title}`);
    } else {
      console.error(`  ✗  Failed: ${listing.title}: ${JSON.stringify(res.body)}`);
    }
  }

  // 4. Fix wrong location names
  console.log('\n── Fixing location names ────────────────────────────────');
  for (const listing of listings) {
    if (listing.location === 'Johannesburg, Gauteng') {
      const body = JSON.stringify({ location: 'Johannesburg' });
      const res = await request(
        `${BASE_URL}/accommodations/${listing._id}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(body) } },
        body
      );
      if (res.status === 200) {
        console.log(`  ✓  Fixed location: "${listing.title}" → Johannesburg`);
      } else {
        console.error(`  ✗  Failed: ${listing.title}: ${JSON.stringify(res.body)}`);
      }
    }
  }

  // 5. Add missing listings
  console.log('\n── Adding missing listings ──────────────────────────────');
  for (const listing of missingListings) {
    // Skip if already exists
    const exists = listings.find(l => l.title === listing.title);
    if (exists) { console.log(`  skip  "${listing.title}" already exists`); continue; }

    const body = JSON.stringify(listing);
    const res = await request(
      `${BASE_URL}/accommodations`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(body) } },
      body
    );
    if (res.status === 201) {
      console.log(`  ✓  Created: ${listing.location} — ${listing.title}`);
    } else {
      console.error(`  ✗  Failed: ${listing.title}: ${JSON.stringify(res.body)}`);
    }
  }

  console.log('\nDone.');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
