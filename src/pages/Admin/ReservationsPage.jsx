import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Admin.css';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState(user?.role === 'host' || user?.role === 'admin' ? 'host' : 'user');

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = view === 'host' ? '/reservations/host' : '/reservations/user';
      const { data } = await api.get(endpoint);
      setReservations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, [view]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar__logo">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" /></svg>
          airbnb
        </Link>
        <nav className="admin-sidebar__nav">
          <Link to="/admin" className="admin-sidebar__link">
            <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="11" height="11" rx="2"/><rect x="18" y="3" width="11" height="11" rx="2"/><rect x="3" y="18" width="11" height="11" rx="2"/><rect x="18" y="18" width="11" height="11" rx="2"/></svg>
            Listings
          </Link>
          <Link to="/reservations" className="admin-sidebar__link admin-sidebar__link--active">
            <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="5" width="26" height="24" rx="2"/><path d="M21 3v4M11 3v4M3 13h26"/></svg>
            Reservations
          </Link>
        </nav>
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__username">{user?.username}</span>
            <span className="admin-sidebar__role">{user?.role}</span>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-main__header">
          <div>
            <h1 className="admin-main__title">Reservations</h1>
            <p className="admin-main__sub">View and manage bookings</p>
          </div>
          {(user?.role === 'host' || user?.role === 'admin') && (
            <div className="admin-view-toggle">
              <button
                className={`admin-view-btn ${view === 'host' ? 'admin-view-btn--active' : ''}`}
                onClick={() => setView('host')}
              >
                As host
              </button>
              <button
                className={`admin-view-btn ${view === 'user' ? 'admin-view-btn--active' : ''}`}
                onClick={() => setView('user')}
              >
                As guest
              </button>
            </div>
          )}
        </div>

        {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" aria-label="Loading" />
            <p>Loading reservations…</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="admin-empty">
            <p>No reservations found.</p>
            <Link to="/locations" className="btn btn--primary">Browse listings</Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>{view === 'host' ? 'Guest' : 'Host'}</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res._id}>
                    <td>
                      <div className="admin-table__listing">
                        <img
                          src={res.accommodation?.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=60'}
                          alt={res.accommodation?.title}
                          className="admin-table__thumb"
                          loading="lazy"
                        />
                        <div>
                          <span className="admin-table__listing-title">{res.accommodation?.title || '—'}</span>
                          <span style={{ display: 'block', fontSize: 12, color: '#717171' }}>{res.accommodation?.location}</span>
                        </div>
                      </div>
                    </td>
                    <td>{view === 'host' ? res.user?.username : res.host?.username || '—'}</td>
                    <td>{formatDate(res.checkIn)}</td>
                    <td>{formatDate(res.checkOut)}</td>
                    <td>{res.guests}</td>
                    <td><strong>${res.totalPrice?.toLocaleString()}</strong></td>
                    <td>
                      <span className={`admin-badge admin-badge--${res.status}`}>{res.status}</span>
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--delete"
                        onClick={() => handleCancel(res._id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
