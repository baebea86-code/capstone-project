import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Header.css';

/**
 * Top Header — Airbnb logo, location search filter, auth-aware profile section.
 * Logged-in: greeting + dropdown (reservations, admin dashboard, logout).
 * Logged-out: "Become a host" link + login button.
 */
export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locations, setLocations] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unique locations from API on mount
  useEffect(() => {
    api.get('/accommodations')
      .then(({ data }) => {
        // API returns { data: [...], pagination: {...} }
        const list = data.data || data;
        const unique = [...new Set(list.map((a) => a.location).filter(Boolean))].sort();
        setLocations(unique);
      })
      .catch(() => {}); // fail silently — search still works without suggestions
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim()) {
      setSuggestions(
        locations.filter((l) => l.toLowerCase().includes(val.toLowerCase()))
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSuggestions([]);
      navigate(`/locations?location=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSuggestionClick = (loc) => {
    setSearchValue(loc);
    setSuggestions([]);
    navigate(`/locations?location=${encodeURIComponent(loc)}`);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <Link to="/" className="header__logo" aria-label="Airbnb home">
          <svg viewBox="0 0 32 32" className="header__logo-icon" aria-hidden="true">
            <path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
          </svg>
          <span className="header__logo-text">airbnb</span>
        </Link>

        {/* Search Bar */}
        <form className="header__search" onSubmit={handleSearchSubmit} role="search">
          <div className="header__search-wrap">
            <input
              type="text"
              className="header__search-input"
              placeholder="Search destinations..."
              value={searchValue}
              onChange={handleSearchChange}
              aria-label="Search destinations"
              autoComplete="off"
            />
            <button type="submit" className="header__search-btn" aria-label="Search">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M13 3a10 10 0 107.32 16.906l5.387 5.387a1.5 1.5 0 002.122-2.121l-5.387-5.388A10 10 0 0013 3zm-7 10a7 7 0 1114 0 7 7 0 01-14 0z" />
              </svg>
            </button>
            {suggestions.length > 0 && (
              <ul className="header__suggestions" role="listbox">
                {suggestions.map((loc) => (
                  <li
                    key={loc}
                    role="option"
                    className="header__suggestion-item"
                    onClick={() => handleSuggestionClick(loc)}
                  >
                    <svg viewBox="0 0 32 32" aria-hidden="true" className="header__suggestion-icon">
                      <path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
                    </svg>
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {/* Nav */}
        <nav className="header__nav" aria-label="Main navigation">
          {!isAuthenticated && (
            <Link to="/admin/login" className="header__become-host">
              Become a host
            </Link>
          )}

          <div className="header__profile" ref={dropdownRef}>
            <button
              className="header__profile-btn"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              {/* Hamburger lines */}
              <svg viewBox="0 0 32 32" className="header__menu-icon" aria-hidden="true">
                <rect x="5" y="9" width="22" height="2" rx="1" />
                <rect x="5" y="15" width="22" height="2" rx="1" />
                <rect x="5" y="21" width="22" height="2" rx="1" />
              </svg>
              {/* Avatar */}
              <div className="header__avatar" aria-hidden="true">
                {isAuthenticated ? (
                  <span className="header__avatar-initials">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M16 8a5 5 0 100 10A5 5 0 0016 8zm-9 18a9 9 0 0118 0H7z" />
                  </svg>
                )}
              </div>
            </button>

            {dropdownOpen && (
              <div className="header__dropdown" role="menu">
                {isAuthenticated ? (
                  <>
                    <div className="header__dropdown-greeting">
                      Hello, {user.username} 👋
                    </div>
                    <Link
                      to="/reservations"
                      className="header__dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Reservations
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="header__dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      className="header__dropdown-item header__dropdown-logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/login"
                      className="header__dropdown-item header__dropdown-item--bold"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/admin/login"
                      className="header__dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
