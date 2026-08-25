import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Admin.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/accommodations');
      setListings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/accommodations/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar__logo">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" /></svg>
          airbnb
        </Link>
        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          <Link to="/admin" className="admin-sidebar__link admin-sidebar__link--active">
            <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="11" height="11" rx="2"/><rect x="18" y="3" width="11" height="11" rx="2"/><rect x="3" y="18" width="11" height="11" rx="2"/><rect x="18" y="18" width="11" height="11" rx="2"/></svg>
            Listings
          </Link>
          <Link to="/admin/create" className="admin-sidebar__link">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3v26M3 16h26"/></svg>
            Add listing
          </Link>
          <Link to="/reservations" className="admin-sidebar__link">
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
          <button className="admin-sidebar__logout" onClick={handleLogout} title="Log out" aria-label="Log out">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18 20l4-4-4-4M22 16H10M13 26H6a1 1 0 01-1-1V7a1 1 0 011-1h7"/></svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-main__header">
          <div>
            <h1 className="admin-main__title">Property Listings</h1>
            <p className="admin-main__sub">Manage all your property listings</p>
          </div>
          <Link to="/admin/create" className="btn btn--primary">
            + Add new listing
          </Link>
        </div>

        {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" aria-label="Loading" />
            <p>Loading listings…</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="admin-empty">
            <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 10a5 5 0 110 10 5 5 0 010-10zm0 32c-6.667 0-12.571-3.41-16-8.57C16.031 37.337 22.286 34 32 34c9.714 0 15.969 3.337 16 7.43C44.571 46.59 38.667 50 32 50z" fill="#ddd"/></svg>
            <p>No listings yet.</p>
            <Link to="/admin/create" className="btn btn--primary">Create your first listing</Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Price/night</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing._id}>
                    <td>
                      <div className="admin-table__listing">
                        <img
                          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'}
                          alt={listing.title}
                          className="admin-table__thumb"
                          loading="lazy"
                        />
                        <span className="admin-table__listing-title">{listing.title}</span>
                      </div>
                    </td>
                    <td>{listing.location}</td>
                    <td><span className="admin-badge">{listing.type}</span></td>
                    <td><strong>${listing.price}</strong></td>
                    <td>★ {listing.rating || '—'}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link to={`/locations/${listing._id}`} className="admin-btn admin-btn--view" title="View listing">
                          View
                        </Link>
                        <Link to={`/admin/edit/${listing._id}`} className="admin-btn admin-btn--edit" title="Edit listing">
                          Edit
                        </Link>
                        <button
                          className="admin-btn admin-btn--delete"
                          onClick={() => setDeleteId(listing._id)}
                          title="Delete listing"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="admin-modal">
            <h2 id="modal-title" className="admin-modal__title">Delete listing?</h2>
            <p className="admin-modal__body">This action cannot be undone. The listing will be permanently removed.</p>
            <div className="admin-modal__actions">
              <button className="btn btn--ghost" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={() => handleDelete(deleteId)}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
