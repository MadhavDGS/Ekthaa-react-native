/**
 * Ekthaa Business - Native React Native App
 * Beautiful native mobile experience with dark mode support
 */

import React, { useEffect, useState } from 'react';
import { Platform, UIManager, ActivityIndicator, View, AppState, StyleSheet, Animated } from 'react-native';

// Enable hardware acceleration on Android for better performance on MediaTek/Snapdragon
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Context
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import BusinessDetailsScreen from './src/screens/Auth/BusinessDetailsScreen';
import OnboardingScreen from './src/screens/Auth/OnboardingScreen';
import HomeScreen from './src/screens/Dashboard/HomeScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import KhataScreen from './src/screens/Dashboard/KhataScreen';
import CustomersScreen from './src/screens/Customers/CustomersScreen';
import CustomerDetailsScreen from './src/screens/Customers/CustomerDetailsScreen';
import AddCustomerScreen from './src/screens/Customers/AddCustomerScreen';
import ProductsScreen from './src/screens/Products/ProductsScreen';
import AddCatalogItemScreen from './src/screens/Products/AddCatalogItemScreen';
import InventoryScreen from './src/screens/Inventory/InventoryScreen';
import AddInventoryItemScreen from './src/screens/Inventory/AddInventoryItemScreen';
import AddInventoryLiteScreen from './src/screens/Inventory/AddInventoryLiteScreen';
import TransactionsScreen from './src/screens/Transactions/TransactionsScreen';
import AddTransactionScreen from './src/screens/Transactions/AddTransactionScreen';
import InvoiceGeneratorScreen from './src/screens/Invoice/InvoiceGeneratorScreen';
import InvoicePreviewScreen from './src/screens/Invoice/InvoicePreviewScreen';
import QRCodeScreen from './src/screens/Business/QRCodeScreen';
import OffersScreen from './src/screens/Business/OffersScreen';
import AddOfferScreen from './src/screens/Business/AddOfferScreen';
import AddShopPhotosScreen from './src/screens/Business/AddShopPhotosScreen';
import AnalyticsScreen from './src/screens/Business/AnalyticsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import CompleteProfileScreen from './src/screens/profile/CompleteProfileScreen';
import PreviewBusinessScreen from './src/screens/profile/PreviewBusinessScreen';
import PrivacySecurityScreen from './src/screens/profile/PrivacySecurityScreen';
import PrivacyPolicyScreen from './src/screens/profile/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/profile/TermsOfServiceScreen';
import { TouchableOpacity, Text } from 'react-native';

// Theme
import { getThemedColors, LightColors, DarkColors } from './src/constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Component - Clean Modern Design
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const insets = useSafeAreaInsets();

  // Icon configuration with unique SF Symbols style icons
  const getTabConfig = (routeName: string, isFocused: boolean) => {
    const configs: { [key: string]: { icon: string; label: string } } = {
      'Khata': { 
        icon: isFocused ? 'wallet' : 'wallet-outline',
        label: 'Khata'
      },
      'Inventory': { 
        icon: isFocused ? 'layers' : 'layers-outline',
        label: 'Stock'
      },
      'Home': { 
        icon: isFocused ? 'grid' : 'grid-outline',
        label: 'Home'
      },
      'Customers': { 
        icon: isFocused ? 'person-circle' : 'person-circle-outline',
        label: 'Customers'
      },
      'Invoice': { 
        icon: isFocused ? 'document-text' : 'document-text-outline',
        label: 'Invoice'
      },
    };
    return configs[routeName] || { icon: 'ellipse-outline', label: routeName };
  };

  return (
    <View style={[
      tabBarStyles.container,
      {
        paddingBottom: Math.max(insets.bottom, 4),
        backgroundColor: Colors.card,
        borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      }
    ]}>
      <View style={tabBarStyles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const { icon, label } = getTabConfig(route.name, isFocused);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={tabBarStyles.tab}
              activeOpacity={0.6}
            >
              <View style={[
                tabBarStyles.iconWrapper,
                isFocused && [tabBarStyles.iconWrapperActive, { backgroundColor: Colors.primary + '15' }]
              ]}>
                <Ionicons 
                  name={icon as any}
                  size={24} 
                  color={isFocused ? Colors.primary : Colors.textTertiary} 
                />
              </View>
              <Text style={[
                tabBarStyles.label,
                { color: isFocused ? Colors.primary : Colors.textTertiary },
                isFocused && tabBarStyles.labelActive
              ]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  iconWrapper: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginBottom: 2,
  },
  iconWrapperActive: {
    // backgroundColor set dynamically
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: '600',
  },
});

