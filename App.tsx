/**
 * Ekthaa Business - Native React Native App
 * Beautiful native mobile experience with dark mode support
 */

import React, { useEffect, useState } from 'react';
import { Platform, UIManager, ActivityIndicator, View, AppState } from 'react-native';

// Enable hardware acceleration on Android for better performance on MediaTek/Snapdragon
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Context
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import BusinessDetailsScreen from './src/screens/Auth/BusinessDetailsScreen';
import OnboardingScreen from './src/screens/Auth/OnboardingScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import CustomersScreen from './src/screens/Customers/CustomersScreen';
import CustomerDetailsScreen from './src/screens/Customers/CustomerDetailsScreen';
import AddCustomerScreen from './src/screens/Customers/AddCustomerScreen';
import ProductsScreen from './src/screens/Products/ProductsScreen';
import AddProductScreen from './src/screens/Products/AddProductScreen';
import TransactionsScreen from './src/screens/Transactions/TransactionsScreen';
import AddTransactionScreen from './src/screens/Transactions/AddTransactionScreen';
import InvoiceGeneratorScreen from './src/screens/Invoice/InvoiceGeneratorScreen';
import InvoicePreviewScreen from './src/screens/Invoice/InvoicePreviewScreen';
import QRCodeScreen from './src/screens/Business/QRCodeScreen';
import OffersScreen from './src/screens/Business/OffersScreen';
import AddOfferScreen from './src/screens/Business/AddOfferScreen';
import AnalyticsScreen from './src/screens/Business/AnalyticsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import PrivacySecurityScreen from './src/screens/profile/PrivacySecurityScreen';
import PrivacyPolicyScreen from './src/screens/profile/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/profile/TermsOfServiceScreen';
import { TouchableOpacity, Text } from 'react-native';

// Theme
import { getThemedColors, LightColors, DarkColors } from './src/constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator with native styling and theme support
function MainTabs() {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);

  return (
    <Tab.Navigator
      initialRouteName="Home"
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

        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 68 : 52,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Customers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Products':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Transactions':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Offers':
              iconName = focused ? 'pricetag' : 'pricetag-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
      />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
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

    return () => {
      subscription.remove();
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
    <NavigationContainer theme={navigationTheme}>
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
              name="AddProduct"
              component={AddProductScreen}
              options={{ headerTitle: 'Add Product' }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
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
              name="Offers"
              component={OffersScreen}
              options={{
                headerTitle: 'Offers & Promotions',
                animation: 'slide_from_right',
              }}
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
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
