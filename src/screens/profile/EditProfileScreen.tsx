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

// Conditionally import MapView only for native platforms
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
    const MapViewModule = require('react-native-maps');
    MapView = MapViewModule.default;
    Marker = MapViewModule.Marker;
}

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
    const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profile_photo_url || null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
        user?.latitude && user?.longitude ? { latitude: user.latitude, longitude: user.longitude } : null
    );
    const [showMap, setShowMap] = useState(false);

    // Reload profile data when screen is focused to get latest photo
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
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload photos.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const photoUri = result.assets[0].uri;
                setProfilePhoto(photoUri);
                
                // Upload immediately
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
            console.log('✅ Photo upload response:', response);
            
            // Backend returns 'photo_url' not 'profile_photo_url'
            const photoUrl = response.photo_url || response.profile_photo_url;
            if (photoUrl) {
                setProfilePhoto(photoUrl);
                console.log('✅ Updated profilePhoto state to:', photoUrl);
                
                // Also update AsyncStorage immediately so ProfileScreen can see it
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    parsedData.profile_photo_url = photoUrl;
                    await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
                    console.log('✅ Updated AsyncStorage with new photo URL');
                }
            }
            
            Alert.alert('Success', 'Profile photo updated successfully');
        } catch (error: any) {
            console.error('Upload photo error:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to upload photo');
            // Reset photo on error
            setProfilePhoto(user?.profile_photo_url || null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleGetGPSLocation = async () => {
        console.log('🗺️ GPS button pressed');
        let loadingStarted = false;
        try {
            // Request location permission
            console.log('📍 Requesting location permission...');
            const { status } = await Location.requestForegroundPermissionsAsync();
            console.log('📍 Permission status:', status);
            
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to use GPS. Please enable it in your device settings.');
                return;
            }

            setLoading(true);
            loadingStarted = true;

            // Get current location with timeout
            console.log('📍 Getting current position...');
            const currentLocation = await Promise.race([
                Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Location timeout - please try again')), 15000)
                )
            ]) as Location.LocationObject;
            
            console.log('📍 Location obtained:', currentLocation.coords.latitude, currentLocation.coords.longitude);
            
            const newLocation = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude
            };
            
            // Update location state first (so user sees it immediately)
            setLocation(newLocation);
            
            // Update location on backend
            console.log('📍 Updating location on backend...');
            await ApiService.updateLocation(newLocation.latitude, newLocation.longitude);
            console.log('📍 Location updated successfully');

            Alert.alert('Success', 'GPS location updated successfully');
        } catch (error: any) {
            console.error('❌ GPS location error:', error);
            const errorMessage = error.message || 'Failed to get GPS location. Please make sure location services are enabled in your device settings.';
            Alert.alert('Error', errorMessage);
        } finally {
            if (loadingStarted) {
                setLoading(false);
            }
        }
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

                        {/* Map Preview */}
                        {location && Platform.OS !== 'web' && MapView && (
                            <View style={styles.mapPreviewContainer}>
                                <MapView
                                    style={styles.mapPreview}
                                    region={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    userInterfaceStyle={isDark ? 'dark' : 'light'}
                                >
                                    <Marker coordinate={location} />
                                </MapView>
                                <Text style={[styles.locationCoords, { color: Colors.textSecondary }]}>
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </Text>
                            </View>
                        )}

                        {location && Platform.OS === 'web' && (
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
                                No location set
                            </Text>
                        )}

                        {/* Location Buttons */}
                        <View style={styles.locationButtonsRow}>
                            <TouchableOpacity
                                style={[styles.locationButton, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3', borderColor: Colors.primary }]}
                                onPress={handleGetGPSLocation}
                                disabled={loading}
                            >
                                <Ionicons name="navigate" size={18} color={Colors.primary} />
                                <Text style={[styles.locationButtonText, { color: Colors.primary }]}>Use GPS</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.locationButton, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3', borderColor: Colors.primary }]}
                                onPress={() => setShowMap(true)}
                                disabled={loading}
                            >
                                <Ionicons name="map" size={18} color={Colors.primary} />
                                <Text style={[styles.locationButtonText, { color: Colors.primary }]}>Pick on Map</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Map Picker Modal */}
            {showMap && Platform.OS !== 'web' && MapView && (
                <View style={styles.mapModal}>
                    <MapView
                        style={styles.fullMap}
                        initialRegion={{
                            latitude: location?.latitude || 17.385,
                            longitude: location?.longitude || 78.486,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
                        userInterfaceStyle={isDark ? 'dark' : 'light'}
                    >
                        {location && <Marker coordinate={location} />}
                    </MapView>

                    <View style={[styles.mapOverlay, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.mapInstructions, { color: Colors.textPrimary }]}>
                            Tap on the map to set your business location
                        </Text>
                        <View style={styles.mapButtons}>
                            <TouchableOpacity
                                style={[styles.mapButton, { backgroundColor: Colors.textTertiary }]}
                                onPress={() => setShowMap(false)}
                            >
                                <Text style={styles.mapButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mapButton, { backgroundColor: Colors.primary }]}
                                onPress={async () => {
                                    if (location) {
                                        try {
                                            setLoading(true);
                                            await ApiService.updateLocation(location.latitude, location.longitude);
                                            setShowMap(false);
                                            Alert.alert('Success', 'Location updated successfully');
                                        } catch (error: any) {
                                            Alert.alert('Error', error.message || 'Failed to update location');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                disabled={!location || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.mapButtonText}>Save Location</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

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
    mapPreviewContainer: {
        marginBottom: Spacing.md,
    },
    mapPreview: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
    },
    locationButtonsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    mapModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
    },
    fullMap: {
        flex: 1,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
    },
    mapInstructions: {
        fontSize: Typography.fontSm,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    mapButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    mapButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapButtonText: {
        color: '#fff',
        fontSize: Typography.fontSm,
        fontWeight: Typography.semiBold,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    photoUpload: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        overflow: 'hidden',
        marginBottom: Spacing.md,
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    changePhotoText: {
        color: '#fff',
        fontSize: Typography.fontSm,
        fontWeight: Typography.semiBold,
    },
});
