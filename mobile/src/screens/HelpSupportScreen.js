import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const faqs = [
  { question: 'How can I track my order?', answer: 'Open Order History from Account to view your latest order status.' },
  { question: 'How do I update my profile?', answer: 'Open your profile from Account, select Edit, and save your updated information.' },
  { question: 'How can I contact support?', answer: 'Use the Contact Support button below and our team will help you.' },
];

export default function HelpSupportScreen({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactSupport = () => {
    Linking.openURL('mailto:support@pawmart.com').catch(() => {
      Alert.alert('Contact Support', 'Email support@pawmart.com for help.');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Help & Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.supportCard}>
          <Text style={styles.supportIcon}>💬</Text>
          <Text style={styles.heading}>How can we help?</Text>
          <Text style={styles.subtitle}>Find answers or contact our support team.</Text>
          <TouchableOpacity style={styles.contactButton} onPress={contactSupport}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => {
          const expanded = expandedFaq === index;
          return (
            <TouchableOpacity
              key={faq.question}
              style={styles.faqCard}
              onPress={() => setExpandedFaq(expanded ? null : index)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Text style={styles.chevron}>{expanded ? '⌃' : '⌄'}</Text>
              </View>
              {expanded && <Text style={styles.answer}>{faq.answer}</Text>}
            </TouchableOpacity>
          );
        })}
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
  supportCard: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 24 },
  supportIcon: { fontSize: 36, marginBottom: 8 },
  heading: { color: theme.colors.primaryDark, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 15, marginBottom: 18 },
  contactButton: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: 13, paddingHorizontal: 24 },
  contactButtonText: { color: theme.colors.surface, fontWeight: '700', fontSize: 15 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  faqCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 16, marginBottom: 10 },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  question: { flex: 1, color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  chevron: { color: theme.colors.primary, fontSize: 22, marginLeft: 10 },
  answer: { color: theme.colors.textSecondary, lineHeight: 21, marginTop: 12 },
});
