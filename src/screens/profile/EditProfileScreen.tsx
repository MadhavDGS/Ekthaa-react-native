/**
 * Edit Profile Screen
 * Edit business profile information
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';
import { User } from '../../types';

export default function EditProfileScreen({ navigation, route }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const { user } = route.params || {};

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone_number: user?.phone_number || '',
        email: user?.email || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
        gst_number: user?.gst_number || '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name.trim()) {
            Alert.alert('Validation Error', 'Business name is required');
            return;
        }

        if (!formData.phone_number.trim()) {
            Alert.alert('Validation Error', 'Phone number is required');
            return;
        }

        try {
            setLoading(true);
            await ApiService.updateProfile(formData);
            Alert.alert('Success', 'Profile updated successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Business Information Section */}
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                            Business Information
                        </Text>

                        {/* Business Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                Business Name *
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter business name"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                            />
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                Phone Number *
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter phone number"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.phone_number}
                                onChangeText={(text) => handleInputChange('phone_number', text)}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                Email
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter email address"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* GST Number */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                GST Number
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter GST number"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.gst_number}
                                onChangeText={(text) => handleInputChange('gst_number', text.toUpperCase())}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>

                    {/* Address Section */}
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                            Business Address
                        </Text>

                        {/* Address */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                Address
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter complete address"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.address}
                                onChangeText={(text) => handleInputChange('address', text)}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* City and State Row */}
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                    City
                                </Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        color: Colors.textPrimary,
                                        borderColor: Colors.borderLight
                                    }]}
                                    placeholder="City"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.city}
                                    onChangeText={(text) => handleInputChange('city', text)}
                                />
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                    State
                                </Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        color: Colors.textPrimary,
                                        borderColor: Colors.borderLight
                                    }]}
                                    placeholder="State"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.state}
                                    onChangeText={(text) => handleInputChange('state', text)}
                                />
                            </View>
                        </View>

                        {/* Pincode */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                Pincode
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter pincode"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.pincode}
                                onChangeText={(text) => handleInputChange('pincode', text)}
                                keyboardType="numeric"
                                maxLength={6}
                            />
                        </View>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Fixed Bottom Button */}
            <View style={[styles.bottomBar, {
                backgroundColor: Colors.card,
                borderTopColor: Colors.borderLight,
                ...Platform.select({
                    ios: { shadowColor: '#000' },
                    android: {}
                })
            }]}>
                <TouchableOpacity
                    style={[styles.saveButton, {
                        backgroundColor: loading ? Colors.textTertiary : Colors.primary
                    }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    sectionTitle: {
        fontSize: Typography.fontMd,
        fontWeight: Typography.bold,
        marginBottom: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.fontSm,
        marginBottom: Spacing.xs,
        fontWeight: Typography.medium,
    },
    input: {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Typography.fontSm,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 80,
        paddingTop: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    bottomBar: {
        borderTopWidth: 1,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: Typography.fontMd,
        fontWeight: Typography.bold,
    },
});
