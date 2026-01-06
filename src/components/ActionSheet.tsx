import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors } from '../constants/theme';

interface ActionOption {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  options: ActionOption[];
  onCancel: () => void;
  isDark: boolean;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  title,
  message,
  options,
  onCancel,
  isDark,
}) => {
  const Colors = getThemedColors(isDark);

  const handleOptionPress = (option: ActionOption) => {
    option.onPress();
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <View style={[styles.container, { backgroundColor: Colors.card }]}>
          {(title || message) && (
            <View style={[styles.header, { borderBottomColor: Colors.borderLight }]}>
              {title && (
                <Text style={[styles.title, { color: Colors.textPrimary }]}>{title}</Text>
              )}
              {message && (
                <Text style={[styles.message, { color: Colors.textSecondary }]}>
                  {message}
                </Text>
              )}
            </View>
          )}

          <ScrollView style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  { borderBottomColor: Colors.borderLight },
                  index === options.length - 1 && styles.lastOption,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={option.destructive ? '#FF3B30' : Colors.primary}
                    style={styles.icon}
                  />
                )}
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: option.destructive ? '#FF3B30' : Colors.textPrimary,
                    },
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: Colors.background }]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelText, { color: Colors.textPrimary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Safe area
    maxHeight: '80%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
  optionsContainer: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  icon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
