/**
 * Test setup — connects to MongoDB before all tests and disconnects after.
 * Uses the real MONGO_URI from .env (test data is isolated by unique emails/titles).
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});