// Bottom Tab Navigator with custom tab bar
function MainTabs() {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
          letterSpacing: 0.5,
        },
        headerLeft: () => (
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginLeft: 13, letterSpacing: 0.5 }}>
            Ekthaa
          </Text>
        ),
        headerTitle: '',
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
            style={{ marginRight: 13 }}
          >
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen 
        name="Khata" 
        component={KhataScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Customers"
        component={CustomersScreen}
        options={{ title: 'Customers' }}
      />
      <Tab.Screen 
        name="Invoice" 
        component={InvoiceGeneratorScreen}
      />
    </Tab.Navigator>
  );
}

// Fonts
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

function AppContent() {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // React Navigation theme
  const navigationTheme = isDark
    ? {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: DarkColors.primary,
        background: DarkColors.background,
        card: DarkColors.card,
        text: DarkColors.textPrimary,
        border: DarkColors.borderLight,
      },
    }
    : {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: LightColors.primary,
        background: LightColors.background,
        card: LightColors.card,
        text: LightColors.textPrimary,
        border: LightColors.borderLight,
      },
    };

  useEffect(() => {
    checkAuth();

    // Listen for app state changes to re-check auth
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuth();
      }
    });

    // Poll auth state more frequently to detect login
    const authCheckInterval = setInterval(() => {
      checkAuth();
    }, 500); // Check every 500ms

    return () => {
      subscription.remove();
      clearInterval(authCheckInterval);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer 
      theme={navigationTheme}
      onStateChange={() => {
        // Re-check auth on navigation state change
        // This ensures auth is checked after login/register completes
        checkAuth();
      }}
    >
      <StatusBar 
        style={isDark ? 'light' : 'light'} 
        backgroundColor="#5A9A8E"
        translucent={false}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
          },
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BusinessDetails"
              component={BusinessDetailsScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CustomerDetails"
              component={CustomerDetailsScreen}
              options={{ headerTitle: 'Customer Details' }}
            />
            <Stack.Screen
              name="AddCustomer"
              component={AddCustomerScreen}
              options={{ headerTitle: 'Add Customer' }}
            />
            <Stack.Screen
              name="Products"
              component={ProductsScreen}
              options={{ headerTitle: 'My Products' }}
            />
            <Stack.Screen
              name="AddCatalogItem"
              component={AddCatalogItemScreen}
              options={{ headerTitle: 'Add Product' }}
            />
            <Stack.Screen
              name="Inventory"
              component={InventoryScreen}
              options={{ headerTitle: 'Inventory' }}
            />
            <Stack.Screen
              name="AddInventoryItem"
              component={AddInventoryItemScreen}
              options={{ headerTitle: 'Add Inventory Item' }}
            />
            <Stack.Screen
              name="AddInventoryLite"
              component={AddInventoryLiteScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
            />
            <Stack.Screen
              name="Transactions"
              component={TransactionsScreen}
              options={{ headerTitle: 'Transactions' }}
            />
            <Stack.Screen
              name="InvoiceGenerator"
              component={InvoiceGeneratorScreen}
              options={{ headerTitle: 'Generate Invoice' }}
            />
            <Stack.Screen
              name="InvoicePreview"
              component={InvoicePreviewScreen}
              options={{ headerTitle: 'Invoice Preview' }}
            />
            <Stack.Screen
              name="QRCode"
              component={QRCodeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerTitle: 'Profile',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerTitle: 'Edit Profile',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CompleteProfile"
              component={CompleteProfileScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PreviewBusiness"
              component={PreviewBusinessScreen}
              options={{
                headerTitle: 'Preview Business Profile',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Offers"
              component={OffersScreen}
              options={{
                headerTitle: 'Offers & Promotions',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="AddShopPhotos"
              component={AddShopPhotosScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddOffer"
              component={AddOfferScreen}
              options={{
                headerTitle: 'Add Offer',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{
                headerTitle: 'Business Analytics',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PrivacySecurity"
              component={PrivacySecurityScreen}
              options={{
                headerTitle: 'Privacy & Security',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="TermsOfService"
              component={TermsOfServiceScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
