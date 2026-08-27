import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { TextEncoder } from 'text-encoding';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';
import config from '../api/config';

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

function PaymentRow({ icon, title, subtitle, action, expanded, disabled, active = true, onPress, children }) {
  return (
    <View style={[styles.paymentRow, disabled && styles.paymentRowDisabled]}>
      <TouchableOpacity style={styles.paymentRowHeader} onPress={onPress} disabled={disabled}>
        <Text style={styles.paymentIcon}>{icon}</Text>
        <View style={styles.paymentCopy}>
          <Text style={styles.paymentTitle}>{title}</Text>
          {subtitle && <Text style={styles.paymentSubtitle}>{subtitle}</Text>}
        </View>
        {action ? <Text style={styles.paymentAction}>{action}</Text> : (
          <View style={styles.paymentRowControl}>
            <Text style={[styles.paymentAvailability, !active && styles.paymentAvailabilityDisabled]}>{active ? 'Available' : 'Unavailable'}</Text>
            <Text style={styles.paymentChevron}>{expanded ? '⌃' : '⌄'}</Text>
          </View>
        )}
      </TouchableOpacity>
      {children}
    </View>
  );
}

const initialMethods = [
  { id: 'upi', name: 'UPI', description: 'Accept payments through UPI.', active: false },
  { id: 'cod', name: 'Cash on Delivery', description: 'Accept payment on delivery.', active: true },
];

