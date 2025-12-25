/**
 * Terms of Service Screen
 * Display the complete terms and conditions for Ekthaa Business
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function TermsOfServiceScreen({ navigation }: any) {
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
                <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Terms & Conditions</Text>
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

                    {/* Section 1 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>1. Introduction</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Welcome to <Text style={styles.bold}>Ekthaa Business</Text> ("Ekthaa", "we", "our", or "us").
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        These Terms & Conditions ("Terms") govern your access to and use of the <Text style={styles.bold}>Ekthaa Business mobile application</Text>, website, and related services (collectively, the "Service").
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        By downloading, accessing, or using the App, you agree to be bound by these Terms.
                        If you do not agree, please do not use the App.
                    </Text>

                    {/* Section 2 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>2. Eligibility</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        To use Ekthaa Business, you must:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Be at least <Text style={styles.bold}>18 years of age</Text></Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Be legally capable of entering into a binding agreement</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Use the App for lawful business purposes only</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        By using the App, you confirm that you meet these requirements.
                    </Text>

                    {/* Section 3 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>3. Account Registration & Security</Text>
                    
                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>3.1 Account Creation</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        To use the Service, you must create an account by providing accurate and complete information, including your phone number and business details.
                    </Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>3.2 Account Responsibility</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You are responsible for:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Maintaining the confidentiality of your login credentials</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• All activities performed through your account</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Ensuring the accuracy of your business and customer data</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Ekthaa is not liable for any loss caused by unauthorized use of your account.
                    </Text>

                    {/* Section 4 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>4. Use of the Service</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You agree to use Ekthaa Business only for legitimate business activities, including:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Managing customers and transactions</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Maintaining product and inventory records</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Viewing analytics and reports</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Communicating with customers where permitted</Text>

                    <Text style={[styles.subheading, { color: Colors.textPrimary }]}>You agree NOT to:</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Use the App for illegal, fraudulent, or misleading activities</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Upload false, harmful, or unauthorized content</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Attempt to reverse-engineer or misuse the platform</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Violate applicable laws or regulations</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We reserve the right to suspend or terminate accounts violating these Terms.
                    </Text>

                    {/* Section 5 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>5. Customer Data Responsibility</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Ekthaa Business allows you to store customer information.
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You acknowledge that:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• You are responsible for obtaining consent from your customers</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• You are the owner/controller of the customer data you upload</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Ekthaa acts only as a technology service provider</Text>
                    
                    <View style={[styles.noteBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)', borderLeftColor: '#ef4444' }]}>
                        <Text style={[styles.noteText, { color: Colors.textSecondary }]}>
                            Ekthaa is <Text style={styles.bold}>not responsible</Text> for disputes between you and your customers.
                        </Text>
                    </View>

                    {/* Section 6 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>6. Payments & Charges</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Ekthaa may offer free and paid features</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Pricing, if applicable, will be clearly communicated in the App</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Payment processing may be handled by third-party providers</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Ekthaa reserves the right to modify pricing or introduce new charges with prior notice.
                    </Text>

                    {/* Section 7 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>7. Data Privacy</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Your use of the App is also governed by our <Text style={styles.bold}>Privacy Policy</Text>, which explains how we collect and use data.
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        By using Ekthaa Business, you agree to the data practices described in the Privacy Policy.
                    </Text>
                    <View style={[styles.noteBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.15)', borderLeftColor: '#6366f1' }]}>
                        <Text style={[styles.noteText, { color: Colors.textSecondary }]}>
                            📄 Privacy Policy is available on our website and within the App.
                        </Text>
                    </View>

                    {/* Section 8 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>8. Intellectual Property</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        All content, features, logos, designs, and software associated with Ekthaa Business are the <Text style={styles.bold}>exclusive property of Ekthaa</Text>.
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You may not:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Copy, modify, or distribute our content</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Use Ekthaa branding without permission</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Reproduce any part of the App for commercial purposes</Text>

                    {/* Section 9 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>9. Service Availability & Modifications</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• We strive to provide uninterrupted service but do not guarantee 100% uptime</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Features may be updated, modified, or discontinued</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Temporary downtime may occur due to maintenance or technical issues</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Ekthaa is not liable for losses caused by service interruptions.
                    </Text>

                    {/* Section 10 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>10. Termination</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may suspend or terminate your account if:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• You violate these Terms</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• You misuse the platform</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Required by law or security reasons</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You may stop using the App at any time.
                        Account deletion requests can be sent to <Text style={styles.bold}>support@ekthaa.app</Text>.
                    </Text>

                    {/* Section 11 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>11. Limitation of Liability</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        To the maximum extent permitted by law:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Ekthaa shall not be liable for indirect, incidental, or consequential damages</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• We are not responsible for data loss, business losses, or customer disputes</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Use of the App is at your own risk</Text>

                    {/* Section 12 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>12. Indemnification</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        You agree to indemnify and hold Ekthaa harmless from any claims, damages, or losses arising from:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Your use of the App</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Violation of these Terms</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Violation of any law or third-party rights</Text>

                    {/* Section 13 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>13. Third-Party Services</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Ekthaa may integrate with third-party services (e.g., payment gateways, analytics).
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We are not responsible for:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Third-party service availability</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Their terms or privacy practices</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Use of third-party services is at your own discretion.
                    </Text>

                    {/* Section 14 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>14. Governing Law & Jurisdiction</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        These Terms are governed by the laws of <Text style={styles.bold}>India</Text>.
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Any disputes shall be subject to the exclusive jurisdiction of courts in India.
                    </Text>

                    {/* Section 15 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>15. Changes to These Terms</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        We may update these Terms from time to time.
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Changes will be notified via:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• In-app notifications</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Website updates</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• Updated "Last Updated" date</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        Continued use of the App means acceptance of the revised Terms.
                    </Text>

                    {/* Section 16 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>16. Contact Us</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        For questions, support, or legal inquiries:
                    </Text>
                    <Text style={[styles.paragraph, { color: Colors.textPrimary }]}>
                        <Text style={styles.bold}>Ekthaa Business</Text>
                    </Text>
                    <View style={[styles.contactBox, { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.1)' : 'rgba(20, 184, 166, 0.15)', borderLeftColor: '#14b8a6' }]}>
                        <Text style={[styles.contactText, { color: Colors.textSecondary }]}>
                            📧 Email: <Text style={styles.bold}>support@ekthaa.app</Text>
                        </Text>
                    </View>

                    {/* Section 17 */}
                    <Text style={[styles.heading, { color: Colors.textPrimary }]}>17. Acceptance</Text>
                    <Text style={[styles.paragraph, { color: Colors.textSecondary }]}>
                        By using Ekthaa Business, you confirm that:
                    </Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• You have read and understood these Terms</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• You agree to be bound by them</Text>
                    <Text style={[styles.bullet, { color: Colors.textSecondary }]}>• You agree to comply with all applicable laws</Text>

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
