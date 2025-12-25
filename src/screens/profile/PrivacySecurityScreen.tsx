/**
 * Privacy & Security Screen
 * Manage account security and privacy settings
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
    Platform,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function PrivacySecurityScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Privacy toggles
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [activityLog, setActivityLog] = useState(true);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            await ApiService.changePassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password changed successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        setShowPasswordModal(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                    },
                },
            ]);
        } catch (error: any) {
            console.error('Password change error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordModal = () => {
        if (!showPasswordModal) return null;

        return (
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Change Password</Text>
                        <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                            <Ionicons name="close" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>Current Password</Text>
                            <View style={[styles.passwordInput, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                                <TextInput
                                    style={[styles.input, { color: Colors.textPrimary }]}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor={Colors.textTertiary}
                                />
                                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    <Ionicons
                                        name={showCurrentPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={Colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>New Password</Text>
                            <View style={[styles.passwordInput, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                                <TextInput
                                    style={[styles.input, { color: Colors.textPrimary }]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor={Colors.textTertiary}
                                />
                                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={Colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>Confirm New Password</Text>
                            <View style={[styles.passwordInput, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                                <TextInput
                                    style={[styles.input, { color: Colors.textPrimary }]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={Colors.textTertiary}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={Colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.changeButton, { backgroundColor: Colors.primary }]}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.changeButtonText}>Change Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]} edges={['top']}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Security Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Account Security</Text>

                    <TouchableOpacity
                        style={[styles.settingCard, { backgroundColor: Colors.card }]}
                        onPress={() => setShowPasswordModal(true)}
                    >
                        <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1e3a8a' : Colors.bgLightBlue }]}>
                            <Ionicons name="key" size={17} color={Colors.blue} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Change Password</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Update your account password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>

                    <View style={[styles.settingCard, { backgroundColor: Colors.card }]}>
                        <View style={[styles.settingIcon, { backgroundColor: isDark ? '#064e3b' : Colors.bgLightGreen }]}>
                            <Ionicons name="finger-print" size={17} color={Colors.paymentGreen} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Biometric Authentication</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Use fingerprint or face ID</Text>
                        </View>
                        <Switch
                            value={biometricAuth}
                            onValueChange={setBiometricAuth}
                            trackColor={{ false: Colors.borderLight, true: Colors.primary }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={[styles.settingCard, { backgroundColor: Colors.card }]}>
                        <View style={[styles.settingIcon, { backgroundColor: isDark ? '#7c2d12' : Colors.bgLightOrange }]}>
                            <Ionicons name="shield-checkmark" size={17} color={Colors.orange} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Two-Factor Authentication</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Extra security for your account</Text>
                        </View>
                        <Switch
                            value={twoFactorAuth}
                            onValueChange={setTwoFactorAuth}
                            trackColor={{ false: Colors.borderLight, true: Colors.primary }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Privacy</Text>

                    <View style={[styles.settingCard, { backgroundColor: Colors.card }]}>
                        <View style={[styles.settingIcon, { backgroundColor: isDark ? '#831843' : 'rgba(236, 72, 153, 0.15)' }]}>
                            <Ionicons name="eye" size={17} color={isDark ? '#f9a8d4' : '#ec4899'} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Activity Log</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Track all account activities</Text>
                        </View>
                        <Switch
                            value={activityLog}
                            onValueChange={setActivityLog}
                            trackColor={{ false: Colors.borderLight, true: Colors.primary }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.settingCard, { backgroundColor: Colors.card }]}
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                        <View style={[styles.settingIcon, { backgroundColor: isDark ? '#312e81' : 'rgba(99, 102, 241, 0.15)' }]}>
                            <Ionicons name="document-text" size={17} color={isDark ? '#a5b4fc' : '#6366f1'} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Privacy Policy</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Read our privacy policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.settingCard, { backgroundColor: Colors.card }]}
                        onPress={() => navigation.navigate('TermsOfService')}
                    >
                        <View style={[styles.settingIcon, { backgroundColor: isDark ? '#064e3b' : 'rgba(20, 184, 166, 0.15)' }]}>
                            <Ionicons name="document" size={17} color={isDark ? '#5eead4' : '#14b8a6'} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Terms of Service</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Read our terms</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                {/* Data Management Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Data Management</Text>

                    <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]}>
                        <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1e3a8a' : Colors.bgLightBlue }]}>
                            <Ionicons name="download" size={17} color={Colors.blue} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Download Your Data</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Export all your data</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingCard, { backgroundColor: Colors.card }]}
                        onPress={() => {
                            Alert.alert(
                                'Delete Account',
                                'This action cannot be undone. All your data will be permanently deleted.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive' },
                                ]
                            );
                        }}
                    >
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                            <Ionicons name="trash" size={17} color={Colors.creditRed} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.settingText, { color: Colors.creditRed }]}>Delete Account</Text>
                            <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Permanently delete your account</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Password Change Modal */}
            {renderPasswordModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.fontBase,
        fontFamily: Typography.fonts.semiBold,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
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
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    menuContent: {
        flex: 1,
    },
    settingText: {
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.medium,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: Typography.fontXs,
        fontFamily: Typography.fonts.regular,
    },
    // Modal styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        borderRadius: BorderRadius.lg,
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: Typography.fontLg,
        fontFamily: Typography.fonts.semiBold,
    },
    modalBody: {
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.medium,
        marginBottom: Spacing.xs,
    },
    passwordInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.regular,
    },
    changeButton: {
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    changeButtonText: {
        color: '#fff',
        fontSize: Typography.fontSm,
        fontFamily: Typography.fonts.semiBold,
    },
});
