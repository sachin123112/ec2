import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import config from '../api/config';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const emptyAddress = {
  label: 'Home', name: '', addressLine1: '', addressLine2: '', city: '', state: '',
  postalCode: '', country: 'India', countryCode: '+91', phone: '', isDefault: false,
};
const requiredAddressFields = ['name', 'addressLine1', 'city', 'state', 'postalCode', 'phone'];
const CHECKOUT_UPI_ID = 'sachinprakash8931@ybl';
const paymentOptions = [
  { id: 'credit_card', label: 'Credit Card', setting: 'creditCardActive' },
  { id: 'debit_card', label: 'Debit Card', setting: 'debitCardActive' },
  { id: 'upi', label: 'UPI', setting: 'upiActive' },
  { id: 'net_banking', label: 'Net Banking', setting: 'netBankingActive' },
  { id: 'qr_code', label: 'QR Code', setting: 'qrCodeActive' },
  { id: 'cod', label: 'Cash on Delivery', setting: 'cashOnDeliveryActive' },
];

function luhnCheck(value) {
  let checksum = 0;
  let shouldDouble = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    checksum += digit;
    shouldDouble = !shouldDouble;
  }
  return checksum % 10 === 0;
}

function validateCard(card) {
  const number = card.number.replace(/\D/g, '');
  if (!/^[0-9]{13,19}$/.test(number) || !luhnCheck(number)) return 'Enter a valid card number.';
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) return 'Enter expiry as MM/YY.';
  const [month, year] = card.expiry.split('/').map(Number);
  const expiryDate = new Date(2000 + year, month, 0, 23, 59, 59, 999);
  if (expiryDate < new Date()) return 'Card expiry date must be in the future.';
  if (!/^\d{3,4}$/.test(card.cvv)) return 'CVV must contain 3 or 4 digits.';
  if (!/^[A-Za-z][A-Za-z .'-]{1,79}$/.test(card.name.trim())) return 'Enter a valid cardholder name.';
  return '';
}

function validateTransactionId(value) {
  const transactionId = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9-]{5,39}$/.test(transactionId)) return 'Enter a valid transaction ID (6-40 letters, numbers, or hyphens).';
  if (!/\d/.test(transactionId)) return 'Transaction ID must contain at least one number.';
  return '';
}

