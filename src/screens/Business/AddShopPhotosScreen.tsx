/**
 * Add Shop Photos Screen
 * Upload up to 10 business/shop photos to showcase in profile and business preview
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { IconSizes, SpacingScale, RadiusScale } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

const { width } = Dimensions.get('window');
const imageSize = (width - SpacingScale.cardPadding * 2 - Spacing.md * 2) / 3;

export default function AddShopPhotosScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  
  const [shopPhotos, setShopPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const maxPhotos = 10;

  useEffect(() => {
    loadShopPhotos();
  }, []);

  const loadShopPhotos = async () => {
    try {
      setLoading(true);
      const profile = await ApiService.getProfile();
      setShopPhotos(profile.shop_photos || []);
    } catch (error) {
      console.error('Error loading shop photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (shopPhotos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxPhotos} photos`);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (shopPhotos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxPhotos} photos`);
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Shop Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadPhoto = async (imageUri: string) => {
    try {
      setUploading(true);
      const updatedPhotos = [...shopPhotos, imageUri];
      
      await ApiService.updateProfile({
        shop_photos: updatedPhotos,
      });

      setShopPhotos(updatedPhotos);
      Alert.alert('Success', 'Photo added successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (index: number) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              const updatedPhotos = shopPhotos.filter((_, i) => i !== index);
              
              await ApiService.updateProfile({
                shop_photos: updatedPhotos,
              });

              setShopPhotos(updatedPhotos);
              Alert.alert('Success', 'Photo deleted successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete photo');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading photos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={IconSizes.medium} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Shop Photos</Text>
          <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>
            {shopPhotos.length}/{maxPhotos} photos
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.1)' : '#e8f5f3' }]}>
          <Ionicons name="information-circle" size={IconSizes.medium} color="#5a9a8e" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={[styles.infoTitle, { color: Colors.textPrimary }]}>
              Showcase Your Business
            </Text>
            <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
              Add photos of your shop, products, or team. These will be visible to customers viewing your business.
            </Text>
          </View>
        </View>

        {/* Photos Grid */}
        <View style={styles.photosGrid}>
          {shopPhotos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: 'rgba(239, 68, 68, 0.9)' }]}
                onPress={() => deletePhoto(index)}
                disabled={uploading}
              >
                <Ionicons name="trash" size={IconSizes.tiny} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Photo Button */}
          {shopPhotos.length < maxPhotos && (
            <TouchableOpacity
              style={[styles.addPhotoButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={showImageOptions}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="add-circle" size={IconSizes.xlarge} color={Colors.primary} />
                  <Text style={[styles.addPhotoText, { color: Colors.textSecondary }]}>
                    Add Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Empty State */}
        {shopPhotos.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="images" size={IconSizes.xlarge} color={Colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>
              No photos yet
            </Text>
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
              Add photos to showcase your business to customers
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: Colors.primary }]}
              onPress={showImageOptions}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="camera" size={IconSizes.small} color="#fff" />
                  <Text style={styles.emptyButtonText}>Add First Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: SpacingScale.sectionPadding }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SpacingScale.cardPadding,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: SpacingScale.cardPadding,
    ...Shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RadiusScale.button,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SpacingScale.cardPadding,
    paddingTop: SpacingScale.cardPadding,
  },
  infoCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: RadiusScale.card,
    marginBottom: SpacingScale.cardPadding,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  photoContainer: {
    width: imageSize,
    height: imageSize,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: RadiusScale.card,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  addPhotoButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: RadiusScale.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.space12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.space8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: RadiusScale.button,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
