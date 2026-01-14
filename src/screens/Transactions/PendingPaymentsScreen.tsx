/**
 * Pending Payments Screen
 * Business can verify or reject customer UPI payment claims
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';

interface PendingPayment {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  upi_ref: string | null;
  status: string;
  created_at: string;
}

export default function PendingPaymentsScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadPendingPayments();
    }, [])
  );

  const loadPendingPayments = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await ApiService.getPendingPayments();
      setPayments(response.payments || []);
    } catch (error) {
      console.error('Error loading pending payments:', error);
      Alert.alert('Error', 'Failed to load pending payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    } else {
      dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    const timeStr = date.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    return `${dateStr} at ${timeStr}`;
  };

  const handleVerify = async (payment: PendingPayment) => {
    Alert.alert(
      'Verify Payment',
      `Confirm that you received ₹${Math.abs(payment.amount)} from ${payment.customer_name}?\n\nThis will update their credit balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoading(payment.id);
              await ApiService.verifyPayment(payment.id, payment.upi_ref || undefined);
              Alert.alert('Success', 'Payment verified and balance updated!');
              loadPendingPayments();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to verify payment');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const openRejectModal = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    try {
      setActionLoading(selectedPayment.id);
      setShowRejectModal(false);
      await ApiService.rejectPayment(selectedPayment.id, rejectReason || undefined);
      Alert.alert('Rejected', 'Payment claim has been rejected');
      loadPendingPayments();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reject payment');
    } finally {
      setActionLoading(null);
      setSelectedPayment(null);
    }
  };

  const renderPaymentItem = ({ item }: { item: PendingPayment }) => {
    const isActioning = actionLoading === item.id;
    
    return (
      <View style={[styles.card, { backgroundColor: Colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <View style={[styles.avatar, { backgroundColor: '#6366f1' }]}>
              <Text style={styles.avatarText}>
                {item.customer_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.customerName, { color: Colors.textPrimary }]}>
                {item.customer_name}
              </Text>
              <Text style={[styles.customerPhone, { color: Colors.textSecondary }]}>
                {item.customer_phone}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: '#10b981' }]}>
              +{formatCurrency(item.amount)}
            </Text>
            <View style={styles.upiTag}>
              <Ionicons name="phone-portrait-outline" size={12} color="#6366f1" />
              <Text style={styles.upiTagText}>UPI</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
            <Text style={[styles.detailText, { color: Colors.textTertiary }]}>
              {formatDateTime(item.created_at)}
            </Text>
          </View>
          {item.upi_ref && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
              <Text style={[styles.detailText, { color: Colors.textTertiary }]}>
                Ref: {item.upi_ref}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.rejectButton, { borderColor: Colors.borderLight }]}
            onPress={() => openRejectModal(item)}
            disabled={isActioning}
            activeOpacity={0.7}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <Ionicons name="close" size={18} color="#ef4444" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.verifyButton, isActioning && styles.buttonDisabled]}
            onPress={() => handleVerify(item)}
            disabled={isActioning}
            activeOpacity={0.7}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.verifyButtonText}>Verify</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle" size={80} color={Colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>
        All Caught Up!
      </Text>
      <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
        No pending payments to verify
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentItem}
        contentContainerStyle={[
          styles.listContent,
          payments.length === 0 && styles.emptyContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPendingPayments();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Reject Reason Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>
                Reject Payment
              </Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtext, { color: Colors.textSecondary }]}>
              Are you sure you want to reject this payment claim from{' '}
              {selectedPayment?.customer_name}?
            </Text>

            <TextInput
              style={[styles.reasonInput, { 
                backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                color: Colors.textPrimary
              }]}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Reason (optional)"
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: Colors.borderLight }]}
                onPress={() => setShowRejectModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: Colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalRejectButton}
                onPress={handleReject}
                activeOpacity={0.7}
              >
                <Text style={styles.modalRejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
  },
  customerName: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  customerPhone: {
    fontSize: Typography.fontSm,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
  },
  upiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    gap: 4,
  },
  upiTagText: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    color: '#6366f1',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  cardDetails: {
    gap: 6,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: Typography.fontSm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  rejectButtonText: {
    color: '#ef4444',
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: '#10b981',
    gap: 6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontMd,
    marginTop: Spacing.xs,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
  },
  modalSubtext: {
    fontSize: Typography.fontMd,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  reasonInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontMd,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  modalRejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalRejectText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
});