export default function CheckoutScreen({ navigation }) {
  const { token } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentSettings, setPaymentSettings] = useState({
    upiActive: true, netBankingActive: true, creditCardActive: true,
    debitCardActive: true, qrCodeActive: true, cashOnDeliveryActive: true,
    upiId: 'sachinprakash893@ybl', freeShippingThreshold: 999, shippingFee: 99,
  });
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shippingThreshold = Number(paymentSettings.freeShippingThreshold);
  const shippingFee = Number(paymentSettings.shippingFee);
  const shipping = totalPrice >= shippingThreshold ? 0 : shippingFee;
  const total = totalPrice + shipping;
  const selectedAddress = addresses.find((item) => String(item.id) === String(selectedAddressId));

  useEffect(() => {
    if (!token) {
      setAddressesLoading(false);
      return;
    }
    fetch(`${config.API_URL}/users/me/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load saved addresses.')))
      .then((data) => {
        const saved = Array.isArray(data) ? data : [];
        setAddresses(saved);
        const defaultAddress = saved.find((item) => item.isDefault) || saved[0];
        if (defaultAddress) setSelectedAddressId(String(defaultAddress.id));
      })
      .catch((error) => setStatus(error.message))
      .finally(() => setAddressesLoading(false));
  }, [token]);

  useEffect(() => {
    fetch(`${config.API_URL}/payment-settings`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load payment settings.')))
      .then((settings) => {
        setPaymentSettings((current) => ({ ...current, ...settings }));
        if (settings[paymentOptions.find((option) => option.id === paymentMethod)?.setting] === false) setPaymentMethod('cod');
      })
      .catch((error) => setStatus(error.message));
  }, []);

  const updateAddress = (field, value) => setAddress((current) => ({ ...current, [field]: value }));
  const updateCard = (field, value) => setCard((current) => ({ ...current, [field]: value }));

  const lookupPostalCode = async (value) => {
    const postalCode = value.trim();
    if (!/^\d{6}$/.test(postalCode)) return;
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
      const data = await response.json();
      const postOffice = data?.[0]?.PostOffice?.[0];
      if (postOffice) {
        setAddress((current) => ({
          ...current,
          addressLine1: current.addressLine1 || [postOffice.Name, postOffice.Block].filter(Boolean).join(', '),
          city: postOffice.District || current.city,
          state: postOffice.State || current.state,
          country: 'India',
        }));
      }
    } catch {
      // Postal lookup is optional; manual address entry remains available.
    }
  };

  const saveNewAddress = async () => {
    const missing = requiredAddressFields.find((field) => !String(address[field] || '').trim());
    if (missing) throw new Error(`${missing === 'addressLine1' ? 'Address' : missing} is required.`);
    const phoneDigits = address.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) throw new Error('Enter exactly 10 digits for the phone number.');
    if (address.countryCode === '+91' && !/^[6-9]\d{9}$/.test(phoneDigits)) throw new Error('Enter a valid 10-digit Indian mobile number.');

    const response = await fetch(`${config.API_URL}/users/me/addresses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...address, phone: `${address.countryCode} ${phoneDigits}`.trim(), countryCode: undefined }),
    });
    if (!response.ok) throw new Error('Please enter a valid delivery address.');
    return response.json();
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    const selectedOption = paymentOptions.find((option) => option.id === paymentMethod);
    if (!selectedOption || paymentSettings[selectedOption.setting] === false) {
      Alert.alert('Payment unavailable', 'This payment method is currently unavailable.');
      return;
    }
    if (['credit_card', 'debit_card'].includes(paymentMethod)) {
      const error = validateCard(card);
      if (error) { Alert.alert('Invalid payment details', error); return; }
    }
    if (['upi', 'qr_code'].includes(paymentMethod)) {
      const error = validateTransactionId(transactionId);
      if (error) { Alert.alert('Invalid transaction ID', error); return; }
    }

    setSubmitting(true);
    setStatus('');
    try {
      const deliveryAddress = selectedAddressId === 'new' ? await saveNewAddress() : selectedAddress;
      if (!deliveryAddress) throw new Error('Please select or add a delivery address.');
      const userResponse = await fetch(`${config.API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!userResponse.ok) throw new Error('Please sign in again before placing the order.');
      const user = await userResponse.json();
      const orderResponse = await fetch(`${config.API_URL}/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, totalAmount: total, status: 'PENDING', paymentMethod: paymentMethod.toUpperCase() }),
      });
      if (!orderResponse.ok) throw new Error('Unable to place order. Please try again.');
      clearCart();
      Alert.alert('Order placed successfully', 'Thank you for shopping at PawMart. Your order is being prepared.', [
        { text: 'View Orders', onPress: () => navigation.navigate('OrderHistory') },
      ]);
    } catch (error) {
      setStatus(error.message || 'Unable to complete checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.length) {
    return <View style={styles.empty}><Text style={styles.emptyTitle}>Your cart is empty</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Cart')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Checkout</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Delivery Address</Text>
        {addressesLoading ? <ActivityIndicator color={theme.colors.primary} /> : addresses.map((item) => (
          <TouchableOpacity key={String(item.id)} style={[styles.addressCard, String(item.id) === String(selectedAddressId) && styles.selectedCard]} onPress={() => setSelectedAddressId(String(item.id))}>
            <Text style={styles.addressLabel}>{item.label || 'Address'} {item.isDefault ? '(Default)' : ''}</Text>
            <Text style={styles.addressText}>{item.name}, {item.addressLine1}{item.addressLine2 ? `, ${item.addressLine2}` : ''}</Text>
            <Text style={styles.addressText}>{[item.city, item.state, item.postalCode].filter(Boolean).join(', ')}</Text>
            <Text style={styles.addressText}>{item.phone}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.newAddressOption, selectedAddressId === 'new' && styles.selectedCard]} onPress={() => setSelectedAddressId('new')}>
          <Text style={styles.addressLabel}>+ Add a new address</Text>
        </TouchableOpacity>
        {selectedAddressId === 'new' && (
          <View style={styles.formCard}>
            {[
              ['name', 'Full name *'], ['addressLine1', 'Address *'], ['addressLine2', 'Landmark'],
              ['city', 'City *'], ['state', 'State *'], ['postalCode', 'Postal code *'], ['phone', 'Phone *'],
            ].map(([field, placeholder]) => (
              <TextInput key={field} style={styles.input} placeholder={placeholder} value={address[field]} keyboardType={field === 'phone' || field === 'postalCode' ? 'phone-pad' : 'default'} onChangeText={(value) => { updateAddress(field, field === 'phone' || field === 'postalCode' ? value.replace(/\D/g, '').slice(0, 10) : value); if (field === 'postalCode') lookupPostalCode(value); }} />
            ))}
          </View>
        )}

        <Text style={styles.heading}>Payment Method</Text>
        {paymentOptions.filter((option) => paymentSettings[option.setting] !== false).map((option) => (
          <TouchableOpacity key={option.id} style={[styles.paymentOption, paymentMethod === option.id && styles.selectedPayment]} onPress={() => setPaymentMethod(option.id)}>
            <Text style={styles.paymentOptionText}>{paymentMethod === option.id ? '● ' : '○ '}{option.label}</Text>
          </TouchableOpacity>
        ))}
        {['credit_card', 'debit_card'].includes(paymentMethod) && <View style={styles.formCard}>
          <TextInput style={styles.input} placeholder="Cardholder name" value={card.name} onChangeText={(value) => updateCard('name', value)} />
          <TextInput style={styles.input} placeholder="Card number" keyboardType="number-pad" maxLength={23} value={card.number} onChangeText={(value) => { const digits = value.replace(/\D/g, '').slice(0, 19); updateCard('number', digits.replace(/(.{4})/g, '$1 ').trim()); }} />
          <View style={styles.row}><TextInput style={[styles.input, styles.half]} placeholder="MM/YY" keyboardType="number-pad" maxLength={5} value={card.expiry} onChangeText={(value) => { const digits = value.replace(/\D/g, '').slice(0, 4); updateCard('expiry', digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits); }} /><TextInput style={[styles.input, styles.half]} placeholder="CVV" keyboardType="number-pad" maxLength={4} value={card.cvv} onChangeText={(value) => updateCard('cvv', value.replace(/\D/g, '').slice(0, 4))} /></View>
        </View>}
        {['upi', 'qr_code'].includes(paymentMethod) && <View style={styles.formCard}>
          <Text style={styles.note}>Scan this QR code to pay using UPI.</Text>
          <View style={styles.qrContainer}><QRCode value={`upi://pay?pa=${CHECKOUT_UPI_ID}&pn=PawMart`} size={180} /></View>
          <Text style={styles.upiId}>{CHECKOUT_UPI_ID}</Text>
          <Text style={styles.note}>After payment, enter the transaction ID.</Text>
          <TextInput style={styles.input} placeholder="Transaction ID" maxLength={40} value={transactionId} onChangeText={(value) => setTransactionId(value.replace(/\s/g, '').slice(0, 40))} />
        </View>}
        {paymentMethod === 'net_banking' && <Text style={styles.note}>Select your bank during secure payment processing.</Text>}
        {paymentMethod === 'cod' && <Text style={styles.note}>Pay when your order arrives.</Text>}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          {cart.map((item) => <View style={styles.summaryRow} key={String(item.id)}><Text style={styles.summaryItem}>{item.name} x {item.qty}</Text><Text style={styles.summaryValue}>₹{(item.price * item.qty).toLocaleString()}</Text></View>)}
          <View style={styles.summaryRow}><Text>Subtotal</Text><Text>₹{totalPrice.toLocaleString()}</Text></View>
          <View style={styles.summaryRow}><Text>Shipping</Text><Text>{shipping ? `₹${shipping}` : 'FREE'}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{total.toLocaleString()}</Text></View>
          {shipping > 0 && <Text style={styles.note}>Add ₹{(shippingThreshold - totalPrice).toLocaleString()} more for free shipping.</Text>}
          <TouchableOpacity style={styles.checkoutButton} onPress={placeOrder} disabled={submitting}><Text style={styles.checkoutText}>{submitting ? 'Placing order...' : 'Place Order'}</Text></TouchableOpacity>
        </View>
        {!!status && <Text style={styles.error}>{status}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { height: 84, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb', backgroundColor: theme.colors.surface },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 29, lineHeight: 29, marginTop: 2 },
  topBarTitle: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 36 },
  heading: { color: theme.colors.primaryDark, fontSize: 24, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  addressCard: { backgroundColor: theme.colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
  newAddressOption: { backgroundColor: theme.colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
  selectedCard: { borderColor: theme.colors.primary, borderWidth: 2 },
  addressLabel: { color: theme.colors.primaryDark, fontWeight: '800', marginBottom: 6 },
  addressText: { color: theme.colors.textSecondary, lineHeight: 20 },
  formCard: { backgroundColor: theme.colors.surface, borderRadius: 14, padding: 14, marginBottom: 12 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 10, flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  half: { minWidth: 0 },
  paymentOption: { backgroundColor: theme.colors.surface, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  selectedPayment: { borderColor: theme.colors.primary, backgroundColor: '#f0ebff' },
  paymentOptionText: { color: theme.colors.text, fontWeight: '700' },
  note: { color: theme.colors.textSecondary, marginBottom: 10, lineHeight: 20 },
  qrContainer: { alignItems: 'center', marginBottom: 10 },
  upiId: { color: theme.colors.primaryDark, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  summary: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, marginTop: 12 },
  summaryTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryItem: { flex: 1, paddingRight: 10 },
  summaryValue: { fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 18, fontWeight: '800' },
  totalValue: { color: theme.colors.primaryDark, fontSize: 20, fontWeight: '800' },
  checkoutButton: { backgroundColor: theme.colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  checkoutText: { color: theme.colors.surface, fontWeight: '800' },
  error: { color: theme.colors.danger, marginTop: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
});
