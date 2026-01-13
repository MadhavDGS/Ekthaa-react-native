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

// Fallback placeholder image (Credit: rawpixel.com / Freepik)
const PRODUCT_PLACEHOLDER = require('../../../assets/product-placeholder.jpg');

// Category-based placeholder images from free sources (Unsplash/Pexels)
const CATEGORY_PLACEHOLDERS: { [key: string]: string } = {
  // Food & Grocery
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'sugar': 'https://images.unsplash.com/photo-1563450392-1ebb936e4a57?w=400&q=80',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'flour': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'atta': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'wheat': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'salt': 'https://images.unsplash.com/photo-1599909533730-b5d81e4e2f2c?w=400&q=80',
  'spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'dal': 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400&q=80',
  'pulses': 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400&q=80',
  'lentils': 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400&q=80',
  'tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  'coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
  'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  'cookies': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80',
  'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
  'namkeen': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80',
  'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  'fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  'eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
  'meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
  'chicken': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80',
  'fish': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
  // Beverages
  'juice': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
  'water': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80',
  'soda': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
  'drinks': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
  // Personal Care
  'soap': 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&q=80',
  'shampoo': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80',
  'toothpaste': 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&q=80',
  'cream': 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&q=80',
  // Household
  'detergent': 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400&q=80',
  'cleaner': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
  // Categories
  'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
  'beverages': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
  'dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'personal care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
  'household': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  'clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
  'stationery': 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80',
  'toys': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80',
  'medicine': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
  'health': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
};

// Get placeholder image based on product name, category, or type
const getProductPlaceholder = (product: any): { uri: string } | number => {
  // First check if product has its own image
  if (product.product_image_url && product.product_image_url.length > 0) {
    return { uri: product.product_image_url };
  }
  
  // Try to match product name with category placeholders
  const productName = (product.name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const productType = (product.type || '').toLowerCase();
  
  // Check product name first (most specific)
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (productName.includes(key)) {
      return { uri: url };
    }
  }
  
  // Check category
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (productCategory.includes(key) || key.includes(productCategory)) {
      return { uri: url };
    }
  }
  
  // Check type
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (productType.includes(key) || key.includes(productType)) {
      return { uri: url };
    }
  }
  
  // Fallback to local placeholder (Credit: rawpixel.com / Freepik)
  return PRODUCT_PLACEHOLDER;
};

export default function HomeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, productsData, dashboard] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getProducts(),
        ApiService.getDashboard(),
      ]);
      
      setProfile(profileData.business);
      setProducts(productsData.products.slice(0, 4)); // Show first 4 products
      setDashboardStats(dashboard?.summary || dashboard);
      
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
      style={[styles.quickActionCard, { backgroundColor: Colors.card }]}
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
      <Text style={[styles.quickActionLabel, { color: Colors.textPrimary }]} numberOfLines={2}>{label}</Text>
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
            {profile?.profile_photo_url ? (
              <Image source={{ uri: profile.profile_photo_url }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.businessName}>{profile?.name || 'Your Business'}</Text>
        </View>

        {/* Quick Stats Bar */}
        {dashboardStats && (
          <View style={styles.headerStats}>
            <TouchableOpacity style={styles.headerStatItem} onPress={() => navigation.navigate('Customers')}>
              <Text style={styles.headerStatValue}>{dashboardStats.total_customers || 0}</Text>
              <Text style={styles.headerStatLabel}>Customers</Text>
            </TouchableOpacity>
            <View style={styles.headerStatDivider} />
            <TouchableOpacity style={styles.headerStatItem} onPress={() => navigation.navigate('Khata')}>
              <Text style={styles.headerStatValue}>₹{Math.abs((dashboardStats.total_credit || 0) - (dashboardStats.total_payment || 0)).toLocaleString('en-IN')}</Text>
              <Text style={styles.headerStatLabel}>To Receive</Text>
            </TouchableOpacity>
            <View style={styles.headerStatDivider} />
            <TouchableOpacity style={styles.headerStatItem} onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.headerStatValue}>{products.length}</Text>
              <Text style={styles.headerStatLabel}>Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
          {/* Profile Completion Card */}
        {profileCompletion < 100 && (
          <View style={[styles.card, { backgroundColor: Colors.card }]}>
            {/* Icon positioned at top-right */}
            <View style={[styles.completionIconLarge, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : '#e8f5f3' }]}>
              <Ionicons name="document-text" size={32} color="#5a9a8e" />
            </View>

            <View style={styles.completionContent}>
              <Text style={[styles.completionTitle, { color: Colors.textPrimary }]}>
                Complete your business profile
              </Text>
              <Text style={[styles.completionSubtitle, { color: Colors.textSecondary }]}>
                to get more customers
              </Text>
              
              {/* Progress Bar */}
              <View style={[styles.progressBarWrapper, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }]}>
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
              
              <Text style={[styles.progressText, { color: Colors.textSecondary }]}>
                {profileCompletion}% complete
              </Text>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => navigation.navigate('CompleteProfile')}
              activeOpacity={0.8}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* My Products Section */}
        <View style={[styles.card, { backgroundColor: Colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>My Products</Text>
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
                  return (
                    <TouchableOpacity
                      key={product.$id || product.id || `product-${Math.random()}`}
                      style={[styles.productCard, { backgroundColor: Colors.card }]}
                      onPress={() => navigation.navigate('Products')}
                      activeOpacity={0.8}
                    >
                      <Image 
                        source={getProductPlaceholder(product)} 
                        style={styles.productImage}
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

              <View style={[styles.productsActionsCapsule, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : '#d1f0e8' }]}>
                <TouchableOpacity
                  style={styles.addProductButton}
                  onPress={() => navigation.navigate('Products')}
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
                onPress={() => navigation.navigate('Products')}
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
            onPress={() => navigation.navigate('AddShopPhotos')}
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
            onPress={() => navigation.navigate('Inventory')}
          />
          <QuickActionButton
            icon="eye-outline"
            label="View as Customer"
            color="#6b7280"
            onPress={() => navigation.navigate('PreviewBusiness')}
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
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  businessName: {
    fontSize: Typography.fontSm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.medium,
  },
  headerStats: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 4,
  },
  card: {
    marginHorizontal: SpacingScale.sectionPadding,
    marginTop: Spacing.md,
    padding: SpacingScale.cardPadding,
    borderRadius: RadiusScale.card,
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
    lineHeight: 22,
    marginBottom: 4,
  },
  completionSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  progressBarWrapper: {
    height: 10,
    borderRadius: RadiusScale.input,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: RadiusScale.input,
  },
  progressText: {
    fontSize: Typography.fontXs,
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
    overflow: 'hidden',
    gap: Spacing.xs,
    paddingLeft: Spacing.md,
  },
  addProductButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: 'transparent',
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
    borderRadius: 100,
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
  },
});
