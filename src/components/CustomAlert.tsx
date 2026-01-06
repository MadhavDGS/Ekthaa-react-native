/**
 * Custom Alert Component - Consistent Design Across iOS & Android
 * Replaces native Alert with beautiful, themed dialogs
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AwesomeAlert from 'react-native-awesome-alerts';
import { getThemedColors } from '../constants/theme';

interface CustomAlertProps {
  show: boolean;
  title?: string;
  message?: string;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirmPressed?: () => void;
  onCancelPressed?: () => void;
  onDismiss?: () => void;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isDark?: boolean;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  show,
  title = 'Alert',
  message = '',
  showConfirmButton = true,
  showCancelButton = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirmPressed,
  onCancelPressed,
  onDismiss,
  confirmButtonColor,
  cancelButtonColor,
  type = 'info',
  isDark = false,
}) => {
  const Colors = getThemedColors(isDark);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return Colors.primary;
    }
  };

  return (
    <AwesomeAlert
      show={show}
      showProgress={false}
      title={title}
      message={message}
      closeOnTouchOutside={true}
      closeOnHardwareBackPress={true}
      showCancelButton={showCancelButton}
      showConfirmButton={showConfirmButton}
      cancelText={cancelText}
      confirmText={confirmText}
      confirmButtonColor={confirmButtonColor || Colors.primary}
      cancelButtonColor={cancelButtonColor || Colors.textSecondary}
      onCancelPressed={onCancelPressed || onDismiss}
      onConfirmPressed={onConfirmPressed || onDismiss}
      onDismiss={onDismiss}
      contentContainerStyle={{
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
      }}
      titleStyle={{
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
      }}
      messageStyle={{
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
      }}
      confirmButtonStyle={{
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 100,
      }}
      confirmButtonTextStyle={{
        fontSize: 16,
        fontWeight: '600',
      }}
      cancelButtonStyle={{
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 100,
        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      }}
      cancelButtonTextStyle={{
        fontSize: 16,
        fontWeight: '600',
      }}
      overlayStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      useNativeDriver={true}
      customView={
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Ionicons 
            name={getIconName()} 
            size={56} 
            color={getIconColor()} 
          />
        </View>
      }
    />
  );
};

export default CustomAlert;
