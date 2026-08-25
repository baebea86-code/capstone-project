import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import './HomePage.css';

/* ── Static destination inspiration data ─────────────────────────────────── */
const inspirationCards = [
  { label: 'New York', sublabel: '4 hours away', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
  { label: 'London',   sublabel: '8 hours away', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  { label: 'Paris',    sublabel: '2 hours away', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { label: 'Tokyo',    sublabel: '14 hours away', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { label: 'Bali',     sublabel: '18 hours away', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { label: 'Dubai',    sublabel: '7 hours away', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
];

const getawayTabs = ['Beach', 'Mountains', 'City', 'Countryside', 'Islands'];

const getawayListings = {
  Beach:       ['Malibu', 'Cancun', 'Phuket', 'Amalfi', 'Mykonos', 'Gold Coast', 'Zanzibar', 'Tulum'],
  Mountains:   ['Swiss Alps', 'Aspen', 'Banff', 'Queenstown', 'Zermatt', 'Patagonia', 'Chamonix', 'Whistler'],
  City:        ['New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Singapore', 'Barcelona', 'Amsterdam'],
  Countryside: ['Tuscany', 'Cotswolds', 'Provence', 'Napa Valley', 'Kyoto', 'Kerala', 'Highlands', 'Loire Valley'],
  Islands:     ['Maldives', 'Santorini', 'Bali', 'Seychelles', 'Bora Bora', 'Hawaii', 'Capri', 'Palawan'],
};

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(getawayTabs[0]);

  return (
    <div className="home">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="home__hero">
        <div className="home__hero-overlay">
          <h1 className="home__hero-title">Find your next adventure</h1>
          <p className="home__hero-sub">
            Discover unique homes, experiences, and places around the world.
          </p>
          <button
            className="home__hero-cta"
            onClick={() => navigate('/locations?location=New York')}
          >
            Explore now
          </button>
        </div>
      </section>

      {/* ── Inspiration for your next trip ──────────────────────────────── */}
      <section className="home__section">
        <div className="home__section-inner">
          <h2 className="home__section-title">Inspiration for your next trip</h2>
          <div className="home__inspiration-grid">
            {inspirationCards.map((card) => (
              <button
                key={card.label}
                className="home__inspiration-card"
                onClick={() =>
                  navigate(`/locations?location=${encodeURIComponent(card.label)}`)
                }
              >
                <img
                  src={card.img}
                  alt={card.label}
                  className="home__inspiration-img"
                  loading="lazy"
                />
                <div className="home__inspiration-info">
                  <span className="home__inspiration-label">{card.label}</span>
                  <span className="home__inspiration-sub">{card.sublabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Discover Airbnb Experiences ─────────────────────────────────── */}
      <section className="home__section home__section--gray">
        <div className="home__section-inner">
          <h2 className="home__section-title">Discover Airbnb Experiences</h2>
          <div className="home__experiences-grid">
            <div className="home__experience-card">
              <div
                className="home__experience-img"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600)',
                }}
              >
                <div className="home__experience-overlay">
                  <h3>Things to do on your trip</h3>
                  <button className="home__experience-btn">Explore</button>
                </div>
              </div>
            </div>
            <div className="home__experience-card">
              <div
                className="home__experience-img"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600)',
                }}
              >
                <div className="home__experience-overlay">
                  <h3>Things to do at home</h3>
                  <button className="home__experience-btn">Explore</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ShopAirbnb ──────────────────────────────────────────────────── */}
      <section className="home__section">
        <div className="home__section-inner">
          <div className="home__shop-grid">
            <div className="home__shop-content">
              <h2 className="home__section-title">Shop Airbnb gift cards</h2>
              <p className="home__shop-text">
                Give the gift of travel. Gift cards can be used for stays,
                experiences, and more.
              </p>
              <button className="home__shop-btn">Shop now</button>
            </div>
            <div className="home__shop-image">
              <img
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500"
                alt="Airbnb gift cards"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Inspiration for future getaways ─────────────────────────────── */}
      <section className="home__section home__section--gray">
        <div className="home__section-inner">
          <h2 className="home__section-title">Inspiration for future getaways</h2>
          <div className="home__tabs" role="tablist">
            {getawayTabs.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`home__tab${activeTab === tab ? ' home__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <ul className="home__getaway-list" role="tabpanel">
            {getawayListings[activeTab].map((item) => (
              <li key={item}>
                <button
                  className="home__getaway-item"
                  onClick={() =>
                    navigate(`/locations?location=${encodeURIComponent(item)}`)
                  }
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
