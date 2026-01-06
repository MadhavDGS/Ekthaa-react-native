import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getThemedColors } from '../constants/theme';

interface EditModalProps {
  visible: boolean;
  title: string;
  message?: string;
  initialValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  isDark: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}

export const EditModal: React.FC<EditModalProps> = ({
  visible,
  title,
  message,
  initialValue,
  onConfirm,
  onCancel,
  isDark,
  placeholder,
  keyboardType = 'default',
}) => {
  const [value, setValue] = useState(initialValue);
  const Colors = getThemedColors(isDark);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, visible]);

  const handleConfirm = () => {
    onConfirm(value);
    setValue('');
  };

  const handleCancel = () => {
    onCancel();
    setValue('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modal, { backgroundColor: Colors.card }]}>
            <Text style={[styles.title, { color: Colors.textPrimary }]}>{title}</Text>
            {message && (
              <Text style={[styles.message, { color: Colors.textSecondary }]}>
                {message}
              </Text>
            )}

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors.background,
                  color: Colors.textPrimary,
                  borderColor: Colors.borderLight,
                },
              ]}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={Colors.textSecondary}
              keyboardType={keyboardType}
              autoFocus
              selectTextOnFocus
            />

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: Colors.borderLight }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: Colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: Colors.primary }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, { color: '#fff' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
