import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth__card">
        {/* Logo */}
        <Link to="/" className="admin-auth__logo">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" /></svg>
          airbnb
        </Link>

        <h1 className="admin-auth__title">Log in to your account</h1>
        <p className="admin-auth__sub">Manage your listings and reservations.</p>

        {serverError && (
          <div className="admin-auth__error" role="alert">{serverError}</div>
        )}

        <form className="admin-auth__form" onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="form-error" role="alert">{errors.email}</span>
            )}
          </div>

          <div className={`form-group ${errors.password ? 'form-group--error' : ''}`}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="form-error" role="alert">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="admin-auth__footer-text">
          Don't have an account?{' '}
          <Link to="/admin/register" className="admin-auth__link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
