const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      // e.g. "Entire apartment", "Private room", "Shared room"
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    weeklyDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    occupancyTaxes: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enhancedCleaning: {
      type: Boolean,
      default: false,
    },
    selfCheckIn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes for faster queries ────────────────────────────────────────────────
// location is queried frequently (filter by city)
accommodationSchema.index({ location: 1 });
// price is used for range filtering and sorting
accommodationSchema.index({ price: 1 });
// combined index for the most common query: filter by location + sort by price
accommodationSchema.index({ location: 1, price: 1 });
// createdAt for default sort (newest first)
accommodationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Accommodation', accommodationSchema);
