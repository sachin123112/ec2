import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const WALLET_BALANCE_KEY = 'pawmart_wallet_balance';
const presets = [500, 1000, 2000, 5000];

export default function WalletScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('1000');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(WALLET_BALANCE_KEY)
      .then((saved) => setBalance(Number(saved) || 0))
      .catch(() => {});
  }, []);

  const addBalance = async () => {
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1 || value > 100000) {
      Alert.alert('Invalid amount', 'Enter an amount between ₹1 and ₹100,000.');
      return;
    }
    navigation.navigate('Payments', { amount: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.backButton, styles.headerContentOffset]} onPress={() => goBackOrNavigate(navigation, 'Home')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, styles.headerContentOffset]}>Wallet</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceValue}>₹{balance.toLocaleString()}</Text>
        </View>

        <View style={styles.benefitsBanner}>
          <View style={styles.benefit}><Text style={styles.benefitIcon}>☝</Text><View><Text style={styles.benefitTitle}>ONE-TAP</Text><Text style={styles.benefitText}>payment</Text></View></View>
          <View style={styles.benefitDivider} />
          <View style={styles.benefit}><Text style={styles.benefitIcon}>↶</Text><View><Text style={styles.benefitTitle}>INSTANT</Text><Text style={styles.benefitText}>refund</Text></View></View>
        </View>

        <View style={styles.addCard}>
          <Text style={styles.fieldLabel}>Add amount <Text style={styles.required}>*</Text></Text>
          <View style={styles.amountInputWrap}><Text style={styles.rupee}>₹</Text><TextInput style={styles.amountInput} value={amount} onChangeText={(value) => setAmount(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" /></View>
          <View style={styles.presets}>{presets.map((preset) => <TouchableOpacity key={preset} style={[styles.preset, Number(amount) === preset && styles.presetSelected]} onPress={() => setAmount(String(preset))}><Text style={[styles.presetText, Number(amount) === preset && styles.presetTextSelected]}>{preset}</Text></TouchableOpacity>)}</View>
          <TouchableOpacity style={styles.addBalanceButton} onPress={addBalance}><Text style={styles.addBalanceText}>Add Balance</Text></TouchableOpacity>
        </View>

        <View style={styles.giftCard}>
          <View style={styles.giftIconBox}><Text style={styles.giftIcon}>🎁</Text></View>
          <Text style={styles.giftTitle}>Have a Gift Card?</Text>
          <TouchableOpacity style={styles.addCardButton} onPress={() => navigation.navigate('AddGiftCard')}><Text style={styles.addCardText}>Add Card</Text></TouchableOpacity>
        </View>

        <View style={styles.helpCard}>
          <TouchableOpacity style={styles.helpRow} onPress={() => setExpanded(expanded === 'how' ? null : 'how')}><Text style={styles.helpIcon}>ⓘ</Text><Text style={styles.helpTitle}>How it works</Text><Text style={styles.chevron}>{expanded === 'how' ? '⌃' : '›'}</Text></TouchableOpacity>
          {expanded === 'how' && <Text style={styles.helpText}>Add balance once and use your PawMart wallet for faster checkout and refunds.</Text>}
          <View style={styles.dashedLine} />
          <TouchableOpacity style={styles.helpRow} onPress={() => setExpanded(expanded === 'faq' ? null : 'faq')}><Text style={styles.helpIcon}>?</Text><Text style={styles.helpTitle}>FAQs</Text><Text style={styles.chevron}>{expanded === 'faq' ? '⌃' : '›'}</Text></TouchableOpacity>
          {expanded === 'faq' && <Text style={styles.helpText}>Your wallet balance is stored securely on this device for development use.</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f8' },
  topBar: { height: 84, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1e6e9' },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#111820', fontSize: 29, lineHeight: 29, marginTop: 2 },
  topBarTitle: { marginLeft: 8, marginTop: 2, color: '#111820', fontSize: 20, fontWeight: '800' },
  headerContentOffset: { transform: [{ translateY: 16 }] },
  content: { padding: 18, paddingBottom: 36 },
  balanceCard: { height: 206, backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#dce2e6', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  balanceLabel: { color: '#9099a5', fontSize: 17, letterSpacing: 0.5, marginBottom: 10 },
  balanceValue: { color: '#0b1118', fontSize: 44, fontWeight: '900' },
  benefitsBanner: { minHeight: 96, borderRadius: 18, backgroundColor: '#eee6ff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, marginBottom: 26 },
  benefit: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  benefitIcon: { color: '#5b1ac2', fontSize: 27, fontWeight: '800' },
  benefitTitle: { color: '#5420ac', fontSize: 14, fontWeight: '900' },
  benefitText: { color: '#27304d', fontSize: 14 },
  benefitDivider: { height: 52, width: 1, backgroundColor: '#d4c2f4' },
  addCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#dce2e6', padding: 20, marginBottom: 24 },
  fieldLabel: { color: '#596574', fontSize: 15, marginBottom: 7 },
  required: { color: '#f30d67' },
  amountInputWrap: { height: 80, borderWidth: 1.5, borderColor: '#d9dee4', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 22 },
  rupee: { fontSize: 25, fontWeight: '700', color: '#111820' },
  amountInput: { flex: 1, fontSize: 23, color: '#111820', marginLeft: 12 },
  presets: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 24 },
  preset: { flex: 1, height: 68, borderWidth: 1.5, borderColor: '#d9dee4', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  presetSelected: { borderColor: '#f30d67', backgroundColor: '#fff2f6' },
  presetText: { color: '#596574', fontSize: 17, fontWeight: '800' },
  presetTextSelected: { color: '#f30d67' },
  addBalanceButton: { height: 68, borderRadius: 16, backgroundColor: '#f30d67', alignItems: 'center', justifyContent: 'center' },
  addBalanceText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  giftCard: { minHeight: 100, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#dce2e6', padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  giftIconBox: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, borderColor: '#dce2e6', alignItems: 'center', justifyContent: 'center' },
  giftIcon: { fontSize: 26 },
  giftTitle: { flex: 1, color: '#111820', fontSize: 16, fontWeight: '900', marginLeft: 10 },
  addCardButton: { borderWidth: 2, borderColor: '#f30d67', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13 },
  addCardText: { color: '#f30d67', fontSize: 16, fontWeight: '800' },
  helpCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#dce2e6', paddingHorizontal: 18, paddingVertical: 8 },
  helpRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center' },
  helpIcon: { color: '#8492a0', fontSize: 27, width: 46 },
  helpTitle: { flex: 1, color: '#111820', fontSize: 16, fontWeight: '500' },
  chevron: { color: '#111820', fontSize: 30, fontWeight: '800' },
  dashedLine: { borderTopWidth: 1, borderTopColor: '#e4e8eb', borderStyle: 'dashed' },
  helpText: { color: '#687583', lineHeight: 21, paddingBottom: 12, paddingLeft: 54 },
});
