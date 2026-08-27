import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const emptyAddress = {
  label: 'Home',
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  countryCode: '+91',
  phone: '',
  isDefault: false,
};
const requiredAddressFields = new Set(['name', 'addressLine1', 'city', 'state', 'postalCode', 'phone']);

function validateCard(card) {
  const number = card.number.replace(/\D/g, '');
  if (!/^[0-9]{13,19}$/.test(number)) return 'Enter a valid card number.';

  let checksum = 0;
  let shouldDouble = false;
  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    checksum += digit;
    shouldDouble = !shouldDouble;
  }
  if (checksum % 10 !== 0) return 'Enter a valid card number.';

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) return 'Enter expiry as MM/YY.';
  const [month, year] = card.expiry.split('/').map(Number);
  const expiryDate = new Date(2000 + year, month, 0, 23, 59, 59, 999);
  if (expiryDate < new Date()) return 'Card expiry date must be in the future.';
  if (!/^[0-9]{3,4}$/.test(card.cvv)) return 'CVV must contain 3 or 4 digits.';
  if (!/^[A-Za-z][A-Za-z .'-]{1,79}$/.test(card.name.trim())) return 'Enter a valid cardholder name.';
  return '';
}

function validateTransactionId(transactionId) {
  const value = transactionId.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9-]{5,39}$/.test(value)) {
    return 'Enter a valid transaction ID (6-40 letters, numbers, or hyphens).';
  }
  if (!/\d/.test(value)) return 'Transaction ID must contain at least one number.';
  return '';
}

