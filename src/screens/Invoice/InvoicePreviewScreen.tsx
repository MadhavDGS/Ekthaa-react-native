/**
 * Invoice Preview Screen
 * Success screen with option to view live PDF preview
 * Fully compatible with Expo Go
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');

export default function InvoicePreviewScreen({ route, navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);
    const { pdfPath, invoiceData } = route.params;
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pdfBase64, setPdfBase64] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        // Pre-load PDF in background
        loadPdfAsBase64();
    }, []);

    const loadPdfAsBase64 = async () => {
        try {
            const base64 = await FileSystem.readAsStringAsync(pdfPath, {
                encoding: FileSystem.EncodingType.Base64,
            });
            setPdfBase64(base64);
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    };

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.quantity) * parseFloat(item.rate));
    }, 0);

    const cgst = subtotal * (parseFloat(invoiceData.cgst_rate) / 100);
    const sgst = subtotal * (parseFloat(invoiceData.sgst_rate) / 100);
    const grandTotal = subtotal + cgst + sgst;

    const handleViewPreview = () => {
        setShowPreview(true);
    };

    const handleViewFullscreen = async () => {
        try {
            setActionLoading(true);
            const isAvailable = await Sharing.isAvailableAsync();

            if (!isAvailable) {
                Alert.alert('Error', 'Sharing is not available on this device');
                return;
            }

            await Sharing.shareAsync(pdfPath, {
                mimeType: 'application/pdf',
                dialogTitle: 'View Invoice',
                UTI: 'com.adobe.pdf',
            });
        } catch (error) {
            console.error('View error:', error);
            Alert.alert('Error', 'Failed to open invoice');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setActionLoading(true);

            if (Platform.OS === 'ios') {
                await Sharing.shareAsync(pdfPath, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Save Invoice to Files',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                const downloadDir = FileSystem.documentDirectory + 'Download/';
                const dirInfo = await FileSystem.getInfoAsync(downloadDir);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
                }

                const buyerName = invoiceData?.buyer_name?.replace(/[^a-z0-9]/gi, '_') || 'invoice';
                const filename = `Invoice_${buyerName}_${Date.now()}.pdf`;
                const newPath = downloadDir + filename;

                await FileSystem.copyAsync({
                    from: pdfPath,
                    to: newPath,
                });

                Alert.alert('Success', `Invoice saved as ${filename}`, [
                    {
                        text: 'Open',
                        onPress: () => handleViewFullscreen()
                    },
                    {
                        text: 'OK',
                        style: 'cancel'
                    }
                ]);
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save PDF');
        } finally {
            setActionLoading(false);
        }
    };

    // Success Screen (shown first)
    if (!showPreview) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Success Header */}
                    <View style={styles.successHeader}>
                        <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '20' }]}>
                            <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
                        </View>
                        <Text style={[styles.successTitle, { color: Colors.textPrimary }]}>
                            Invoice Generated!
                        </Text>
                        <Text style={[styles.successSubtitle, { color: Colors.textSecondary }]}>
                            Your invoice PDF has been created successfully
                        </Text>
                    </View>

                    {/* Invoice Summary */}
                    <View style={[styles.summaryCard, { backgroundColor: Colors.card }]}>
                        <Text style={[styles.summaryTitle, { color: Colors.textPrimary }]}>
                            Invoice Summary
                        </Text>

                        <View style={styles.summaryRow}>
                            <Ionicons name="person" size={20} color={Colors.textSecondary} />
                            <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Buyer:</Text>
                            <Text style={[styles.summaryValue, { color: Colors.textPrimary }]}>
                                {invoiceData.buyer_name}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Ionicons name="list" size={20} color={Colors.textSecondary} />
                            <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Items:</Text>
                            <Text style={[styles.summaryValue, { color: Colors.textPrimary }]}>
                                {invoiceData.items.length}
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />

                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Subtotal:</Text>
                            <Text style={[styles.summaryValue, { color: Colors.textPrimary }]}>
                                ₹{subtotal.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>
                                CGST ({invoiceData.cgst_rate}%):
                            </Text>
                            <Text style={[styles.summaryValue, { color: Colors.textPrimary }]}>
                                ₹{cgst.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>
                                SGST ({invoiceData.sgst_rate}%):
                            </Text>
                            <Text style={[styles.summaryValue, { color: Colors.textPrimary }]}>
                                ₹{sgst.toFixed(2)}
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />

                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: Colors.textPrimary }]}>Grand Total:</Text>
                            <Text style={[styles.totalValue, { color: Colors.primary }]}>
                                ₹{grandTotal.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={[styles.actionBar, { backgroundColor: Colors.card, borderTopColor: Colors.borderLight }]}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                        onPress={handleViewPreview}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="eye" size={22} color="#fff" />
                        <Text style={styles.buttonText}>View Preview</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
                        onPress={handleSave}
                        disabled={actionLoading}
                        activeOpacity={0.8}
                    >
                        {actionLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="download" size={22} color="#fff" />
                                <Text style={styles.buttonText}>Save</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // PDF Preview Screen (shown after clicking "View Preview")
    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            {/* Header with Invoice Summary */}
            <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setShowPreview(false)}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>
                        {invoiceData.buyer_name}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>
                        {invoiceData.items.length} item{invoiceData.items.length > 1 ? 's' : ''} • ₹{grandTotal.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* PDF Preview */}
            <View style={styles.pdfContainer}>
                {!pdfBase64 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
                            Loading preview...
                        </Text>
                    </View>
                ) : (
                    <WebView
                        source={{
                            html: `
                                <!DOCTYPE html>
                                <html>
                                    <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
                                        <style>
                                            * {
                                                margin: 0;
                                                padding: 0;
                                                box-sizing: border-box;
                                            }
                                            body {
                                                margin: 0;
                                                padding: 0;
                                                background-color: #525659;
                                                overflow: auto;
                                                -webkit-overflow-scrolling: touch;
                                            }
                                            iframe {
                                                width: 100%;
                                                height: 100vh;
                                                border: none;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <iframe src="data:application/pdf;base64,${pdfBase64}" type="application/pdf"></iframe>
                                    </body>
                                </html>
                            `,
                        }}
                        style={styles.webview}
                        scalesPageToFit={true}
                        originWhitelist={['*']}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                )}
            </View>

            {/* Action Buttons */}
            <View style={[styles.actionBar, { backgroundColor: Colors.card, borderTopColor: Colors.borderLight }]}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                    onPress={handleViewFullscreen}
                    disabled={actionLoading}
                    activeOpacity={0.8}
                >
                    {actionLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name="expand-outline" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Fullscreen</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
                    onPress={handleSave}
                    disabled={actionLoading}
                    activeOpacity={0.8}
                >
                    {actionLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name="download" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Save</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.lg,
        justifyContent: 'center',
    },
    successHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    successTitle: {
        fontSize: Typography.fontXl,
        fontWeight: Typography.bold,
        marginBottom: Spacing.xs,
    },
    successSubtitle: {
        fontSize: Typography.fontSm,
        textAlign: 'center',
    },
    summaryCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: Typography.fontLg,
        fontWeight: Typography.bold,
        marginBottom: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    summaryLabel: {
        fontSize: Typography.fontSm,
        flex: 1,
    },
    summaryValue: {
        fontSize: Typography.fontSm,
        fontWeight: Typography.semiBold,
    },
    divider: {
        height: 1,
        marginVertical: Spacing.md,
    },
    totalLabel: {
        fontSize: Typography.fontMd,
        fontWeight: Typography.bold,
        flex: 1,
    },
    totalValue: {
        fontSize: Typography.fontLg,
        fontWeight: Typography.bold,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: Typography.fontMd,
        fontWeight: Typography.bold,
    },
    headerSubtitle: {
        fontSize: Typography.fontXs,
        marginTop: 2,
    },
    pdfContainer: {
        flex: 1,
        backgroundColor: '#525659',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.fontSm,
    },
    webview: {
        flex: 1,
        backgroundColor: '#525659',
    },
    actionBar: {
        flexDirection: 'row',
        gap: Spacing.md,
        padding: Spacing.md,
        borderTopWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: { elevation: 4 },
        }),
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        minHeight: 48,
    },
    buttonText: {
        color: '#fff',
        fontSize: Typography.fontSm,
        fontWeight: Typography.bold,
    },
});
