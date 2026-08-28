import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { goBackOrNavigate } from '../navigation/safeBack';

const instructions = [
  'Use the 16 digit PawMart Gift Card and PIN as received on your email or phone number.',
  'Once the Gift Card is added, the balance will reflect in your PawMart Wallet.',
  'Card balance added can be used across PawMart to shop for your pets.',
  'Expiry of the Gift Card shall be applied as mentioned on the Gift Card.',
];

export default function AddGiftCardScreen({ navigation }) {
  const [cardCode, setCardCode] = useState('');
  const [pin, setPin] = useState('');
  const isValid = useMemo(() => cardCode.replace(/\D/g, '').length === 16 && /^\d{6}$/.test(pin), [cardCode, pin]);

  const updateCardCode = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    setCardCode(digits.replace(/(.{4})/g, '$1-').replace(/-$/, ''));
  };

  const addGiftCard = () => {
    if (!isValid) {
      Alert.alert('Invalid gift card', 'Enter a 16 digit card code and 6 digit PIN.');
      return;
    }
    Alert.alert('Gift card submitted', 'Your gift card is being verified.', [{ text: 'Done', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.backButton, styles.headerContentOffset]} onPress={() => goBackOrNavigate(navigation, 'Wallet')} accessibilityLabel="Go back"><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <Text style={[styles.title, styles.headerContentOffset]}>Add Gift Card</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Enter 16 digit card code</Text>
          <TextInput style={styles.input} placeholder="5678-1234-9876-9783" placeholderTextColor="#9aa3af" value={cardCode} onChangeText={updateCardCode} keyboardType="number-pad" />
          <Text style={styles.fieldLabel}>Enter 6-digit PIN</Text>
          <TextInput style={styles.input} placeholder="123456" placeholderTextColor="#9aa3af" value={pin} onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" secureTextEntry />
        </View>

        <View style={styles.sectionHeading}><View style={styles.rule} /><Text style={styles.sectionTitle}>HOW IT WORKS</Text><View style={styles.rule} /></View>
        <View style={styles.instructions}>{instructions.map((instruction, index) => <View style={styles.instruction} key={instruction}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={styles.instructionText}>{instruction}</Text></View>)}</View>
      </ScrollView>
      <View style={styles.bottomAction}><Text style={styles.terms}>By continuing, you agree to our <Text style={styles.termsLink}>Terms & Conditions</Text></Text><TouchableOpacity style={[styles.submitButton, isValid && styles.submitButtonActive]} onPress={addGiftCard}><Text style={styles.submitText}>Add Gift Card</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { height: 88, paddingHorizontal: 20, paddingTop: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e5e8' },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#111820', fontSize: 29, lineHeight: 29, marginTop: 2 },
  title: { color: '#101820', fontSize: 20, fontWeight: '900', marginLeft: 14 },
  headerContentOffset: { transform: [{ translateY: 14 }] },
  content: { padding: 20, paddingBottom: 140 },
  formCard: { paddingTop: 12 },
  fieldLabel: { color: '#7a8490', fontSize: 16, marginBottom: -8, marginLeft: 16, zIndex: 1, backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 7 },
  input: { height: 68, borderWidth: 2, borderColor: '#d1d5dc', borderRadius: 12, paddingHorizontal: 16, color: '#7b8491', fontSize: 17, marginBottom: 22 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  rule: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  sectionTitle: { color: '#242a32', fontSize: 17, marginHorizontal: 10 },
  instructions: { marginTop: 18 },
  instruction: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 17 },
  number: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#e3e6ea', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  numberText: { color: '#7d8792', fontSize: 16 },
  instructionText: { flex: 1, color: '#7b8491', fontSize: 16, lineHeight: 23, paddingTop: 2 },
  bottomAction: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f1f2' },
  terms: { color: '#7b8491', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  termsLink: { color: '#ef3677' },
  submitButton: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#b9b9b9' },
  submitButtonActive: { backgroundColor: '#f30d67' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
