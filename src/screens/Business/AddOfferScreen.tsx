/**
 * Add Offer/Voucher Screen
 * Create new offers and vouchers
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function AddOfferScreen({ navigation, route }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const { type } = route.params || { type: 'offers' };
    const isOffer = type === 'offers';

    const [loading, setLoading] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        offerType: 'flat_discount',
        discountValue: '',
        buyQuantity: '',
        getQuantity: '',
        specialPrice: '',
        originalPrice: '',
        minPurchase: '',
        maxDiscount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            handleInputChange('startDate', dateStr);
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            handleInputChange('endDate', dateStr);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Validation Error', 'Please enter a name');
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            Alert.alert('Validation Error', 'Please select start and end dates');
            return;
        }

        try {
            setLoading(true);
            if (isOffer) {
                await ApiService.createOffer(formData);
            } else {
                const voucherData = {
                    title: formData.name,
                    description: formData.description,
                    discount_type: formData.offerType === 'flat_discount' ? 'flat' : 'percentage',
                    discount_value: parseFloat(formData.discountValue || '0'),
                    min_purchase: parseFloat(formData.minPurchase || '0'),
                    max_discount: parseFloat(formData.maxDiscount || '0'),
                    valid_from: formData.startDate,
                    valid_until: formData.endDate,
                    is_active: formData.status === 'active',
                };
                await ApiService.createVoucher(voucherData);
            }
            Alert.alert('Success', `${isOffer ? 'Offer' : 'Voucher'} created successfully`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            console.error('Error creating:', error);
            Alert.alert('Error', error.message || 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]} edges={['bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Form Section */}
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                            {isOffer ? 'Offer' : 'Voucher'} Details
                        </Text>

                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                Name *
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder={isOffer ? "Summer Sale 2025" : "WELCOME50"}
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    color: Colors.textPrimary,
                                    borderColor: Colors.borderLight
                                }]}
                                placeholder="Describe your offer"
                                placeholderTextColor={Colors.textTertiary}
                                value={formData.description}
                                onChangeText={(text) => handleInputChange('description', text)}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Offer Type */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: Colors.textSecondary }]}>Type *</Text>
                            <View style={styles.typeGrid}>
                                {[
                                    { id: 'flat_discount', label: 'Flat ₹', icon: 'cash-outline' },
                                    { id: 'percentage_discount', label: 'Percent %', icon: 'trending-down-outline' },
                                    { id: 'buy_x_get_y', label: 'Buy X Get Y', icon: 'gift-outline' },
                                    { id: 'special_price', label: 'Special Price', icon: 'pricetag-outline' },
                                ].map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.typeButton,
                                            { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight },
                                            formData.offerType === item.id && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                                        ]}
                                        onPress={() => handleInputChange('offerType', item.id)}
                                    >
                                        <Ionicons
                                            name={item.icon as any}
                                            size={20}
                                            color={formData.offerType === item.id ? '#fff' : Colors.textSecondary}
                                        />
                                        <Text
                                            style={[
                                                styles.typeLabel,
                                                { color: formData.offerType === item.id ? '#fff' : Colors.textSecondary },
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Conditional Fields */}
                        {(formData.offerType === 'flat_discount' || formData.offerType === 'percentage_discount') && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>
                                    Discount Value * {formData.offerType === 'percentage_discount' ? '(%)' : '(₹)'}
                                </Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        color: Colors.textPrimary,
                                        borderColor: Colors.borderLight
                                    }]}
                                    placeholder={formData.offerType === 'percentage_discount' ? '20' : '100'}
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.discountValue}
                                    onChangeText={(text) => handleInputChange('discountValue', text)}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}

                        {formData.offerType === 'buy_x_get_y' && (
                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.label, { color: Colors.textSecondary }]}>Buy Quantity *</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                            color: Colors.textPrimary,
                                            borderColor: Colors.borderLight
                                        }]}
                                        placeholder="2"
                                        placeholderTextColor={Colors.textTertiary}
                                        value={formData.buyQuantity}
                                        onChangeText={(text) => handleInputChange('buyQuantity', text)}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.halfInput}>
                                    <Text style={[styles.label, { color: Colors.textSecondary }]}>Get Quantity *</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                            color: Colors.textPrimary,
                                            borderColor: Colors.borderLight
                                        }]}
                                        placeholder="1"
                                        placeholderTextColor={Colors.textTertiary}
                                        value={formData.getQuantity}
                                        onChangeText={(text) => handleInputChange('getQuantity', text)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}

                        {formData.offerType === 'special_price' && (
                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.label, { color: Colors.textSecondary }]}>Special Price *</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                            color: Colors.textPrimary,
                                            borderColor: Colors.borderLight
                                        }]}
                                        placeholder="499"
                                        placeholderTextColor={Colors.textTertiary}
                                        value={formData.specialPrice}
                                        onChangeText={(text) => handleInputChange('specialPrice', text)}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.halfInput}>
                                    <Text style={[styles.label, { color: Colors.textSecondary }]}>Original Price</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                            color: Colors.textPrimary,
                                            borderColor: Colors.borderLight
                                        }]}
                                        placeholder="999"
                                        placeholderTextColor={Colors.textTertiary}
                                        value={formData.originalPrice}
                                        onChangeText={(text) => handleInputChange('originalPrice', text)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}

                        {/* Min/Max */}
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>Min Purchase (₹)</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        color: Colors.textPrimary,
                                        borderColor: Colors.borderLight
                                    }]}
                                    placeholder="500"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.minPurchase}
                                    onChangeText={(text) => handleInputChange('minPurchase', text)}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>Max Discount (₹)</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        color: Colors.textPrimary,
                                        borderColor: Colors.borderLight
                                    }]}
                                    placeholder="200"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.maxDiscount}
                                    onChangeText={(text) => handleInputChange('maxDiscount', text)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Dates */}
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>Start Date *</Text>
                                <TouchableOpacity
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        borderColor: Colors.borderLight,
                                        justifyContent: 'center',
                                    }]}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={[{ color: formData.startDate ? Colors.textPrimary : Colors.textTertiary }]}>
                                            {formData.startDate || 'Select date'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                                    </View>
                                </TouchableOpacity>
                                {showStartDatePicker && (
                                    <DateTimePicker
                                        value={formData.startDate ? new Date(formData.startDate) : new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onStartDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>End Date *</Text>
                                <TouchableOpacity
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        borderColor: Colors.borderLight,
                                        justifyContent: 'center',
                                    }]}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={[{ color: formData.endDate ? Colors.textPrimary : Colors.textTertiary }]}>
                                            {formData.endDate || 'Select date'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                                    </View>
                                </TouchableOpacity>
                                {showEndDatePicker && (
                                    <DateTimePicker
                                        value={formData.endDate ? new Date(formData.endDate) : new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onEndDateChange}
                                        minimumDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                                    />
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Button */}
            <View style={[styles.bottomBar, {
                backgroundColor: Colors.card,
                borderTopColor: Colors.borderLight
            }]}>
                <TouchableOpacity
                    style={[styles.submitButton, {
                        backgroundColor: loading ? Colors.textTertiary : Colors.primary
                    }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.submitText}>Create {isOffer ? 'Offer' : 'Voucher'}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
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
    sectionTitle: {
        fontSize: Typography.fontMd,
        fontFamily: Typography.fonts.bold,
        marginBottom: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.fontSm,
        marginBottom: Spacing.xs,
        fontFamily: Typography.fonts.medium,
    },
    input: {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Typography.fontSm,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 80,
        paddingTop: Spacing.sm,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    typeButton: {
        flex: 1,
        minWidth: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    typeLabel: {
        fontSize: Typography.fontXs,
        fontFamily: Typography.fonts.semiBold,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    bottomBar: {
        borderTopWidth: 1,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
    },
    submitText: {
        color: '#fff',
        fontSize: Typography.fontMd,
        fontFamily: Typography.fonts.bold,
    },
});
