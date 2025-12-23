/**
 * Offers & Promotions Screen
 * Manage business offers and vouchers
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonOfferCard } from '../../components/Skeletons';
import ApiService from '../../services/api';

export default function OffersScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const [activeTab, setActiveTab] = useState('offers');
    const [offers, setOffers] = useState<any[]>([]);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [activeTab])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'offers') {
                const response = await ApiService.getOffers();
                setOffers(response.offers || []);
            } else {
                const response = await ApiService.getVouchers();
                setVouchers(response.vouchers || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleToggle = async (id: string, type: 'offer' | 'voucher') => {
        try {
            if (type === 'offer') {
                await ApiService.toggleOffer(id);
            } else {
                await ApiService.toggleVoucher(id);
            }
            await loadData();
        } catch (error) {
            console.error('Error toggling:', error);
            Alert.alert('Error', 'Failed to toggle status');
        }
    };

    const handleDelete = async (id: string, type: 'offer' | 'voucher') => {
        Alert.alert(
            'Delete Confirmation',
            `Are you sure you want to delete this ${type}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (type === 'offer') {
                                await ApiService.deleteOffer(id);
                            } else {
                                await ApiService.deleteVoucher(id);
                            }
                            await loadData();
                        } catch (error) {
                            console.error('Error deleting:', error);
                            Alert.alert('Error', `Failed to delete ${type}`);
                        }
                    },
                },
            ]
        );
    };

    const renderOfferCard = (item: any) => (
        <View key={item.$id} style={[styles.card, { backgroundColor: Colors.card }]}>
            <View style={[styles.badge, { backgroundColor: Colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: Colors.primary }]}>
                    {item.offerType === 'flat_discount' && `₹${item.discountValue} OFF`}
                    {item.offerType === 'percentage_discount' && `${item.discountValue}% OFF`}
                    {item.offerType === 'buy_x_get_y' && `Buy ${item.buyQuantity} Get ${item.getQuantity}`}
                    {item.offerType === 'special_price' && `Special ₹${item.specialPrice}`}
                </Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: Colors.textPrimary }]}>{item.name}</Text>
                {item.description && (
                    <Text style={[styles.cardDescription, { color: Colors.textSecondary }]}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.cardMeta}>
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
                        <Text style={[styles.metaText, { color: Colors.textTertiary }]}>
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </Text>
                    </View>
                    {item.minPurchase > 0 && (
                        <View style={styles.metaRow}>
                            <Ionicons name="cart-outline" size={12} color={Colors.textTertiary} />
                            <Text style={[styles.metaText, { color: Colors.textTertiary }]}>
                                Min: ₹{item.minPurchase}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        item.status === 'active'
                            ? { backgroundColor: Colors.creditGreen + '20' }
                            : { backgroundColor: Colors.textTertiary + '20' },
                    ]}
                    onPress={() => handleToggle(item.$id, 'offer')}
                >
                    <Ionicons
                        name={item.status === 'active' ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={item.status === 'active' ? Colors.creditGreen : Colors.textTertiary}
                    />
                    <Text
                        style={[
                            styles.toggleText,
                            { color: item.status === 'active' ? Colors.creditGreen : Colors.textTertiary },
                        ]}
                    >
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: Colors.creditRed + '15' }]}
                    onPress={() => handleDelete(item.$id, 'offer')}
                >
                    <Ionicons name="trash-outline" size={16} color={Colors.creditRed} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderVoucherCard = (item: any) => (
        <View key={item.$id} style={[styles.card, { backgroundColor: Colors.card }]}>
            <View style={[styles.badge, { backgroundColor: Colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: Colors.primary }]}>
                    {item.discount_type === 'flat' ? `₹${item.discount_value} OFF` : `${item.discount_value}% OFF`}
                </Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: Colors.textPrimary }]}>{item.title}</Text>
                {item.description && (
                    <Text style={[styles.cardDescription, { color: Colors.textSecondary }]}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.cardMeta}>
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
                        <Text style={[styles.metaText, { color: Colors.textTertiary }]}>
                            {new Date(item.valid_from).toLocaleDateString()} - {new Date(item.valid_until).toLocaleDateString()}
                        </Text>
                    </View>
                    {item.min_purchase && (
                        <View style={styles.metaRow}>
                            <Ionicons name="cart-outline" size={12} color={Colors.textTertiary} />
                            <Text style={[styles.metaText, { color: Colors.textTertiary }]}>
                                Min: ₹{item.min_purchase}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        item.is_active
                            ? { backgroundColor: Colors.creditGreen + '20' }
                            : { backgroundColor: Colors.textTertiary + '20' },
                    ]}
                    onPress={() => handleToggle(item.$id, 'voucher')}
                >
                    <Ionicons
                        name={item.is_active ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={item.is_active ? Colors.creditGreen : Colors.textTertiary}
                    />
                    <Text
                        style={[
                            styles.toggleText,
                            { color: item.is_active ? Colors.creditGreen : Colors.textTertiary },
                        ]}
                    >
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: Colors.creditRed + '15' }]}
                    onPress={() => handleDelete(item.$id, 'voucher')}
                >
                    <Ionicons name="trash-outline" size={16} color={Colors.creditRed} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color={Colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>
                No {activeTab === 'offers' ? 'Offers' : 'Vouchers'} Yet
            </Text>
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                Create {activeTab === 'offers' ? 'special offers' : 'vouchers'} to boost sales
            </Text>
        </View>
    );

    const data = activeTab === 'offers' ? offers : vouchers;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]} edges={['top']}>
            {/* Tab Header */}
            <View style={[styles.tabHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'offers' && { borderBottomColor: Colors.primary, borderBottomWidth: 2 },
                    ]}
                    onPress={() => setActiveTab('offers')}
                >
                    <Ionicons name="pricetag" size={18} color={activeTab === 'offers' ? Colors.primary : Colors.textTertiary} />
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'offers' ? Colors.primary : Colors.textSecondary },
                        ]}
                    >
                        Offers
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'vouchers' && { borderBottomColor: Colors.primary, borderBottomWidth: 2 },
                    ]}
                    onPress={() => setActiveTab('vouchers')}
                >
                    <Ionicons name="ticket" size={18} color={activeTab === 'vouchers' ? Colors.primary : Colors.textTertiary} />
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'vouchers' ? Colors.primary : Colors.textSecondary },
                        ]}
                    >
                        Vouchers
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : data.length === 0 ? (
                    renderEmpty()
                ) : (
                    data.map((item) => (activeTab === 'offers' ? renderOfferCard(item) : renderVoucherCard(item)))
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: Colors.primary }]}
                onPress={() => navigation.navigate('AddOffer', { type: activeTab })}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.xs,
    },
    tabText: {
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.semiBold,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: Spacing.xl,
    },
    emptyTitle: {
        fontSize: Typography.fontLg,
        fontFamily: Typography.fonts.bold,
        marginTop: Spacing.md,
    },
    emptyText: {
        fontSize: Typography.fontSm,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    card: {
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.sm,
    },
    badgeText: {
        fontSize: Typography.font2xs,
        fontFamily: Typography.fonts.bold,
    },
    cardContent: {
        marginBottom: Spacing.sm,
    },
    cardTitle: {
        fontSize: Typography.fontBase,
        fontFamily: Typography.fonts.semiBold,
        marginBottom: Spacing.xs,
    },
    cardDescription: {
        fontSize: Typography.fontSm,
        marginBottom: Spacing.sm,
    },
    cardMeta: {
        gap: Spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: Typography.font2xs,
    },
    cardActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        gap: 4,
    },
    toggleText: {
        fontSize: Typography.fontXs,
        fontFamily: Typography.fonts.medium,
    },
    deleteButton: {
        width: 40,
        height: 32,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});
