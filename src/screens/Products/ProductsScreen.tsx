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

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
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
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(data.products?.map((p: any) => p.category) || [])];
      setCategories(uniqueCategories as string[]);
      
      // Calculate stats
      const totalValue = data.products?.reduce((sum: number, p: any) => sum + (p.price * p.stock_quantity), 0) || 0;
      const lowStock = data.products?.filter((p: any) => p.stock_quantity <= (p.low_stock_threshold || 5)).length || 0;
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
        activeOpacity={0.95}
      >
        <View style={styles.productContent}>
          <View style={styles.contentHeader}>
            <View style={[styles.productIconSmall, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
              <Ionicons name={getCategoryIcon(item.category)} size={23} color={getCategoryColor(item.category)} />
            </View>
            <View style={styles.headerTexts}>
              <Text style={[styles.productName, { color: Colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.categoryText, { color: Colors.textSecondary }]}>{item.category}</Text>
            </View>
          </View>
          
          <View style={[styles.categoryBadge, { backgroundColor: Colors.primary }]}>
            <Text style={[styles.categoryBadgeText, { color: '#fff' }]}>{item.category.toUpperCase()}</Text>
          </View>
          
          <Text style={[styles.unitText, { color: Colors.textTertiary }]}>per {item.unit}</Text>
          
          <Text style={[styles.productPrice, { color: Colors.primary }]}>{formatCurrency(item.price)}</Text>
          
          <View style={styles.stockRow}>
            <Text style={[styles.stockText, { color: isLowStock ? Colors.creditRed : Colors.creditGreen }]}>
              {item.stock_quantity} in stock
            </Text>
            {isLowStock && <Ionicons name="warning" size={15} color={Colors.creditRed} style={{ marginLeft: Spacing.xs }} />}
          </View>
          
          <View style={[styles.quantityControls, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
            <TouchableOpacity 
              style={[styles.quantityButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item, -1);
              }}
            >
              <Ionicons name="remove" size={19} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: Colors.textPrimary }]}>{item.stock_quantity}</Text>
            <TouchableOpacity 
              style={[styles.quantityButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={(e) => {
                e.stopPropagation();
                handleQuantityChange(item, 1);
              }}
            >
              <Ionicons name="add" size={19} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {item.product_image_url && (
          <View style={styles.productRight}>
            <Image 
              source={{ uri: item.product_image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        )}
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
          <Ionicons name="pricetag-outline" size={24} color={Colors.primary} />
          <View style={styles.statInfo}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Inventory Value</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{formatCurrency(stats.totalValue)}</Text>
          </View>
        </View>
        {stats.lowStock > 0 && (
          <View style={styles.statBox}>
            <Ionicons name="alert-circle-outline" size={24} color={Colors.creditRed} />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Low Stock Items</Text>
              <Text style={[styles.statValue, { color: Colors.creditRed }]}>{stats.lowStock}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
        <View style={[styles.searchBar, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: Colors.textPrimary }]}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
    borderBottomWidth: 1,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Spacing.lg,
    borderWidth: 1,
  },
  statInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontXs,
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
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontBase,
    marginLeft: Spacing.sm,
    fontWeight: '500',
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.xs,
    borderWidth: 1.5,
  },
  categoryChipActive: {
    borderWidth: 1.5,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  categoryChipText: {
    fontSize: Typography.fontBase,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 110,
  },
  productCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
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
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerTexts: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontLg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.fontSm,
    fontWeight: '400',
  },
  productRight: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  productImage: {
    width: 86,
    height: 120,
    borderRadius: BorderRadius.sm,
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
    fontSize: Typography.fontXs,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  unitText: {
    fontSize: Typography.fontSm,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: Typography.font2xl,
    fontWeight: '900',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stockText: {
    fontSize: Typography.fontBase,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    borderWidth: 1,
  },
  quantityButton: {
    width: 38,
    height: 38,
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
    fontSize: Typography.fontLg,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: Typography.fontLg,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontBase,
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
    fontSize: Typography.fontMd,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 86 : 70,
    width: 56,
    height: 56,
    borderRadius: 28,
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
