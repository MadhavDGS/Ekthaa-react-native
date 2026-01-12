/**
 * Home Screen - Business Overview Dashboard
 * Modern home with profile completion, products showcase, and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AvatarSizes, IconSizes, SpacingScale, RadiusScale } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Illustration from '../../components/Illustration';
import SvgIcon, { SvgIconName } from '../../components/SvgIcon';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, productsData] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getProducts(),
      ]);
      
      setProfile(profileData.business);
      setProducts(productsData.products.slice(0, 4)); // Show first 4 products
      
      // Calculate profile completion
      const completion = calculateProfileCompletion(profileData.business);
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateProfileCompletion = (profile: any) => {
    const fields = [
      profile?.name,
      profile?.phone_number,
      profile?.email,
      profile?.address,
      profile?.category,
      profile?.profile_photo,
      profile?.description,
      profile?.gst_number,
    ];
    const completed = fields.filter(f => f && f.length > 0).length;
    return Math.round((completed / fields.length) * 100);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const QuickActionButton = ({ svgIcon, icon, label, color, onPress }: any) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        {svgIcon ? (
          <SvgIcon name={svgIcon} size={36} color={color} />
        ) : (
          <Ionicons name={icon} size={36} color={color} />
        )}
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#4A8A7E', '#3A7A6E', '#2A5A50', '#1A4A40']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      locations={[0, 0.4, 0.7, 1]}
      style={styles.container}
    >
      {/* Modern Gradient Header - Matching KhataScreen */}
      <SafeAreaView edges={['top']} style={Platform.OS === 'web' && { paddingTop: 0 }}>
        <View style={styles.headerTitle}>
          <Text style={styles.appTitle}>Ekthaa</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.businessName}>{profile?.name || 'Your Business'}</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
          {/* Profile Completion Card */}
        {profileCompletion < 100 && (
          <View style={styles.card}>
            {/* Icon positioned at top-right */}
            <View style={styles.completionIconLarge}>
              <Ionicons name="document-text" size={32} color="#5a9a8e" />
            </View>

            <View style={styles.completionContent}>
              <Text style={styles.completionTitle}>
                Complete your business profile
              </Text>
              <Text style={styles.completionSubtitle}>
                to get more customers
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarWrapper}>
                <LinearGradient
                  colors={
                    profileCompletion < 30 
                      ? ['#ef4444', '#dc2626']
                      : profileCompletion < 60
                      ? ['#f59e0b', '#d97706']
                      : ['#10b981', '#059669']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${profileCompletion}%` },
                  ]}
                />
              </View>
              
              <Text style={styles.progressText}>
                {profileCompletion}% complete
              </Text>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.8}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* My Products Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {products.length > 0 ? (
            <>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.productsScroll}
                contentContainerStyle={styles.productsScrollContent}
              >
                {products.map((product, index) => {
                  // Placeholder images for common products
                  const placeholderImages = [
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', // Rice
                    'https://images.unsplash.com/photo-1563450392-1ebb936e4a57?w=400&q=80', // Sugar
                    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80', // Oil
                    'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80', // Flour
                    'https://images.unsplash.com/photo-1599909533730-b5d81e4e2f2c?w=400&q=80', // Salt
                  ];
                  const imageUrl = product.image || placeholderImages[index % placeholderImages.length];
                  
                  return (
                    <TouchableOpacity
                      key={product.$id || product.id || `product-${Math.random()}`}
                      style={[styles.productCard, { backgroundColor: Colors.backgroundSecondary }]}
                      onPress={() => navigation.navigate('Products')}
                      activeOpacity={0.8}
                    >
                      <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.productImage}
                        defaultSource={require('../../../assets/icon.png')}
                      />
                      <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={[styles.productPrice, { color: Colors.primary }]}>
                        ₹{product.price}{product.unit && `/${product.unit}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.productsActionsCapsule}>
                <TouchableOpacity
                  style={styles.addProductButton}
                  onPress={() => navigation.navigate('AddProduct')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={18} color="#5a9a8e" />
                  <Text style={styles.addProductText}>Add Product</Text>
                </TouchableOpacity>

                <View style={styles.actionsDivider} />

                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('Products')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllButtonText}>View All</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyProducts}>
              <Illustration name="noData" width={160} height={160} />
              <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>No products yet</Text>
              <TouchableOpacity
                style={[styles.addFirstButton, { backgroundColor: Colors.primary }]}
                onPress={() => navigation.navigate('AddProduct')}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            icon="camera"
            label="Add Shop Photo"
            color="#16a34a"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <QuickActionButton
            svgIcon="reward"
            label="Run Offers"
            color="#f59e0b"
            onPress={() => navigation.navigate('Offers')}
          />
          <QuickActionButton
            svgIcon="record"
            label="Create Invoice"
            color="#3b82f6"
            onPress={() => navigation.navigate('Invoice')}
          />
          <QuickActionButton
            svgIcon="safe"
            label="Khata"
            color="#f97316"
            onPress={() => navigation.navigate('Khata')}
          />
          <QuickActionButton
            svgIcon="handbag"
            label="Inventory"
            color="#16a34a"
            onPress={() => navigation.navigate('Products')}
          />
          <QuickActionButton
            icon="ellipsis-horizontal"
            label="View More"
            color="#6b7280"
            onPress={() => navigation.navigate('Customers')}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  businessName: {
    fontSize: Typography.fontSm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.medium,
  },
  card: {
    marginHorizontal: SpacingScale.sectionPadding,
    marginTop: Spacing.md,
    padding: SpacingScale.cardPadding,
    borderRadius: RadiusScale.card,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  completionIconLarge: {
    position: 'absolute',
    top: SpacingScale.cardPadding,
    right: SpacingScale.cardPadding,
    width: 56,
    height: 56,
    borderRadius: RadiusScale.card,
    backgroundColor: '#e8f5f3',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  completionContent: {
    paddingRight: 70,
  },
  completionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 22,
    marginBottom: 4,
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: Spacing.md,
  },
  progressBarWrapper: {
    height: 10,
    borderRadius: RadiusScale.input,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: RadiusScale.input,
  },
  progressText: {
    fontSize: Typography.fontXs,
    color: '#6b7280',
    fontWeight: Typography.medium,
    marginBottom: Spacing.md,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 100,
    backgroundColor: '#5a9a8e',
    gap: Spacing.xs,
    alignSelf: 'flex-end',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    color: '#5a9a8e',
  },
  productsScroll: {
    marginHorizontal: -SpacingScale.cardPadding,
    paddingHorizontal: SpacingScale.cardPadding,
    marginTop: Spacing.xs,
  },
  productsScrollContent: {
    paddingRight: SpacingScale.cardPadding,
  },
  productCard: {
    width: 120,
    marginRight: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: RadiusScale.card,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: RadiusScale.card,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: RadiusScale.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    backgroundColor: '#e5e7eb',
  },
  productName: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    marginBottom: 2,
    marginTop: Spacing.xs,
    color: '#1f2937',
  },
  productPrice: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.bold,
    color: '#5a9a8e',
  },
  productsActionsCapsule: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    borderRadius: 100,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  addProductButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: '#d1f0e8',
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },
  addProductText: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    color: '#5a9a8e',
  },
  actionsDivider: {
    width: 0,
  },
  viewAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: '#5a9a8e',
    gap: Spacing.xs,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    color: '#6b7280',
  },
  addFirstButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: '#5a9a8e',
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  quickActionCard: {
    width: (width - SpacingScale.sectionPadding * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: RadiusScale.actionCard,
    padding: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  quickActionIcon: {
    width: '100%',
    flex: 1,
    borderRadius: RadiusScale.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: Typography.font3xs,
    fontWeight: Typography.semiBold,
    textAlign: 'center',
    lineHeight: 13,
    color: '#1f2937',
  },
});
