import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const initialMethods = [
function PaymentRow({ icon, title, subtitle, action, expanded, disabled, onPress, children }) {
  return (
    <View style={[styles.paymentRow, disabled && styles.paymentRowDisabled]}>
      <TouchableOpacity style={styles.paymentRowHeader} onPress={onPress} disabled={disabled}>
        <Text style={styles.paymentIcon}>{icon}</Text>
        <View style={styles.paymentCopy}>
          <Text style={styles.paymentTitle}>{title}</Text>
          {subtitle && <Text style={styles.paymentSubtitle}>{subtitle}</Text>}
        </View>
        {action ? <Text style={styles.paymentAction}>{action}</Text> : <Text style={styles.paymentChevron}>{expanded ? '⌃' : '⌄'}</Text>}
      </TouchableOpacity>
      {children}
    </View>
  );
}

  { id: 'upi', name: 'UPI', description: 'Accept payments through UPI.', active: false },
  { id: 'cod', name: 'Cash on Delivery', description: 'Accept payment on delivery.', active: true },
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
  const [expandedSection, setExpandedSection] = useState(null);

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
          <Text style={styles.stepText}>Step 3 of 3</Text>
          <Text style={styles.heading}>Payments</Text>
          <Text style={styles.secureBadge}>🔒 100% Secure</Text>
        </View>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount⌄</Text>
          <Text style={styles.totalValue}>₹139</Text>
        </View>

        <PaymentRow icon="♧" title="Recommended for You" expanded={expandedSection === 'recommended'} onPress={() => toggleSection('recommended')} />
        <PaymentRow icon="◴" title="Cards" expanded={expandedSection === 'cards'} onPress={() => toggleSection('cards')}>
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
        <PaymentRow icon="▣" title="UPI" subtitle="Pay by any UPI app" expanded={expandedSection === 'upi'} onPress={() => toggleSection('upi')}>
          {expandedSection === 'upi' && <Text style={styles.detailText}>Choose your preferred UPI app at checkout.</Text>}
        </PaymentRow>
        <PaymentRow icon="▤" title="Cash on Delivery" expanded={expandedSection === 'cod'} onPress={() => toggleSection('cod')}>
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
  topBar: { height: 76, paddingHorizontal: 18, paddingTop: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
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
  cardOptions: { paddingHorizontal: 12, paddingBottom: 12 },
  savedCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 8 },
  savedCardTitle: { color: '#101828', fontWeight: '800' },
  savedCardText: { color: '#667085', marginTop: 5 },
  detailText: { color: '#667085', paddingHorizontal: 60, paddingBottom: 14 },
  methodCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#dfe3ea', borderRadius: 16, padding: 14, marginBottom: 12 },
  methodHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  methodCopy: { flex: 1, marginRight: 12 },
  methodName: { color: '#101828', fontSize: 16, fontWeight: '800', marginBottom: 5 },
  methodDescription: { color: '#34517a', fontSize: 14 },
  editText: { color: '#2563eb', fontWeight: '700' },
  credentials: { marginTop: 14 },
  fieldLabel: { color: '#34517a', fontSize: 12, marginBottom: 5 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 11, fontSize: 14, marginBottom: 10 },
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
