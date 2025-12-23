/**
 * Invoice Generator Screen
 * Multi-step invoice creation with PDF generation
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

type InvoiceSection = 'buyer' | 'seller' | 'items' | 'extra' | 'preview';

interface InvoiceItem {
    product_id?: string;
    description: string;
    hsn_code: string;
    quantity: string;
    rate: string;
    unit: string;
}

interface InvoiceFormData {
    seller_name: string;
    seller_address: string;
    seller_city: string;
    seller_state: string;
    seller_pincode: string;
    seller_gstin: string;
    buyer_name: string;
    buyer_address: string;
    buyer_city: string;
    buyer_state: string;
    buyer_pincode: string;
    buyer_gstin: string;
    buyer_state_code: string;
    items: InvoiceItem[];
    cgst_rate: string;
    sgst_rate: string;
    vehicle_number: string;
    notes: string;
}

export default function InvoiceGeneratorScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const [activeSection, setActiveSection] = useState<InvoiceSection>('buyer');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    const [formData, setFormData] = useState<InvoiceFormData>({
        seller_name: '',
        seller_address: '',
        seller_city: '',
        seller_state: '',
        seller_pincode: '',
        seller_gstin: '',
        buyer_name: '',
        buyer_address: '',
        buyer_city: '',
        buyer_state: '',
        buyer_pincode: '',
        buyer_gstin: '',
        buyer_state_code: '',
        items: [{
            description: '',
            hsn_code: '',
            quantity: '',
            rate: '',
            unit: 'Nos'
        }],
        cgst_rate: '9',
        sgst_rate: '9',
        vehicle_number: '',
        notes: ''
    });

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Invoice Generator',
        });
        loadBusinessProfile();
        loadProducts();
    }, []);

    const loadBusinessProfile = async () => {
        try {
            const data = await ApiService.getProfile();
            // The API returns { user: {...} } structure
            const user = data.user || data;

            setFormData(prev => ({
                ...prev,
                seller_name: user.business_name || user.name || '',
                seller_address: user.address || '',
                seller_city: user.city || '',
                seller_state: user.state || '',
                seller_pincode: user.pincode || '',
                seller_gstin: user.gst_number || '',
            }));
        } catch (error) {
            console.error('Failed to load business profile:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await ApiService.getProducts();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleInputChange = (field: keyof InvoiceFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', hsn_code: '', quantity: '', rate: '', unit: 'Nos' }]
        }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };

    const calculateItemTotal = (item: InvoiceItem) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        return qty * rate;
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const cgst = (subtotal * parseFloat(formData.cgst_rate)) / 100;
        const sgst = (subtotal * parseFloat(formData.sgst_rate)) / 100;
        const total = subtotal + cgst + sgst;
        return { subtotal, cgst, sgst, total };
    };

    const handleGenerateInvoice = async () => {
        // Validation - only essential fields required
        const missingFields = [];
        if (!formData.buyer_name) missingFields.push('Buyer Name');
        if (!formData.buyer_address) missingFields.push('Buyer Address');
        if (!formData.buyer_city) missingFields.push('Buyer City');
        if (!formData.buyer_state) missingFields.push('Buyer State');
        if (!formData.buyer_pincode) missingFields.push('Buyer Pincode');

        const hasValidItem = formData.items.some(item =>
            item.description && item.quantity && item.rate
        );
        if (!hasValidItem) {
            missingFields.push('At least one item');
        }

        if (missingFields.length > 0) {
            Alert.alert('Missing Fields', `Please fill: ${missingFields.join(', ')}`);
            return;
        }

        try {
            setLoading(true);

            // Call API to generate PDF
            const pdfPath = await ApiService.generateInvoice(formData);

            // Navigate to preview screen
            navigation.navigate('InvoicePreview', {
                pdfPath: pdfPath,
                invoiceData: formData
            });
        } catch (error: any) {
            console.error('Invoice generation error:', error);
            Alert.alert('Error', error.message || 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();
    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    const renderTabBar = () => (
        <View style={[styles.tabBar, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
                <TouchableOpacity
                    style={[styles.tab, activeSection === 'buyer' && { backgroundColor: Colors.primary }]}
                    onPress={() => setActiveSection('buyer')}
                >
                    <Ionicons name="person" size={16} color={activeSection === 'buyer' ? '#fff' : Colors.textSecondary} />
                    <Text style={[styles.tabText, { color: activeSection === 'buyer' ? '#fff' : Colors.textSecondary }]}>Buyer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeSection === 'seller' && { backgroundColor: Colors.primary }]}
                    onPress={() => setActiveSection('seller')}
                >
                    <Ionicons name="storefront" size={16} color={activeSection === 'seller' ? '#fff' : Colors.textSecondary} />
                    <Text style={[styles.tabText, { color: activeSection === 'seller' ? '#fff' : Colors.textSecondary }]}>Seller</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeSection === 'items' && { backgroundColor: Colors.primary }]}
                    onPress={() => setActiveSection('items')}
                >
                    <Ionicons name="cube" size={16} color={activeSection === 'items' ? '#fff' : Colors.textSecondary} />
                    <Text style={[styles.tabText, { color: activeSection === 'items' ? '#fff' : Colors.textSecondary }]}>Items</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeSection === 'extra' && { backgroundColor: Colors.primary }]}
                    onPress={() => setActiveSection('extra')}
                >
                    <Ionicons name="add-circle" size={16} color={activeSection === 'extra' ? '#fff' : Colors.textSecondary} />
                    <Text style={[styles.tabText, { color: activeSection === 'extra' ? '#fff' : Colors.textSecondary }]}>Extra</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: Colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {renderTabBar()}

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {activeSection === 'buyer' && (
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Buyer Details</Text>

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Buyer Name *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Enter buyer name"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.buyer_name}
                            onChangeText={(text) => handleInputChange('buyer_name', text)}
                        />

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>GSTIN (Optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Enter GSTIN"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.buyer_gstin}
                            onChangeText={(text) => handleInputChange('buyer_gstin', text)}
                        />

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Address *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Enter complete address"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.buyer_address}
                            onChangeText={(text) => handleInputChange('buyer_address', text)}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>City *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="City"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.buyer_city}
                                    onChangeText={(text) => handleInputChange('buyer_city', text)}
                                />
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>State *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="State"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.buyer_state}
                                    onChangeText={(text) => handleInputChange('buyer_state', text)}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>Pincode *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="PIN"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.buyer_pincode}
                                    onChangeText={(text) => handleInputChange('buyer_pincode', text)}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>State Code</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="Code"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.buyer_state_code}
                                    onChangeText={(text) => handleInputChange('buyer_state_code', text)}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {activeSection === 'seller' && (
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Seller Details (Your Business)</Text>

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Business Name *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Business name"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.seller_name}
                            onChangeText={(text) => handleInputChange('seller_name', text)}
                        />

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>GSTIN</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Enter GSTIN"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.seller_gstin}
                            onChangeText={(text) => handleInputChange('seller_gstin', text)}
                        />

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Address *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Enter address"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.seller_address}
                            onChangeText={(text) => handleInputChange('seller_address', text)}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>City *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="City"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.seller_city}
                                    onChangeText={(text) => handleInputChange('seller_city', text)}
                                />
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>State *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="State"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.seller_state}
                                    onChangeText={(text) => handleInputChange('seller_state', text)}
                                />
                            </View>
                        </View>

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Pincode</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Pincode"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.seller_pincode}
                            onChangeText={(text) => handleInputChange('seller_pincode', text)}
                            keyboardType="numeric"
                        />
                    </View>
                )}

                {activeSection === 'items' && (
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Invoice Items</Text>
                            <TouchableOpacity onPress={addItem} style={[styles.addButton, { backgroundColor: Colors.primary }]}>
                                <Ionicons name="add" size={16} color="#fff" />
                                <Text style={styles.addButtonText}>Add Item</Text>
                            </TouchableOpacity>
                        </View>

                        {formData.items.map((item, index) => (
                            <View key={index} style={styles.itemCard}>
                                <View style={styles.itemHeader}>
                                    <Text style={[styles.itemTitle, { color: Colors.textPrimary }]}>Item {index + 1}</Text>
                                    {formData.items.length > 1 && (
                                        <TouchableOpacity onPress={() => removeItem(index)}>
                                            <Ionicons name="trash" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <Text style={[styles.label, { color: Colors.textSecondary }]}>Description *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="Item description"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={item.description}
                                    onChangeText={(text) => handleItemChange(index, 'description', text)}
                                />

                                <View style={styles.row}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { color: Colors.textSecondary }]}>HSN Code</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                            placeholder="HSN"
                                            placeholderTextColor={Colors.textTertiary}
                                            value={item.hsn_code}
                                            onChangeText={(text) => handleItemChange(index, 'hsn_code', text)}
                                        />
                                    </View>

                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Unit</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                            placeholder="Unit"
                                            placeholderTextColor={Colors.textTertiary}
                                            value={item.unit}
                                            onChangeText={(text) => handleItemChange(index, 'unit', text)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Quantity *</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                            placeholder="Qty"
                                            placeholderTextColor={Colors.textTertiary}
                                            value={item.quantity}
                                            onChangeText={(text) => handleItemChange(index, 'quantity', text)}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>

                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Rate *</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                            placeholder="₹ Rate"
                                            placeholderTextColor={Colors.textTertiary}
                                            value={item.rate}
                                            onChangeText={(text) => handleItemChange(index, 'rate', text)}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.itemTotal}>
                                    <Text style={[styles.itemTotalLabel, { color: Colors.textSecondary }]}>Item Total:</Text>
                                    <Text style={[styles.itemTotalAmount, { color: Colors.textPrimary }]}>{formatCurrency(calculateItemTotal(item))}</Text>
                                </View>
                            </View>
                        ))}

                        <View style={styles.totalsCard}>
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: Colors.textSecondary }]}>Subtotal:</Text>
                                <Text style={[styles.totalValue, { color: Colors.textPrimary }]}>{formatCurrency(totals.subtotal)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: Colors.textSecondary }]}>CGST ({formData.cgst_rate}%):</Text>
                                <Text style={[styles.totalValue, { color: Colors.textPrimary }]}>{formatCurrency(totals.cgst)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: Colors.textSecondary }]}>SGST ({formData.sgst_rate}%):</Text>
                                <Text style={[styles.totalValue, { color: Colors.textPrimary }]}>{formatCurrency(totals.sgst)}</Text>
                            </View>
                            <View style={[styles.totalRow, styles.grandTotalRow]}>
                                <Text style={[styles.grandTotalLabel, { color: Colors.textPrimary }]}>Total:</Text>
                                <Text style={[styles.grandTotalValue, { color: Colors.primary }]}>{formatCurrency(totals.total)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {activeSection === 'extra' && (
                    <View style={[styles.section, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Additional Information</Text>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>CGST Rate (%)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="9"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.cgst_rate}
                                    onChangeText={(text) => handleInputChange('cgst_rate', text)}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={[styles.label, { color: Colors.textSecondary }]}>SGST Rate (%)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                                    placeholder="9"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={formData.sgst_rate}
                                    onChangeText={(text) => handleInputChange('sgst_rate', text)}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Vehicle Number</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Vehicle number (optional)"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.vehicle_number}
                            onChangeText={(text) => handleInputChange('vehicle_number', text)}
                        />

                        <Text style={[styles.label, { color: Colors.textSecondary }]}>Additional Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: Colors.textPrimary }]}
                            placeholder="Add any additional notes"
                            placeholderTextColor={Colors.textTertiary}
                            value={formData.notes}
                            onChangeText={(text) => handleInputChange('notes', text)}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                )}
            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: Colors.card, borderTopColor: Colors.borderLight }]}>
                <TouchableOpacity
                    style={[styles.generateButton, { backgroundColor: Colors.primary }]}
                    onPress={handleGenerateInvoice}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="document-text" size={20} color="#fff" />
                            <Text style={styles.generateButtonText}>Generate Invoice PDF</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        borderBottomWidth: 1,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    tabScrollContent: {
        gap: Spacing.xs,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    tabText: {
        fontSize: Typography.fontXs,
        fontWeight: Typography.semiBold,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    section: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
        }),
    },
    sectionTitle: {
        fontSize: Typography.fontLg,
        fontWeight: Typography.bold,
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.fontXs,
        fontWeight: Typography.semiBold,
        marginBottom: Spacing.xs,
        marginTop: Spacing.sm,
    },
    input: {
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        fontSize: Typography.fontSm,
        minHeight: 44,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    halfInput: {
        flex: 1,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    addButtonText: {
        color: '#fff',
        fontSize: Typography.fontXs,
        fontWeight: Typography.semiBold,
    },
    itemCard: {
        marginBottom: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.07)',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    itemTitle: {
        fontSize: Typography.fontSm,
        fontWeight: Typography.bold,
    },
    itemTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.07)',
    },
    itemTotalLabel: {
        fontSize: Typography.fontSm,
        fontWeight: Typography.semiBold,
    },
    itemTotalAmount: {
        fontSize: Typography.fontMd,
        fontWeight: Typography.bold,
    },
    totalsCard: {
        marginTop: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(90, 154, 142, 0.05)',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    totalLabel: {
        fontSize: Typography.fontSm,
    },
    totalValue: {
        fontSize: Typography.fontSm,
        fontWeight: Typography.semiBold,
    },
    grandTotalRow: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 2,
        borderTopColor: 'rgba(90, 154, 142, 0.3)',
    },
    grandTotalLabel: {
        fontSize: Typography.fontMd,
        fontWeight: Typography.bold,
    },
    grandTotalValue: {
        fontSize: Typography.fontLg,
        fontWeight: Typography.bold,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        borderTopWidth: 1,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        minHeight: 50,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: Typography.fontSm,
        fontWeight: Typography.bold,
    },
});
