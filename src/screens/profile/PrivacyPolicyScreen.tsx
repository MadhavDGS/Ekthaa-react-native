/**
 * Privacy Policy Screen
 * Display the complete privacy policy for Ekthaa Business
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function PrivacyPolicyScreen({ navigation }: any) {
    const Colors = useThemedColors();
    const isDark = Colors.background === '#0F172A';

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Privacy Policy</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Last Updated */}
                    <Text style={[styles.lastUpdated, { color: Colors.textSecondary }]}>
                        Last Updated: December 24, 2025
                    </Text>

                    {/* Introduction */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>Introduction</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Welcome to <Text style={styles.bold}>Ekthaa Business</Text> ("Ekthaa", "we", "our", or "us").
                        We value your trust and are committed to protecting your privacy and personal data.
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        This Privacy Policy explains how we collect, use, store, disclose, and safeguard your information 
                        when you use the <Text style={styles.bold}>Ekthaa Business mobile application</Text> (the "App") and related services.
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        By using the App, you agree to the collection and use of information in accordance with this Privacy Policy. 
                        If you do not agree, please do not use the App.
                    </Text>

                    {/* Section 1 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>1. Information We Collect</Text>
                    
                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>1.1 Personal & Business Information</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Information you provide directly to us, including:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Business name, address, business type</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• GST number (if provided)</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Business registration details</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Owner or representative name</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Phone number and email address</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Login credentials (stored securely)</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>1.2 Customer Data (Entered by Business Users)</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        When you use Ekthaa Business to manage customers, you may store:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Customer names and contact details</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Credit and payment records</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Transaction history</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Purchase details</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Outstanding balances</Text>
                    
                    <View style={[styles.noteBox, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.15)', borderLeftColor: '#fbbf24' }]}>
                        <Text style={[styles.noteText, { color: Colors.textSecondary }]}>
                            <Text style={styles.bold}>Note:</Text> You are responsible for ensuring you have lawful permission to store your customers' data.
                        </Text>
                    </View>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>1.3 Product & Inventory Information</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Product or service names</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Descriptions and categories</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Prices and stock levels</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Product images uploaded by you</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>1.4 Location Information</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may collect location data to:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Display your business on maps</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Enable local discovery features</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Improve accuracy of nearby searches</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You can disable location access anytime through your device settings.
                    </Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>1.5 Transaction Information</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Invoice records</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Payment dates and amounts</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Transaction history</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Payment methods (if applicable)</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>1.6 Device & Technical Information</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Device type and model</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Operating system and app version</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Device identifiers</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Network and diagnostic information</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>1.7 Usage & Analytics Data</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• App feature usage</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Time spent on screens</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Navigation patterns</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Crash logs and error reports</Text>

                    {/* Section 2 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>2. How We Use Your Information</Text>
                    
                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>2.1 Core Services</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We use your information to:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Provide business management features</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Maintain customer credit and transaction records</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Manage products, inventory, offers, and vouchers</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Generate reports and analytics</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>2.2 Account & Support</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Create and manage user accounts</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Authenticate users</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Respond to queries and support requests</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Communicate service-related information</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>2.3 Improvement & Development</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Analyze usage trends</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Improve performance and usability</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Develop new features</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Fix bugs and security issues</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>2.4 Communication</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• App updates and feature announcements</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Service notifications</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Customer support communication</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>2.5 Legal & Security</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Comply with legal obligations</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Prevent fraud and misuse</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Enforce our terms and policies</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Protect Ekthaa, users, and the public</Text>

                    {/* Section 3 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>3. Data Storage & Security</Text>
                    
                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>3.1 Data Storage</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Data is stored on secure cloud infrastructure</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Regular backups are maintained</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Access is restricted to authorized personnel only</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>3.2 Security Measures</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We use industry-standard safeguards, including:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• HTTPS / TLS encryption</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Secure authentication mechanisms</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Access control and monitoring</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Periodic security updates and reviews</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>3.3 Data Retention</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We retain your data only as long as:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Your account remains active</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Required to provide services</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Required by law or legitimate business purposes</Text>

                    {/* Section 4 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>4. Data Sharing & Disclosure</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We <Text style={styles.bold}>do not sell, rent, or trade</Text> your personal data.
                    </Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>4.1 Trusted Service Providers</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may share data with vetted third parties for:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Cloud hosting and storage</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Analytics and performance monitoring</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Customer support services</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Payment processing (if enabled)</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        All providers are contractually bound to protect your data.
                    </Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>4.2 Business Transfers</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        If Ekthaa is involved in a merger, acquisition, or asset sale, your data may be transferred. 
                        Users will be notified of any such change.
                    </Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>4.3 Legal Obligations</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may disclose information when required to:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Comply with legal processes</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Respond to lawful requests by authorities</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Protect rights, safety, or property</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Investigate fraud or abuse</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>4.4 With Your Consent</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may share information if you explicitly authorize us to do so.
                    </Text>

                    {/* Section 5 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>5. Third-Party Services</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        The App may integrate or link to third-party services such as:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Analytics tools</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Cloud infrastructure providers</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Payment gateways</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We are not responsible for the privacy practices of third parties. Please review their privacy policies separately.
                    </Text>

                    {/* Section 6 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>6. Children's Privacy</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Ekthaa Business is <Text style={styles.bold}>not intended for users under 18 years of age</Text>.
                        We do not knowingly collect data from children. If you believe such data has been collected, contact us immediately.
                    </Text>

                    {/* Section 7 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>7. Your Rights & Choices</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You have the right to:
                    </Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>7.1 Access & Update</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• View and edit your data within the App</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Request a copy of your stored data</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>7.2 Data Deletion</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Request account and data deletion</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Some data may be retained for legal or compliance reasons</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>7.3 Opt-Out</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Disable location permissions</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Opt out of non-essential communications</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>7.4 Data Portability</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Request export of your data in a readable format</Text>

                    <View style={[styles.contactBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.15)', borderLeftColor: '#6366f1' }]}>
                        <Text style={[styles.contactText, { color: Colors.textSecondary }]}>
                            📧 <Text style={styles.bold}>Contact for all requests:</Text> support@ekthaa.app
                        </Text>
                    </View>

                    {/* Sections 8-13 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>8. International Data Transfers</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Your information may be processed in India or other countries where our service providers operate. 
                        Appropriate safeguards are applied to protect your data.
                    </Text>

                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>9. Cookies & Tracking Technologies</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may use cookies or similar technologies to:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Maintain sessions</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Store preferences</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Analyze app usage</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Improve functionality</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You can control these through device or browser settings.
                    </Text>

                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>10. Changes to This Privacy Policy</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may update this policy periodically. Changes will be communicated via:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• In-app notifications</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Email communication</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Updated "Last Updated" date</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Continued use of the App means acceptance of the revised policy.
                    </Text>

                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>11. Contact Information</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        For questions, concerns, or privacy requests:
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textPrimary }]}>
                        <Text style={styles.bold}>Ekthaa Business</Text>
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        📧 Email: support@ekthaa.app
                    </Text>

                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>12. Governing Law</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        This Privacy Policy is governed by the laws of <Text style={styles.bold}>India</Text>.
                        Any disputes shall be subject to the exclusive jurisdiction of Indian courts.
                    </Text>

                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>13. Consent</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        By using the Ekthaa Business App, you consent to:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Collection and use of data as described</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Processing of information for service delivery</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• This Privacy Policy and related terms</Text>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: Colors.textTertiary }]}>
                            © 2025 Ekthaa Business. All rights reserved.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    content: {
        padding: 20,
    },
    lastUpdated: {
        fontSize: 13,
        marginBottom: 24,
        fontStyle: 'italic',
    },
    heading: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 12,
    },
    subheading: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    bullet: {
        fontSize: 14,
        lineHeight: 22,
        marginLeft: 8,
        marginBottom: 6,
    },
    bold: {
        fontWeight: '600',
    },
    noteBox: {
        padding: 12,
        borderLeftWidth: 3,
        borderRadius: 6,
        marginVertical: 12,
    },
    noteText: {
        fontSize: 13,
        lineHeight: 20,
    },
    contactBox: {
        padding: 14,
        borderLeftWidth: 3,
        borderRadius: 6,
        marginVertical: 16,
    },
    contactText: {
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        marginTop: 32,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
    },
});
