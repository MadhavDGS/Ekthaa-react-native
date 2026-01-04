/**
 * Products Screen - Native Inventory UI
 * Beautiful product catalog with categories
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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';
import { AvatarSizes, IconSizes, TextScale, SpacingScale } from '../../constants/scales';
import { getThemedColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonCard } from '../../components/Skeletons';

export default function ProductsScreen({ navigation }: any) {
  const { isDark } = useTheme();
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
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getProducts();
      console.log('📋 Products loaded:', data.products?.length || 0);
      setProducts(data.products || []);
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      // Case-insensitive category comparison
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

      // Update product stock via API in background
      await ApiService.updateProduct(product.id, {
        ...product,
        stock_quantity: newQuantity
      });
    } catch (error) {
      console.error('❌ Failed to update stock:', error);
      Alert.alert('Error', 'Failed to update stock quantity. Please try again.');
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
              Alert.alert('Success', 'Product deleted successfully');
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
    // Show options for editing
    Alert.alert(
      'Edit Product',
      `What would you like to edit for "${product.name}"?`,
      [
        {
          text: 'Edit Description',
          onPress: () => editDescription(product)
        },
        {
          text: 'Edit Price',
          onPress: () => editPrice(product)
        },
        {
          text: 'Edit Stock Threshold',
          onPress: () => editStockThreshold(product)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const editDescription = (product: any) => {
    Alert.prompt(
      'Edit Description',
      `Enter new description for ${product.name}`,
      async (newDescription) => {
        if (newDescription !== undefined && newDescription !== product.description) {
          try {
            await ApiService.updateProduct(product.id, {
              ...product,
              description: newDescription
            });
            Alert.alert('Success', 'Description updated successfully');
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
        if (newPrice !== undefined) {
          const priceNum = parseFloat(newPrice);
          if (isNaN(priceNum) || priceNum < 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
          }
          try {
            await ApiService.updateProduct(product.id, {
              ...product,
              price: priceNum
            });
            Alert.alert('Success', 'Price updated successfully');
            loadProducts();
          } catch (error) {
            console.error('❌ Failed to update price:', error);
            Alert.alert('Error', 'Failed to update price');
          }
        }
      },
      'plain-text',
      product.price.toString()
    );
  };

  const editStockThreshold = (product: any) => {
    Alert.prompt(
      'Edit Low Stock Threshold',
      `Alert when stock falls below this number for ${product.name}`,
      async (newThreshold) => {
        if (newThreshold !== undefined) {
          const thresholdNum = parseInt(newThreshold);
          if (isNaN(thresholdNum) || thresholdNum < 0) {
            Alert.alert('Error', 'Please enter a valid number');
            return;
          }
          try {
            await ApiService.updateProduct(product.id, {
              ...product,
              low_stock_threshold: thresholdNum
            });
            Alert.alert('Success', 'Stock threshold updated successfully');
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

          {item.product_image_url && (
            <View style={styles.productRight}>
              <Image
                source={{ uri: item.product_image_url }}
                style={[styles.productImage, { borderColor: Colors.borderLight }]}
                resizeMode="cover"
              />
            </View>
          )}
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
      <Ionicons name="cube-outline" size={64} color={Colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Products</Text>
      <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
        {searchQuery ? 'No products match your search' : 'Add products to your inventory'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.primary }]}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Add Product</Text>
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
        <View style={[styles.statBox, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '30' }]}>
          <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Inventory Value</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{formatCurrency(stats.totalValue)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: Colors.creditRed + '15', borderColor: Colors.creditRed + '30' }]}>
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
        style={[styles.fab, { backgroundColor: Colors.primary, ...Platform.select({ ios: { shadowColor: Colors.primary }, android: {} }) }]}
        onPress={() => navigation.navigate('AddProduct')}
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
    borderWidth: 1,
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
    height: 32,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontXs,
    marginLeft: Spacing.xs,
    fontFamily: Typography.fonts.medium,
    height: 32,
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
    borderWidth: 1,
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
    borderWidth: 1,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
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
    borderWidth: 1,
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
    bottom: Platform.OS === 'ios' ? 86 : 70,
    width: IconSizes.xlarge + 10,
    height: IconSizes.xlarge + 10,
    borderRadius: (IconSizes.xlarge + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
