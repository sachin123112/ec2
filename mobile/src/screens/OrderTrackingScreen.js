import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import config from '../api/config';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const trackingSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
const trackingEmailRecipient = 'gitsachin720@gmail.com';

function getStepIndex(status) {
	const normalizedStatus = String(status || 'Pending').toLowerCase();
	if (normalizedStatus.includes('deliver')) return 3;
	if (normalizedStatus.includes('ship') || normalizedStatus.includes('dispatch')) return 2;
	if (normalizedStatus.includes('confirm') || normalizedStatus.includes('process')) return 1;
	return 0;
}

export default function OrderTrackingScreen({ navigation }) {
	const { token } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadOrders = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${config.API_URL}/orders`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error('Unable to load orders');
			const data = await response.json();
			setOrders(Array.isArray(data) ? data : []);
		} catch (error) {
			Alert.alert('Unable to load tracking', 'Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	const handleTrackingEmail = async () => {
		if (orders.length === 0) {
			Alert.alert('No orders to send', 'There are no order tracking details available yet.');
			return;
		}

		const orderLines = orders.map((order) => {
			const orderNumber = order.orderNumber || order.id || 'Order';
			const status = order.status || 'Pending';
			const date = order.createdAt || order.date;
			return `Order #${orderNumber}: ${status} (${date ? new Date(date).toLocaleDateString() : 'Date unavailable'})`;
		});
		const subject = 'PawMart Order Tracking';
		const body = `Hello,\n\nHere are the latest PawMart order tracking details:\n\n${orderLines.join('\n')}\n\nThank you,\nPawMart`;
		const mailUrl = `mailto:${encodeURIComponent(trackingEmailRecipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

		if (await Linking.canOpenURL(mailUrl)) {
			await Linking.openURL(mailUrl);
		} else {
			Alert.alert('Email unavailable', 'No email app is configured on this device.');
		}
	};

	useEffect(() => {
		if (token) loadOrders();
		else setLoading(false);
	}, [token]);

	return (
		<View style={styles.container}>
			<View style={styles.topBar}>
				<TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
					<Text style={styles.backIcon}>‹</Text>
				</TouchableOpacity>
				<Text style={styles.topBarTitle}>Order Tracking</Text>
			</View>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.heading}>Track Your Orders</Text>
				<View style={styles.emailCard}>
					<Text style={styles.fieldLabel}>Send tracking details to</Text>
					<TextInput
						style={styles.input}
						value={trackingEmailRecipient}
						editable={false}
					/>
					<TouchableOpacity style={styles.emailButton} onPress={handleTrackingEmail}>
						<Text style={styles.emailButtonText}>Tracking Email</Text>
					</TouchableOpacity>
				</View>
				{loading ? (
					<ActivityIndicator color={theme.colors.primary} />
				) : orders.length === 0 ? (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyIcon}>📦</Text>
						<Text style={styles.emptyTitle}>No orders to track</Text>
						<Text style={styles.emptyText}>Your order tracking details will appear here.</Text>
					</View>
				) : (
					orders.map((order) => {
						const orderNumber = order.orderNumber || order.id || 'Order';
						const status = order.status || 'Pending';
						const activeStep = getStepIndex(status);
						return (
							<View style={styles.orderCard} key={String(order.id || orderNumber)}>
								<View style={styles.orderHeader}>
									<Text style={styles.orderNumber}>#{orderNumber}</Text>
									<Text style={styles.currentStatus}>{status}</Text>
								</View>
								<Text style={styles.orderDate}>
									{order.createdAt || order.date ? new Date(order.createdAt || order.date).toLocaleDateString() : 'Date unavailable'}
								</Text>
								<View style={styles.timeline}>
									{trackingSteps.map((step, index) => (
										<View style={styles.step} key={step}>
											<View style={[styles.stepMarker, index <= activeStep && styles.stepMarkerActive]}>
												{index <= activeStep && <Text style={styles.stepCheck}>✓</Text>}
											</View>
											<Text style={[styles.stepText, index <= activeStep && styles.stepTextActive]}>{step}</Text>
											{index < trackingSteps.length - 1 && <View style={[styles.stepLine, index < activeStep && styles.stepLineActive]} />}
										</View>
									))}
								</View>
							</View>
						);
					})
				)}
			</ScrollView>
			<BottomTabBar activeTab="Account" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: theme.colors.background },
	topBar: { height: 108, paddingHorizontal: 18, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
	backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', justifyContent: 'center', alignItems: 'center' },
	backIcon: { color: theme.colors.text, fontSize: 29, lineHeight: 29, marginTop: 2 },
	topBarTitle: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
	content: { padding: 18, paddingBottom: 110 },
	heading: { color: '#101828', fontSize: 24, fontWeight: '800', marginBottom: 16 },
	emailCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#dfe3ea', borderRadius: 12, padding: 14, marginBottom: 14 },
	fieldLabel: { color: '#34517a', fontSize: 12, marginBottom: 5 },
	input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 11, fontSize: 14, marginBottom: 10 },
	emailButton: { backgroundColor: theme.colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
	emailButtonText: { color: theme.colors.surface, fontWeight: '700' },
	emptyCard: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 24, alignItems: 'center' },
	emptyIcon: { fontSize: 34, marginBottom: 10 },
	emptyTitle: { color: '#101828', fontSize: 18, fontWeight: '800' },
	emptyText: { color: '#667085', marginTop: 6, textAlign: 'center' },
	orderCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#dfe3ea', borderRadius: 12, padding: 14, marginBottom: 12 },
	orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	orderNumber: { color: '#101828', fontSize: 16, fontWeight: '800' },
	currentStatus: { color: theme.colors.primary, fontWeight: '800', textTransform: 'capitalize' },
	orderDate: { color: '#667085', fontSize: 13, marginTop: 5 },
	timeline: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 22 },
	step: { flex: 1, alignItems: 'center', position: 'relative' },
	stepMarker: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
	stepMarkerActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
	stepCheck: { color: theme.colors.surface, fontSize: 13, fontWeight: '800' },
	stepText: { color: '#98a2b3', fontSize: 11, marginTop: 7, textAlign: 'center' },
	stepTextActive: { color: '#101828', fontWeight: '700' },
	stepLine: { position: 'absolute', top: 11, left: '50%', right: '-50%', height: 2, backgroundColor: '#e4e7ec' },
	stepLineActive: { backgroundColor: theme.colors.primary },
});
