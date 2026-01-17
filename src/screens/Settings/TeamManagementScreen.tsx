/**
 * Team Management Screen
 * Manage workers, admins, and team members
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getThemedColors, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { BusinessMember, UserRole, ROLE_INFO, DEFAULT_PERMISSIONS } from '../../types/accounts';
import ApiService from '../../services/api';

export default function TeamManagementScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const Colors = getThemedColors(isDark);
  
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BusinessMember | null>(null);
  
  // Add member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('worker');
  const [addingMember, setAddingMember] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  const loadMembers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await ApiService.getTeamMembers();
      // setMembers(response.members);
      
      // Demo data
      setMembers([
        {
          id: '1',
          user_id: 'user1',
          business_id: 'biz1',
          role: 'owner',
          name: 'You',
          phone_number: '+91 9876543210',
          permissions: DEFAULT_PERMISSIONS.owner,
          added_by: 'self',
          added_at: new Date().toISOString(),
          is_active: true,
        },
      ]);
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert('Error', 'Failed to load team members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = newMemberPhone.replace(/\D/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setAddingMember(true);
    try {
      // TODO: Replace with actual API call
      // await ApiService.addTeamMember({
      //   name: newMemberName.trim(),
      //   phone_number: cleanPhone,
      //   role: newMemberRole,
      // });

      // Simulate adding
      const newMember: BusinessMember = {
        id: Date.now().toString(),
        user_id: '',
        business_id: '',
        role: newMemberRole,
        name: newMemberName.trim(),
        phone_number: `+91 ${cleanPhone}`,
        permissions: DEFAULT_PERMISSIONS[newMemberRole],
        added_by: 'current_user',
        added_at: new Date().toISOString(),
        is_active: true,
      };

      setMembers([...members, newMember]);
      setShowAddModal(false);
      resetForm();
      
      Alert.alert(
        'Invitation Sent',
        `An SMS invitation has been sent to ${newMemberName}. They can login with their phone number to access this business.`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = (member: BusinessMember) => {
    if (member.role === 'owner') {
      Alert.alert('Cannot Remove', 'The owner cannot be removed from the team.');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Remove ${member.name} from your team? They will lose access to this business.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API call
              setMembers(members.filter(m => m.id !== member.id));
              Alert.alert('Removed', `${member.name} has been removed from the team.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = async (member: BusinessMember, newRole: UserRole) => {
    if (member.role === 'owner') {
      Alert.alert('Cannot Change', 'The owner role cannot be changed.');
      return;
    }

    try {
      // TODO: API call
      setMembers(members.map(m => 
        m.id === member.id 
          ? { ...m, role: newRole, permissions: DEFAULT_PERMISSIONS[newRole] }
          : m
      ));
      setShowRoleModal(false);
      Alert.alert('Updated', `${member.name}'s role has been changed to ${ROLE_INFO[newRole].label}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update role');
    }
  };

  const resetForm = () => {
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberRole('worker');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderMember = ({ item }: { item: BusinessMember }) => {
    const roleInfo = ROLE_INFO[item.role];
    const isOwner = item.role === 'owner';

    return (
      <View style={[styles.memberCard, { backgroundColor: Colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: roleInfo.color + '20' }]}>
          <Text style={[styles.avatarText, { color: roleInfo.color }]}>
            {getInitials(item.name)}
          </Text>
        </View>
        
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.memberName, { color: Colors.textPrimary }]}>{item.name}</Text>
            {isOwner && (
              <View style={[styles.ownerBadge, { backgroundColor: roleInfo.color }]}>
                <Ionicons name="star" size={10} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[styles.memberPhone, { color: Colors.textSecondary }]}>{item.phone_number}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '15' }]}>
            <Text style={[styles.roleText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
          </View>
        </View>

        {!isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.backgroundSecondary }]}
              onPress={() => {
                setSelectedMember(item);
                setShowRoleModal(true);
              }}
            >
              <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.creditRed + '15' }]}
              onPress={() => handleRemoveMember(item)}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.creditRed} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: Colors.primary + '10' }]}>
        <Ionicons name="people-outline" size={20} color={Colors.primary} />
        <Text style={[styles.infoText, { color: Colors.textPrimary }]}>
          Add workers or admins to help manage your business
        </Text>
      </View>

      {/* Members List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadMembers();
              }}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={Colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: Colors.textSecondary }]}>
                No team members yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: Colors.textTertiary }]}>
                Add workers to help manage your business
              </Text>
            </View>
          }
        />
      )}

      {/* Add Member FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary, bottom: 20 + insets.bottom }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Member Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Add Team Member</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: Colors.textSecondary }]}>Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary }]}
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                  placeholder="Enter name"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: Colors.textSecondary }]}>Phone Number</Text>
                <View style={[styles.phoneInputRow, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}>
                  <Text style={[styles.phonePrefix, { color: Colors.textSecondary }]}>+91</Text>
                  <TextInput
                    style={[styles.phoneInput, { color: Colors.textPrimary }]}
                    value={newMemberPhone}
                    onChangeText={setNewMemberPhone}
                    placeholder="9876543210"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Role Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: Colors.textSecondary }]}>Role</Text>
                <View style={styles.roleOptions}>
                  {(['worker', 'admin'] as UserRole[]).map((role) => {
                    const info = ROLE_INFO[role];
                    const isSelected = newMemberRole === role;
                    return (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleOption,
                          { borderColor: isSelected ? info.color : Colors.borderLight },
                          isSelected && { backgroundColor: info.color + '10' },
                        ]}
                        onPress={() => setNewMemberRole(role)}
                      >
                        <View style={[styles.roleIcon, { backgroundColor: info.color + '20' }]}>
                          <Ionicons 
                            name={role === 'admin' ? 'shield-checkmark' : 'person'} 
                            size={20} 
                            color={info.color} 
                          />
                        </View>
                        <Text style={[styles.roleName, { color: Colors.textPrimary }]}>{info.label}</Text>
                        <Text style={[styles.roleDesc, { color: Colors.textTertiary }]}>{info.description}</Text>
                        {isSelected && (
                          <View style={[styles.checkmark, { backgroundColor: info.color }]}>
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: Colors.primary }]}
                onPress={handleAddMember}
                disabled={addingMember}
              >
                {addingMember ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={18} color="#fff" />
                    <Text style={styles.addButtonText}>Send Invitation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        visible={showRoleModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.roleModalContent, { backgroundColor: Colors.card }]}>
            <Text style={[styles.roleModalTitle, { color: Colors.textPrimary }]}>
              Change Role for {selectedMember?.name}
            </Text>
            {(['worker', 'admin'] as UserRole[]).map((role) => {
              const info = ROLE_INFO[role];
              const isSelected = selectedMember?.role === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleSelectItem, { borderBottomColor: Colors.borderLight }]}
                  onPress={() => selectedMember && handleChangeRole(selectedMember, role)}
                >
                  <View style={[styles.roleSelectIcon, { backgroundColor: info.color + '20' }]}>
                    <Ionicons 
                      name={role === 'admin' ? 'shield-checkmark' : 'person'} 
                      size={20} 
                      color={info.color} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleSelectName, { color: Colors.textPrimary }]}>{info.label}</Text>
                    <Text style={[styles.roleSelectDesc, { color: Colors.textTertiary }]}>{info.description}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color={info.color} />}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.cancelButton, { borderTopColor: Colors.borderLight }]}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    margin: Spacing.md,
    marginBottom: 0,
    borderRadius: BorderRadius.md,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  avatar: {
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
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  ownerBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  memberPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingLeft: 14,
  },
  phonePrefix: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
    fontSize: 15,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  roleModalContent: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  roleModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: Spacing.md,
    textAlign: 'center',
  },
  roleSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: 12,
  },
  roleSelectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSelectName: {
    fontSize: 15,
    fontWeight: '500',
  },
  roleSelectDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    padding: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
