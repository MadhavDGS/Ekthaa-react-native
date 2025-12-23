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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';
import { AvatarSizes, IconSizes, TextScale, SpacingScale } from '../../constants/scales';
import { getThemedColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

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
      // Only fetch if data is stale (5+ minutes old) or doesn't exist
      if (!products.length || now - lastFetch > fiveMinutes) {
        loadProducts();
      }
    }, [products.length, lastFetch])
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
      filtered = filtered.filter(p => p.category === selectedCategory);
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
      // Update product stock via API
      await ApiService.updateProduct(product.id, {
        ...product,
        stock_quantity: newQuantity
      });
      
      // Reload products to reflect changes
      loadProducts();
    } catch (error) {
      console.error('❌ Failed to update stock:', error);
    }
  };

  const handleProductEdit = (product: any) => {
    // Navigate to edit product screen (if you have one)
    // For now, just log
    console.log('Edit product:', product.name);
    // TODO: navigation.navigate('EditProduct', { productId: product.id });
  };

  const renderProduct = ({ item }: any) => {
    const isLowStock = item.stock_quantity <= (item.low_stock_threshold || 5);
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
        onPress={() => handleProductEdit(item)}
        activeOpacity={0.7}
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
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item, -1);
              }}
            >
              <Ionicons name="remove" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: Colors.textPrimary }]}>{item.stock_quantity}</Text>
            <TouchableOpacity 
              style={[styles.quantityButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item, 1);
              }}
            >
              <Ionicons name="add" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      {/* Stats Header */}
      <View style={[styles.statsHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
        <View style={[styles.statBox, { backgroundColor: isDark ? '#4c1d95' : '#faf5ff', borderColor: Colors.primary + '20' }]}>
          <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Inventory Value</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{formatCurrency(stats.totalValue)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: isDark ? '#7f1d1d' : '#fef2f2', borderColor: Colors.creditRed + '20' }]}>
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.fontLg,
    fontWeight: '800',
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
    fontWeight: '500',
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
    fontWeight: '600',
  },
  categoryChipTextActive: {
    fontWeight: '700',
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
  productName: {
    fontSize: Typography.fontBase,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.fontXs,
    fontWeight: '400',
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
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  unitText: {
    fontSize: Typography.fontXs,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: Typography.fontLg,
    fontWeight: '900',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
