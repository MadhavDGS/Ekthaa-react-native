/**
 * Home Screen - Business Overview Dashboard
 * Polished modern design matching target screenshot exactly
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
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
      setProducts(productsData.products.slice(0, 4));
      
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
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={34} color={color} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#5a9a8e', '#4a8a7e']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={styles.headerTitle}>Ekthaa</Text>
          <Text style={styles.headerSubtitle}>{profile?.name || 'Your Business'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileIcon}>
            {profile?.profile_photo ? (
              <Image source={{ uri: profile.profile_photo }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person" size={24} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Completion Card */}
        {profileCompletion < 100 && (
          <View style={styles.card}>
            <View style={styles.completionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.completionTitle}>Complete your business profile</Text>
                <Text style={styles.completionSubtitle}>to get more customers</Text>
              </View>
              <View style={styles.completionIcon}>
                <Ionicons name="document-text" size={36} color="#5a9a8e" />
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${profileCompletion}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{profileCompletion}% complete</Text>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.8}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* My Products Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {products.length > 0 ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.$id || product.id || `product-${Math.random()}`}
                    style={styles.productCard}
                    onPress={() => navigation.navigate('Inventory')}
                    activeOpacity={0.8}
                  >
                    {product.image ? (
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="cube-outline" size={40} color="#9ca3af" />
                      </View>
                    )}
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.productPrice}>₹{product.price}{product.unit && `/${product.unit}`}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.productsActions}>
                <TouchableOpacity
                  style={styles.addProductButton}
                  onPress={() => navigation.navigate('AddProduct')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={20} color="#5a9a8e" />
                  <Text style={styles.addProductText}>Add Product</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('Inventory')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewAllButtonText}>View All</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyProducts}>
              <Ionicons name="cube-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No products yet</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => navigation.navigate('AddProduct')}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <QuickActionButton icon="camera" label="Add Shop Photo" color="#16a34a" onPress={() => navigation.navigate('EditProfile')} />
          <QuickActionButton icon="megaphone" label="Run Offers" color="#f59e0b" onPress={() => navigation.navigate('Offers')} />
          <QuickActionButton icon="document-text" label="Create Invoice" color="#0891b2" onPress={() => navigation.navigate('Invoice')} />
          <QuickActionButton icon="wallet" label="Khata" color="#ea580c" onPress={() => navigation.navigate('Khata')} />
          <QuickActionButton icon="cube" label="Inventory" color="#16a34a" onPress={() => navigation.navigate('Inventory')} />
          <QuickActionButton icon="ellipsis-horizontal" label="View More" color="#6b7280" onPress={() => navigation.navigate('More')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 22,
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  completionIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#e8f5f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#5a9a8e',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#5a9a8e',
    gap: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5a9a8e',
  },
  productsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  productCard: {
    width: 130,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 110,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5a9a8e',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  productsActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  addProductButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5a9a8e',
    gap: 6,
    backgroundColor: '#fff',
  },
  addProductText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5a9a8e',
  },
  viewAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#5a9a8e',
    gap: 6,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
    color: '#6b7280',
  },
  addFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#5a9a8e',
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
    paddingBottom: 20,
  },
  quickActionCard: {
    width: (width - 52) / 3,
    aspectRatio: 1.05,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 68,
    height: 68,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1f2937',
    lineHeight: 16,
  },
});
