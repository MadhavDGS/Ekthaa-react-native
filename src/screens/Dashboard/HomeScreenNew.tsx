/**
 * Home Screen - Business Overview Dashboard
 * Modern design with dark mode support
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
import ApiService from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import Illustration from '../../components/Illustration';

const { width } = Dimensions.get('window');

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
      setProducts(productsData.products.slice(0, 4));
      setDashboardStats(dashboard?.summary || dashboard);
      
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

  const QuickActionButton = ({ icon, label, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.quickActionCard, { backgroundColor: Colors.card }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color: Colors.textPrimary }]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['top']}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#5a9a8e', '#4a8a7e']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Ekthaa</Text>
            <Text style={styles.headerSubtitle}>{profile?.name || 'Your Business'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileIcon}>
              {profile?.profile_photo_url ? (
                <Image source={{ uri: profile.profile_photo_url }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person" size={24} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats in Header */}
        {dashboardStats && (
          <View style={styles.headerStats}>
            <TouchableOpacity style={styles.headerStatItem} onPress={() => navigation.navigate('Customers')}>
              <Text style={styles.headerStatValue}>{dashboardStats.total_customers || 0}</Text>
              <Text style={styles.headerStatLabel}>Customers</Text>
            </TouchableOpacity>
            <View style={styles.headerStatDivider} />
            <TouchableOpacity style={styles.headerStatItem} onPress={() => navigation.navigate('Khata')}>
              <Text style={styles.headerStatValue}>₹{((dashboardStats.total_credit || 0) - (dashboardStats.total_payment || 0)).toLocaleString('en-IN')}</Text>
              <Text style={styles.headerStatLabel}>To Receive</Text>
            </TouchableOpacity>
            <View style={styles.headerStatDivider} />
            <TouchableOpacity style={styles.headerStatItem} onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.headerStatValue}>{products.length}</Text>
              <Text style={styles.headerStatLabel}>Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Compact Profile Completion */}
        {profileCompletion < 100 && (
          <TouchableOpacity 
            style={[styles.completionCard, { backgroundColor: Colors.card }]}
            onPress={() => navigation.navigate('CompleteProfile')}
            activeOpacity={0.8}
          >
            <View style={styles.completionLeft}>
              <View style={[styles.completionIconBg, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#e8f5f3' }]}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
              </View>
              <View style={styles.completionInfo}>
                <Text style={[styles.completionTitle, { color: Colors.textPrimary }]}>Complete Profile</Text>
                <View style={styles.completionProgressRow}>
                  <View style={[styles.completionProgressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]}>
                    <View style={[styles.completionProgressFill, { width: `${profileCompletion}%` }]} />
                  </View>
                  <Text style={[styles.completionPercent, { color: Colors.textSecondary }]}>{profileCompletion}%</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Quick Actions - Horizontal Scroll */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionLabel, { color: Colors.textSecondary }]}>QUICK ACTIONS</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.quickActionsScroll}
          >
            <QuickActionButton icon="add-circle" label="Add Product" color="#16a34a" onPress={() => navigation.navigate('AddProduct')} />
            <QuickActionButton icon="receipt" label="Create Invoice" color="#0891b2" onPress={() => navigation.navigate('Invoice')} />
            <QuickActionButton icon="wallet" label="Khata" color="#ea580c" onPress={() => navigation.navigate('Khata')} />
            <QuickActionButton icon="images" label="Shop Photos" color="#8b5cf6" onPress={() => navigation.navigate('AddShopPhotos')} />
            <QuickActionButton icon="pricetag" label="Run Offers" color="#f59e0b" onPress={() => navigation.navigate('Offers')} />
          </ScrollView>
        </View>

        {/* My Products Section */}
        <View style={[styles.productsSection, { backgroundColor: Colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>My Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All →</Text>
            </TouchableOpacity>
          </View>

          {products.length > 0 ? (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.$id || product.id || `product-${Math.random()}`}
                  style={[styles.productCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb' }]}
                  onPress={() => navigation.navigate('Inventory')}
                  activeOpacity={0.8}
                >
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }]}>
                      <Ionicons name="cube-outline" size={32} color={Colors.textTertiary} />
                    </View>
                  )}
                  <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={1}>{product.name}</Text>
                  <Text style={[styles.productPrice, { color: Colors.primary }]}>₹{product.price}{product.unit && `/${product.unit}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyProducts}>
              <Illustration name="noData" width={120} height={120} />
              <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>No products yet</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => navigation.navigate('AddProduct')}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Business Tools */}
        <View style={styles.toolsSection}>
          <Text style={[styles.sectionLabel, { color: Colors.textSecondary }]}>BUSINESS TOOLS</Text>
          <View style={styles.toolsGrid}>
            <TouchableOpacity 
              style={[styles.toolCard, { backgroundColor: Colors.card }]}
              onPress={() => navigation.navigate('AnalyticsScreen')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconBg, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="bar-chart" size={22} color="#2563eb" />
              </View>
              <Text style={[styles.toolLabel, { color: Colors.textPrimary }]}>Analytics</Text>
              <Text style={[styles.toolDesc, { color: Colors.textTertiary }]}>Track sales</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toolCard, { backgroundColor: Colors.card }]}
              onPress={() => navigation.navigate('PreviewBusiness')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconBg, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="eye" size={22} color="#db2777" />
              </View>
              <Text style={[styles.toolLabel, { color: Colors.textPrimary }]}>Preview</Text>
              <Text style={[styles.toolDesc, { color: Colors.textTertiary }]}>View profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toolCard, { backgroundColor: Colors.card }]}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconBg, { backgroundColor: '#e8f5f3' }]}>
                <Ionicons name="settings" size={22} color="#5a9a8e" />
              </View>
              <Text style={[styles.toolLabel, { color: Colors.textPrimary }]}>Settings</Text>
              <Text style={[styles.toolDesc, { color: Colors.textTertiary }]}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Compact Profile Completion
  completionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
  },
  completionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  completionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionInfo: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  completionProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  completionProgressFill: {
    height: '100%',
    backgroundColor: '#5a9a8e',
    borderRadius: 3,
  },
  completionPercent: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 32,
  },
  // Quick Actions
  quickActionsSection: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginLeft: 20,
    marginBottom: 12,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  quickActionCard: {
    width: 90,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  // Products Section
  productsSection: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9a8e',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: (width - 76) / 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  addFirstButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#5a9a8e',
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Business Tools
  toolsSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  toolsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  toolCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  toolIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 11,
  },
});
