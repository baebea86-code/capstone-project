const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

/**
 * POST /api/reservations
 * Create a new reservation.
 * Protected — logged-in users only.
 */
const createReservation = async (req, res) => {
  const { accommodationId, checkIn, checkOut, guests, totalPrice } = req.body;

  if (!accommodationId || !checkIn || !checkOut || !guests || !totalPrice) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    const reservation = await Reservation.create({
      accommodation: accommodationId,
      user: req.user._id,
      host: accommodation.host,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    });

    const populated = await reservation.populate([
      { path: 'accommodation', select: 'title location images price' },
      { path: 'user', select: 'username email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/reservations/host
 * Get all reservations for the logged-in host's properties.
 * Protected — host/admin only.
 */
const getReservationsByHost = async (req, res) => {
  try {
    const reservations = await Reservation.find({ host: req.user._id })
      .populate('accommodation', 'title location images price')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/reservations/user
 * Get all reservations made by the logged-in user.
 * Protected — logged-in users only.
 */
const getReservationsByUser = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('accommodation', 'title location images price')
      .populate('host', 'username email')
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/reservations/:id
 * Delete a reservation.
 * Protected — the user who made it or the host can delete.
 */
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isHost = reservation.host.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isHost && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this reservation' });
    }

    await reservation.deleteOne();
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
};
