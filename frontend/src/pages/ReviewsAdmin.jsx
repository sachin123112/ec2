import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import './ReviewsAdmin.css';

const initialReviews = [
  { id: 1, customer: 'Priya Sharma', product: 'Premium Dog Food', rating: 5, review: 'Excellent quality and my dog absolutely loves it.', date: '18 Sep 2026', status: 'Published', avatar: 'P' },
  { id: 2, customer: 'Sanjay Kumar', product: 'Interactive Cat Toy', rating: 4, review: 'Good toy with sturdy build. Delivery was quick too.', date: '17 Sep 2026', status: 'Published', avatar: 'S' },
  { id: 3, customer: 'Ananya Rao', product: 'Aquarium Water Filter', rating: 3, review: 'Works well, though the instructions could be clearer.', date: '16 Sep 2026', status: 'Pending', avatar: 'A' },
  { id: 4, customer: 'Rohit Mehta', product: 'Bird Cage', rating: 5, review: 'Spacious and easy to assemble. Very happy with the purchase.', date: '14 Sep 2026', status: 'Published', avatar: 'R' },
  { id: 5, customer: 'Neha Reddy', product: 'Pet Grooming Kit', rating: 2, review: 'The packaging arrived damaged and one item was missing.', date: '12 Sep 2026', status: 'Flagged', avatar: 'N' },
];

const statusOptions = ['All Status', 'Published', 'Pending', 'Flagged'];
const ratingOptions = ['All Ratings', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function ReviewsAdmin() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [ratingFilter, setRatingFilter] = useState(ratingOptions[0]);
  const [notice, setNotice] = useState('');

  const loadReviews = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Unable to load reviews (${response.status}).`);
      const loadedReviews = await response.json();
      setReviews(Array.isArray(loadedReviews) ? loadedReviews : []);
      setNotice('');
    } catch (error) {
      console.error(error);
      setNotice('Review service unavailable. Showing demo reviews.');
    }
  }, [token]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const filteredReviews = useMemo(() => reviews.filter(review => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || review.customer.toLowerCase().includes(query) || review.product.toLowerCase().includes(query) || review.review.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All Status' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'All Ratings' || review.rating === Number(ratingFilter.charAt(0));
    return matchesSearch && matchesStatus && matchesRating;
  }), [reviews, searchTerm, statusFilter, ratingFilter]);

  async function updateReviewStatus(id, nextStatus) {
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${id}/status?status=${nextStatus.toUpperCase()}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Unable to update review status.');
      setReviews(previous => previous.map(review => review.id === id ? { ...review, status: nextStatus } : review));
      setNotice(`Review ${nextStatus.toLowerCase()} successfully.`);
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function removeReview(id) {
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Unable to delete review.');
      setReviews(previous => previous.filter(review => review.id !== id));
      setNotice('Review removed successfully.');
    } catch (error) {
      setNotice(error.message);
    }
  }

  function resetFilters() {
    setSearchTerm('');
    setStatusFilter(statusOptions[0]);
    setRatingFilter(ratingOptions[0]);
    setNotice('');
  }

  return (
    <div className="dashboard-page reviews-admin-page">
      <div className="dashboard-header reviews-admin-header">
        <div className="dashboard-header-left">
          <div className="reviews-breadcrumb">
            <Link to="/admin/dashboard">Dashboard</Link>
            <span>›</span>
            <Link to="/admin/reviews">Reviews</Link>
            <span>›</span>
            <span className="reviews-breadcrumb-current">Manage Reviews</span>
          </div>
          <div className="reviews-title-row">
            <div className="reviews-title-icon">★</div>
            <div>
              <h1>Manage Reviews</h1>
              <p>Review, moderate, and manage customer feedback for your store.</p>
            </div>
          </div>
          <div className="header-links reviews-header-links">
            <Link to="/admin/products" className="btn-outline">Products</Link>
            <Link to="/admin/orders" className="btn-outline">Orders</Link>
            <Link to="/reports" className="btn-outline">Reports</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-status reviews-status-row">
        <span>{notice || `${reviews.length} customer reviews in your store`}</span>
        <div className="reviews-summary-pills">
          <span><strong>{reviews.filter(review => review.status === 'Pending').length}</strong> Pending</span>
          <span><strong>{reviews.filter(review => review.status === 'Published').length}</strong> Published</span>
        </div>
      </div>

      <section className="dashboard-card reviews-filter-card" aria-labelledby="reviews-filter-title">
        <div className="reviews-section-heading">
          <div className="reviews-section-icon">⌕</div>
          <div>
            <h2 id="reviews-filter-title">Filter Reviews</h2>
            <p>Find feedback by customer, product, rating, or moderation status.</p>
          </div>
        </div>
        <div className="reviews-filter-grid">
          <label>
            <span>Search</span>
            <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search reviews..." />
          </label>
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              {statusOptions.map(option => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Rating</span>
            <select value={ratingFilter} onChange={event => setRatingFilter(event.target.value)}>
              {ratingOptions.map(option => <option key={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" className="btn-outline reviews-reset-button" onClick={resetFilters}>↻ Reset</button>
        </div>
      </section>

      <section className="dashboard-card reviews-list-card">
        <div className="reviews-list-heading">
          <div className="reviews-section-heading">
            <div className="reviews-section-icon list">▤</div>
            <div>
              <h2>Customer Reviews</h2>
              <p>Moderate feedback before it appears in your storefront.</p>
            </div>
          </div>
          <button type="button" className="btn-outline reviews-export-button">⇩ Export</button>
        </div>

        <div className="reviews-table-scroll">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 && <tr><td colSpan="7" className="reviews-empty-state">No reviews match these filters.</td></tr>}
              {filteredReviews.map(review => (
                <tr key={review.id}>
                  <td>
                    <div className="review-customer-cell">
                      <span className="review-avatar">{review.avatar}</span>
                      <strong>{review.customer}</strong>
                    </div>
                  </td>
                  <td className="review-product-cell">{review.product}</td>
                  <td><span className="review-rating">{'★'.repeat(review.rating)}<small>{'★'.repeat(5 - review.rating)}</small></span></td>
                  <td className="review-copy">{review.review}</td>
                  <td>{review.date}</td>
                  <td><span className={`review-status-pill ${review.status.toLowerCase()}`}>{review.status}</span></td>
                  <td>
                    <div className="review-actions">
                      {review.status !== 'Published' && <button type="button" className="review-action approve" onClick={() => updateReviewStatus(review.id, 'Published')}>Approve</button>}
                      {review.status !== 'Flagged' && <button type="button" className="review-action flag" onClick={() => updateReviewStatus(review.id, 'Flagged')}>Flag</button>}
                      <button type="button" className="review-action remove" onClick={() => removeReview(review.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="reviews-footer-row">
          <span>Showing {filteredReviews.length} of {reviews.length} reviews</span>
          <div className="pagination-controls">
            <button type="button" aria-label="Previous page">‹</button>
            <button type="button" className="page-btn active">1</button>
            <button type="button" aria-label="Next page">›</button>
          </div>
        </div>
      </section>
    </div>
  );
}
