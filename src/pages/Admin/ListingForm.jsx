import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './Admin.css';

const AMENITY_OPTIONS = [
  'WiFi', 'Kitchen', 'Free parking', 'Air conditioning', 'Washer',
  'TV', 'Pool', 'Gym', 'Fireplace', 'Garden', 'Breakfast',
  'Balcony', 'Hot tub', 'Beach access', 'Pet friendly',
];

const TYPE_OPTIONS = [
  'Entire apartment', 'Entire house', 'Entire villa', 'Entire cottage',
  'Entire bungalow', 'Entire studio', 'Entire penthouse', 'Entire townhouse',
  'Private room', 'Shared room',
];

const EMPTY_FORM = {
  title: '', location: '', description: '', type: TYPE_OPTIONS[0],
  price: '', bedrooms: '', bathrooms: '', guests: '',
  amenities: [], weeklyDiscount: '', cleaningFee: '',
  serviceFee: '', occupancyTaxes: '',
  enhancedCleaning: false, selfCheckIn: false,
};

function validate(form) {
  const errs = {};
  if (!form.title.trim()) errs.title = 'Title is required';
  if (!form.location.trim()) errs.location = 'Location is required';
  if (!form.description.trim()) errs.description = 'Description is required';
  if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Enter a valid price';
  if (!form.bedrooms || isNaN(form.bedrooms) || Number(form.bedrooms) < 0) errs.bedrooms = 'Enter valid bedrooms';
  if (!form.bathrooms || isNaN(form.bathrooms) || Number(form.bathrooms) < 0) errs.bathrooms = 'Enter valid bathrooms';
  if (!form.guests || isNaN(form.guests) || Number(form.guests) < 1) errs.guests = 'At least 1 guest';
  return errs;
}

