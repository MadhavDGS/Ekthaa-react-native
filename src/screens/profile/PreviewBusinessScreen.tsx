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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function PreviewBusinessScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'vouchers' | 'offers'>('products');

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

    const openLocation = () => {
        if (profile?.latitude && profile?.longitude) {
            const scheme = Platform.select({
                ios: 'maps:',
                android: 'geo:',
            });
            const url = Platform.select({
                ios: `${scheme}${profile.latitude},${profile.longitude}?q=${encodeURIComponent(profile.name)}`,
                android: `${scheme}${profile.latitude},${profile.longitude}?q=${encodeURIComponent(profile.name)}`,
            });
            Linking.openURL(url || '');
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
                                {profile.profile_image_url ? (
                                    <Image source={{ uri: profile.profile_image_url }} style={styles.avatarImage} />
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
                            <Text style={styles.actionText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={openLocation}
                            disabled={!profile.latitude || !profile.longitude}
                        >
                            <Ionicons name="navigate" size={20} color="#fff" />
                            <Text style={styles.actionText}>Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={[styles.section, { backgroundColor: Colors.background }]}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Contact Information</Text>

                    {profile.phone_number && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="call" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Phone</Text>
                                <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                    {profile.phone_number}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={makeCall}>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {profile.email && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="mail" size={20} color={Colors.primary} />
                            </View>
                            <View style={[styles.contactText, { flex: 1 }]}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Email</Text>
                                <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                    {profile.email}
                                </Text>
                            </View>
                        </View>
                    )}

                    {(profile.address || profile.city || profile.state || profile.pincode) && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="location" size={20} color={Colors.primary} />
                            </View>
                            <View style={[styles.contactText, { flex: 1 }]}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Address</Text>
                                {profile.address && (
                                    <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                        {profile.address}
                                    </Text>
                                )}
                                {(profile.city || profile.state || profile.pincode) && (
                                    <Text style={[styles.contactValue, { color: Colors.textPrimary, marginTop: 2 }]}>
                                        {[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {profile.gst_number && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="document-text" size={20} color={Colors.primary} />
                            </View>
                            <View style={[styles.contactText, { flex: 1 }]}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>GST Number</Text>
                                <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                    {profile.gst_number}
                                </Text>
                            </View>
                        </View>
                    )}

                    {profile.operating_hours && (
                        <View style={[styles.contactCard, { backgroundColor: Colors.backgroundSecondary }]}>
                            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="time" size={20} color={Colors.primary} />
                            </View>
                            <View style={[styles.contactText, { flex: 1 }]}>
                                <Text style={[styles.contactLabel, { color: Colors.textSecondary }]}>Operating Hours</Text>
                                <Text style={[styles.contactValue, { color: Colors.textPrimary }]}>
                                    {profile.operating_hours}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Tabs Section */}
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
                        style={[styles.tab, activeTab === 'vouchers' && styles.activeTab]}
                        onPress={() => setActiveTab('vouchers')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'vouchers' ? Colors.primary : Colors.textSecondary }]}>
                            Vouchers
                        </Text>
                        {activeTab === 'vouchers' && <View style={[styles.tabIndicator, { backgroundColor: Colors.primary }]} />}
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
                                        {product.product_image_url ? (
                                            <Image
                                                source={{ uri: product.product_image_url }}
                                                style={styles.productImage}
                                            />
                                        ) : (
                                            <View style={[styles.productImage, styles.productImagePlaceholder, { backgroundColor: Colors.backgroundSecondary }]}>
                                                <Ionicons name="cube-outline" size={32} color={Colors.textTertiary} />
                                            </View>
                                        )}
                                        <View style={styles.productInfo}>
                                            <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={1}>
                                                {product.product_name}
                                            </Text>
                                            <Text style={[styles.productPrice, { color: Colors.primary }]}>
                                                {formatCurrency(product.price)}
                                            </Text>
                                            {product.quantity !== undefined && (
                                                <View style={[styles.stockBadge, { backgroundColor: product.quantity > 0 ? Colors.bgLightGreen : Colors.bgLightRed }]}>
                                                    <Text style={[styles.stockText, { color: product.quantity > 0 ? Colors.paymentGreen : Colors.creditRed }]}>
                                                        {product.quantity > 0 ? 'Available in-store' : 'Out of stock'}
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
                                            <Text style={[styles.offerValidityText, { color: Colors.primary }]}>
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

                {/* Location Map Section */}
                {profile.latitude && profile.longitude && (
                    <View style={[styles.section, { backgroundColor: Colors.background }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Location</Text>
                            <TouchableOpacity onPress={openLocation} style={styles.viewMapButton}>
                                <Text style={[styles.viewMapText, { color: Colors.primary }]}>Open in Maps</Text>
                                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.mapPreview, { backgroundColor: Colors.backgroundSecondary }]}
                            onPress={openLocation}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{
                                    uri: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l-shop+5A9A8E(${profile.longitude},${profile.latitude})/${profile.longitude},${profile.latitude},14,0/600x300@2x?access_token=pk.eyJ1IjoibWFkaGF2ZGdzIiwiYSI6ImNtNWFtZTBsdzBiNXoya3M4MnYwYXB6cGoifQ.Km3YB7X0aCrOBN0dABHXMg`
                                }}
                                style={styles.mapImage}
                                resizeMode="cover"
                            />
                            <View style={[styles.mapOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                <Ionicons name="navigate" size={24} color="#fff" />
                                <Text style={styles.mapOverlayText}>Tap to open directions</Text>
                            </View>
                        </TouchableOpacity>

                        {profile.location && (
                            <Text style={[styles.locationText, { color: Colors.textSecondary }]}>
                                {profile.location}
                            </Text>
                        )}
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
        gap: Spacing.space3,
        marginTop: Spacing.space4,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: Spacing.space3,
        borderRadius: BorderRadius.md,
        gap: Spacing.space2,
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
        gap: 4,
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
        gap: Spacing.space2,
    },
    previewNoteText: {
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
        gap: 4,
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