/**
 * Inventory Screen - Internal Stock Management
 * Manage stock levels, HSN codes, low stock alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService from '../../services/api';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';
import { AvatarSizes, IconSizes, TextScale, SpacingScale } from '../../constants/scales';
import { getThemedColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonCard } from '../../components/Skeletons';
import Illustration from '../../components/Illustration';

// Fallback placeholder image (Credit: rawpixel.com / Freepik)
const PRODUCT_PLACEHOLDER = require('../../../assets/product-placeholder.jpg');

// Category-based placeholder images from free sources (Unsplash/Pexels)
const CATEGORY_PLACEHOLDERS: { [key: string]: string } = {
  // Food & Grocery
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'sugar': 'https://images.unsplash.com/photo-1563450392-1ebb936e4a57?w=400&q=80',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'flour': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'atta': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'wheat': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'salt': 'https://images.unsplash.com/photo-1599909533730-b5d81e4e2f2c?w=400&q=80',
  'spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'dal': 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400&q=80',
  'pulses': 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400&q=80',
  'lentils': 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400&q=80',
  'tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  'coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
  'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  'cookies': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80',
  'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
  'namkeen': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80',
  'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  'fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  'eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
  'meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
  'chicken': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80',
  'fish': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
  // Beverages
  'juice': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
  'water': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80',
  'soda': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
  'drinks': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
  // Personal Care
  'soap': 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&q=80',
  'shampoo': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80',
  'toothpaste': 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&q=80',
  'cream': 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&q=80',
  // Household
  'detergent': 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400&q=80',
  'cleaner': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
  // Categories
  'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
  'beverages': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
  'dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'personal care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
  'household': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  'clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
  'stationery': 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80',
  'toys': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80',
  'medicine': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
  'health': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
};

// Get placeholder image based on product name, category, or type
const getProductPlaceholder = (product: any): { uri: string } | number => {
  // First check if product has its own image
  if (product.product_image_url && product.product_image_url.length > 0) {
    return { uri: product.product_image_url };
  }
  
  // Try to match product name with category placeholders
  const productName = (product.name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const productType = (product.type || '').toLowerCase();
  
  // Check product name first (most specific)
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (productName.includes(key)) {
      return { uri: url };
    }
  }
  
  // Check category
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (productCategory.includes(key) || key.includes(productCategory)) {
      return { uri: url };
    }
  }
  
  // Check type
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (productType.includes(key) || key.includes(productType)) {
      return { uri: url };
    }
  }
  
  // Fallback to local placeholder (Credit: rawpixel.com / Freepik)
  return PRODUCT_PLACEHOLDER;
};

export default function InventoryScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const Colors = getThemedColors(isDark);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalValue: 0, lowStock: 0 });
  const [lastFetch, setLastFetch] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      // Only fetch if data is stale (5+ minutes old) or hasn't been fetched yet
      if (lastFetch === 0 || now - lastFetch > fiveMinutes) {
        loadProducts();
      }
    }, [lastFetch])
  );

  useEffect(() => {
    console.log('⚡ useEffect triggered - products length:', products.length, 'searchQuery:', searchQuery, 'category:', selectedCategory);
    if (products.length > 0) {
      filterProducts();
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Load cached products first for instant display
      const cached = await AsyncStorage.getItem('products_cache');
      if (cached && products.length === 0) {
        const cachedData = JSON.parse(cached);
        console.log('📋 Loaded cached products:', cachedData.length);
        setProducts(cachedData);
        
        // Calculate stats from cache
        const uniqueCategories = ['All', ...new Set(cachedData.map((p: any) => p.category))];
        setCategories(uniqueCategories as string[]);
        const totalValue = cachedData.reduce((sum: number, p: any) => sum + (p.price * p.stock_quantity), 0);
        const lowStock = cachedData.filter((p: any) => p.stock_quantity < 10).length;
        setStats({ total: cachedData.length, totalValue, lowStock });
        
        setLoading(false); // Show cached data immediately
      }
      
      console.log('📋 Loading fresh products...');
      const data = await ApiService.getProducts();
      console.log('📋 Products loaded:', data.products?.length || 0);
      
      if (!data.products || data.products.length === 0) {
        console.warn('⚠️ No products in response');
        setProducts([]);
        setFilteredProducts([]);
      } else {
        console.log('✅ Setting products state with', data.products.length, 'items');
        const productsArray = [...data.products];
        setProducts(productsArray);
        
        // Cache products
        await AsyncStorage.setItem('products_cache', JSON.stringify(productsArray));
        
        // Filter products immediately after setting them
        console.log('🔍 Filtering products immediately - Total:', productsArray.length);
        let filtered = productsArray;
        if (selectedCategory !== 'All') {
          filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (searchQuery.trim()) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        console.log('🔍 Immediate filter result:', filtered.length);
        setFilteredProducts(filtered);
      }
      
      setLastFetch(Date.now());

      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(data.products?.map((p: any) => p.category) || [])];
      setCategories(uniqueCategories as string[]);

      // Calculate stats
      const totalValue = data.products?.reduce((sum: number, p: any) => sum + (p.price * p.stock_quantity), 0) || 0;
      const lowStock = data.products?.filter((p: any) => p.stock_quantity <= (p.low_stock_threshold || 5)).length || 0;
      console.log('📊 Stats calculated - Inventory Value:', totalValue, 'Low Stock:', lowStock);
      setStats({ totalValue, lowStock });
    } catch (error) {
      console.error('❌ Load products error:', error);
      Alert.alert('Error', 'Failed to load products. Please check your connection.', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProducts = () => {
    console.log('🔍 Filtering products - Total:', products.length, 'Category:', selectedCategory, 'Search:', searchQuery);
    let filtered = products;

    if (selectedCategory !== 'All') {
      // Case-insensitive category comparison
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      console.log('🔍 After category filter:', filtered.length);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('🔍 After search filter:', filtered.length);
    }

    console.log('🔍 Final filtered products:', filtered.length);
    setFilteredProducts(filtered);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  const handleQuantityChange = async (product: any, change: number) => {
    const newQuantity = product.stock_quantity + change;

    // Don't allow negative quantities
    if (newQuantity < 0) {
      return;
    }

    try {
      // Optimistically update UI first
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, stock_quantity: newQuantity } : p
      );
      setProducts(updatedProducts);

      // Update product stock via API - only send the stock_quantity field
      await ApiService.updateProduct(product.id, {
        stock_quantity: newQuantity
      });
    } catch (error: any) {
      console.error('❌ Failed to update stock:', error);
      console.error('❌ Error details:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Failed to update stock quantity. Please try again.';
      Alert.alert('Error', errorMessage);
      // Revert on error
      loadProducts();
    }
  };

  const handleDeleteProduct = (product: any) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteProduct(product.id);
              loadProducts();
            } catch (error) {
              console.error('❌ Failed to delete product:', error);
              Alert.alert('Error', 'Failed to delete product. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleProductEdit = (product: any) => {
    Alert.alert(
      'Edit Product',
      `What would you like to edit for "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit Description', onPress: () => editDescription(product) },
        { text: 'Edit Price', onPress: () => editPrice(product) },
        { text: 'Edit Stock Threshold', onPress: () => editStockThreshold(product) },
      ]
    );
  };

  const editDescription = (product: any) => {
    Alert.prompt(
      'Edit Description',
      `Enter new description for ${product.name}`,
      async (newDescription) => {
        if (newDescription && newDescription !== product.description) {
          try {
            await ApiService.updateProduct(product.id, {
              description: newDescription
            });
            loadProducts();
          } catch (error) {
            console.error('❌ Failed to update description:', error);
            Alert.alert('Error', 'Failed to update description');
          }
        }
      },
      'plain-text',
      product.description || ''
    );
  };

  const editPrice = (product: any) => {
    Alert.prompt(
      'Edit Price',
      `Enter new price for ${product.name} (per ${product.unit})`,
      async (newPrice) => {
        if (newPrice) {
          const priceNum = parseFloat(newPrice);
          if (isNaN(priceNum) || priceNum < 0) {
            Alert.alert('Invalid Price', 'Please enter a valid price');
            return;
          }
          try {
            await ApiService.updateProduct(product.id, {
              price: priceNum
            });
            loadProducts();
          } catch (error) {
            console.error('❌ Failed to update price:', error);
            Alert.alert('Error', 'Failed to update price');
          }
        }
      },
      'plain-text',
      product.price?.toString() || ''
    );
  };

  const editStockThreshold = (product: any) => {
    Alert.prompt(
      'Edit Low Stock Threshold',
      `Alert when stock falls below this number for ${product.name}`,
      async (newThreshold) => {
        if (newThreshold) {
          const thresholdNum = parseInt(newThreshold);
          if (isNaN(thresholdNum) || thresholdNum < 0) {
            Alert.alert('Invalid Input', 'Please enter a valid number');
            return;
          }
          try {
            await ApiService.updateProduct(product.id, {
              low_stock_threshold: thresholdNum
            });
            loadProducts();
          } catch (error) {
            console.error('❌ Failed to update threshold:', error);
            Alert.alert('Error', 'Failed to update threshold');
          }
        }
      },
      'plain-text',
      (product.low_stock_threshold || 5).toString()
    );
  };

  const renderProduct = ({ item }: any) => {
    const isLowStock = item.stock_quantity <= (item.low_stock_threshold || 5);

    return (
      <View
        style={[styles.productCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
      >
        <View style={styles.cardMain}>
          <View style={styles.productContent}>
            <View style={styles.contentHeader}>
              <View style={[styles.productIconSmall, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
                <Ionicons name={getCategoryIcon(item.category)} size={18} color={getCategoryColor(item.category)} />
              </View>
              <View style={styles.headerTexts}>
                <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.categoryText, { color: Colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
              </View>
              {/* Edit and Delete Actions */}
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.backgroundSecondary }]}
                  onPress={() => handleProductEdit(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.backgroundSecondary }]}
                  onPress={() => handleDeleteProduct(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.creditRed} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.productPrice, { color: Colors.primary }]}>{formatCurrency(item.price)}</Text>
              <Text style={[styles.unitText, { color: Colors.textTertiary }]}>/{item.unit}</Text>
            </View>

            <View style={styles.stockRow}>
              <Ionicons name="cube-outline" size={14} color={isLowStock ? Colors.creditRed : Colors.creditGreen} />
              <Text style={[styles.stockText, { color: isLowStock ? Colors.creditRed : Colors.creditGreen }]}>
                {item.stock_quantity} in stock
              </Text>
              {isLowStock && <Ionicons name="alert-circle" size={14} color={Colors.creditRed} style={{ marginLeft: Spacing.xs }} />}
            </View>
          </View>

          {/* Product Image - use smart placeholder based on category/name */}
          <View style={styles.productRight}>
            <Image
              source={getProductPlaceholder(item)}
              style={[styles.productImage, { borderColor: Colors.borderLight }]}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={[styles.quantityControls, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
          <View style={styles.quantityLabel}>
            <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
            <Text style={[styles.quantityLabelText, { color: Colors.textSecondary }]}>Adjust Stock</Text>
          </View>
          <View style={styles.quantityButtons}>
            <TouchableOpacity
              style={[styles.quantityButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={() => handleQuantityChange(item, -1)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: Colors.textPrimary }]}>{item.stock_quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={() => handleQuantityChange(item, 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      'Food & Groceries': 'fast-food',
      'Beverages': 'water',
      'Personal Care': 'body',
      'Electronics': 'phone-portrait',
      'Clothing & Textiles': 'shirt',
    };
    return icons[category] || 'cube';
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      'Food & Groceries': '#10b981',
      'Beverages': '#3b82f6',
      'Personal Care': '#ec4899',
      'Electronics': '#8b5cf6',
      'Clothing & Textiles': '#f59e0b',
    };
    return colors[category] || Colors.primary;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Illustration name="noData" width={200} height={200} />
      <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Products</Text>
      <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
        {searchQuery ? 'No products match your search' : 'Add products to your inventory'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.primary }]}
          onPress={() => navigation.navigate('AddInventoryItem')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Add Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
        <View style={[styles.statsHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', height: 60, borderRadius: 8 }]} />
          <View style={[styles.statBox, { backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', height: 60, borderRadius: 8 }]} />
        </View>
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      {/* Stats Header */}
      <View style={[styles.statsHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
        <View style={[styles.statBox, styles.statBoxLarge, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '30' }]}>
          <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Inventory Value</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{formatCurrency(stats.totalValue)}</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxSmall, { backgroundColor: Colors.creditRed + '15', borderColor: Colors.creditRed + '30' }]}>
          <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Low Stock Items</Text>
          <Text style={[styles.statValue, { color: Colors.creditRed }]}>{stats.lowStock}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}>
          <Ionicons name="search" size={14} color={Colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: Colors.textPrimary }]}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                { backgroundColor: Colors.backgroundSecondary, borderColor: 'transparent' },
                selectedCategory === category && { ...styles.categoryChipActive, backgroundColor: Colors.primary, borderColor: Colors.primary, ...Platform.select({ ios: { shadowColor: Colors.primary }, android: {} }) }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                { color: selectedCategory === category ? '#fff' : Colors.textPrimary },
                selectedCategory === category && styles.categoryChipTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadProducts(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: Colors.primary,
            bottom: Platform.OS === 'ios' ? 20 : 16 + Math.max(insets.bottom, 0),
          }
        ]}
        onPress={() => navigation.navigate('AddInventoryItem')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={27} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statBoxLarge: {
    flex: 3,
  },
  statBoxSmall: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSm,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.fontLg,
    fontFamily: Typography.fonts.extraBold,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    height: 40,
    paddingVertical: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSm,
    marginLeft: Spacing.xs,
    fontFamily: Typography.fonts.medium,
    height: '100%',
    paddingVertical: 0,
  },
  categoriesWrapper: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.xs,
    borderWidth: 1,
  },
  categoryChipActive: {
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  categoryChipText: {
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.semiBold,
  },
  categoryChipTextActive: {
    fontFamily: Typography.fonts.bold,
  },
  listContent: {
    padding: Spacing.sm,
    paddingBottom: 95,
  },
  productCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardMain: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  productContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  productIconSmall: {
    width: IconSizes.large,
    height: IconSizes.large,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerTexts: {
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.regular,
  },
  productRight: {
    marginLeft: Spacing.sm,
  },
  productImage: {
    width: 80,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  categoryBadgeText: {
    fontSize: Typography.font3xs,
    fontFamily: Typography.fonts.extraBold,
    letterSpacing: 0.8,
  },
  unitText: {
    fontSize: Typography.fontXs,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fonts.medium,
  },
  productPrice: {
    fontSize: Typography.fontLg,
    fontFamily: Typography.fonts.extraBold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stockText: {
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.semiBold,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  quantityLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quantityLabelText: {
    fontSize: Typography.font3xs,
    fontFamily: Typography.fonts.semiBold,
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quantityButton: {
    width: IconSizes.large,
    height: IconSizes.large,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  quantityText: {
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.bold,
    minWidth: 32,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.semiBold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.font3xs,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.semiBold,
  },
  fab: {
    position: 'absolute',
    right: 16,
    // bottom set dynamically in component
    width: IconSizes.xlarge + 10,
    height: IconSizes.xlarge + 10,
    borderRadius: (IconSizes.xlarge + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
