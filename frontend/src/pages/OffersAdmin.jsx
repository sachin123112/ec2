import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './OffersAdmin.css';

const initialOffers = [
  { id: 1, title: 'Up to 30% OFF on Pet Food', type: 'Product', discount: '30%', startDate: '01 Sep 2026', endDate: '30 Sep 2026', status: 'Active', image: '/images/product-royal-canin.png' },
  { id: 2, title: 'Up to 25% OFF on Toys & Accessories', type: 'Category', discount: '25%', startDate: '01 Sep 2026', endDate: '30 Sep 2026', status: 'Active', image: '/images/promo-toys.png' },
  { id: 3, title: 'Combo Offers on Grooming & Care', type: 'Combo', discount: '₹50 - ₹200', startDate: '05 Sep 2026', endDate: '25 Sep 2026', status: 'Active', image: '/images/product-bed.png' },
  { id: 4, title: 'Summer Deals', type: 'Product', discount: '20%', startDate: '10 Sep 2026', endDate: '20 Sep 2026', status: 'Active', image: '/images/category-food.png' },
  { id: 5, title: 'New User Offer', type: 'Coupon', discount: '₹100', startDate: '01 Sep 2026', endDate: '30 Sep 2026', status: 'Active', image: '/images/hero-pets.png' },
  { id: 6, title: 'Free Shipping on Orders', type: 'Cart', discount: 'Free Shipping', startDate: '01 Sep 2026', endDate: '31 Dec 2026', status: 'Active', image: '/images/product-kong.png' },
  { id: 7, title: 'Royal Canin Special Offer', type: 'Brand', discount: '15%', startDate: '01 Sep 2026', endDate: '30 Sep 2026', status: 'Active', image: '/images/product-royal-canin.png' },
  { id: 8, title: 'Clearance Sale', type: 'Product', discount: '50%', startDate: '15 Sep 2026', endDate: '30 Sep 2026', status: 'Inactive', image: '/images/product-whiskas.png' },
];

function typeClass(type) {
  return type.toLowerCase();
}

