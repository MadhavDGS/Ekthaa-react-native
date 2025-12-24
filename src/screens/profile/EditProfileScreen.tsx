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
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
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
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
        user?.latitude && user?.longitude ? { latitude: user.latitude, longitude: user.longitude } : null
    );
    const [showMap, setShowMap] = useState(false);

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

                    {/* Business Location Section */}
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                            Business Location
                        </Text>

                        {/* Location Status */}
                        {user?.latitude && user?.longitude ? (
                            <View style={styles.locationInfo}>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location" size={20} color={Colors.primary} />
                                    <Text style={[styles.locationText, { color: Colors.textPrimary }]}>
                                        Location Set
                                    </Text>
                                </View>
                                <Text style={[styles.locationCoords, { color: Colors.textSecondary }]}>
                                    {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.locationInfo}>
                                <Text style={[styles.locationText, { color: Colors.textSecondary }]}>
                                    No location set
                                </Text>
                            </View>
                        )}

                        {/* Update Location Button */}
                        <TouchableOpacity
                            style={[styles.locationButton, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3', borderColor: Colors.primary }]}
                            onPress={async () => {
                                try {
                                    const { requestForegroundPermissionsAsync, getCurrentPositionAsync } = require('expo-location');
                                    const { status } = await requestForegroundPermissionsAsync();
                                    if (status !== 'granted') {
                                        Alert.alert('Permission Denied', 'Location permission is required to update business location');
                                        return;
                                    }

                                    setLoading(true);
                                    const location = await getCurrentPositionAsync({});
                                    await ApiService.updateLocation(location.coords.latitude, location.coords.longitude);

                                    Alert.alert('Success', 'Business location updated successfully');
                                    navigation.setParams({ user: { ...user, latitude: location.coords.latitude, longitude: location.coords.longitude } });
                                } catch (error: any) {
                                    console.error('Update location error:', error);
                                    Alert.alert('Error', error.message || 'Failed to update location');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                        >
                            <Ionicons name="navigate" size={20} color={Colors.primary} />
                            <Text style={[styles.locationButtonText, { color: Colors.primary }]}>
                                Update Location (Use Current)
                            </Text>
                        </TouchableOpacity>
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
    locationInfo: {
        marginBottom: Spacing.md,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    locationText: {
        fontSize: Typography.fontSm,
        fontWeight: Typography.medium,
    },
    locationCoords: {
        fontSize: Typography.fontXs,
        marginLeft: 28,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        gap: Spacing.xs,
    },
    locationButtonText: {
        fontSize: Typography.fontSm,
        fontWeight: Typography.semiBold,
    },
});
