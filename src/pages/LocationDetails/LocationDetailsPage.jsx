import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Footer from '../../components/Footer';
import './LocationDetailsPage.css';


/* ── Helpers ─────────────────────────────────────────────────────────────── */
function StarRating({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 32 32" aria-hidden="true"
          className={`star ${i < Math.floor(rating) ? 'star--full' : 'star--empty'}`}>
          <path d="M15.094 2.55a1 1 0 011.812 0l3.21 6.504 7.178 1.043a1 1 0 01.554 1.706l-5.195 5.063 1.226 7.147a1 1 0 01-1.451 1.054L16 21.82l-6.428 3.38a1 1 0 01-1.45-1.054l1.225-7.147L3.152 11.8a1 1 0 01.554-1.706l7.178-1.043 3.21-6.504z" />
        </svg>
      ))}
    </span>
  );
}

const today = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
const nightsBetween = (a, b) => {
  const diff = new Date(b) - new Date(a);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

export default function LocationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [acc, setAcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(addDays(today(), 7));
  const [guests, setGuests] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState('');
  const [reserveError, setReserveError] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(null);

  /* Fetch accommodation from API */
  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        setLoading(true);
        setFetchError('');
        const { data } = await api.get(`/accommodations/${id}`);
        setAcc(data);
      } catch (err) {
        setFetchError('Accommodation not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccommodation();
  }, [id]);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  const subtotal = acc ? acc.price * nights : 0;
  const weeklyDiscountAmt = acc
    ? nights >= 7 ? Math.round(subtotal * ((acc.weeklyDiscount || 0) / 100)) : 0
    : 0;
  const total = acc
    ? subtotal - weeklyDiscountAmt + (acc.cleaningFee || 0) + (acc.serviceFee || 0) + (acc.occupancyTaxes || 0)
    : 0;

  /* Loading state */
  if (loading) {
    return (
      <div className="details-not-found">
        <p>Loading accommodation…</p>
      </div>
    );
  }

  /* Error / not found state */
  if (fetchError || !acc) {
    return (
      <div className="details-not-found">
        <h2>{fetchError || 'Accommodation not found.'}</h2>
        <button className="btn btn--primary" onClick={() => navigate('/locations')}>
          Back to listings
        </button>
      </div>
    );
  }

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (nights <= 0) {
      setReserveError('Please select valid check-in and check-out dates.');
      return;
    }
    setReserving(true);
    setReserveError('');
    setReserveMsg('');
    try {
      await api.post('/reservations', {
        accommodationId: acc._id,
        checkIn,
        checkOut,
        guests,
        totalPrice: total,
      });
      setReserveMsg('Reservation confirmed! Check your reservations page.');
    } catch (err) {
      setReserveError(err.response?.data?.message || 'Reservation failed. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  const hostName =
    typeof acc.host === 'object' ? acc.host?.username : acc.host;

  const ratingCategories = acc.specificRatings
    ? Object.entries(acc.specificRatings)
    : [];

  return (
    <div className="details">
      <div className="details__inner">

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <section className="details__header">
          <span className="details__type">{acc.type}</span>
          <h1 className="details__title">{acc.title}</h1>
          <div className="details__sub">
            <span className="details__rating">
              <StarRating rating={acc.rating || 0} />
              <strong>{acc.rating || 0}</strong>
              <span className="details__reviews">· {acc.reviews || 0} reviews</span>
            </span>
            <span className="details__location-text">
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" /></svg>
              {acc.location}
            </span>
          </div>
        </section>

        {/* ── Image Gallery ────────────────────────────────────────────── */}
        {acc.images?.length > 0 ? (
          <section className="details__gallery" aria-label="Photo gallery">
            <div className="details__gallery-main">
              <img
                src={acc.images[0].startsWith('/uploads')
                  ? `http://localhost:5000${acc.images[0]}`
                  : acc.images[0]}
                alt={`${acc.title} main photo`}
                onClick={() => setGalleryIndex(0)}
                className="details__gallery-img details__gallery-img--large"
              />
            </div>
            {acc.images.length > 1 && (
              <div className="details__gallery-grid">
                {acc.images.slice(1, 5).map((img, i) => (
                  <img
                    key={i}
                    src={img.startsWith('/uploads') ? `http://localhost:5000${img}` : img}
                    alt={`${acc.title} photo ${i + 2}`}
                    className="details__gallery-img"
                    onClick={() => setGalleryIndex(i + 1)}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="details__gallery" aria-label="Photo gallery">
            <div className="details__gallery-main">
              <div className="details__gallery-img details__gallery-img--large"
                style={{ background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#9ca3af' }}>No photos available</span>
              </div>
            </div>
          </section>
        )}

        {/* Lightbox */}
        {galleryIndex !== null && acc.images?.length > 0 && (
          <div className="details__lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer"
            onClick={() => setGalleryIndex(null)}>
            <button className="details__lightbox-close" aria-label="Close" onClick={() => setGalleryIndex(null)}>✕</button>
            <img
              src={acc.images[galleryIndex]?.startsWith('/uploads')
                ? `http://localhost:5000${acc.images[galleryIndex]}`
                : acc.images[galleryIndex]}
              alt=""
              onClick={(e) => e.stopPropagation()}
            />
            <div className="details__lightbox-nav" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setGalleryIndex((galleryIndex - 1 + acc.images.length) % acc.images.length)}>‹</button>
              <span>{galleryIndex + 1} / {acc.images.length}</span>
              <button onClick={() => setGalleryIndex((galleryIndex + 1) % acc.images.length)}>›</button>
            </div>
          </div>
        )}

        {/* ── Two-column layout ────────────────────────────────────────── */}
        <div className="details__columns">

          {/* Left column — static info */}
          <div className="details__left">

            {/* Accommodation details */}
            <section className="details__section">
              <h2 className="details__section-title">Accommodation details</h2>
              <div className="details__stats">
                <div className="details__stat">
                  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M26 4H6a2 2 0 00-2 2v14a2 2 0 002 2h4v4l5-4h11a2 2 0 002-2V6a2 2 0 00-2-2z"/></svg>
                  <span>{acc.guests} guests</span>
                </div>
                <div className="details__stat">
                  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 20h26v2H3zm2-8h22v6H5zm0-4a3 3 0 100 6 3 3 0 000-6zm22 0a3 3 0 100 6 3 3 0 000-6z"/></svg>
                  <span>{acc.bedrooms} bedroom{acc.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="details__stat">
                  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M28 14H4V8a2 2 0 012-2h2V4H6a4 4 0 00-4 4v18h2v-4h24v4h2V18a4 4 0 00-4-4zM4 24v-8h24v8z"/></svg>
                  <span>{acc.bathrooms} bathroom{acc.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <p className="details__description">{acc.description}</p>
            </section>

            {/* Where you'll sleep */}
            <section className="details__section">
              <h2 className="details__section-title">Where you'll sleep</h2>
              <div className="details__sleep-card">
                <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 20h26v2H3zm2-8h22v6H5zm0-4a3 3 0 100 6 3 3 0 000-6zm22 0a3 3 0 100 6 3 3 0 000-6z"/></svg>
                <div>
                  <strong>Bedroom</strong>
                  <p>{acc.bedrooms} {acc.bedrooms === 1 ? 'bed' : 'beds'}</p>
                </div>
              </div>
            </section>

            {/* What this place offers */}
            <section className="details__section">
              <h2 className="details__section-title">What this place offers</h2>
              <ul className="details__amenities-list">
                {acc.amenities?.map((a) => (
                  <li key={a} className="details__amenity">
                    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13.5 24.569l-7.78-7.78 1.414-1.413L13.5 21.74l11.366-11.366 1.414 1.414z"/></svg>
                    {a}
                  </li>
                ))}
                {acc.enhancedCleaning && (
                  <li className="details__amenity details__amenity--highlight">
                    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13.5 24.569l-7.78-7.78 1.414-1.413L13.5 21.74l11.366-11.366 1.414 1.414z"/></svg>
                    Enhanced cleaning
                  </li>
                )}
                {acc.selfCheckIn && (
                  <li className="details__amenity details__amenity--highlight">
                    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13.5 24.569l-7.78-7.78 1.414-1.413L13.5 21.74l11.366-11.366 1.414 1.414z"/></svg>
                    Self check-in
                  </li>
                )}
              </ul>
            </section>

            {/* Nights */}
            <section className="details__section">
              <h2 className="details__section-title">
                {nights > 0 ? `${nights} night${nights !== 1 ? 's' : ''} in ${acc.location}` : `Stays in ${acc.location}`}
              </h2>
              <p className="details__text text-muted">
                Select your dates for an exact price breakdown.
              </p>
            </section>

            {/* Reviews */}
            <section className="details__section">
              <h2 className="details__section-title">
                <StarRating rating={acc.rating || 0} /> {acc.rating || 0} · {acc.reviews || 0} reviews
              </h2>
              {ratingCategories.length > 0 && (
                <div className="details__rating-grid">
                  {ratingCategories.map(([key, val]) => (
                    <div key={key} className="details__rating-item">
                      <span className="details__rating-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <div className="details__rating-bar">
                        <div className="details__rating-fill" style={{ width: `${(val / 5) * 100}%` }} />
                      </div>
                      <span className="details__rating-val">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Host details */}
            <section className="details__section">
              <h2 className="details__section-title">Meet your host</h2>
              <div className="details__host">
                <div className="details__host-avatar">
                  {hostName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <strong>{hostName || 'Host'}</strong>
                  <p className="text-muted">Host</p>
                </div>
              </div>
            </section>

            {/* House rules */}
            <section className="details__section">
              <h2 className="details__section-title">House rules</h2>
              <ul className="details__rules">
                <li>Check-in after 3:00 PM</li>
                <li>Checkout before 11:00 AM</li>
                <li>No smoking</li>
                <li>No parties or events</li>
                <li>Pets not allowed (unless specified)</li>
              </ul>
            </section>

            {/* Health & Safety */}
            <section className="details__section">
              <h2 className="details__section-title">Health & safety</h2>
              <ul className="details__rules">
                {acc.enhancedCleaning && <li>Committed to Airbnb's enhanced cleaning process</li>}
                <li>Carbon monoxide alarm installed</li>
                <li>Smoke alarm installed</li>
              </ul>
            </section>

            {/* Cancellation policy */}
            <section className="details__section">
              <h2 className="details__section-title">Cancellation policy</h2>
              <p className="details__text">
                Free cancellation before 48 hours of check-in. After that, this reservation is non-refundable.
              </p>
            </section>
          </div>

          {/* Right column — cost calculator */}
          <div className="details__right">
            <div className="details__calculator">
              <div className="details__calc-header">
                <span className="details__calc-price">
                  <strong>${acc.price}</strong> / night
                </span>
                <span className="details__calc-rating">
                  ★ {acc.rating || 0} · {acc.reviews || 0} reviews
                </span>
              </div>

              <div className="details__calc-dates">
                <div className="details__calc-date-group">
                  <label htmlFor="check-in">Check-in</label>
                  <input
                    id="check-in"
                    type="date"
                    value={checkIn}
                    min={today()}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        setCheckOut(addDays(e.target.value, 1));
                      }
                    }}
                  />
                </div>
                <div className="details__calc-date-group">
                  <label htmlFor="check-out">Checkout</label>
                  <input
                    id="check-out"
                    type="date"
                    value={checkOut}
                    min={addDays(checkIn, 1)}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="details__calc-guests">
                <label htmlFor="guests">Guests</label>
                <select
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {Array.from({ length: acc.guests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} guest{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <button
                className="details__calc-reserve-btn"
                onClick={handleReserve}
                disabled={reserving || nights <= 0}
              >
                {reserving ? 'Reserving…' : 'Reserve'}
              </button>

              {reserveMsg && <p className="details__calc-success">{reserveMsg}</p>}
              {reserveError && <p className="details__calc-error">{reserveError}</p>}

              {nights > 0 && (
                <div className="details__calc-breakdown">
                  <div className="details__calc-line">
                    <span>${acc.price} × {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  {weeklyDiscountAmt > 0 && (
                    <div className="details__calc-line details__calc-line--discount">
                      <span>Weekly discount ({acc.weeklyDiscount}%)</span>
                      <span>-${weeklyDiscountAmt.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="details__calc-line">
                    <span>Cleaning fee</span>
                    <span>${acc.cleaningFee || 0}</span>
                  </div>
                  <div className="details__calc-line">
                    <span>Service fee</span>
                    <span>${acc.serviceFee || 0}</span>
                  </div>
                  <div className="details__calc-line">
                    <span>Occupancy taxes & fees</span>
                    <span>${acc.occupancyTaxes || 0}</span>
                  </div>
                  <div className="details__calc-line details__calc-line--total">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
