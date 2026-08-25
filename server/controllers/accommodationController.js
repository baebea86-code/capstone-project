const Accommodation = require('../models/Accommodation');

/**
 * POST /api/accommodations
 * Create a new accommodation listing.
 * Protected — requires a logged-in host or admin.
 */
const createAccommodation = async (req, res) => {
  try {
    const {
      title, location, description, type, price,
      bedrooms, bathrooms, guests, amenities,
      weeklyDiscount, cleaningFee, serviceFee, occupancyTaxes,
      enhancedCleaning, selfCheckIn,
    } = req.body;

    // Handle uploaded images (multer stores them in req.files)
    const images = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    const accommodation = await Accommodation.create({
      title,
      location,
      description,
      type,
      price,
      bedrooms,
      bathrooms,
      guests,
      amenities: amenities
        ? typeof amenities === 'string'
          ? amenities.split(',').map((a) => a.trim())
          : amenities
        : [],
      images,
      weeklyDiscount: weeklyDiscount || 0,
      cleaningFee: cleaningFee || 0,
      serviceFee: serviceFee || 0,
      occupancyTaxes: occupancyTaxes || 0,
      enhancedCleaning: enhancedCleaning || false,
      selfCheckIn: selfCheckIn || false,
      host: req.user._id,
    });

    res.status(201).json(accommodation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/accommodations
 * Read all accommodation listings. Public.
 */
const getAccommodations = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = location
      ? { location: { $regex: location, $options: 'i' } }
      : {};

    const accommodations = await Accommodation.find(filter)
      .populate('host', 'username email')
      .sort({ createdAt: -1 });

    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/accommodations/:id
 * Read a single accommodation. Public.
 */
const getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id).populate(
      'host',
      'username email'
    );
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    res.json(accommodation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/accommodations/:id
 * Update an accommodation listing.
 * Protected — only the host who owns it or an admin can update.
 */
const updateAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Only the owner or an admin may update
    if (
      accommodation.host.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    // Handle new images if uploaded
    const newImages = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    const updatedData = { ...req.body };

    // Merge images: keep existing ones unless replaced
    if (newImages.length > 0) {
      updatedData.images = newImages;
    }

    // Parse amenities if sent as a comma-separated string
    if (updatedData.amenities && typeof updatedData.amenities === 'string') {
      updatedData.amenities = updatedData.amenities
        .split(',')
        .map((a) => a.trim());
    }

    const updated = await Accommodation.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).populate('host', 'username email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/accommodations/:id
 * Delete an accommodation listing.
 * Protected — only the owner or an admin.
 */
const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    if (
      accommodation.host.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await accommodation.deleteOne();
    res.json({ message: 'Accommodation removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
};
