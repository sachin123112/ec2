import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import './Cart.css';

function resolveBannerUrl(imageUrl) {
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/api\/v1\/?$/, '')}/${imageUrl.replace(/^\/+/, '')}`;
}

export default function Cart() {
  const { cart, removeFromCart, updateQty, totalPrice } = useCart();
  const navigate = useNavigate();
  const [pageBanner, setPageBanner] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/banners?page=CART`)
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (!mounted) return;
        setPageBanner(Array.isArray(data) && data.length > 0 ? data[0] : null);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        {pageBanner && (
          <section aria-label="Cart page banner" style={{ width: 'min(1200px, calc(100% - 32px))', margin: '0 auto 1.25rem', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(21, 33, 59, 0.08)' }}>
            <img src={resolveBannerUrl(pageBanner.imageUrl)} alt="Cart banner" style={{ display: 'block', width: '100%', height: '220px', objectFit: 'cover' }} />
          </section>
        )}
        <span>🛒</span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet. Go spoil your pet!</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const shipping = totalPrice >= 999 ? 0 : 99;
  const total = totalPrice + shipping;
  const selectedItems = cart.filter(item => selectedItemIds === null || selectedItemIds.has(item.id));
  const allItemsSelected = selectedItems.length === cart.length;

  function toggleSelectAll() {
    setSelectedItemIds(allItemsSelected ? new Set() : new Set(cart.map(item => item.id)));
  }

  function toggleItemSelection(itemId) {
    setSelectedItemIds(current => {
      const next = new Set(current ?? cart.map(item => item.id));
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function removeSelectedItems() {
    selectedItems.forEach(item => removeFromCart(item.id));
    setSelectedItemIds(null);
  }

  return (
    <div className="cart-page">
      {pageBanner && (
        <section aria-label="Cart page banner" className="cart-banner-wrap">
          <img src={resolveBannerUrl(pageBanner.imageUrl)} alt="Cart banner" className="cart-banner" />
        </section>
      )}

      <div className="cart-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span className="cart-breadcrumb-current">Cart</span>
      </div>

      <div className="cart-header">
        <div className="cart-title-wrap">
          <span className="cart-icon-badge">🛒</span>
          <div>
            <h1>Your Cart</h1>
            <p>Review your items before checkout</p>
          </div>
        </div>
        <Link to="/shop" className="cart-continue-btn">← Continue Shopping</Link>
      </div>

      <div className="cart-body">
        <div className="cart-items-panel">
          <div className="cart-selection-row">
            <label className="select-all" htmlFor="cart-select-all">
              <input id="cart-select-all" type="checkbox" checked={allItemsSelected} onChange={toggleSelectAll} />
              <span>Select All <span className="selection-count">({cart.length} {cart.length === 1 ? 'item' : 'items'})</span></span>
            </label>
            <button type="button" className="remove-selected-btn" onClick={removeSelectedItems} disabled={selectedItems.length === 0}>
              Remove Selected{selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}
            </button>
          </div>

          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <label className="cart-item-check" aria-label={`Select ${item.name}`}>
                  <input type="checkbox" checked={selectedItemIds === null || selectedItemIds.has(item.id)} onChange={() => toggleItemSelection(item.id)} />
                </label>

                <img src={item.image} alt={item.name} />

                <div className="cart-item-info">
                  <span className="item-category">{item.category} · {item.subCategory}</span>
                  <h3>{item.name}</h3>
                  <div className="item-stock-row">
                    <span className="item-stock-indicator">●</span>
                    <span>In Stock</span>
                  </div>
                  <div className="item-price-row">
                    <span className="item-price">₹{item.price.toLocaleString()} each</span>
                  </div>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} aria-label={`Decrease quantity for ${item.name}`}>−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} aria-label={`Increase quantity for ${item.name}`}>+</button>
                  </div>

                  <span className="item-subtotal">₹{(item.price * item.qty).toLocaleString()}</span>

                  <button type="button" className="btn-remove" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="cart-summary">
          <div className="summary-header">
            <span className="summary-icon">🧾</span>
            <div>
              <h2>Order Summary</h2>
              <p>Review your order details</p>
            </div>
          </div>

          <div className="summary-row">
            <span>Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>

          <div className="summary-row shipping-row">
            <span>Delivery Charge</span>
            <span className={shipping === 0 ? 'free' : ''}>
              {shipping === 0 ? '₹0 Free' : `₹${shipping}`}
            </span>
          </div>

          {shipping > 0 && (
            <div className="shipping-note">
              Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping
            </div>
          )}

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button className="btn-checkout" onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>

          <div className="cart-trust">
            <span className="trust-badge"><span aria-hidden="true">🔒</span> Secure Payment</span>
            <span className="trust-badge"><span aria-hidden="true">🚚</span> Fast Delivery</span>
            <span className="trust-badge"><span aria-hidden="true">↩️</span> Easy Returns</span>
          </div>

          <div className="promo-banner">
            <div className="promo-icon">🎁</div>
            <div>
              <strong>{shipping === 0 ? 'You are eligible for FREE shipping!' : 'Unlock FREE shipping'}</strong>
              <small>{shipping === 0 ? 'Your order qualifies for free delivery.' : `Add ₹${(999 - totalPrice).toLocaleString()} more to qualify.`}</small>
            </div>
            <span className="promo-arrow" aria-hidden="true">›</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
