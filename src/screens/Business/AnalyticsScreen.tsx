/**
 * Analytics Screen
 * Business reports and performance metrics
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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonStats, SkeletonCard } from '../../components/Skeletons';
import ApiService from '../../services/api';
import SvgIcon from '../../components/SvgIcon';

export default function AnalyticsScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            loadAnalytics();
        }, [])
    );

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadAnalytics();
    };

    const formatCurrency = (amount: number) => `₹${amount?.toLocaleString('en-IN') || 0}`;

    if (loading && !dashboardData) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const summary = dashboardData?.summary || {};
    const recentCustomers = dashboardData?.recent_customers || [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]} edges={['top']}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
                }
            >
                {/* Key Metrics */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Key Metrics</Text>

                    <View style={styles.metricsGrid}>
                        <View style={[styles.metricCard, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '30' }]}>
                            <SvgIcon name="customerService" size={24} color={Colors.primary} />
                            <Text style={[styles.metricValue, { color: Colors.primary }]}>
                                {summary.total_customers || 0}
                            </Text>
                            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Total Customers</Text>
                        </View>

                        <View style={[styles.metricCard, { backgroundColor: Colors.creditGreen + '15', borderColor: Colors.creditGreen + '30' }]}>
                            <SvgIcon name="transactionRecord" size={24} color={Colors.creditGreen} />
                            <Text style={[styles.metricValue, { color: Colors.creditGreen }]}>
                                {summary.total_transactions || 0}
                            </Text>
                            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Transactions</Text>
                        </View>

                        <View style={[styles.metricCard, { backgroundColor: Colors.orange + '15', borderColor: Colors.orange + '30' }]}>
                            <SvgIcon name="handbag" size={24} color={Colors.orange} />
                            <Text style={[styles.metricValue, { color: Colors.orange }]}>
                                {summary.total_products || 0}
                            </Text>
                            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Products</Text>
                        </View>

                        <View style={[styles.metricCard, { backgroundColor: Colors.creditRed + '15', borderColor: Colors.creditRed + '30' }]}>
                            <SvgIcon name="riskAssessment" size={24} color={Colors.creditRed} />
                            <Text style={[styles.metricValue, { color: Colors.creditRed }]}>
                                {summary.low_stock_count || 0}
                            </Text>
                            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Low Stock</Text>
                        </View>
                    </View>
                </View>

                {/* Financial Overview */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Financial Overview</Text>

                    <View style={[styles.card, { backgroundColor: Colors.card }]}>
                        <View style={styles.financeRow}>
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { color: Colors.textSecondary }]}>Outstanding</Text>
                                <Text style={[styles.financeValue, { color: Colors.creditRed }]}>
                                    {formatCurrency(summary.outstanding_balance || 0)}
                                </Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { color: Colors.textSecondary }]}>Total Collected</Text>
                                <Text style={[styles.financeValue, { color: Colors.creditGreen }]}>
                                    {formatCurrency(summary.total_collected || 0)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Top Customers */}
                {recentCustomers.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Top Customers</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.card, { backgroundColor: Colors.card }]}>
                            {recentCustomers.slice(0, 5).map((customer: any, index: number) => (
                                <View key={customer.id}>
                                    {index > 0 && <View style={[styles.separator, { backgroundColor: Colors.borderLight }]} />}
                                    <View style={styles.customerRow}>
                                        <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
                                            <Text style={[styles.avatarText, { color: Colors.primary }]}>
                                                {customer.name?.charAt(0).toUpperCase() || 'C'}
                                            </Text>
                                        </View>
                                        <View style={styles.customerInfo}>
                                            <Text style={[styles.customerName, { color: Colors.textPrimary }]}>
                                                {customer.name}
                                            </Text>
                                            <Text style={[styles.customerPhone, { color: Colors.textSecondary }]}>
                                                {customer.phone_number}
                                            </Text>
                                        </View>
                                        <View style={styles.customerBalance}>
                                            <Text
                                                style={[
                                                    styles.balanceAmount,
                                                    { color: customer.balance >= 0 ? Colors.creditRed : Colors.creditGreen },
                                                ]}
                                            >
                                                {customer.balance >= 0 ? '+' : ''}{formatCurrency(Math.abs(customer.balance))}
                                            </Text>
                                            <Text style={[styles.balanceLabel, { color: Colors.textTertiary }]}>
                                                {customer.balance >= 0 ? 'To Collect' : 'Advance'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Business Insights */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Business Insights</Text>

                    <View style={[styles.insightCard, { backgroundColor: Colors.card }]}>
                        <View style={styles.insightRow}>
                            <Ionicons name="information-circle" size={20} color={Colors.primary} />
                            <Text style={[styles.insightText, { color: Colors.textSecondary }]}>
                                You have {summary.total_customers || 0} total customers with an average balance of{' '}
                                <Text style={{ color: Colors.textPrimary, fontFamily: Typography.fonts.semiBold }}>
                                    {formatCurrency((summary.outstanding_balance || 0) / Math.max(1, summary.total_customers || 1))}
                                </Text>
                            </Text>
                        </View>
                    </View>

                    {summary.low_stock_count > 0 && (
                        <View style={[styles.insightCard, { backgroundColor: Colors.creditRed + '10' }]}>
                            <View style={styles.insightRow}>
                                <Ionicons name="alert-circle" size={20} color={Colors.creditRed} />
                                <Text style={[styles.insightText, { color: Colors.textSecondary }]}>
                                    {summary.low_stock_count} product{summary.low_stock_count > 1 ? 's are' : ' is'} running low on stock
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    section: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: Typography.fontMd,
        fontFamily: Typography.fonts.bold,
        marginBottom: Spacing.sm,
    },
    viewAllText: {
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.medium,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    metricCard: {
        flex: 1,
        minWidth: '47%',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: Typography.fontXl,
        fontFamily: Typography.fonts.bold,
        marginTop: Spacing.xs,
    },
    metricLabel: {
        fontSize: Typography.fontXs,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    card: {
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
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
    financeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    financeItem: {
        flex: 1,
        alignItems: 'center',
    },
    financeLabel: {
        fontSize: Typography.fontXs,
        marginBottom: Spacing.xs,
    },
    financeValue: {
        fontSize: Typography.fontLg,
        fontFamily: Typography.fonts.bold,
    },
    divider: {
        width: 1,
        height: 40,
        marginHorizontal: Spacing.md,
    },
    separator: {
        height: 1,
        marginVertical: Spacing.sm,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    avatarText: {
        fontSize: Typography.fontBase,
        fontFamily: Typography.fonts.bold,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.semiBold,
    },
    customerPhone: {
        fontSize: Typography.font2xs,
        marginTop: 2,
    },
    customerBalance: {
        alignItems: 'flex-end',
    },
    balanceAmount: {
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.bold,
    },
    balanceLabel: {
        fontSize: Typography.font3xs,
        marginTop: 2,
    },
    insightCard: {
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    insightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    insightText: {
        flex: 1,
        fontSize: Typography.fontSm,
        lineHeight: 20,
    },
});