const bankOptions = [
  { id: 'sbi', name: 'State Bank of India', logo: 'SBI', color: '#1f5aa6' },
  { id: 'bob', name: 'Bank of Baroda', logo: 'BOB', color: '#e87524' },
  { id: 'pnb', name: 'Punjab National Bank', logo: 'PNB', color: '#b51f2a' },
  { id: 'canara', name: 'Canara Bank', logo: 'CB', color: '#0a7044' },
  { id: 'union', name: 'Union Bank of India', logo: 'UB', color: '#ed1c24' },
  { id: 'indian', name: 'Indian Bank', logo: 'IB', color: '#1b4d9b' },
  { id: 'boi', name: 'Bank of India', logo: 'BOI', color: '#0b5ca8' },
  { id: 'central', name: 'Central Bank of India', logo: 'CBI', color: '#d21f2b' },
  { id: 'uco', name: 'UCO Bank', logo: 'UCO', color: '#0069a6' },
  { id: 'bom', name: 'Bank of Maharashtra', logo: 'BOM', color: '#00844a' },
  { id: 'iob', name: 'Indian Overseas Bank', logo: 'IOB', color: '#14539a' },
  { id: 'psb', name: 'Punjab & Sind Bank', logo: 'PSB', color: '#0067a5' },
  { id: 'hdfc', name: 'HDFC Bank', logo: 'HDFC', color: '#004c8f' },
  { id: 'icici', name: 'ICICI Bank', logo: 'ICICI', color: '#f58220' },
  { id: 'axis', name: 'Axis Bank', logo: 'AXIS', color: '#97144d' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', logo: 'KMB', color: '#ed1c24' },
  { id: 'indusind', name: 'IndusInd Bank', logo: 'IND', color: '#982b5d' },
  { id: 'idfc', name: 'IDFC FIRST Bank', logo: 'IDFC', color: '#9d1d27' },
  { id: 'federal', name: 'Federal Bank', logo: 'FB', color: '#006d9c' },
  { id: 'yes', name: 'YES BANK', logo: 'YES', color: '#00549f' },
  { id: 'bandhan', name: 'Bandhan Bank', logo: 'BDB', color: '#ed1c24' },
  { id: 'rbl', name: 'RBL Bank', logo: 'RBL', color: '#e31837' },
  { id: 'au', name: 'AU Small Finance Bank', logo: 'AU', color: '#f58220' },
  { id: 'equitas', name: 'Equitas Small Finance Bank', logo: 'ESF', color: '#ed1c24' },
  { id: 'ujjivan', name: 'Ujjivan Small Finance Bank', logo: 'USF', color: '#0072bc' },
  { id: 'utkarsh', name: 'Utkarsh Small Finance Bank', logo: 'USB', color: '#004b8d' },
  { id: 'esaf', name: 'ESAF Small Finance Bank', logo: 'ESAF', color: '#f58220' },
  { id: 'jana', name: 'Jana Small Finance Bank', logo: 'JSF', color: '#00549f' },
  { id: 'suryoday', name: 'Suryoday Small Finance Bank', logo: 'SSB', color: '#e87524' },
  { id: 'capital', name: 'Capital Small Finance Bank', logo: 'CSF', color: '#1b4d9b' },
  { id: 'shivalik', name: 'Shivalik Small Finance Bank', logo: 'SSFB', color: '#00844a' },
  { id: 'dcb', name: 'DCB Bank', logo: 'DCB', color: '#00549f' },
  { id: 'karnataka', name: 'Karnataka Bank', logo: 'KB', color: '#ed1c24' },
  { id: 'southindian', name: 'South Indian Bank', logo: 'SIB', color: '#0072bc' },
  { id: 'karur', name: 'Karur Vysya Bank', logo: 'KVB', color: '#00549f' },
  { id: 'csb', name: 'CSB Bank', logo: 'CSB', color: '#e87524' },
  { id: 'cityunion', name: 'City Union Bank', logo: 'CUB', color: '#1b4d9b' },
  { id: 'tmb', name: 'Tamilnad Mercantile Bank', logo: 'TMB', color: '#006d9c' },
  { id: 'dbs', name: 'DBS Bank India', logo: 'DBS', color: '#ed1c24' },
  { id: 'hsbc', name: 'HSBC India', logo: 'HSBC', color: '#db0011' },
  { id: 'standardchartered', name: 'Standard Chartered Bank', logo: 'SC', color: '#0072bc' },
  { id: 'citibank', name: 'Citi India', logo: 'CITI', color: '#056dae' },
];

export default function PaymentScreen({ navigation }) {
  const [methods, setMethods] = useState(initialMethods);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('Debit Card');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [addingBank, setAddingBank] = useState(false);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [upiMode, setUpiMode] = useState('upiId');
  const [expandedSection, setExpandedSection] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState({
    upiActive: true,
    netBankingActive: true,
    creditCardActive: true,
    debitCardActive: true,
    qrCodeActive: true,
    cashOnDeliveryActive: true,
    upiId: 'sachinprakash893@ybl',
  });

  React.useEffect(() => {
    fetch(`${config.API_URL}/payment-settings`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load payment settings')))
      .then(setPaymentConfig)
      .catch(() => {});
  }, []);

  const toggleSection = (section) => {
    setExpandedSection((current) => current === section ? null : section);
  };

  const handleAddMethod = () => {
    const digits = cardNumber.replace(/\D/g, '');
    const [expiryMonth, expiryYear] = expiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    const validCardNumber = digits.length >= 13 && digits.length <= 19 && luhnCheck(digits);
    const validExpiry = /^\d{2}\/\d{2}$/.test(expiry)
      && expiryMonth >= 1
      && expiryMonth <= 12
      && (expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth));
    const validCvv = /^\d{3,4}$/.test(cvv);

    if (!cardholderName.trim() || !newName.trim()) {
      Alert.alert('Missing details', 'Enter the payment method and cardholder name.');
      return;
    }
    if (!validCardNumber) {
      Alert.alert('Invalid card number', 'Enter a valid card number.');
      return;
    }
    if (!validExpiry) {
      Alert.alert('Invalid expiry date', 'Use MM/YY and enter a future expiry date.');
      return;
    }
    if (!validCvv) {
      Alert.alert('Invalid CVV', 'Enter a 3 or 4 digit CVV.');
      return;
    }

    setMethods((current) => [...current, {
      id: `${Date.now()}`,
      name: `${cardType} - ${newName.trim()}`,
      description: newDescription.trim() || `Card ending in ${digits.slice(-4)}`,
      cardType,
      cardholderName: cardholderName.trim(),
      last4: digits.slice(-4),
      active: false,
    }]);
    setNewName('');
    setNewDescription('');
    setCardholderName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardType('Debit Card');
    setAdding(false);
  };

  const handleAddBankAccount = () => {
    const normalizedIfsc = ifscCode.trim().toUpperCase();
    const digits = accountNumber.replace(/\D/g, '');
    const validIfsc = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalizedIfsc);
    const validAccountNumber = /^\d{9,18}$/.test(digits);

    if (!bankName.trim() || !accountHolderName.trim()) {
      Alert.alert('Missing details', 'Enter the bank name and account holder name.');
      return;
    }
    if (!validIfsc) {
      Alert.alert('Invalid IFSC code', 'Enter a valid 11-character IFSC code, such as SBIN0001234.');
      return;
    }
    if (!validAccountNumber) {
      Alert.alert('Invalid account number', 'Enter an account number with 9 to 18 digits.');
      return;
    }

    setMethods((current) => [...current, {
      id: `bank-${Date.now()}`,
      name: bankName.trim(),
      description: `Account ending in ${digits.slice(-4)}`,
      accountHolderName: accountHolderName.trim(),
      ifscCode: normalizedIfsc,
      accountLast4: digits.slice(-4),
      methodType: 'bank',
      active: false,
    }]);
    setBankName('');
    setIfscCode('');
    setAccountNumber('');
    setAccountHolderName('');
    setAddingBank(false);
  };

  const handlePhonePeLink = async () => {
    const normalizedUpiId = upiId.trim().toLowerCase();

    if (!isValidUpiId(normalizedUpiId)) {
      Alert.alert('Invalid UPI ID', 'Enter a valid UPI ID, such as yourname@oksbi.');
      return;
    }

    const phonePeUrl = `phonepe://pay?pa=${encodeURIComponent(normalizedUpiId)}&pn=${encodeURIComponent('PawMart')}`;
    const canOpenPhonePe = await Linking.canOpenURL(phonePeUrl);
    if (!canOpenPhonePe) {
      Alert.alert('PhonePe unavailable', 'Install PhonePe on this device to continue with this UPI ID.');
      return;
    }

    await Linking.openURL(phonePeUrl);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Payment Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.paymentHeader}>
          <Text style={styles.heading}>Payments</Text>
          <Text style={styles.secureBadge}>🔒 100% Secure</Text>
        </View>

        <PaymentRow icon="♧" title="Net Banking" subtitle="Pay directly from your bank account" active={paymentConfig.netBankingActive} disabled={!paymentConfig.netBankingActive} expanded={expandedSection === 'netBanking'} onPress={() => toggleSection('netBanking')}>
          {expandedSection === 'netBanking' && (
            <View style={styles.cardOptions}>
              {methods.filter((method) => method.methodType === 'bank').map((method) => (
                <View style={styles.savedCard} key={method.id}>
                  <Text style={styles.savedCardTitle}>{method.name}</Text>
                  <Text style={styles.savedCardText}>Account ending in {method.accountLast4}</Text>
                  <Text style={styles.savedCardText}>IFSC: {method.ifscCode}</Text>
                </View>
              ))}
              {addingBank && (
                <View style={styles.addCard}>
                  <Text style={styles.fieldLabel}>Bank name</Text>
                  <TouchableOpacity style={styles.bankSelector} onPress={() => setBankDropdownOpen((current) => !current)}>
                    {bankName ? (
                      <>
                        <View style={[styles.bankLogo, { backgroundColor: bankOptions.find((bank) => bank.name === bankName)?.color || theme.colors.primary }]}>
                          <Text style={styles.bankLogoText}>{bankOptions.find((bank) => bank.name === bankName)?.logo}</Text>
                        </View>
                        <Text style={styles.bankSelectorText}>{bankName}</Text>
                      </>
                    ) : <Text style={styles.bankPlaceholder}>Select your bank</Text>}
                    <Text style={styles.bankSelectorChevron}>{bankDropdownOpen ? '⌃' : '⌄'}</Text>
                  </TouchableOpacity>
                  {bankDropdownOpen && (
                    <View style={styles.bankDropdown}>
                      <ScrollView nestedScrollEnabled style={styles.bankDropdownList}>
                        {bankOptions.map((bank) => (
                          <TouchableOpacity
                            key={bank.id}
                            style={styles.bankOption}
                            onPress={() => {
                              setBankName(bank.name);
                              setBankDropdownOpen(false);
                            }}
                          >
                            <View style={[styles.bankLogo, { backgroundColor: bank.color }]}>
                              <Text style={styles.bankLogoText}>{bank.logo}</Text>
                            </View>
                            <Text style={styles.bankOptionText}>{bank.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  <Text style={styles.fieldLabel}>IFSC code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. SBIN0001234"
                    value={ifscCode}
                    autoCapitalize="characters"
                    maxLength={11}
                    onChangeText={(value) => setIfscCode(value.replace(/\s/g, '').toUpperCase())}
                  />
                  <Text style={styles.fieldLabel}>Account number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter account number"
                    value={accountNumber}
                    keyboardType="number-pad"
                    maxLength={18}
                    onChangeText={(value) => setAccountNumber(value.replace(/\D/g, ''))}
                  />
                  <Text style={styles.fieldLabel}>Account holder name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter account holder name"
                    value={accountHolderName}
                    autoCapitalize="words"
                    onChangeText={setAccountHolderName}
                  />
                  <View style={styles.formActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingBank(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddBankAccount}>
                      <Text style={styles.addButtonText}>Save Bank</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {!addingBank && <TouchableOpacity style={styles.addMethodButton} onPress={() => setAddingBank(true)}><Text style={styles.addMethodText}>+ Add Bank Account</Text></TouchableOpacity>}
            </View>
          )}
        </PaymentRow>
        <PaymentRow icon="◴" title="Credit Card" subtitle="Visa, Mastercard and other credit cards" active={paymentConfig.creditCardActive} disabled={!paymentConfig.creditCardActive} expanded={expandedSection === 'cards'} onPress={() => toggleSection('cards')}>
          {expandedSection === 'cards' && (
            <View style={styles.cardOptions}>
              {methods.filter((method) => method.id !== 'upi' && method.id !== 'cod').map((method) => (
                <View style={styles.savedCard} key={method.id}>
                  <Text style={styles.savedCardTitle}>{method.name}</Text>
                  <Text style={styles.savedCardText}>•••• •••• •••• {method.last4 || '----'}</Text>
                </View>
              ))}
              {adding && (
                <View style={styles.addCard}>
            <Text style={styles.fieldLabel}>Card Type</Text>
            <View style={styles.cardTypeRow}>
              {['Debit Card', 'Credit Card'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.cardTypeButton, cardType === type && styles.cardTypeButtonSelected]}
                  onPress={() => setCardType(type)}
                >
                  <Text style={[styles.cardTypeText, cardType === type && styles.cardTypeTextSelected]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Payment method name" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.input} placeholder="Description" value={newDescription} onChangeText={setNewDescription} />
            <TextInput style={styles.input} placeholder="Cardholder name" value={cardholderName} autoCapitalize="words" onChangeText={setCardholderName} />
            <TextInput
              style={styles.input}
              placeholder="Card number"
              value={cardNumber}
              keyboardType="number-pad"
              maxLength={19}
              onChangeText={(value) => setCardNumber(value.replace(/\D/g, ''))}
            />
            <View style={styles.cardRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                value={expiry}
                keyboardType="number-pad"
                maxLength={5}
                onChangeText={(value) => {
                  const digits = value.replace(/\D/g, '').slice(0, 4);
                  setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                }}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                value={cvv}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                onChangeText={(value) => setCvv(value.replace(/\D/g, ''))}
              />
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAdding(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddMethod}>
                <Text style={styles.addButtonText}>Save Method</Text>
              </TouchableOpacity>
            </View>
                </View>
              )}
              {!adding && <TouchableOpacity style={styles.addMethodButton} onPress={() => setAdding(true)}><Text style={styles.addMethodText}>+ Add Card</Text></TouchableOpacity>}
            </View>
          )}
        </PaymentRow>
        <PaymentRow icon="◴" title="Debit Card" subtitle="Use your bank debit card" active={paymentConfig.debitCardActive} disabled={!paymentConfig.debitCardActive} expanded={false} onPress={() => toggleSection('cards')} />
        <PaymentRow icon="▣" title="UPI" subtitle="Pay by any UPI app" active={paymentConfig.upiActive} disabled={!paymentConfig.upiActive} expanded={expandedSection === 'upi'} onPress={() => toggleSection('upi')}>
          {expandedSection === 'upi' && (
            <View style={styles.upiOptions}>
              <View style={styles.upiModeToggle}>
                <TouchableOpacity
                  style={[styles.upiModeButton, upiMode === 'upiId' && styles.upiModeButtonSelected]}
                  onPress={() => setUpiMode('upiId')}
                >
                  <Text style={[styles.upiModeText, upiMode === 'upiId' && styles.upiModeTextSelected]}>UPI ID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.upiModeButton, upiMode === 'qr' && styles.upiModeButtonSelected]}
                  onPress={() => setUpiMode('qr')}
                >
                  <Text style={[styles.upiModeText, upiMode === 'qr' && styles.upiModeTextSelected]}>QR Code</Text>
                </TouchableOpacity>
              </View>
              {upiMode === 'upiId' && (
                <>
                  <Text style={styles.fieldLabel}>UPI ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="yourname@oksbi"
                    value={upiId}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setUpiId}
                  />
                  <Text style={styles.upiHint}>Enter your UPI ID to continue securely with PhonePe.</Text>
                  <TouchableOpacity style={styles.phonePeButton} onPress={handlePhonePeLink}>
                    <Text style={styles.phonePeButtonText}>Continue with PhonePe</Text>
                  </TouchableOpacity>
                </>
              )}
              {upiMode === 'qr' && (
                <View style={styles.qrContainer}>
                  <QRCode
                    value={`upi://pay?pa=${encodeURIComponent(paymentConfig.upiId)}&pn=${encodeURIComponent('PawMart')}&cu=INR`}
                    size={210}
                    backgroundColor="#ffffff"
                    color="#101828"
                  />
                </View>
              )}
            </View>
          )}
        </PaymentRow>
        <PaymentRow icon="▤" title="QR Code" subtitle="Scan and pay securely" active={paymentConfig.qrCodeActive} disabled={!paymentConfig.qrCodeActive} expanded={expandedSection === 'qr'} onPress={() => toggleSection('qr')}>
          {expandedSection === 'qr' && <View style={styles.qrContainer}><QRCode value={`upi://pay?pa=${encodeURIComponent(paymentConfig.upiId)}&pn=${encodeURIComponent('PawMart')}&cu=INR`} size={210} backgroundColor="#ffffff" color="#101828" /></View>}
        </PaymentRow>
        <PaymentRow icon="▤" title="Cash on Delivery" subtitle="Pay when your order arrives" active={paymentConfig.cashOnDeliveryActive} disabled={!paymentConfig.cashOnDeliveryActive} expanded={expandedSection === 'cod'} onPress={() => toggleSection('cod')}>
          {expandedSection === 'cod' && <Text style={styles.detailText}>Pay when your order is delivered.</Text>}
        </PaymentRow>
        <PaymentRow icon="▧" title="Have a Gift Card?" action="Add" onPress={() => Alert.alert('Gift Card', 'Gift card support is coming soon.')} />
        <PaymentRow icon="▥" title="EMI" action="Unavailable" disabled />
      </ScrollView>
      <BottomTabBar activeTab="Account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { height: 108, paddingHorizontal: 18, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 30, lineHeight: 30 },
  topBarTitle: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 110 },
  paymentHeader: { paddingHorizontal: 8, paddingBottom: 12 },
  stepText: { color: '#344054', fontSize: 16, marginBottom: 2 },
  heading: { color: '#101828', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#34517a', fontSize: 15, marginBottom: 16 },
  secureBadge: { position: 'absolute', right: 8, bottom: 18, backgroundColor: '#f2f4f7', color: '#344054', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, fontWeight: '700' },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef4ff', borderRadius: 12, padding: 18, marginBottom: 16 },
  totalLabel: { color: '#315ecb', fontSize: 20 },
  totalValue: { color: '#315ecb', fontSize: 25, fontWeight: '800' },
  paymentRow: { backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: '#dfe3ea', paddingVertical: 4 },
  paymentRowDisabled: { opacity: 0.5 },
  paymentRowHeader: { minHeight: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  paymentIcon: { width: 42, color: '#101828', fontSize: 28, textAlign: 'center', marginRight: 10 },
  paymentCopy: { flex: 1 },
  paymentTitle: { color: '#101828', fontSize: 18, fontWeight: '800' },
  paymentSubtitle: { color: '#667085', fontSize: 15, marginTop: 5 },
  paymentChevron: { color: '#101828', fontSize: 25, paddingHorizontal: 8 },
  paymentAction: { color: '#315ecb', fontSize: 16, fontWeight: '800', paddingHorizontal: 8 },
  paymentRowControl: { flexDirection: 'row', alignItems: 'center' },
  paymentAvailability: { color: '#16803c', fontSize: 12, fontWeight: '700' },
  paymentAvailabilityDisabled: { color: '#98a2b3' },
  cardOptions: { paddingHorizontal: 12, paddingBottom: 12 },
  savedCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 8 },
  savedCardTitle: { color: '#101828', fontWeight: '800' },
  savedCardText: { color: '#667085', marginTop: 5 },
  detailText: { color: '#667085', paddingHorizontal: 60, paddingBottom: 14 },
  upiOptions: { paddingHorizontal: 12, paddingBottom: 12 },
  upiModeToggle: { flexDirection: 'row', backgroundColor: '#f2f4f7', borderRadius: 8, padding: 3, marginBottom: 14 },
  upiModeButton: { flex: 1, alignItems: 'center', borderRadius: 6, paddingVertical: 9 },
  upiModeButtonSelected: { backgroundColor: theme.colors.primary },
  upiModeText: { color: '#475467', fontSize: 13, fontWeight: '700' },
  upiModeTextSelected: { color: theme.colors.surface },
  disabledInput: { backgroundColor: '#eaecf0', color: '#667085' },
  upiHint: { color: '#667085', fontSize: 12, marginTop: -4, marginBottom: 10 },
  qrContainer: { alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4e7ec', borderRadius: 10, padding: 14, marginBottom: 12 },
  qrTitle: { color: '#101828', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  qrUpiId: { color: '#667085', fontSize: 12, marginTop: 10 },
  phonePeButton: { backgroundColor: '#5f259f', borderRadius: 8, padding: 12, alignItems: 'center' },
  phonePeButtonText: { color: theme.colors.surface, fontWeight: '700' },
  methodCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#dfe3ea', borderRadius: 16, padding: 14, marginBottom: 12 },
  methodHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  methodCopy: { flex: 1, marginRight: 12 },
  methodName: { color: '#101828', fontSize: 16, fontWeight: '800', marginBottom: 5 },
  methodDescription: { color: '#34517a', fontSize: 14 },
  editText: { color: '#2563eb', fontWeight: '700' },
  credentials: { marginTop: 14 },
  fieldLabel: { color: '#34517a', fontSize: 12, marginBottom: 5 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 11, fontSize: 14, marginBottom: 10 },
  bankSelector: { minHeight: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 11, marginBottom: 6 },
  bankSelectorText: { flex: 1, color: '#101828', fontSize: 14, marginLeft: 10 },
  bankPlaceholder: { flex: 1, color: '#98a2b3', fontSize: 14 },
  bankSelectorChevron: { color: '#101828', fontSize: 20, paddingLeft: 8 },
  bankDropdown: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
  bankDropdownList: { maxHeight: 250 },
  bankOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eef2f6' },
  bankOptionText: { flex: 1, color: '#101828', fontSize: 14, marginLeft: 10 },
  bankLogo: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  bankLogoText: { color: '#ffffff', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  halfInput: { flex: 1 },
  methodFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12, gap: 8 },
  status: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 14, fontSize: 12, overflow: 'hidden' },
  statusActive: { color: '#15803d', backgroundColor: '#dcfce7' },
  statusInactive: { color: '#475569', backgroundColor: '#f1f5f9' },
  addCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#dfe3ea', borderRadius: 16, padding: 14, marginBottom: 12 },
  cardTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  cardTypeButton: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingVertical: 12 },
  cardTypeButtonSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  cardTypeText: { color: '#475569', fontWeight: '700' },
  cardTypeTextSelected: { color: theme.colors.surface },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 11 },
  cancelText: { color: '#475569', fontWeight: '700' },
  addButton: { backgroundColor: theme.colors.primary, borderRadius: 8, padding: 11 },
  addButtonText: { color: theme.colors.surface, fontWeight: '700' },
  addMethodButton: { alignItems: 'center', borderWidth: 1, borderColor: '#b8c7dc', borderRadius: 8, padding: 12, marginTop: 6 },
  addMethodText: { color: '#1d4f91', fontWeight: '700', fontSize: 13 },
});

function luhnCheck(value) {
  let sum = 0;
  let shouldDouble = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidUpiId(value) {
  return /^[a-z0-9][a-z0-9._-]{1,255}@[a-z][a-z0-9.-]{1,63}$/i.test(value);
}
