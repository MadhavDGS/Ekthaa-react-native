/**
 * Skeleton Loading Components
 * Reusable skeleton loaders for various screen layouts
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Spacing, BorderRadius } from '../constants/theme';

interface SkeletonProps {
    isDark: boolean;
}

// Animated shimmer effect
const useShimmer = () => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return opacity;
};

// Customer/Product Card Skeleton
export const SkeletonCard: React.FC<SkeletonProps> = ({ isDark }) => {
    const opacity = useShimmer();
    const bgColor = isDark ? '#2a2a2a' : '#e5e7eb';
    const cardBg = isDark ? '#1a1a1a' : '#fff';

    return (
        <Animated.View style={[styles.card, { opacity, backgroundColor: cardBg }]}>
            <View style={[styles.avatar, { backgroundColor: bgColor }]} />
            <View style={styles.cardContent}>
                <View style={[styles.titleBar, { backgroundColor: bgColor }]} />
                <View style={[styles.subtitleBar, { backgroundColor: bgColor }]} />
            </View>
            <View style={[styles.balanceBar, { backgroundColor: bgColor }]} />
        </Animated.View>
    );
};

// Stats Card Skeleton (for Dashboard)
export const SkeletonStats: React.FC<SkeletonProps> = ({ isDark }) => {
    const opacity = useShimmer();
    const bgColor = isDark ? '#2a2a2a' : '#e5e7eb';

    return (
        <View style={styles.statsContainer}>
            {[1, 2, 3, 4].map((item) => (
                <Animated.View key={item} style={[styles.statCard, { opacity }]}>
                    <View style={[styles.statValue, { backgroundColor: bgColor }]} />
                    <View style={[styles.statLabel, { backgroundColor: bgColor }]} />
                </Animated.View>
            ))}
        </View>
    );
};

// Transaction List Skeleton
export const SkeletonTransaction: React.FC<SkeletonProps> = ({ isDark }) => {
    const opacity = useShimmer();
    const bgColor = isDark ? '#2a2a2a' : '#e5e7eb';

    return (
        <Animated.View style={[styles.transaction, { opacity }]}>
            <View style={[styles.transactionIcon, { backgroundColor: bgColor }]} />
            <View style={styles.transactionContent}>
                <View style={[styles.transactionTitle, { backgroundColor: bgColor }]} />
                <View style={[styles.transactionSubtitle, { backgroundColor: bgColor }]} />
            </View>
            <View style={[styles.transactionAmount, { backgroundColor: bgColor }]} />
        </Animated.View>
    );
};

// Profile Header Skeleton
export const SkeletonHeader: React.FC<SkeletonProps> = ({ isDark }) => {
    const opacity = useShimmer();
    const bgColor = isDark ? '#2a2a2a' : '#e5e7eb';

    return (
        <Animated.View style={[styles.header, { opacity }]}>
            <View style={[styles.headerAvatar, { backgroundColor: bgColor }]} />
            <View style={[styles.headerTitle, { backgroundColor: bgColor }]} />
            <View style={[styles.headerSubtitle, { backgroundColor: bgColor }]} />
        </Animated.View>
    );
};

// Offer/Voucher Card Skeleton
export const SkeletonOfferCard: React.FC<SkeletonProps> = ({ isDark }) => {
    const opacity = useShimmer();
    const bgColor = isDark ? '#2a2a2a' : '#e5e7eb';
    const cardBg = isDark ? '#1a1a1a' : '#fff';

    return (
        <Animated.View style={[styles.offerCard, { opacity, backgroundColor: cardBg }]}>
            <View style={[styles.offerBadge, { backgroundColor: bgColor }]} />
            <View style={[styles.offerTitle, { backgroundColor: bgColor }]} />
            <View style={[styles.offerDescription, { backgroundColor: bgColor }]} />
            <View style={styles.offerActions}>
                <View style={[styles.offerButton, { backgroundColor: bgColor }]} />
                <View style={[styles.offerButton, { backgroundColor: bgColor }]} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // Card Skeleton
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.md,
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
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: Spacing.sm,
    },
    cardContent: {
        flex: 1,
    },
    titleBar: {
        height: 16,
        width: '60%',
        borderRadius: 4,
        marginBottom: 6,
    },
    subtitleBar: {
        height: 12,
        width: '40%',
        borderRadius: 4,
    },
    balanceBar: {
        height: 20,
        width: 70,
        borderRadius: 4,
    },

    // Stats Skeleton
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    statCard: {
        width: '48%',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    statValue: {
        height: 24,
        width: 60,
        borderRadius: 4,
        marginBottom: 8,
    },
    statLabel: {
        height: 12,
        width: 80,
        borderRadius: 4,
    },

    // Transaction Skeleton
    transaction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: Spacing.sm,
    },
    transactionContent: {
        flex: 1,
    },
    transactionTitle: {
        height: 14,
        width: '50%',
        borderRadius: 4,
        marginBottom: 6,
    },
    transactionSubtitle: {
        height: 12,
        width: '30%',
        borderRadius: 4,
    },
    transactionAmount: {
        height: 18,
        width: 60,
        borderRadius: 4,
    },

    // Header Skeleton
    header: {
        alignItems: 'center',
        padding: Spacing.lg,
    },
    headerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: Spacing.md,
    },
    headerTitle: {
        height: 20,
        width: 150,
        borderRadius: 4,
        marginBottom: 8,
    },
    headerSubtitle: {
        height: 14,
        width: 100,
        borderRadius: 4,
    },

    // Offer Card Skeleton
    offerCard: {
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.md,
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
    offerBadge: {
        height: 20,
        width: 80,
        borderRadius: 10,
        marginBottom: Spacing.sm,
    },
    offerTitle: {
        height: 16,
        width: '70%',
        borderRadius: 4,
        marginBottom: 8,
    },
    offerDescription: {
        height: 12,
        width: '90%',
        borderRadius: 4,
        marginBottom: Spacing.sm,
    },
    offerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    offerButton: {
        flex: 1,
        height: 32,
        borderRadius: BorderRadius.md,
    },
});
