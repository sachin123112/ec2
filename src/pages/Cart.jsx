import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const [ordered, setOrdered] = useState(false);

  if (ordered) {
    return (
      <div className="cart-success">
        <span>🎉</span>
        <h2>Order Placed!</h2>
        <p>Thank you for shopping at PawMart. Your furry friend will love it!</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <span>🛒</span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet. Go spoil your pet!</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const shipping = totalPrice >= 999 ? 0 : 99;
  const total = totalPrice + shipping;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Your Cart</h1>
        <button className="btn-clear" onClick={clearCart}>Clear All</button>
      </div>

      <div className="cart-body">
        {/* Items */}
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <span className="item-category">{item.category} · {item.subCategory}</span>
                <h3>{item.name}</h3>
                <span className="item-price">₹{item.price.toLocaleString()} each</span>
              </div>
              <div className="cart-item-controls">
                <div className="qty-control">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <span className="item-subtotal">₹{(item.price * item.qty).toLocaleString()}</span>
                <button className="btn-remove" onClick={() => removeFromCart(item.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'free' : ''}>
              {shipping === 0 ? '🎉 FREE' : `₹${shipping}`}
            </span>
          </div>

          {shipping > 0 && (
            <div className="shipping-note">
              Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping!
            </div>
          )}

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button
            className="btn-checkout"
            onClick={() => { clearCart(); setOrdered(true); }}
          >
            Proceed to Checkout →
          </button>

          <Link to="/shop" className="btn-continue">← Continue Shopping</Link>

          <div className="cart-trust">
            <span>🔒 Secure Checkout</span>
            <span>🚚 Fast Delivery</span>
            <span>↩️ Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
