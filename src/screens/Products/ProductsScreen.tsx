/**
 * Products Screen - Customer-Facing Catalog
 * Products visible to customers with photo, price, description
 * Can add products from Inventory
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
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService from '../../services/api';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';
import { getThemedColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonCard } from '../../components/Skeletons';
import Illustration from '../../components/Illustration';

const { width } = Dimensions.get('window');

// Fallback placeholder image (Credit: rawpixel.com / Freepik)
const PRODUCT_PLACEHOLDER = require('../../../assets/product-placeholder.jpg');

// Category-based placeholder images
const CATEGORY_PLACEHOLDERS: { [key: string]: string } = {
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'sugar': 'https://images.unsplash.com/photo-1563450392-1ebb936e4a57?w=400&q=80',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'flour': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'atta': 'https://images.unsplash.com/photo-1628548985793-27d8e2d22c48?w=400&q=80',
  'spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'dal': 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400&q=80',
  'tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  'coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
  'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80',
  'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  'fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
  'beverages': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
  'dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'personal care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
  'household': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  'clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
};

// Get placeholder image based on product name/category
// Works with both catalog items (image_url) and inventory items (product_image_url)
const getProductPlaceholder = (product: any): { uri: string } | number => {
  // Check both field names (catalog uses image_url, inventory uses product_image_url)
  const imageUrl = product.image_url || product.product_image_url;
  if (imageUrl && imageUrl.length > 0) {
    return { uri: imageUrl };
  }
  
  const productName = (product.name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (productName.includes(key) || productCategory.includes(key)) {
      return { uri: url };
    }
  }
  
  return PRODUCT_PLACEHOLDER;
};

export default function ProductsScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const Colors = getThemedColors(isDark);
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Load catalog items (customer-facing)
      const catalogData = await ApiService.getCatalog();
      setProducts(catalogData.catalog || []);
      
      // Load inventory items for the "Add from Inventory" modal
      const inventoryData = await ApiService.getProducts();
      setInventoryItems(inventoryData.products || []);
    } catch (error) {
      console.error('❌ Load products error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  };

  const formatCurrency = (amount: number) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  const handleToggleVisibility = async (product: any) => {
    try {
      await ApiService.toggleCatalogVisibility(product.id);
      loadProducts();
    } catch (error) {
      console.error('❌ Failed to update visibility:', error);
      Alert.alert('Error', 'Failed to update product visibility');
    }
  };

  const handleRemoveFromCatalog = (product: any) => {
    Alert.alert(
      'Remove from Catalog',
      `Remove "${product.name}" from customer catalog? It will still be in your inventory.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          onPress: async () => {
            try {
              await ApiService.updateCatalogItem(product.id, { is_visible: false });
              loadProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to hide product');
            }
          }
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteCatalogItem(product.id);
              loadProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove product');
            }
          }
        }
      ]
    );
  };

  const handleAddFromInventory = () => {
    setSelectedItems(new Set());
    setShowInventoryModal(true);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const confirmAddFromInventory = async () => {
    try {
      // Add selected inventory items to catalog
      const result = await ApiService.addCatalogFromInventory(Array.from(selectedItems));
      setShowInventoryModal(false);
      loadProducts();
      
      if (result.errors && result.errors.length > 0) {
        Alert.alert(
          'Partially Added',
          `Added ${result.added_items?.length || 0} item(s). Some items had issues:\n${result.errors.join('\n')}`
        );
      } else {
        Alert.alert('Success', `${result.added_items?.length || selectedItems.size} product(s) added to catalog`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add products');
    }
  };

  const renderProduct = ({ item }: any) => {
    return (
      <View style={[styles.productCard, { backgroundColor: Colors.card }]}>
        <Image
          source={getProductPlaceholder(item)}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: Colors.textPrimary }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.productPrice, { color: item.price === 0 ? Colors.textSecondary : Colors.primary }]}>
            {item.price === 0 ? 'Contact for price' : formatCurrency(item.price)}
            {item.price !== 0 && item.unit && <Text style={[styles.unitText, { color: Colors.textTertiary }]}>/{item.unit}</Text>}
          </Text>
          {item.description && (
            <Text style={[styles.productDescription, { color: Colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: Colors.creditRed + '15' }]}
          onPress={() => handleRemoveFromCatalog(item)}
        >
          <Ionicons name="eye-off-outline" size={18} color={Colors.creditRed} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderInventoryItem = ({ item }: any) => {
    const isSelected = selectedItems.has(item.id);
    // Check if this inventory item is already in catalog
    const isAlreadyInCatalog = products.some((p: any) => p.inventory_item_id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.inventoryItem,
          { backgroundColor: Colors.card, borderColor: isSelected ? Colors.primary : Colors.borderLight },
          isSelected && { borderWidth: 2 },
          isAlreadyInCatalog && { opacity: 0.5 }
        ]}
        onPress={() => !isAlreadyInCatalog && toggleItemSelection(item.id)}
        disabled={isAlreadyInCatalog}
        activeOpacity={0.7}
      >
        <Image
          source={getProductPlaceholder(item)}
          style={styles.inventoryItemImage}
          resizeMode="cover"
        />
        <View style={styles.inventoryItemInfo}>
          <Text style={[styles.inventoryItemName, { color: Colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.inventoryItemPrice, { color: Colors.primary }]}>
            {formatCurrency(item.price)}
          </Text>
          {isAlreadyInCatalog && (
            <Text style={[styles.alreadyAddedText, { color: Colors.textTertiary }]}>
              Already in catalog
            </Text>
          )}
        </View>
        {!isAlreadyInCatalog && (
          <View style={[styles.checkbox, { borderColor: isSelected ? Colors.primary : Colors.borderLight, backgroundColor: isSelected ? Colors.primary : 'transparent' }]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Illustration name="noData" width={180} height={180} />
      <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Products in Catalog</Text>
      <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
        Add products to show them to your customers
      </Text>
      <View style={styles.emptyButtonsContainer}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.primary }]}
          onPress={() => navigation.navigate('AddCatalogItem')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Create New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addButtonSecondary, { borderColor: Colors.primary }]}
          onPress={handleAddFromInventory}
        >
          <Ionicons name="cube-outline" size={20} color={Colors.primary} />
          <Text style={[styles.addButtonTextSecondary, { color: Colors.primary }]}>From Inventory</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      {/* Header Info */}
      <View style={[styles.headerInfo, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
        <View style={styles.headerContent}>
          <Ionicons name="storefront-outline" size={24} color={Colors.primary} />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Customer Catalog</Text>
            <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>
              {products.length} product{products.length !== 1 ? 's' : ''} visible to customers
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.inventoryLink, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#e8f5f3' }]}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Ionicons name="cube-outline" size={16} color={Colors.primary} />
          <Text style={[styles.inventoryLinkText, { color: Colors.primary }]}>Inventory</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}>
          <Ionicons name="search" size={16} color={Colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: Colors.textPrimary }]}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
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

      {/* FAB - Add Options */}
      {products.length > 0 && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: Colors.primary,
              bottom: Platform.OS === 'ios' ? 86 : 70 + Math.max(insets.bottom, 0),
            }
          ]}
          onPress={() => {
            Alert.alert(
              'Add Product',
              'How would you like to add a product?',
              [
                { text: 'Create New', onPress: () => navigation.navigate('AddCatalogItem') },
                { text: 'From Inventory', onPress: handleAddFromInventory },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add from Inventory Modal */}
      <Modal
        visible={showInventoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInventoryModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: Colors.backgroundSecondary }]}>
          <View style={[styles.modalHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
            <TouchableOpacity onPress={() => setShowInventoryModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Add from Inventory</Text>
            <TouchableOpacity
              onPress={confirmAddFromInventory}
              disabled={selectedItems.size === 0}
              style={{ opacity: selectedItems.size === 0 ? 0.5 : 1 }}
            >
              <Text style={[styles.modalDoneText, { color: Colors.primary }]}>
                Add ({selectedItems.size})
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={inventoryItems}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalList}
            ListEmptyComponent={
              <View style={styles.emptyModal}>
                <Ionicons name="cube-outline" size={48} color={Colors.textTertiary} />
                <Text style={[styles.emptyModalText, { color: Colors.textSecondary }]}>
                  No items in inventory. Add items to inventory first.
                </Text>
                <TouchableOpacity
                  style={[styles.goToInventoryButton, { backgroundColor: Colors.primary }]}
                  onPress={() => {
                    setShowInventoryModal(false);
                    navigation.navigate('AddInventoryItem');
                  }}
                >
                  <Text style={styles.goToInventoryText}>Add to Inventory</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontXs,
  },
  inventoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inventoryLinkText: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSm,
    paddingVertical: 0,
  },
  gridContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - Spacing.sm * 3) / 2,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productName: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  unitText: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.regular,
  },
  productDescription: {
    fontSize: Typography.fontXs,
    marginTop: 4,
    lineHeight: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSm,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  emptyButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  addButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  addButtonTextSecondary: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
  },
  modalDoneText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  modalList: {
    padding: Spacing.md,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  inventoryItemImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  inventoryItemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  inventoryItemName: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  inventoryItemPrice: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.bold,
    marginTop: 2,
  },
  alreadyAddedText: {
    fontSize: Typography.fontXs,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyModal: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyModalText: {
    fontSize: Typography.fontSm,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  goToInventoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  goToInventoryText: {
    color: '#fff',
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
});
