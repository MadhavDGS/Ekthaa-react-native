/**
 * Edit Profile Screen - Web Version
 * Map functionality disabled on web
 */

import React, { useState } from 'react';
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
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';
import { User } from '../../types';

// Web version - no MapView

export default function EditProfileScreen({ navigation, route }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst_number: '',
    });
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Reload profile data when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            const loadLatestProfile = async () => {
                try {
                    const data = await ApiService.getProfile();
                    if (data.business) {
                        setProfilePhoto(data.business.profile_photo_url || null);
                        setFormData({
                            name: data.business.name || '',
                            phone_number: data.business.phone_number || '',
                            email: data.business.email || '',
                            address: data.business.address || '',
                            city: data.business.city || '',
                            state: data.business.state || '',
                            pincode: data.business.pincode || '',
                            gst_number: data.business.gst_number || '',
                        });
                        if (data.business.latitude && data.business.longitude) {
                            setLocation({
                                latitude: data.business.latitude,
                                longitude: data.business.longitude
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error loading latest profile:', error);
                }
            };
            loadLatestProfile();
        }, [])
    );

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const photoUri = result.assets[0].uri;
                setProfilePhoto(photoUri);
                await uploadProfilePhoto(photoUri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadProfilePhoto = async (photoUri: string) => {
        try {
            setUploadingPhoto(true);
            const response = await ApiService.uploadProfilePhoto(photoUri);
            const photoUrl = response.photo_url || response.profile_photo_url;
            if (photoUrl) {
                setProfilePhoto(photoUrl);
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    parsedData.profile_photo_url = photoUrl;
                    await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
                }
            }
            Alert.alert('Success', 'Profile photo updated successfully');
        } catch (error: any) {
            console.error('Upload photo error:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to upload photo');
            setProfilePhoto(null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleGetGPSLocation = async () => {
        Alert.alert('Not Supported', 'GPS location is not available on web. Please use the mobile app.');
    };

    const handleSave = async () => {
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
                    {/* Profile Photo Section */}
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                            Profile Photo
                        </Text>
                        
                        <View style={styles.photoContainer}>
                            <TouchableOpacity
                                style={[styles.photoUpload, { borderColor: Colors.borderLight }]}
                                onPress={pickImage}
                                disabled={uploadingPhoto}
                            >
                                {profilePhoto ? (
                                    <Image
                                        source={{ uri: profilePhoto }}
                                        style={styles.profileImage}
                                    />
                                ) : (
                                    <View style={[styles.photoPlaceholder, { backgroundColor: Colors.primary + '15' }]}>
                                        <Ionicons name="camera" size={40} color={Colors.primary} />
                                    </View>
                                )}
                                {uploadingPhoto && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator size="large" color={Colors.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.changePhotoButton, { backgroundColor: Colors.primary }]}
                                onPress={pickImage}
                                disabled={uploadingPhoto}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="camera" size={16} color="#fff" />
                                <Text style={styles.changePhotoText}>
                                    {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Business Information Section */}
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                            Business Information
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>Business Name *</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: Colors.backgroundSecondary,
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter business name"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>Phone Number *</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: Colors.backgroundSecondary,
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter phone number"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.phone_number}
                                onChangeText={(text) => handleInputChange('phone_number', text)}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: Colors.backgroundSecondary,
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter email"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>GST Number</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: Colors.backgroundSecondary,
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter GST number"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.gst_number}
                                onChangeText={(text) => handleInputChange('gst_number', text)}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>

                    {/* Business Address Section */}
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                            Business Address
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>Address</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: Colors.backgroundSecondary,
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Enter address"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.address}
                                onChangeText={(text) => handleInputChange('address', text)}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>City</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        backgroundColor: Colors.backgroundSecondary,
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
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>State</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        backgroundColor: Colors.backgroundSecondary,
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

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>Pincode</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: Colors.backgroundSecondary,
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

                        {location && (
                            <View style={styles.mapPreviewContainer}>
                                <View style={[styles.mapPreview, { backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Ionicons name="location" size={40} color={Colors.primary} />
                                </View>
                                <Text style={[styles.locationCoords, { color: Colors.textSecondary }]}>
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </Text>
                            </View>
                        )}

                        {!location && (
                            <Text style={[styles.locationText, { color: Colors.textSecondary, marginBottom: Spacing.md }]}>
                                No location set. Use mobile app for GPS features.
                            </Text>
                        )}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save Button */}
            <View style={[styles.bottomBar, {
                backgroundColor: Colors.card,
                borderTopColor: Colors.borderLight
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
    },
    sectionTitle: {
        fontSize: Typography.fontMd,
        fontFamily: Typography.fonts.bold,
        marginBottom: Spacing.md,
    },
    photoContainer: {
        alignItems: 'center',
    },
    photoUpload: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    changePhotoText: {
        color: '#fff',
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.semiBold,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.fontSm,
        marginBottom: Spacing.xs,
        fontFamily: Typography.fonts.medium,
    },
    input: {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Typography.fontSm,
        borderWidth: 1,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
        marginBottom: Spacing.md,
    },
    mapPreviewContainer: {
        marginBottom: Spacing.md,
    },
    mapPreview: {
        height: 200,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
    },
    locationCoords: {
        fontSize: Typography.fontXs,
        textAlign: 'center',
    },
    locationText: {
        fontSize: Typography.fontSm,
        textAlign: 'center',
    },
    bottomBar: {
        borderTopWidth: 1,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
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
        fontFamily: Typography.fonts.bold,
    },
});
