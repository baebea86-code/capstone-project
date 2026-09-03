import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Footer from '../../components/Footer';
import './LocationPage.css';

/* Star rating helper */
function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <span className="star-rating" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`star ${
            i < full
              ? 'star--full'
              : i === full && half
                ? 'star--half'
                : 'star--empty'
          }`}
        >
          <path d="M15.094 2.55a1 1 0 011.812 0l3.21 6.504 7.178 1.043a1 1 0 01.554 1.706l-5.195 5.063 1.226 7.147a1 1 0 01-1.451 1.054L16 21.82l-6.428 3.38a1 1 0 01-1.45-1.054l1.225-7.147L3.152 11.8a1 1 0 01.554-1.706l7.178-1.043 3.21-6.504z" />
        </svg>
      ))}
    </span>
  );
}

const typeOptions = [
  'All types',
  'Entire apartment',
  'Entire cottage',
  'Entire villa',
  'Private room',
  'Entire studio',
  'Entire penthouse',
  'Entire townhouse',
  'Entire bungalow',
];

const sortOptions = [
  'Recommended',
  'Price: Low to High',
  'Price: High to Low',
  'Top Rated',
];

export default function LocationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const locationParam = searchParams.get('location') || '';

  const [accommodations, setAccommodations] = useState([]);
  const [selectedType, setSelectedType] = useState('All types');
  const [sortBy, setSortBy] = useState('Recommended');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minBeds, setMinBeds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* Fetch accommodations from MongoDB */
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/accommodations');
        setAccommodations(response.data);
      } catch (err) {
        console.error('Error fetching accommodations:', err);
        setError('Unable to load accommodations. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  /* Get unique locations from database data */
  const locations = useMemo(() => {
    return [...new Set(accommodations.map((a) => a.location))];
  }, [accommodations]);

  /* Filter and sort accommodations */
  const results = useMemo(() => {
    let list = locationParam
      ? accommodations.filter((a) =>
          a.location?.toLowerCase().includes(locationParam.toLowerCase())
        )
      : accommodations;

    if (selectedType !== 'All types') {
      list = list.filter((a) => a.type === selectedType);
    }

    list = list.filter(
      (a) => a.price <= maxPrice && a.bedrooms >= minBeds
    );

    switch (sortBy) {
      case 'Price: Low to High':
        return [...list].sort((a, b) => a.price - b.price);

      case 'Price: High to Low':
        return [...list].sort((a, b) => b.price - a.price);

      case 'Top Rated':
        return [...list].sort((a, b) => b.rating - a.rating);

      default:
        return list;
    }
  }, [
    accommodations,
    locationParam,
    selectedType,
    sortBy,
    maxPrice,
    minBeds,
  ]);

  return (
    <div className="location-page">
      <div className="location-page__inner">

        {/* Filter sidebar */}
        <aside className="location-filter" aria-label="Filters">
          <h2 className="location-filter__title">Filters</h2>

          <div className="location-filter__group">
            <label
              className="location-filter__label"
              htmlFor="type-select"
            >
              Property type
            </label>

            <select
              id="type-select"
              className="location-filter__select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="location-filter__group">
            <label
              className="location-filter__label"
              htmlFor="price-range"
            >
              Max price: <strong>${maxPrice}</strong>
            </label>

            <input
              id="price-range"
              type="range"
              min="50"
              max="2000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="location-filter__range"
            />
          </div>

          <div className="location-filter__group">
            <label
              className="location-filter__label"
              htmlFor="beds"
            >
              Min bedrooms: <strong>{minBeds}</strong>
            </label>

            <input
              id="beds"
              type="range"
              min="0"
              max="6"
              step="1"
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
              className="location-filter__range"
            />
          </div>

          <div className="location-filter__group">
            <label
              className="location-filter__label"
              htmlFor="sort-select"
            >
              Sort by
            </label>

            <select
              id="sort-select"
              className="location-filter__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((sort) => (
                <option key={sort} value={sort}>
                  {sort}
                </option>
              ))}
            </select>
          </div>

          <div className="location-filter__locations">
            <p className="location-filter__label">
              Browse by location
            </p>

            {locations.map((location) => (
              <button
                key={location}
                className={`location-filter__loc-btn ${
                  locationParam === location
                    ? 'location-filter__loc-btn--active'
                    : ''
                }`}
                onClick={() =>
                  navigate(
                    `/locations?location=${encodeURIComponent(location)}`
                  )
                }
              >
                {location}
              </button>
            ))}
          </div>
        </aside>

        {/* Results */}
        <main className="location-results">
          <div className="location-results__heading">
            <h1 className="location-results__title">
              {locationParam
                ? `Stays in ${locationParam}`
                : 'All available stays'}
            </h1>

            {!loading && (
              <p className="location-results__count">
                {results.length} accommodation
                {results.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="location-results__empty">
              <p>Loading accommodations...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="location-results__empty">
              <p>{error}</p>

              <button
                className="btn btn--primary"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          )}

          {/* No results */}
          {!loading && !error && results.length === 0 && (
            <div className="location-results__empty">
              <p>No results found for your filters.</p>

              <button
                className="btn btn--primary"
                onClick={() => {
                  setSelectedType('All types');
                  setMaxPrice(2000);
                  setMinBeds(0);
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && results.length > 0 && (
            <ul
              className="location-cards"
              aria-label="Accommodation listings"
            >
              {results.map((acc) => (
                <li key={acc._id}>
                  <button
                    className="location-card"
                    onClick={() =>
                      navigate(`/locations/${acc._id}`)
                    }
                    aria-label={`View ${acc.title}`}
                  >
                    <img
                      src={
                        acc.images?.[0]?.startsWith('/uploads')
                          ? `http://localhost:5000${acc.images[0]}`
                          : acc.images?.[0]
                      }
                      alt={acc.title}
                      className="location-card__img"
                      loading="lazy"
                    />

                    <div className="location-card__body">
                      <div className="location-card__top">
                        <span className="location-card__type">
                          {acc.type}
                        </span>

                        <span className="location-card__rating">
                          <StarRating rating={acc.rating || 0} />

                          <span>
                            {acc.rating || 0} ({acc.reviews || 0})
                          </span>
                        </span>
                      </div>

                      <h2 className="location-card__title">
                        {acc.title}
                      </h2>

                      <p className="location-card__location">
                        <svg
                          viewBox="0 0 32 32"
                          aria-hidden="true"
                        >
                          <path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
                        </svg>

                        {acc.location}
                      </p>

                      <ul className="location-card__amenities">
                        {acc.amenities?.slice(0, 4).map((amenity) => (
                          <li key={amenity}>{amenity}</li>
                        ))}

                        {acc.amenities?.length > 4 && (
                          <li>
                            +{acc.amenities.length - 4} more
                          </li>
                        )}
                      </ul>

                      <div className="location-card__footer">
                        <div className="location-card__details">
                          <span>
                            {acc.bedrooms} bed
                            {acc.bedrooms !== 1 ? 's' : ''}
                          </span>

                          <span>·</span>

                          <span>
                            {acc.bathrooms} bath
                            {acc.bathrooms !== 1 ? 's' : ''}
                          </span>

                          <span>·</span>

                          <span>
                            Up to {acc.guests} guests
                          </span>
                        </div>

                        <div className="location-card__price">
                          <strong>${acc.price}</strong>
                          <span> / night</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