export default function ListingForm() {
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  /* Pre-fill form when editing */
  useEffect(() => {
    if (!isEdit) return;
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/accommodations/${id}`);
        setForm({
          title: data.title || '',
          location: data.location || '',
          description: data.description || '',
          type: data.type || TYPE_OPTIONS[0],
          price: data.price?.toString() || '',
          bedrooms: data.bedrooms?.toString() || '',
          bathrooms: data.bathrooms?.toString() || '',
          guests: data.guests?.toString() || '',
          amenities: data.amenities || [],
          weeklyDiscount: data.weeklyDiscount?.toString() || '',
          cleaningFee: data.cleaningFee?.toString() || '',
          serviceFee: data.serviceFee?.toString() || '',
          occupancyTaxes: data.occupancyTaxes?.toString() || '',
          enhancedCleaning: data.enhancedCleaning || false,
          selfCheckIn: data.selfCheckIn || false,
        });
        if (data.images?.length) setImagePreviews(data.images);
      } catch (err) {
        setServerError('Failed to load listing data');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchListing();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleAmenityToggle = (amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'amenities') {
          val.forEach((a) => formData.append('amenities', a));
        } else {
          formData.append(key, val);
        }
      });
      imageFiles.forEach((f) => formData.append('images', f));

      if (isEdit) {
        await api.put(`/accommodations/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/accommodations', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/admin');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" aria-label="Loading" />
        <p>Loading listing…</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <a href="/" className="admin-sidebar__logo">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1C10.925 1 7 6.925 7 11.5c0 3.712 2.388 7.662 4.925 10.65C14.1 24.85 16 26.5 16 26.5s1.9-1.65 4.075-4.35C22.612 19.162 25 15.212 25 11.5 25 6.925 21.075 1 16 1zm0 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" /></svg>
          airbnb
        </a>
        <nav className="admin-sidebar__nav">
          <a href="/admin" className="admin-sidebar__link">
            <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="11" height="11" rx="2"/><rect x="18" y="3" width="11" height="11" rx="2"/><rect x="3" y="18" width="11" height="11" rx="2"/><rect x="18" y="18" width="11" height="11" rx="2"/></svg>
            Listings
          </a>
          <a href="/admin/create" className="admin-sidebar__link admin-sidebar__link--active">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3v26M3 16h26"/></svg>
            {isEdit ? 'Edit listing' : 'Add listing'}
          </a>
        </nav>
      </aside>

      {/* Form */}
      <main className="admin-main">
        <div className="admin-main__header">
          <div>
            <h1 className="admin-main__title">{isEdit ? 'Update listing' : 'Create new listing'}</h1>
            <p className="admin-main__sub">{isEdit ? 'Edit the details below and save.' : 'Fill in the details to add a new property.'}</p>
          </div>
          <button className="btn btn--ghost" onClick={() => navigate('/admin')}>← Back</button>
        </div>

        {serverError && <div className="admin-alert admin-alert--error" role="alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate encType="multipart/form-data" className="admin-form">

          {/* Basic info */}
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Basic information</h2>
            <div className="admin-form__grid">

              <div className={`form-group ${errors.title ? 'form-group--error' : ''}`}>
                <label htmlFor="title" className="form-label">Title *</label>
                <input id="title" name="title" type="text" className="form-input"
                  value={form.title} onChange={handleChange} placeholder="Modern Apartment in New York" />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className={`form-group ${errors.location ? 'form-group--error' : ''}`}>
                <label htmlFor="location" className="form-label">Location *</label>
                <input id="location" name="location" type="text" className="form-input"
                  value={form.location} onChange={handleChange} placeholder="New York, USA" />
                {errors.location && <span className="form-error">{errors.location}</span>}
              </div>

              <div className="form-group form-group--full">
                <label htmlFor="description" className="form-label">Description *</label>
                <textarea id="description" name="description" className="form-input form-textarea"
                  value={form.description} onChange={handleChange} rows={4}
                  placeholder="Describe your property in detail…" />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type" className="form-label">Property type</label>
                <select id="type" name="type" className="form-input" value={form.type} onChange={handleChange}>
                  {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Capacity & pricing */}
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Capacity & pricing</h2>
            <div className="admin-form__grid">

              {[
                { id: 'price', label: 'Price per night ($) *', placeholder: '150' },
                { id: 'bedrooms', label: 'Bedrooms *', placeholder: '2' },
                { id: 'bathrooms', label: 'Bathrooms *', placeholder: '1' },
                { id: 'guests', label: 'Max guests *', placeholder: '4' },
                { id: 'weeklyDiscount', label: 'Weekly discount (%)', placeholder: '10' },
                { id: 'cleaningFee', label: 'Cleaning fee ($)', placeholder: '50' },
                { id: 'serviceFee', label: 'Service fee ($)', placeholder: '30' },
                { id: 'occupancyTaxes', label: 'Occupancy taxes ($)', placeholder: '20' },
              ].map(({ id, label, placeholder }) => (
                <div key={id} className={`form-group ${errors[id] ? 'form-group--error' : ''}`}>
                  <label htmlFor={id} className="form-label">{label}</label>
                  <input id={id} name={id} type="number" min="0" className="form-input"
                    value={form[id]} onChange={handleChange} placeholder={placeholder} />
                  {errors[id] && <span className="form-error">{errors[id]}</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Amenities</h2>
            <div className="admin-form__amenities">
              {AMENITY_OPTIONS.map((amenity) => (
                <label key={amenity} className={`admin-form__amenity ${form.amenities.includes(amenity) ? 'admin-form__amenity--selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="visually-hidden"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Features</h2>
            <div className="admin-form__checkboxes">
              <label className="admin-form__checkbox-label">
                <input type="checkbox" name="enhancedCleaning" checked={form.enhancedCleaning} onChange={handleChange} />
                Enhanced cleaning
              </label>
              <label className="admin-form__checkbox-label">
                <input type="checkbox" name="selfCheckIn" checked={form.selfCheckIn} onChange={handleChange} />
                Self check-in
              </label>
            </div>
          </section>

          {/* Images */}
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Images</h2>
            <label htmlFor="images" className="admin-form__upload-label">
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v16m-6-6l6-6 6 6M4 26h24"/></svg>
              Click to upload images (JPEG, PNG, WebP · max 5MB each)
            </label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="visually-hidden"
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="admin-form__previews">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i + 1}`} className="admin-form__preview-img" />
                ))}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="admin-form__submit">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin')}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create listing'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
