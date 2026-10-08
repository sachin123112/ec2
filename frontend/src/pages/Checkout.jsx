import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

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

function validateGstin(value) {
  const gstin = String(value || '').trim().toUpperCase();
  return !gstin || GSTIN_PATTERN.test(gstin) ? '' : 'Enter a valid 15-character GSTIN.';
}

export default function Checkout() {
  const { token, userEmail } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentProvider, setPaymentProvider] = useState('');
  const [gstin, setGstin] = useState('');
  const [gstinError, setGstinError] = useState('');
  const [status, setStatus] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    upiActive: true,
    netBankingActive: true,
    creditCardActive: true,
    debitCardActive: true,
    qrCodeActive: true,
    payuActive: false,
    phonePeActive: false,
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
        setPaymentProvider(settings.phonePeActive ? 'PHONEPE' : settings.payuActive ? 'PAYU' : '');
        const hasOnlineMethod = settings.payuActive || settings.phonePeActive;
        if (!hasOnlineMethod && settings.cashOnDeliveryActive) setPaymentMethod('cod');
        else if (!settings.creditCardActive && settings.upiActive) setPaymentMethod('upi');
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
    if (paymentMethod !== 'cod' && !paymentProvider) {
      setStatus('Online payment is not currently available. Select Cash on Delivery.');
      return;
    }
    const gstinValidationError = validateGstin(gstin);
    if (gstinValidationError) {
      setGstinError(gstinValidationError);
      setStatus(gstinValidationError);
      return;
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
        body: JSON.stringify({
          userId: user.id,
          paymentMethod: paymentMethod.toUpperCase(),
          paymentProvider: paymentMethod === 'cod' ? null : paymentProvider,
          customerPhone: deliveryAddress.phone,
          gstin: gstin.trim().toUpperCase() || null,
          shippingAddress: [
            deliveryAddress.name,
            deliveryAddress.addressLine1,
            deliveryAddress.addressLine2,
            deliveryAddress.city,
            deliveryAddress.state,
            deliveryAddress.postalCode,
            deliveryAddress.country,
            deliveryAddress.phone,
          ].filter(Boolean).join(', '),
          items: cart.map(item => ({ productId: item.id, quantity: item.qty })),
        }),
      });
      const orderResult = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok) throw new Error(orderResult.message || 'Unable to place order. Please try again.');

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/checkout/success?orderId=${orderResult.id}&cod=true`);
        return;
      }

      if (orderResult.gateway === 'PAYU' && orderResult.checkoutUrl && orderResult.formData) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = orderResult.checkoutUrl;
        Object.entries(orderResult.formData).forEach(([name, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
      if (orderResult.gateway === 'PHONEPE' && orderResult.checkoutUrl) {
        window.location.assign(orderResult.checkoutUrl);
        return;
      }
      throw new Error('The payment provider did not return a checkout page. Please try again.');
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
            <h2>2. GST details <span className="optional-label">Optional</span></h2>
            <label className="gstin-field" htmlFor="checkout-gstin">GSTIN</label>
            <input
              id="checkout-gstin"
              className="gstin-input"
              value={gstin}
              onChange={event => {
                setGstinError('');
                setGstin(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15));
              }}
              onBlur={() => setGstinError(validateGstin(gstin))}
              maxLength={15}
              pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]"
              title="Enter a valid 15-character GSTIN."
              autoComplete="off"
              aria-invalid={Boolean(gstinError)}
              aria-describedby={gstinError ? 'checkout-gstin-error' : 'checkout-gstin-note'}
              placeholder="15-character GSTIN"
            />
            {gstinError
              ? <p className="checkout-status gstin-error" id="checkout-gstin-error" role="alert">{gstinError}</p>
              : <p className="payment-note gstin-note" id="checkout-gstin-note">Add a GSTIN to include it on your billing invoice.</p>}
          </section>

          <section className="checkout-section">
            <h2>3. Payment method</h2>
            <div className="payment-methods">
              {[
                { id: 'credit_card', label: 'Credit Card', enabled: paymentSettings.creditCardActive },
                { id: 'debit_card', label: 'Debit Card', enabled: paymentSettings.debitCardActive },
                { id: 'upi', label: 'UPI', enabled: paymentSettings.upiActive },
                { id: 'net_banking', label: 'Net Banking', enabled: paymentSettings.netBankingActive },
                { id: 'cod', label: 'Cash on Delivery', enabled: paymentSettings.cashOnDeliveryActive },
              ].filter(method => method.enabled && (method.id === 'cod' || paymentSettings.payuActive || paymentSettings.phonePeActive)).map(method => (
                <label className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`} key={method.id}>
                  <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={event => setPaymentMethod(event.target.value)} />
                  {method.label}
                </label>
              ))}
            </div>
            {paymentMethod !== 'cod' && (paymentSettings.payuActive || paymentSettings.phonePeActive) && (
              <div className="payment-providers" role="group" aria-label="Payment provider">
                {paymentSettings.payuActive && (
                  <label className={`payment-option ${paymentProvider === 'PAYU' ? 'selected' : ''}`}>
                    <input type="radio" name="paymentProvider" value="PAYU" checked={paymentProvider === 'PAYU'} onChange={() => setPaymentProvider('PAYU')} />
                    PayU
                  </label>
                )}
                {paymentSettings.phonePeActive && (
                  <label className={`payment-option ${paymentProvider === 'PHONEPE' ? 'selected' : ''}`}>
                    <input type="radio" name="paymentProvider" value="PHONEPE" checked={paymentProvider === 'PHONEPE'} onChange={() => setPaymentProvider('PHONEPE')} />
                    PhonePe
                  </label>
                )}
              </div>
            )}
            {paymentMethod !== 'cod' && !paymentSettings.payuActive && !paymentSettings.phonePeActive && (
              <p className="payment-note">Online payment is not configured. Choose Cash on Delivery.</p>
            )}
            {paymentMethod !== 'cod' && (paymentSettings.payuActive || paymentSettings.phonePeActive) && (
              <p className="payment-note">You’ll complete payment securely with {paymentProvider === 'PHONEPE' ? 'PhonePe' : 'PayU'}.</p>
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
  const { token } = useAuth();
  const { clearCart } = useCart();
  const clearCartRef = useRef(clearCart);
  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isCod = searchParams.get('cod') === 'true';
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!orderId || !token) {
      setChecking(false);
      return undefined;
    }
    let cancelled = false;
    let attempts = 0;
    let timeoutId;

    async function checkPayment() {
      setChecking(true);
      try {
        const response = await fetch(`${API_URL}/orders/${orderId}/payment-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'Unable to verify payment status.');
        if (cancelled) return;
        setPayment(result);
        setError('');
        if (result.paymentStatus === 'COMPLETED' || result.paymentMethod === 'COD') {
          clearCartRef.current();
        } else if (result.paymentStatus === 'PENDING' && attempts < 7) {
          attempts += 1;
          timeoutId = setTimeout(checkPayment, 3000);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || 'Unable to verify payment status.');
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkPayment();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [orderId, token, refreshCount]);

  const isCompleted = payment?.paymentStatus === 'COMPLETED';
  const isFailed = payment?.paymentStatus === 'FAILED' || payment?.orderStatus === 'CANCELED';
  const isCodOrder = isCod || payment?.paymentMethod === 'COD';

  return (
    <div className="checkout-success">
      <div className="checkout-success-icon">{isCompleted || isCodOrder ? '✓' : isFailed ? '!' : '…'}</div>
      <h1>{isCompleted ? 'Payment confirmed' : isCodOrder ? 'Order placed' : isFailed ? 'Payment not completed' : 'Confirming payment'}</h1>
      <p>
        {isCompleted
          ? 'Your payment was verified and your order is being prepared.'
          : isCodOrder
            ? 'Your order is pending and payment is due on delivery.'
            : isFailed
              ? 'The payment was not confirmed. Your order has not been processed.'
              : error || (checking ? 'Checking with the payment provider...' : 'Payment is still pending confirmation.')}
      </p>
      {payment?.orderNumber && <p>Order {payment.orderNumber}</p>}
      {!isCompleted && !isCodOrder && !isFailed && orderId && (
        <button type="button" className="btn-outline" onClick={() => setRefreshCount(value => value + 1)} disabled={checking}>
          {checking ? 'Checking...' : 'Check payment status'}
        </button>
      )}
      <Link to="/shop" className="btn-primary">Continue Shopping</Link>
    </div>
  );
}
