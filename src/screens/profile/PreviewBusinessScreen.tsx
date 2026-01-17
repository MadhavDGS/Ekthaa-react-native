/**
 * Preview Business Profile Screen
 * Shows business owners how their profile appears to customers
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    Alert,
    ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

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

export default function PreviewBusinessScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'offers' | 'details' | 'vouchers'>('products');

    useEffect(() => {
        loadPreview();
    }, []);

    const loadPreview = async () => {
        try {
            setLoading(true);
            // Load business profile
            const profileData = await ApiService.getProfile();
            setProfile(profileData.business || {});

            // Load products
            try {
                const productsData = await ApiService.getProducts();
                setProducts(productsData.products || []);
            } catch (error) {
                console.log('No products found');
                setProducts([]);
            }

            // Load offers
            try {
                const offersData = await ApiService.getOffers();
                setOffers(offersData.offers || []);
            } catch (error) {
                console.log('No offers found');
                setOffers([]);
            }
        } catch (error) {
            console.error('❌ Error loading preview:', error);
            Alert.alert('Error', 'Failed to load profile preview');
        } finally {
            setLoading(false);
        }
    };

    const openLocation = async () => {
        if (!profile?.latitude || !profile?.longitude) {
            Alert.alert('Location Not Set', 'This business has not set their location yet.');
            return;
        }

        const lat = profile.latitude;
        const lng = profile.longitude;
        const label = encodeURIComponent(profile.name || 'Business Location');

        // Map app URLs
        const googleMapsUrl = Platform.select({
            ios: `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=14`,
            android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
        });
        const appleMapsUrl = `maps://?ll=${lat},${lng}&q=${label}`;
        const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes`;
        const googleMapsWeb = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        try {
            if (Platform.OS === 'ios') {
                // iOS: Show ActionSheet with available map apps
                const options = ['Apple Maps', 'Google Maps', 'Waze', 'Cancel'];
                const urls = [appleMapsUrl, googleMapsUrl, wazeUrl];

                ActionSheetIOS.showActionSheetWithOptions(
                    {
                        options,
                        cancelButtonIndex: 3,
                        title: 'Open location in:',
                    },
                    async (buttonIndex) => {
                        if (buttonIndex < 3) {
                            const url = urls[buttonIndex];
                            const canOpen = await Linking.canOpenURL(url || '');
                            if (canOpen && url) {
                                await Linking.openURL(url);
                            } else {
                                // Fallback to Google Maps web
                                await Linking.openURL(googleMapsWeb);
                            }
                        }
                    }
                );
            } else {
                // Android: Try opening map apps in order of preference
                const tryOpenUrl = async (url: string | undefined) => {
                    if (!url) return false;
                    try {
                        const canOpen = await Linking.canOpenURL(url);
                        if (canOpen) {
                            await Linking.openURL(url);
                            return true;
                        }
                    } catch (e) {
                        return false;
                    }
                    return false;
                };

                // Try Google Maps app first (most common on Android)
                const opened = await tryOpenUrl(googleMapsUrl);
                if (!opened) {
                    // Fallback to web
                    await Linking.openURL(googleMapsWeb);
                }
            }
        } catch (error) {
            console.error('❌ Error opening location:', error);
            Alert.alert('Error', 'Unable to open maps. Please try again.');
        }
    };

    const makeCall = () => {
        if (profile?.phone_number) {
            Linking.openURL(`tel:${profile.phone_number}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: Colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
                    Loading preview...
                </Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: Colors.background }]}>
                <Ionicons name="business-outline" size={64} color={Colors.textTertiary} />
                <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                    Profile not available
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={[styles.header, { backgroundColor: Colors.primary }]}>
                    <View style={styles.headerContent}>
                        <View style={styles.businessInfo}>
                            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                {profile.profile_photo_url ? (
                                    <Image source={{ uri: profile.profile_photo_url }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.avatarText}>{profile.name?.charAt(0)?.toUpperCase() || 'B'}</Text>
                                )}
                            </View>
                            <View style={styles.businessDetails}>
                                <Text style={styles.businessName}>{profile.name}</Text>
                                {profile.category && (
                                    <View style={styles.categoryBadge}>
                                        <Ionicons name="pricetag" size={12} color="#fff" />
                                        <Text style={styles.categoryText}>{profile.category}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        {profile.description && (
                            <Text style={styles.description}>{profile.description}</Text>
                        )}
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={makeCall}
                            disabled={!profile.phone_number}
                        >
                            <Ionicons name="call" size={20} color="#fff" />
                            <Text style={[styles.actionText, { marginLeft: 8 }]}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={openLocation}
                        >
                            <Ionicons name="navigate" size={20} color="#fff" />
                            <Text style={[styles.actionText, { marginLeft: 8 }]}>Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Shop Photos Gallery */}
                {profile.shop_photos && profile.shop_photos.length > 0 && (
                    <View style={[styles.section, { backgroundColor: Colors.background }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Shop Photos</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.photosScrollContent}
                        >
                            {profile.shop_photos.map((photo: string, index: number) => (
                                <Image
                                    key={index}
                                    source={{ uri: photo }}
                                    style={styles.shopPhoto}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Tabs Section - New Order: Products → Offers → Business Details → Vouchers */}
                <View style={[styles.tabsContainer, { backgroundColor: Colors.background, borderBottomColor: Colors.borderLight }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'products' && styles.activeTab]}
                        onPress={() => setActiveTab('products')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'products' ? Colors.primary : Colors.textSecondary }]}>
                            Products
                        </Text>
                        {activeTab === 'products' && <View style={[styles.tabIndicator, { backgroundColor: Colors.primary }]} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
                        onPress={() => setActiveTab('offers')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'offers' ? Colors.primary : Colors.textSecondary }]}>
                            Offers
                        </Text>
                        {activeTab === 'offers' && <View style={[styles.tabIndicator, { backgroundColor: Colors.primary }]} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'details' && styles.activeTab]}
                        onPress={() => setActiveTab('details')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'details' ? Colors.primary : Colors.textSecondary }]}>
                            Details
                        </Text>
                        {activeTab === 'details' && <View style={[styles.tabIndicator, { backgroundColor: Colors.primary }]} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'vouchers' && styles.activeTab]}
                        onPress={() => setActiveTab('vouchers')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'vouchers' ? Colors.primary : Colors.textSecondary }]}>
                            Vouchers
                        </Text>
                        {activeTab === 'vouchers' && <View style={[styles.tabIndicator, { backgroundColor: Colors.primary }]} />}
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'products' && (
                    products.length > 0 ? (
                        <View style={[styles.section, { backgroundColor: Colors.background }]}>
                            <View style={styles.productsGrid}>
                                {products.map((product: any) => (
                                    <View
                                        key={product.id}
                                        style={[styles.productCard, { backgroundColor: Colors.card }]}
                                    >
                                        <Image
                                            source={getProductPlaceholder(product)}
                                            style={styles.productImage}
                                        />
                                        <View style={styles.productInfo}>
                                            <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={1}>
                                                {product.name}
                                            </Text>
                                            <Text style={[styles.productPrice, { color: Colors.primary }]}>
                                                {formatCurrency(product.price)}
                                            </Text>
                                            {product.stock_quantity !== undefined && (
                                                <View style={[styles.stockBadge, { backgroundColor: product.stock_quantity > 0 ? Colors.bgLightGreen : Colors.bgLightRed }]}>
                                                    <Text style={[styles.stockText, { color: product.stock_quantity > 0 ? Colors.paymentGreen : Colors.creditRed }]}>
                                                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.emptyContainer, { backgroundColor: Colors.background }]}>
                            <Ionicons name="cube-outline" size={64} color={Colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                                No products available
                            </Text>
                        </View>
                    )
                )}

                {activeTab === 'vouchers' && (
                    offers.filter((offer: any) => offer.offer_type === 'voucher').length > 0 ? (
                        <View style={[styles.section, { backgroundColor: Colors.background }]}>
                            {offers.filter((offer: any) => offer.offer_type === 'voucher').map((voucher: any) => (
                                <View
                                    key={voucher.id}
                                    style={[styles.voucherCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
                                >
                                    <Text style={[styles.voucherTitle, { color: Colors.textPrimary }]}>
                                        ₹{voucher.discount_amount} Store Voucher
                                    </Text>
                                    {voucher.ekthaa_cash_required && (
                                        <Text style={[styles.voucherCash, { color: Colors.textSecondary }]}>
                                            Buy with <Text style={{ color: '#f97316', fontWeight: '700' }}>{voucher.ekthaa_cash_required} Ekthaa Cash</Text>
                                        </Text>
                                    )}
                                    {voucher.min_purchase_amount && (
                                        <Text style={[styles.voucherCondition, { color: Colors.textSecondary }]}>
                                            Applicable on minimum purchase of ₹{voucher.min_purchase_amount}
                                        </Text>
                                    )}
                                    <Text style={[styles.voucherDiscount, { color: Colors.paymentGreen }]}>
                                        ₹{voucher.discount_amount} OFF
                                    </Text>
                                    <View style={[styles.voucherBadge, { backgroundColor: Colors.backgroundSecondary }]}>
                                        <Text style={[styles.voucherBadgeText, { color: Colors.primary }]}>Added by business</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={[styles.emptyContainer, { backgroundColor: Colors.background }]}>
                            <Ionicons name="ticket-outline" size={64} color={Colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                                No vouchers available
                            </Text>
                        </View>
                    )
                )}

                {activeTab === 'offers' && (
                    offers.filter((offer: any) => offer.offer_type === 'offer').length > 0 ? (
                        <View style={[styles.section, { backgroundColor: Colors.background }]}>
                            {offers.filter((offer: any) => offer.offer_type === 'offer').map((offer: any) => (
                                <View
                                    key={offer.id}
                                    style={[styles.offerCard, { backgroundColor: Colors.card }]}
                                >
                                    <Text style={[styles.offerTitle, { color: Colors.textPrimary }]}>
                                        {offer.offer_name || `Flat ${offer.discount_percentage}% Off`}
                                    </Text>
                                    {offer.description && (
                                        <Text style={[styles.offerDescription, { color: Colors.textSecondary }]}>
                                            {offer.description}
                                        </Text>
                                    )}
                                    {offer.validity && (
                                        <View style={[styles.offerValidityBadge, { backgroundColor: Colors.backgroundSecondary }]}>
                                            <Ionicons name="time-outline" size={14} color={Colors.primary} />
                                            <Text style={[styles.offerValidityText, { color: Colors.primary, marginLeft: 4 }]}>
                                                {offer.validity}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={[styles.emptyContainer, { backgroundColor: Colors.background }]}>
                            <Ionicons name="pricetag-outline" size={64} color={Colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                                No offers available
                            </Text>
                        </View>
                    )
                )}

                {/* Business Details Tab Content */}
                {activeTab === 'details' && (
                    <View style={[styles.section, { backgroundColor: Colors.background }]}>
                        <View style={[styles.infoGrid, { backgroundColor: Colors.card }]}>
                            {/* Email */}
                            {profile.email && (
                                <TouchableOpacity 
                                    style={styles.infoItem}
                                    onPress={() => Linking.openURL(`mailto:${profile.email}`)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.infoIconWrapper, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#eef2ff' }]}>
                                        <Ionicons name="mail" size={20} color="#6366f1" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>EMAIL</Text>
                                        <Text style={[styles.infoValue, { color: Colors.textPrimary }]} numberOfLines={1}>
                                            {profile.email}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={16} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            )}

                            {/* Address */}
                            {(profile.address || profile.city || profile.state || profile.pincode) && (
                                <TouchableOpacity 
                                    style={styles.infoItem}
                                    onPress={openLocation}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.infoIconWrapper, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' }]}>
                                        <Ionicons name="location" size={20} color="#ef4444" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>LOCATION</Text>
                                        <Text style={[styles.infoValue, { color: Colors.textPrimary }]} numberOfLines={2}>
                                            {profile.address || [profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
                                        </Text>
                                    </View>
                                    <Ionicons name="navigate" size={16} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            )}

                            {/* GST Number */}
                            {profile.gst_number && (
                                <View style={styles.infoItem}>
                                    <View style={[styles.infoIconWrapper, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb' }]}>
                                        <Ionicons name="document-text" size={20} color="#f59e0b" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>GST NUMBER</Text>
                                        <Text style={[styles.infoValue, { color: Colors.textPrimary, fontFamily: 'monospace' }]}>
                                            {profile.gst_number}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Operating Hours */}
                            {profile.operating_hours && (
                                <View style={styles.infoItem}>
                                    <View style={[styles.infoIconWrapper, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4' }]}>
                                        <Ionicons name="time" size={20} color="#10b981" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>HOURS</Text>
                                        <Text style={[styles.infoValue, { color: Colors.textPrimary }]}>
                                            {profile.operating_hours}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Website */}
                            {profile.website && (
                                <TouchableOpacity 
                                    style={styles.infoItem}
                                    onPress={() => Linking.openURL(profile.website.startsWith('http') ? profile.website : `https://${profile.website}`)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.infoIconWrapper, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff' }]}>
                                        <Ionicons name="globe-outline" size={20} color="#3b82f6" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>WEBSITE</Text>
                                        <Text style={[styles.infoValue, { color: Colors.textPrimary }]} numberOfLines={1}>
                                            {profile.website}
                                        </Text>
                                    </View>
                                    <Ionicons name="open-outline" size={16} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            )}

                            {/* Social Media Links */}
                            {(profile.instagram || profile.facebook || profile.twitter || profile.linkedin || profile.youtube) && (
                                <View style={styles.infoItem}>
                                    <View style={[styles.infoIconWrapper, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : '#fdf2f8' }]}>
                                        <Ionicons name="share-social" size={20} color="#ec4899" />
                                    </View>
                                    <View style={[styles.infoContent, { flex: 1 }]}>
                                        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>SOCIAL MEDIA</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 12 }}>
                                            {profile.instagram && (
                                                <TouchableOpacity onPress={() => Linking.openURL(profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram.replace('@', '')}`)}>
                                                    <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                                                </TouchableOpacity>
                                            )}
                                            {profile.facebook && (
                                                <TouchableOpacity onPress={() => Linking.openURL(profile.facebook.startsWith('http') ? profile.facebook : `https://facebook.com/${profile.facebook}`)}>
                                                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                                                </TouchableOpacity>
                                            )}
                                            {profile.twitter && (
                                                <TouchableOpacity onPress={() => Linking.openURL(profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`)}>
                                                    <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                                                </TouchableOpacity>
                                            )}
                                            {profile.linkedin && (
                                                <TouchableOpacity onPress={() => Linking.openURL(profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/company/${profile.linkedin}`)}>
                                                    <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                                                </TouchableOpacity>
                                            )}
                                            {profile.youtube && (
                                                <TouchableOpacity onPress={() => Linking.openURL(profile.youtube.startsWith('http') ? profile.youtube : `https://youtube.com/@${profile.youtube}`)}>
                                                    <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Preview Note */}
                <View style={[styles.previewNote, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                    <Ionicons name="information-circle" size={20} color={Colors.primary} />
                    <Text style={[styles.previewNoteText, { color: Colors.textSecondary }]}>
                        This is how your business profile appears to customers
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    loadingText: {
        marginTop: Spacing.space3,
        fontSize: 14,
    },
    header: {
        paddingTop: Spacing.space6,
        paddingBottom: Spacing.space8,
        paddingHorizontal: Spacing.space4,
    },
    headerContent: {
        flexDirection: 'column',
    },
    businessInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.space3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    businessDetails: {
        marginLeft: Spacing.space4,
        flex: 1,
    },
    businessName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: Spacing.space2,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.space3,
        paddingVertical: Spacing.space1,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 12,
        color: '#fff',
        marginLeft: 4,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.space4,
        paddingHorizontal: Spacing.space2,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: Spacing.space3,
        borderRadius: BorderRadius.md,
        marginHorizontal: Spacing.space2,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        padding: Spacing.space4,
        marginBottom: Spacing.space2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.space3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.space3,
    },
    infoGrid: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.space4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    infoIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.space3,
    },
    infoContent: {
        flex: 1,
        marginRight: Spacing.space2,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 3,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.space4,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.space2,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.space3,
    },
    contactText: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    viewMapButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewMapText: {
        fontSize: 14,
        fontWeight: '600',
    },
    mapPreview: {
        height: 200,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        marginBottom: Spacing.space2,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    locationText: {
        fontSize: 14,
        lineHeight: 20,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -Spacing.space2,
    },
    productCard: {
        width: '48%',
        margin: '1%',
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    productImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: Spacing.space3,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    productStock: {
        fontSize: 12,
    },
    moreProducts: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: Spacing.space3,
        fontStyle: 'italic',
    },
    emptyProducts: {
        alignItems: 'center',
        paddingVertical: Spacing.space8,
    },
    emptyText: {
        fontSize: 16,
        marginTop: Spacing.space3,
    },
    previewNote: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.space4,
        marginHorizontal: Spacing.space4,
        marginTop: Spacing.space4,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    previewNoteText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        marginLeft: Spacing.space2,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingHorizontal: Spacing.space4,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.space4,
        alignItems: 'center',
        position: 'relative',
    },
    activeTab: {
        // Active tab styling handled by indicator
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    photosScrollContent: {
        paddingLeft: Spacing.space4,
        paddingRight: Spacing.space4,
    },
    shopPhoto: {
        width: 200,
        height: 150,
        borderRadius: BorderRadius.md,
        marginRight: Spacing.space3,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.space2,
    },
    productCard: {
        width: '48%',
        margin: '1%',
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    productImage: {
        width: '100%',
        height: 140,
    },
    productImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: Spacing.space3,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    stockBadge: {
        paddingHorizontal: Spacing.space2,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    stockText: {
        fontSize: 11,
        fontWeight: '600',
    },
    voucherCard: {
        padding: Spacing.space4,
        marginHorizontal: Spacing.space4,
        marginVertical: Spacing.space2,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    voucherTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: Spacing.space2,
    },
    voucherCash: {
        fontSize: 14,
        marginBottom: Spacing.space1,
    },
    voucherCondition: {
        fontSize: 13,
        marginBottom: Spacing.space3,
    },
    voucherDiscount: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: Spacing.space2,
    },
    voucherBadge: {
        paddingHorizontal: Spacing.space3,
        paddingVertical: Spacing.space2,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    voucherBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    offerCard: {
        padding: Spacing.space4,
        marginHorizontal: Spacing.space4,
        marginVertical: Spacing.space2,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    offerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.space2,
    },
    offerDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: Spacing.space3,
    },
    offerValidityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.space3,
        paddingVertical: Spacing.space2,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    offerValidityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.space12,
    },
    emptyText: {
        fontSize: 16,
        marginTop: Spacing.space3,
    },
});