/**
 * Adds images to existing seeded listings.
 * Usage: node seedImages.js example@gmail.com 1a2b3c4d5e
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';
const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node seedImages.js <email> <password>');
  process.exit(1);
}

/* Images mapped by listing title */
const imageMap = {
  // ── Johannesburg ────────────────────────────────────────────────────────
  'Modern Apartment in Sandton': [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  ],
  'Cozy Studio in Maboneng Precinct': [
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
  ],
  'Luxury Villa in Fourways': [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  ],

  // ── Cape Town ───────────────────────────────────────────────────────────
  'Sea-View Apartment in Sea Point': [
    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  ],
  'Charming Cottage in Bo-Kaap': [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  ],
  'Clifton Beach House': [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800',
  ],

  // ── Paris ───────────────────────────────────────────────────────────────
  'Charming Studio in Montmartre': [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800',
  ],
  'Elegant Apartment near the Eiffel Tower': [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1540541338537-1220059d7076?w=800',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
  ],
  'Luxury Penthouse in Le Marais': [
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  ],

  // ── Bali ────────────────────────────────────────────────────────────────
  'Beachfront Bungalow in Seminyak': [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    'https://images.unsplash.com/photo-1580977251946-fc04b5e92baa?w=800',
  ],
  'Rice Terrace Villa in Ubud': [
    'https://images.unsplash.com/photo-1604999565976-8913ad2ddb37?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?w=800',
  ],
  'Surf Cottage in Canggu': [
    'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  ],

  // ── New York ────────────────────────────────────────────────────────────
  'Modern Apartment in Manhattan': [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800',
  ],
  'Cosy Brooklyn Brownstone': [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  ],
  'Luxury Penthouse in Midtown': [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  ],

  // ── Tokyo ───────────────────────────────────────────────────────────────
  'Traditional Ryokan in Asakusa': [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800',
  ],
  'Modern Studio in Shinjuku': [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
  ],
  'Spacious Family Apartment in Shibuya': [
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  ],
};

/* ── HTTP helpers ────────────────────────────────────────────────────────── */
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

  // 2. Fetch all accommodations
  const listRes = await request(
    `${BASE_URL}/accommodations`,
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
  );
  const listings = listRes.body;
  console.log(`Found ${listings.length} listings.\n`);

  let updated = 0;
  let skipped = 0;

  for (const listing of listings) {
    const images = imageMap[listing.title];
    if (!images) { console.log(`  skip  ${listing.title} (no image map entry)`); skipped++; continue; }
    if (listing.images && listing.images.length > 0) { console.log(`  skip  ${listing.title} (already has images)`); skipped++; continue; }

    const body = JSON.stringify({ images });
    const res = await request(
      `${BASE_URL}/accommodations/${listing._id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      body
    );

    if (res.status === 200) {
      console.log(`  ✓  ${listing.title}`);
      updated++;
    } else {
      console.error(`  ✗  ${listing.title}: ${JSON.stringify(res.body)}`);
    }
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
}

main().catch((err) => { console.error('Error:', err.message); process.exit(1); });