export default function Checkout() {
  const { token, userEmail } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardError, setCardError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [transactionError, setTransactionError] = useState('');
  const [status, setStatus] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    upiActive: true,
    cashOnDeliveryActive: true,
    upiId: 'sachinprakash893@ybl',
    freeShippingThreshold: 999,
    shippingFee: 99,
  });

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);
  const shipping = totalPrice >= Number(paymentSettings.freeShippingThreshold) ? 0 : Number(paymentSettings.shippingFee);
  const total = totalPrice + shipping;
  const selectedAddress = addresses.find(address => String(address.id) === String(selectedAddressId));

  useEffect(() => {
    if (!token) {
      setAddressesLoading(false);
      return;
    }
    setAddressesLoading(true);
    fetch(`${API_URL}/users/me/addresses`, { headers: authHeaders })
      .then(response => {
        if (!response.ok) throw new Error(`Unable to load saved addresses (${response.status}).`);
        return response.json();
      })
      .then(data => {
        const savedAddresses = Array.isArray(data) ? data : [];
        setAddresses(savedAddresses);
        const defaultAddress = savedAddresses.find(address => address.isDefault) || savedAddresses[0];
        if (defaultAddress) setSelectedAddressId(String(defaultAddress.id));
      })
      .catch(error => setStatus(error.message || 'Unable to load saved addresses.'))
      .finally(() => setAddressesLoading(false));
  }, [authHeaders, token]);

  useEffect(() => {
    fetch(`${API_URL}/payment-settings`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Unable to load payment settings.')))
      .then(settings => {
        setPaymentSettings(settings);
        if (paymentMethod === 'upi' && !settings.upiActive) setPaymentMethod('card');
        if (paymentMethod === 'cod' && !settings.cashOnDeliveryActive) setPaymentMethod('card');
      })
      .catch(error => setStatus(error.message));
  }, []);

  function updateAddress(field, value) {
    setAddressForm(previous => ({ ...previous, [field]: value }));
  }

  async function lookupPostalCode(value) {
    const postalCode = value.trim();
    if (!/^\d{6}$/.test(postalCode)) return;

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
      const data = await response.json();
      const postOffice = data?.[0]?.PostOffice?.[0];
      if (postOffice) {
        const areaAddress = [postOffice.Name, postOffice.Block]
          .filter(Boolean)
          .filter((value, index, values) => values.indexOf(value) === index)
          .join(', ');
        setAddressForm(previous => ({
          ...previous,
          addressLine1: previous.addressLine1 || areaAddress,
          city: postOffice.District || previous.city,
          state: postOffice.State || previous.state,
          country: 'India',
        }));
      }
    } catch (error) {
      console.error('Unable to look up postal code', error);
    }
  }

    function formatFieldLabel(field) {
      return field === 'addressLine1'
        ? 'Address'
        : field === 'addressLine2'
          ? 'Land Mark'
        : field.replace(/([A-Z])/g, ' $1').replace(/^./, character => character.toUpperCase());
    }

    function validateAddressPhone() {
      const phoneDigits = addressForm.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) return 'Enter exactly 10 digits for the phone number.';
      if (addressForm.countryCode === '+91' && !/^[6-9]\d{9}$/.test(phoneDigits)) {
        return 'Enter a valid 10-digit Indian mobile number.';
      }
      return '';
    }

    function getAddressPayload() {
      return {
        ...addressForm,
        phone: `${addressForm.countryCode} ${addressForm.phone}`.trim(),
        countryCode: undefined,
      };
    }

    async function handleSaveAddress() {
      const missingField = [...requiredAddressFields].find(field => !String(addressForm[field] || '').trim());
      if (missingField) {
        const missingMessage = `${formatFieldLabel(missingField)} is required.`;
        if (missingField === 'phone') setPhoneError(missingMessage);
        else setStatus(missingMessage);
        return;
      }

      const phoneError = validateAddressPhone();
      if (phoneError) {
        setPhoneError(phoneError);
        setStatus('');
        return;
      }

      setSubmitting(true);
      setStatus('Saving address...');
      try {
        const response = await fetch(`${API_URL}/users/me/addresses`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(getAddressPayload()),
        });
        if (!response.ok) throw new Error('Unable to save address.');
        const savedAddress = await response.json();
        setAddresses(previous => [...previous, savedAddress]);
        setSelectedAddressId(String(savedAddress.id));
        setAddressForm(emptyAddress);
        setPhoneError('');
        setStatus('Address saved successfully.');
      } catch (error) {
        setStatus(error.message || 'Unable to save address.');
      } finally {
        setSubmitting(false);
      }
    }

    function handleCancelAddress() {
      setAddressForm(emptyAddress);
      setStatus('');
    }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!cart.length) return;
    if (paymentMethod === 'card') {
      const validationError = validateCard(cardForm);
      if (validationError) {
        setCardError(validationError);
        setStatus(validationError);
        return;
      }
    }
    if (paymentMethod === 'upi') {
      const validationError = validateTransactionId(transactionId);
      if (validationError) {
        setTransactionError(validationError);
        setStatus(validationError);
        return;
      }
    }
    setSubmitting(true);
    setStatus('');

    try {
      let deliveryAddress = selectedAddress;
      if (selectedAddressId === 'new') {
        const phoneError = validateAddressPhone();
        if (phoneError) {
          setPhoneError(phoneError);
          throw new Error(phoneError);
        }

        const addressResponse = await fetch(`${API_URL}/users/me/addresses`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(getAddressPayload()),
        });
        if (!addressResponse.ok) throw new Error('Please enter a valid delivery address.');
        deliveryAddress = await addressResponse.json();
      }

      if (!deliveryAddress) throw new Error('Please select or add a delivery address.');
      const userResponse = await fetch(`${API_URL}/users/me`, { headers: authHeaders });
      if (!userResponse.ok) throw new Error('Please sign in again before placing the order.');
      const user = await userResponse.json();
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ userId: user.id, totalAmount: total, status: 'PENDING', paymentMethod: paymentMethod.toUpperCase() }),
      });
      if (!orderResponse.ok) throw new Error('Unable to place order. Please try again.');

      clearCart();
      navigate('/checkout/success');
    } catch (error) {
      if (error.message?.includes('phone number')) {
        setPhoneError(error.message);
        setStatus('');
      } else {
        setStatus(error.message || 'Unable to complete checkout.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.length) {
    return <div className="checkout-empty"><h1>Your cart is empty</h1><Link to="/shop" className="btn-primary">Browse Products</Link></div>;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <Link to="/cart" className="checkout-back">← Back to cart</Link>
        <h1>Checkout</h1>
        <span>{userEmail}</span>
      </div>
      <form className="checkout-grid" onSubmit={handleSubmit}>
        <div className="checkout-main">
          <section className="checkout-section">
            <h2>1. Delivery address</h2>
            {addressesLoading && <p className="payment-note">Loading saved addresses...</p>}
            {!addressesLoading && addresses.map(address => (
              <label className={`address-option ${String(address.id) === String(selectedAddressId) ? 'selected' : ''}`} key={address.id}>
                <input type="radio" name="address" value={address.id} checked={String(address.id) === String(selectedAddressId)} onChange={event => setSelectedAddressId(event.target.value)} />
                <span><strong>{address.label || 'Address'}</strong><br />{address.name}, {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} {address.postalCode}<br />{address.phone}</span>
              </label>
            ))}
            {!addressesLoading && <label className={`address-option ${selectedAddressId === 'new' ? 'selected' : ''}`}>
              <input type="radio" name="address" value="new" checked={selectedAddressId === 'new'} onChange={() => setSelectedAddressId('new')} />
              <span><strong>+ Add a new address</strong></span>
            </label>}
            {selectedAddressId === 'new' && (
              <div className="address-form">
                {['name', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'phone'].map(field => (
                  <label key={field}>{formatFieldLabel(field)}{requiredAddressFields.has(field) ? ' *' : ''}
                    {field === 'phone' ? (
                      <span className="phone-input-group">
                        <select value={addressForm.countryCode} onChange={event => updateAddress('countryCode', event.target.value)} aria-label="Country code">
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+61">+61</option>
                          <option value="+971">+971</option>
                        </select>
                        <input
                          required
                          aria-required="true"
                          value={addressForm.phone}
                          onChange={event => { setPhoneError(''); updateAddress(field, event.target.value.replace(/\D/g, '').slice(0, 10)); }}
                          inputMode="tel"
                          pattern="[0-9]{10}"
                          minLength={10}
                          maxLength={10}
                          title="Enter exactly 10 digits"
                        />
                        {phoneError && <small className="field-error">{phoneError}</small>}
                      </span>
                    ) : (
                      <input
                        required={requiredAddressFields.has(field)}
                        aria-required={requiredAddressFields.has(field) ? 'true' : undefined}
                        value={addressForm[field]}
                        onChange={event => {
                          updateAddress(field, event.target.value);
                          if (field === 'postalCode') lookupPostalCode(event.target.value);
                        }}
                        onBlur={field === 'postalCode' ? event => lookupPostalCode(event.target.value) : undefined}
                        inputMode={field === 'postalCode' ? 'numeric' : undefined}
                        maxLength={field === 'postalCode' ? 6 : undefined}
                      />
                    )}
                  </label>
                ))}
                <div className="address-actions">
                  <button type="button" className="btn-primary" onClick={handleSaveAddress} disabled={submitting}>Save Address</button>
                  <button type="button" className="btn-outline" onClick={handleCancelAddress} disabled={submitting}>Cancel</button>
                </div>
              </div>
            )}
            {status && <p className="checkout-status address-status">{status}</p>}
          </section>

          <section className="checkout-section">
            <h2>2. Payment method</h2>
            <div className="payment-methods">
              {[
                { id: 'card', label: 'Credit / Debit Card', enabled: true },
                { id: 'upi', label: 'UPI', enabled: paymentSettings.upiActive },
                { id: 'cod', label: 'Cash on Delivery', enabled: paymentSettings.cashOnDeliveryActive },
              ].filter(method => method.enabled).map(method => (
                <label className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`} key={method.id}>
                  <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={event => setPaymentMethod(event.target.value)} />
                  {method.label}
                </label>
              ))}
            </div>
            {paymentMethod === 'card' && (
              <div className="card-form">
                <input placeholder="Cardholder name" required value={cardForm.name} onChange={event => { setCardError(''); setCardForm({ ...cardForm, name: event.target.value }); }} />
                <input placeholder="Card number" inputMode="numeric" required maxLength={23} value={cardForm.number} onChange={event => { setCardError(''); const digits = event.target.value.replace(/\D/g, '').slice(0, 19); setCardForm({ ...cardForm, number: digits.replace(/(.{4})/g, '$1 ').trim() }); }} />
                <input placeholder="MM/YY" inputMode="numeric" required maxLength={5} value={cardForm.expiry} onChange={event => { setCardError(''); const digits = event.target.value.replace(/\D/g, '').slice(0, 4); setCardForm({ ...cardForm, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }); }} />
                <input placeholder="CVV" inputMode="numeric" required maxLength={4} value={cardForm.cvv} onChange={event => { setCardError(''); setCardForm({ ...cardForm, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) }); }} />
                {cardError && <p className="checkout-status card-status">{cardError}</p>}
              </div>
            )}
            {paymentMethod === 'upi' && (
              <div className="upi-payment">
                <div className="upi-section upi-qr-section">
                  <img
                    className="upi-qr-code"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${paymentSettings.upiId}&pn=PawMart`)}`}
                    alt="QR code for PawMart UPI payment"
                  />
                  <p className="payment-note">Scan this QR code to pay.</p>
                </div>
                <div className="upi-section upi-id-section">
                  <label htmlFor="upi-id">Transaction ID</label>
                  <input
                    id="upi-id"
                    className="upi-input"
                    placeholder="e.g. 123456789012"
                    required
                    maxLength={40}
                    value={transactionId}
                    onChange={event => {
                      setTransactionError('');
                      setTransactionId(event.target.value.replace(/\s/g, '').slice(0, 40));
                    }}
                  />
                  {transactionError && <p className="checkout-status transaction-status">{transactionError}</p>}
                </div>
              </div>
            )}
            {paymentMethod === 'cod' && <p className="payment-note">Pay when your order arrives.</p>}
          </section>
        </div>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {cart.map(item => <div className="checkout-item" key={item.id}><span>{item.name} × {item.qty}</span><strong>₹{(item.price * item.qty).toLocaleString()}</strong></div>)}
          <div className="summary-line"><span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
          <div className="summary-line"><span>Shipping</span><span>{shipping ? `₹${shipping}` : 'FREE'}</span></div>
          <div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString()}</strong></div>
          <button className="btn-checkout" type="submit" disabled={submitting}>{submitting ? 'Placing order...' : 'Place Order'}</button>
        </aside>
      </form>
    </div>
  );
}

export function CheckoutSuccess() {
  return (
    <div className="checkout-success">
      <div className="checkout-success-icon">✓</div>
      <h1>Order placed successfully</h1>
      <p>Thank you for shopping at PawMart. Your order is being prepared.</p>
      <Link to="/shop" className="btn-primary">Continue Shopping</Link>
    </div>
  );
}