export default function OffersAdmin() {
  const [offers, setOffers] = useState(initialOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Product', discount: '', startDate: '2026-09-01', endDate: '2026-09-30' });
  const [message, setMessage] = useState('');

  const filteredOffers = useMemo(() => offers.filter(offer => {
    const query = searchTerm.trim().toLowerCase();
    return (!query || offer.title.toLowerCase().includes(query))
      && (typeFilter === 'All' || offer.type === typeFilter)
      && (statusFilter === 'All' || offer.status === statusFilter);
  }), [offers, searchTerm, typeFilter, statusFilter]);

  function clearFilters() {
    setSearchTerm('');
    setTypeFilter('All');
    setStatusFilter('All');
  }

  function formatDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function handleAddOffer(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setOffers(previous => [{
      id: Date.now(), title: form.title.trim(), type: form.type, discount: form.discount || 'Custom', startDate: formatDate(form.startDate), endDate: formatDate(form.endDate), status: 'Active', image: '/images/hero-pets.png',
    }, ...previous]);
    setForm({ title: '', type: 'Product', discount: '', startDate: '2026-09-01', endDate: '2026-09-30' });
    setIsAddOpen(false);
    setMessage('Offer added to this session.');
  }

  function toggleStatus(id) {
    setOffers(previous => previous.map(offer => offer.id === id ? { ...offer, status: offer.status === 'Active' ? 'Inactive' : 'Active' } : offer));
  }

  function removeOffer(id) {
    setOffers(previous => previous.filter(offer => offer.id !== id));
    setMessage('Offer removed from this session.');
  }

  return (
    <div className="offers-admin-page">
      <header className="offers-admin-header">
        <div><h1>Manage Offers</h1><div className="offers-admin-breadcrumb"><Link to="/admin/dashboard">Home</Link><span>›</span><span>Offers</span></div></div>
        <button type="button" className="offers-admin-add" onClick={() => setIsAddOpen(true)}><span>+</span> Add Offer</button>
      </header>

      {message && <div className="offers-admin-message" role="status">{message}</div>}

      {isAddOpen && (
        <div className="offers-admin-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setIsAddOpen(false)}>
          <form className="offers-admin-modal" onSubmit={handleAddOffer}>
            <div className="offers-admin-modal-heading"><div><span className="offers-admin-kicker">Campaign setup</span><h2>Add offer</h2></div><button type="button" className="offers-admin-close" onClick={() => setIsAddOpen(false)} aria-label="Close">×</button></div>
            <label>Offer title<input autoFocus value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="e.g. Summer Pet Sale" required /></label>
            <label>Offer type<select value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}><option>Product</option><option>Category</option><option>Combo</option><option>Coupon</option><option>Cart</option><option>Brand</option></select></label>
            <label>Discount<input value={form.discount} onChange={event => setForm({ ...form, discount: event.target.value })} placeholder="e.g. 20%" /></label>
            <div className="offers-admin-date-fields"><label>Start date<input type="date" value={form.startDate} onChange={event => setForm({ ...form, startDate: event.target.value })} /></label><label>End date<input type="date" value={form.endDate} onChange={event => setForm({ ...form, endDate: event.target.value })} /></label></div>
            <div className="offers-admin-modal-actions"><button type="button" className="offers-admin-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button><button type="submit" className="offers-admin-add">Save Offer</button></div>
          </form>
        </div>
      )}

      <section className="offers-admin-card">
        <div className="offers-admin-toolbar">
          <label className="offers-admin-search"><span>⌕</span><input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search offers..." aria-label="Search offers" /></label>
          <label className="offers-admin-filter">Offer Type<select value={typeFilter} onChange={event => setTypeFilter(event.target.value)}><option>All</option><option>Product</option><option>Category</option><option>Combo</option><option>Coupon</option><option>Cart</option><option>Brand</option></select></label>
          <label className="offers-admin-filter">Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></label>
          <button type="button" className="offers-admin-reset" onClick={clearFilters}>↻ Reset</button>
        </div>

        <div className="offers-admin-table-wrap">
          <table className="offers-admin-table">
            <thead><tr><th><input type="checkbox" aria-label="Select all offers" /></th><th>#</th><th>Offer Image</th><th>Title</th><th>Type</th><th>Discount</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filteredOffers.map((offer, index) => <tr key={offer.id}>
              <td><input type="checkbox" aria-label={`Select ${offer.title}`} /></td><td>{index + 1}</td>
              <td><img className="offers-admin-image" src={offer.image} alt="" /></td><td className="offers-admin-title">{offer.title}</td>
              <td><span className={`offers-admin-type offers-admin-type--${typeClass(offer.type)}`}>{offer.type}</span></td><td>{offer.discount}</td><td>{offer.startDate}</td><td>{offer.endDate}</td>
              <td><button type="button" className={`offers-admin-status offers-admin-status--${offer.status.toLowerCase()}`} onClick={() => toggleStatus(offer.id)}>{offer.status}</button></td>
              <td><div className="offers-admin-actions"><button type="button" className="offers-admin-edit" onClick={() => setMessage(`Edit form for ${offer.title} is ready for backend integration.`)} aria-label={`Edit ${offer.title}`}>✎</button><button type="button" className="offers-admin-delete" onClick={() => removeOffer(offer.id)} aria-label={`Delete ${offer.title}`}>♧</button></div></td>
            </tr>)}</tbody>
          </table>
          {filteredOffers.length === 0 && <div className="offers-admin-empty">No offers match your filters.</div>}
        </div>
        <footer className="offers-admin-footer"><span>Showing {filteredOffers.length} of {offers.length} offers</span><div className="offers-admin-pagination"><button type="button" disabled>‹</button><button type="button" disabled>‹</button><button type="button" className="active">1</button><button type="button">2</button><button type="button">›</button></div></footer>
      </section>
    </div>
  );
}
