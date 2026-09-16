import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useCart } from '../context/CartContext';
import { fetchProducts, resolveImageUrl } from '../api/products';
import { products as staticProducts } from '../data/products';
import BottomTabBar from '../components/BottomTabBar';
import MobilePageBanner from '../components/MobilePageBanner';
import BackButton from '../components/BackButton';

const fallbackImage =
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&q=85';
const bannerWidth = Dimensions.get('window').width;
const banners = [
  { id: 'nutrition', image: 'https://images.unsplash.com/photo-1589924691995-400dc9a65b3d?w=1200&q=85', title: 'Better nutrition for happier pets' },
  { id: 'play', image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=1200&q=85', title: 'Playtime starts here' },
  { id: 'care', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&q=85', title: 'Everyday care made easy' },
];

const categoryRail = [
  { name: 'Top Picks', icon: '✦' },
  { name: 'Powders & Pastes', icon: '🧴' },
  { name: 'Dry Fruits & Nuts', icon: '🥜' },
  { name: 'Dates & Seeds', icon: '🌰' },
  { name: 'Whole Spices', icon: '🫙' },
  { name: 'Salt', icon: '🧂' },
];


// ======================================================
// NORMALIZE PRODUCT
// ======================================================

function normalizeProduct(product) {
  const image =
    product.imageUrls?.[0] ||
    product.images?.[0] ||
    product.image;

  return {
    ...product,
    category: product.categoryName || product.category?.name || product.category || '',
    price: Number(product.price || 0),
    stockQuantity: Number(product.stockQuantity || 0),
    netQuantity: Number(product.netQuantity || 0),
    image: resolveImageUrl(image, fallbackImage),
  };
}


// ======================================================
// PRODUCT CARD
// ======================================================

function ProductCard({
  product,
  quantity,
  onAdd,
  onDecrease,
  onIncrease,
}) {
  return (
    <View style={styles.productCard}>

      <View style={styles.productImageWrap}>

        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
        />

        {quantity === 0 ? (

          <TouchableOpacity
            style={styles.cardAddButton}
            onPress={onAdd}
            activeOpacity={0.85}
          >
            <Text style={styles.cardAddText}>
              Add
            </Text>
          </TouchableOpacity>

        ) : (

          <View style={styles.quantityControl}>

            <TouchableOpacity
              onPress={onDecrease}
              accessibilityLabel={`Remove one ${product.name}`}
              hitSlop={8}
            >
              <Text style={styles.quantityAction}>
                −
              </Text>
            </TouchableOpacity>

            <Text style={styles.quantityValue}>
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={onIncrease}
              accessibilityLabel={`Add one ${product.name}`}
              hitSlop={8}
            >
              <Text style={styles.quantityAction}>
                ＋
              </Text>
            </TouchableOpacity>

          </View>
        )}

      </View>

      <Text style={styles.discount}>
        ₹
        {Math.max(
          20,
          Math.round(
            Number(product.price || 0) * 0.15
          )
        )}{' '}
        OFF
      </Text>

      <Text
        style={styles.productName}
        numberOfLines={2}
      >
        {product.name}
      </Text>

      <Text style={styles.productPack}>
        {product.netQuantity
          ? `${product.netQuantity} g`
          : '1 pack'}
      </Text>

      <Text style={styles.rating}>
        ★ {product.rating || '4.6'}{' '}
        <Text style={styles.reviewCount}>
          ({product.reviews || '28k'})
        </Text>
      </Text>

    </View>
  );
}


// ======================================================
// MAIN SCREEN
// ======================================================

export default function CategoryProductsScreen({
  navigation,
  route,
}) {
  const category =
    route?.params?.category || {};
  const categoryDisplayName =
    String(category.name || '').toLowerCase() === 'dog food'
      ? 'Pet Food'
      : category.name;
  const isPetFoodCategory =
    String(category.name || '').toLowerCase() === 'pet food' ||
    String(category.name || '').toLowerCase() === 'dog food';

  const {
    addToCart,
    totalItems,
  } = useCart();

  const [products, setProducts] = useState(
    staticProducts.map(normalizeProduct)
  );

  const [quantities, setQuantities] =
    useState({});

  const [activeRailItem, setActiveRailItem] =
    useState('Top Picks');

  const [filterMenu, setFilterMenu] =
    useState('');

  const [selectedType, setSelectedType] =
    useState('All');

  const [selectedBrand, setSelectedBrand] =
    useState('All');
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = React.useRef(null);


  // ======================================================
  // LOAD PRODUCTS
  // ======================================================

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        const liveProducts = data
          .filter((product) => String(product.categoryName || product.category?.name || product.category || '').toLowerCase() === 'pet food')
          .map(normalizeProduct);
        const hasSelectedCategory = liveProducts.some((product) => {
          const productCategory = String(product.category || '').toLowerCase();
          return productCategory === String(category.name || '').toLowerCase();
        });
        setProducts(hasSelectedCategory ? liveProducts : staticProducts.map(normalizeProduct));
      })
      .catch((error) => {
        console.warn(
          'Unable to load category products:',
          error
        );

        setProducts(staticProducts.map(normalizeProduct));
      });
  }, [category.name]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((current) => {
        const next = (current + 1) % banners.length;
        bannerScrollRef.current?.scrollTo({ x: next * bannerWidth, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);


  // ======================================================
  // CATEGORY PRODUCTS
  // ======================================================

  const categoryProducts = useMemo(() => {

    const categoryName =
      String(category.name || '')
        .toLowerCase();

    const categoryAliases = {
      'pet food': ['pet food'],
      'dog food': ['dog food'],
      'cat food': ['cat food'],
      'bird food': ['bird food'],
      'fish food': ['fish food'],
    };

    const matchingNames =
      categoryAliases[categoryName] ||
      [categoryName];

    const categoryTerms =
      categoryName
        .split(' ')
        .filter(Boolean);

    return products.filter((product) => {

      const productCategory =
        String(
          product.category || ''
        ).toLowerCase();

      if (isPetFoodCategory) {
        return productCategory === 'pet food';
      }

      return matchingNames.includes(productCategory) || categoryTerms.some((term) => productCategory.includes(term));
    });

  }, [category.name, products]);


  // ======================================================
  // FILTER OPTIONS
  // ======================================================

  const filterOptions = useMemo(() => {

    const types = [
      ...new Set(
        categoryProducts
          .map(
            (product) =>
              product.subCategory
          )
          .filter(Boolean)
      ),
    ];

    const brands = [
      ...new Set(
        categoryProducts
          .map(
            (product) =>
              product.brand
          )
          .filter(Boolean)
      ),
    ];

    return {
      types,
      brands,
    };

  }, [categoryProducts]);


  // ======================================================
  // FILTERED PRODUCTS
  // ======================================================

  const filteredProducts = useMemo(() => {

    return categoryProducts.filter(
      (product) => {

        const typeMatches =
          selectedType === 'All' ||
          product.subCategory ===
            selectedType;

        const brandMatches =
          selectedBrand === 'All' ||
          product.brand ===
            selectedBrand;

        return (
          typeMatches &&
          brandMatches
        );
      }
    );

  }, [
    categoryProducts,
    selectedBrand,
    selectedType,
  ]);


  // ======================================================
  // UPDATE QUANTITY
  // ======================================================

  const updateQuantity = (
    product,
    nextQuantity
  ) => {

    const previousQuantity =
      quantities[product.id] || 0;

    setQuantities((current) => ({
      ...current,
      [product.id]: Math.max(
        0,
        nextQuantity
      ),
    }));

    if (
      nextQuantity >
      previousQuantity
    ) {
      addToCart(product);
    }
  };


  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {
    setSelectedType('All');
    setSelectedBrand('All');
    setFilterMenu('');
  };


  // ======================================================
  // BACK NAVIGATION
  // ======================================================


  // ======================================================
  // UI
  // ======================================================

  return (
    <View style={styles.container}>
      <MobilePageBanner page="PRODUCTS" height={170} />

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.topBar}>

        <BackButton navigation={navigation} fallbackRoute="Shop" />

        <Text
          style={styles.topBarTitle}
          numberOfLines={1}
        >
          {categoryDisplayName || 'Products'}
        </Text>

      </View>


      {/* ==================================================
          FILTER BAR
      ================================================== */}

      {!isPetFoodCategory && <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterMenu === 'filters' &&
              styles.filterSelected,
          ]}
          onPress={() =>
            setFilterMenu(
              filterMenu === 'filters'
                ? ''
                : 'filters'
            )
          }
          accessibilityLabel="Filters"
          activeOpacity={0.75}
        >
          <Text style={styles.filterIcon}>
            ☷
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType !== 'All' &&
              styles.filterSelected,
          ]}
          onPress={() =>
            setFilterMenu(
              filterMenu === 'type'
                ? ''
                : 'type'
            )
          }
          activeOpacity={0.75}
        >
          <Text style={styles.filterText}>
            {selectedType === 'All'
              ? 'Type'
              : selectedType}{' '}
            ⌄
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedBrand !== 'All' &&
              styles.filterSelected,
          ]}
          onPress={() =>
            setFilterMenu(
              filterMenu === 'brand'
                ? ''
                : 'brand'
            )
          }
          activeOpacity={0.75}
        >
          <Text style={styles.filterText}>
            {selectedBrand === 'All'
              ? 'Brand'
              : selectedBrand}{' '}
            ⌄
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.recipeChip}
          onPress={() =>
            Alert.alert(
              'Recipe ideas',
              'Recipe ideas will be available soon.'
            )
          }
          activeOpacity={0.75}
        >
          <Text style={styles.recipeText}>
            🛍️ Recipe ideas
          </Text>
        </TouchableOpacity>

      </ScrollView>}

      {!isPetFoodCategory && <View style={styles.bannerContainer}>
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => setActiveBanner(Math.round(event.nativeEvent.contentOffset.x / bannerWidth))}
        >
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerSlide}>
              <Image source={{ uri: banner.image }} style={styles.bannerImage} />
              <View style={styles.bannerShade} />
              <Text style={styles.bannerTitle}>{banner.title}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.bannerDots}>
          {banners.map((banner, index) => <View key={banner.id} style={[styles.bannerDot, index === activeBanner && styles.bannerDotActive]} />)}
        </View>
      </View>}


      {/* ==================================================
          FILTER MENU
      ================================================== */}

      {!isPetFoodCategory && filterMenu && (
        <View style={styles.filterMenu}>

          {filterMenu === 'filters' && (
            <TouchableOpacity
              style={styles.filterOption}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text
                style={
                  styles.filterOptionText
                }
              >
                Clear all filters
              </Text>
            </TouchableOpacity>
          )}


          {filterMenu === 'type' &&
            [
              'All',
              ...filterOptions.types,
            ].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterOption,
                  selectedType === type &&
                    styles.filterOptionActive,
                ]}
                onPress={() => {
                  setSelectedType(type);
                  setFilterMenu('');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    styles.filterOptionText
                  }
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}


          {filterMenu === 'brand' &&
            (
              filterOptions.brands.length
                ? [
                    'All',
                    ...filterOptions.brands,
                  ].map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.filterOption,
                        selectedBrand === brand &&
                          styles.filterOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedBrand(brand);
                        setFilterMenu('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={
                          styles.filterOptionText
                        }
                      >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))
                : (
                  <Text style={styles.noBrands}>
                    No brand data available
                  </Text>
                )
            )}

        </View>
      )}


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <View style={styles.contentRow}>

        {/* ==================================================
            CATEGORY SIDEBAR
        ================================================== */}

        {!isPetFoodCategory && <ScrollView
          style={styles.categoryRailScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.categoryRailContent
          }
        >

          {categoryRail.map((item) => (

            <TouchableOpacity
              key={item.name}
              style={[
                styles.railItem,
                activeRailItem ===
                  item.name &&
                  styles.railItemActive,
              ]}
              onPress={() =>
                setActiveRailItem(
                  item.name
                )
              }
              activeOpacity={0.8}
            >

              <Text style={styles.railIcon}>
                {item.icon}
              </Text>

              <Text
                style={[
                  styles.railLabel,
                  activeRailItem ===
                    item.name &&
                    styles.railLabelActive,
                ]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

            </TouchableOpacity>

          ))}

        </ScrollView>}


        {/* ==================================================
            PRODUCT AREA
        ================================================== */}

        <ScrollView
          style={styles.productsScroll}
          contentContainerStyle={
            styles.productsContent
          }
          showsVerticalScrollIndicator={false}
        >

          {!isPetFoodCategory && <>
            <Text style={styles.assurance}>No preservatives  •  No sodium</Text>
            <Text style={styles.resultCount}>{filteredProducts.length} products</Text>
          </>}


          {/* PRODUCTS */}

          {filteredProducts.length > 0 && (

            <View style={styles.productGrid}>

              {filteredProducts.map(
                (product) => (

                  <TouchableOpacity
                    key={String(product.id)}
                    style={styles.productTouchable}
                    activeOpacity={0.92}
                    onPress={() =>
                      navigation.navigate(
                        'ProductDetails',
                        { product }
                      )
                    }
                  >

                    <ProductCard
                      product={product}

                      quantity={
                        quantities[
                          product.id
                        ] || 0
                      }

                      onAdd={() =>
                        updateQuantity(
                          product,
                          1
                        )
                      }

                      onDecrease={() =>
                        updateQuantity(
                          product,
                          (
                            quantities[
                              product.id
                            ] || 0
                          ) - 1
                        )
                      }

                      onIncrease={() =>
                        updateQuantity(
                          product,
                          (
                            quantities[
                              product.id
                            ] || 0
                          ) + 1
                        )
                      }
                    />

                  </TouchableOpacity>

                )
              )}

            </View>
          )}


          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {!filteredProducts.length && (

            <View style={styles.emptyState}>

              <View
                style={
                  styles.emptyIconCircle
                }
              >
                <Text style={styles.emptyIcon}>
                  🛍️
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No products
                {'\n'}
                found
              </Text>

              <Text style={styles.empty}>
                No products match these
                filters.
                {'\n'}
                Try changing or clearing
                your filters.
              </Text>

              {(selectedType !== 'All' ||
                selectedBrand !== 'All') && (

                <TouchableOpacity
                  style={
                    styles.clearButton
                  }
                  onPress={clearFilters}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      styles.clearButtonText
                    }
                  >
                    Clear Filters
                  </Text>
                </TouchableOpacity>

              )}

            </View>
          )}

        </ScrollView>

      </View>


      {/* ==================================================
          CART
      ================================================== */}

      {totalItems > 0 && (

        <TouchableOpacity
          style={styles.cartSummary}
          onPress={() =>
            navigation.navigate('Cart')
          }
          activeOpacity={0.9}
        >

          <View
            style={
              styles.cartSummaryIcon
            }
          >
            <Text style={styles.cartEmoji}>
              🛒
            </Text>
          </View>

          <View
            style={
              styles.cartSummaryText
            }
          >
            <Text style={styles.cartTitle}>
              Cart
            </Text>

            <Text style={styles.cartItems}>
              {totalItems} items
            </Text>
          </View>

          <Text style={styles.cartArrow}>
            ›
          </Text>

        </TouchableOpacity>
      )}


      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <BottomTabBar activeTab="Shop" />

    </View>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  // ====================================================
  // MAIN
  // ====================================================

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  // ====================================================
  // HEADER
  // ====================================================

  topBar: {
    height: 64,
    paddingHorizontal: 18,
    backgroundColor: '#FBF9F6',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F1ED',
    borderWidth: 1,
    borderColor: '#E6E7EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -6,
  },

  backIcon: {
    color: '#555B63',
    fontSize: 25,
    fontWeight: '300',
    lineHeight: 30,
    marginTop: 4,
  },

  topBarTitle: {
    flex: 1,
    marginLeft: 9,
    color: '#181B20',
    fontSize: 18,
    fontWeight: '800',
  },

  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchIcon: {
    color: '#252A30',
    fontSize: 28,
    lineHeight: 30,
  },


  // ====================================================
  // FILTER BAR
  // ====================================================

  filterBar: {
    flexGrow: 0,
    height: 48,
    backgroundColor: '#FBF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  filterContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },

  filterButton: {
    width: 40,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterIcon: {
    color: '#343A40',
    fontSize: 19,
    fontWeight: '600',
  },

  filterChip: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5E8',
    justifyContent: 'center',
  },

  filterText: {
    color: '#30363C',
    fontSize: 12,
    fontWeight: '700',
  },

  recipeChip: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5E8',
    justifyContent: 'center',
  },

  recipeText: {
    color: '#30363C',
    fontSize: 12,
    fontWeight: '700',
  },

  filterSelected: {
    backgroundColor: '#F4E9FF',
    borderColor: '#A77BE8',
  },

  bannerContainer: {
    height: 118,
    backgroundColor: '#f0e7db',
    overflow: 'hidden',
  },

  bannerSlide: {
    width: bannerWidth,
    height: 118,
    justifyContent: 'flex-end',
    padding: 16,
  },

  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },

  bannerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#24170f',
    opacity: 0.32,
  },

  bannerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    maxWidth: 230,
    textShadowColor: '#000',
    textShadowRadius: 4,
  },

  bannerDots: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    flexDirection: 'row',
    gap: 5,
  },

  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.55,
  },

  bannerDotActive: {
    width: 18,
    opacity: 1,
    backgroundColor: '#f3b34b',
  },


  // ====================================================
  // FILTER MENU
  // ====================================================

  filterMenu: {
    position: 'absolute',
    top: 106,
    left: 10,
    right: 10,
    zIndex: 20,

    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',

    padding: 6,

    elevation: 8,

    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 9,
  },

  filterOptionActive: {
    backgroundColor: '#F4E9FF',
  },

  filterOptionText: {
    color: '#30363C',
    fontSize: 14,
    fontWeight: '700',
  },

  noBrands: {
    color: '#7A838B',
    padding: 14,
    fontSize: 13,
  },


  // ====================================================
  // CONTENT
  // ====================================================

  contentRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },


  // ====================================================
  // CATEGORY SIDEBAR
  // ====================================================

  categoryRailScroll: {
    width: 87,
    flexGrow: 0,
    backgroundColor: '#FFFFFF',

    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },

  categoryRailContent: {
    paddingBottom: 10,
  },

  railItem: {
    width: 87,
    height: 78,

    paddingHorizontal: 2,
    paddingVertical: 5,

    alignItems: 'center',
    justifyContent: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',

    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },

  railItemActive: {
    backgroundColor: '#F4E5FF',
    borderLeftColor: '#9B4DCA',
  },

  railIcon: {
    fontSize: 19,
    lineHeight: 22,
    marginBottom: 3,
  },

  railLabel: {
    color: '#30363C',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  railLabelActive: {
    color: '#7B20B2',
    fontWeight: '800',
  },


  // ====================================================
  // PRODUCT AREA
  // ====================================================

  productsScroll: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FBF9F6',
  },

  productsContent: {
    flexGrow: 1,
    paddingHorizontal: 9,
    paddingTop: 0,
    paddingBottom: 130,
  },

  assurance: {
    color: '#986744',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',

    marginTop: 6,
    marginBottom: 4,
  },

  resultCount: {
    color: '#9299A1',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },


  // ====================================================
  // PRODUCT GRID
  // ====================================================

  productGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productTouchable: {
    width: '48%',
  },

  productCard: {
    width: '100%',
    marginBottom: 20,
  },

  productImageWrap: {
    width: '100%',
    height: 142,

    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EAED',

    backgroundColor: '#F8F9FA',

    overflow: 'hidden',
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },


  // ====================================================
  // FAVORITE
  // ====================================================

  favoriteButton: {
    position: 'absolute',

    right: 8,
    top: 8,

    width: 32,
    height: 32,
    borderRadius: 16,

    backgroundColor:
      'rgba(255,255,255,0.94)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  favoriteIcon: {
    color: '#E83E75',
    fontSize: 23,
    lineHeight: 25,
  },


  // ====================================================
  // ADD BUTTON
  // ====================================================

  cardAddButton: {
    position: 'absolute',

    right: 8,
    bottom: 8,

    minWidth: 54,
    height: 34,

    borderRadius: 10,

    backgroundColor: '#E83E75',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 12,
  },

  cardAddText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },


  // ====================================================
  // QUANTITY
  // ====================================================

  quantityControl: {
    position: 'absolute',

    right: 8,
    bottom: 8,

    height: 36,
    minWidth: 108,

    paddingHorizontal: 8,

    borderRadius: 10,

    backgroundColor: '#E83E75',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  quantityAction: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  quantityValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },


  // ====================================================
  // PRODUCT DETAILS
  // ====================================================

  discount: {
    color: '#278650',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 7,
  },

  productName: {
    color: '#20252B',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 3,
  },

  productPack: {
    color: '#7B838B',
    fontSize: 12,
    marginTop: 3,
  },

  rating: {
    color: '#279254',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  reviewCount: {
    color: '#9299A1',
    fontWeight: '500',
  },


  // ====================================================
  // EMPTY STATE
  // ====================================================

  emptyState: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 12,
    paddingBottom: 20,

    // This moves the whole empty state
    // toward the left side of product area.
    marginLeft: 0,
  },

  emptyIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,

    backgroundColor: '#F7EEFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 14,
  },

  emptyIcon: {
    fontSize: 29,
  },

  emptyTitle: {
    color: '#30363C',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '800',

    textAlign: 'center',

    marginBottom: 8,
  },

  empty: {
    color: '#7A838B',

    fontSize: 13,
    lineHeight: 20,

    textAlign: 'center',

    maxWidth: 155,
  },

  clearButton: {
    marginTop: 18,

    height: 38,

    paddingHorizontal: 20,

    borderRadius: 10,

    backgroundColor: '#9B5DE5',

    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },


  // ====================================================
  // CART
  // ====================================================

  cartSummary: {
    position: 'absolute',

    left: 16,
    right: 16,
    bottom: 78,

    height: 60,

    borderRadius: 16,

    backgroundColor: '#252C35',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 13,

    elevation: 8,

    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  cartSummaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,

    backgroundColor: '#E7F7EA',

    alignItems: 'center',
    justifyContent: 'center',
  },

  cartEmoji: {
    fontSize: 18,
  },

  cartSummaryText: {
    flex: 1,
    marginLeft: 11,
  },

  cartTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  cartItems: {
    color: '#C5CBD0',
    fontSize: 12,
    marginTop: 2,
  },

  cartArrow: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '300',
  },

});