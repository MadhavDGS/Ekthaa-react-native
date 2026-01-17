/**
 * Account Switcher Component
 * Allows users to switch between linked business accounts
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { LinkedAccount, ROLE_INFO } from '../types/accounts';

interface AccountSwitcherProps {
  visible: boolean;
  onClose: () => void;
  onAccountSwitch: (account: LinkedAccount) => void;
  currentBusinessId?: string;
}

export default function AccountSwitcher({
  visible,
  onClose,
  onAccountSwitch,
  currentBusinessId,
}: AccountSwitcherProps) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadLinkedAccounts();
    }
  }, [visible]);

  const loadLinkedAccounts = async () => {
    try {
      setLoading(true);
      // Load from AsyncStorage - in production this would come from API
      const storedAccounts = await AsyncStorage.getItem('linked_accounts');
      if (storedAccounts) {
        const parsed = JSON.parse(storedAccounts);
        setAccounts(parsed.map((acc: LinkedAccount) => ({
          ...acc,
          is_current: acc.business_id === currentBusinessId,
        })));
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = async (account: LinkedAccount) => {
    if (account.is_current) {
      onClose();
      return;
    }
    
    onAccountSwitch(account);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    return ROLE_INFO[role as keyof typeof ROLE_INFO]?.color || Colors.primary;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: Colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.textPrimary }]}>
              Switch Account
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Accounts List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : accounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color={Colors.textTertiary} />
              <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                No linked accounts
              </Text>
              <Text style={[styles.emptySubtext, { color: Colors.textTertiary }]}>
                Add workers or admins to your business from Settings
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.accountsList}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountItem,
                    { borderBottomColor: Colors.borderLight },
                    account.is_current && { backgroundColor: Colors.primary + '10' },
                  ]}
                  onPress={() => handleAccountSelect(account)}
                  activeOpacity={0.7}
                >
                  {/* Avatar */}
                  {account.profile_photo ? (
                    <Image
                      source={{ uri: account.profile_photo }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary + '20' }]}>
                      <Text style={[styles.avatarText, { color: Colors.primary }]}>
                        {getInitials(account.business_name)}
                      </Text>
                    </View>
                  )}

                  {/* Info */}
                  <View style={styles.accountInfo}>
                    <Text style={[styles.businessName, { color: Colors.textPrimary }]} numberOfLines={1}>
                      {account.business_name}
                    </Text>
                    <View style={styles.roleRow}>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(account.role) + '20' }]}>
                        <Text style={[styles.roleText, { color: getRoleColor(account.role) }]}>
                          {ROLE_INFO[account.role]?.label || account.role}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Current indicator */}
                  {account.is_current ? (
                    <View style={[styles.currentBadge, { backgroundColor: Colors.primary }]}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Add Account Button */}
          <TouchableOpacity
            style={[styles.addAccountButton, { borderTopColor: Colors.borderLight }]}
            onPress={() => {
              onClose();
              // Navigate to add account screen
            }}
          >
            <View style={[styles.addIcon, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="add" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.addAccountText, { color: Colors.primary }]}>
              Add Another Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  accountsList: {
    maxHeight: 300,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  businessName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  currentBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
});
