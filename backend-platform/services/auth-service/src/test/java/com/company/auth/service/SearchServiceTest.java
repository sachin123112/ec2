package com.company.auth.service;

import com.company.auth.document.OrderDocument;
import com.company.auth.document.ProductDocument;
import com.company.auth.model.Category;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.Product;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.OrderSearchRepository;
import com.company.auth.repository.ProductRepository;
import com.company.auth.repository.ProductSearchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private ProductSearchRepository productSearchRepository;

    @Mock
    private OrderSearchRepository orderSearchRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    private SearchService service;

    @BeforeEach
    void setUp() {
        service = new SearchService(
                mockProvider(productSearchRepository),
                mockProvider(orderSearchRepository),
                productRepository,
                orderRepository
        );
    }

    @Test
    void searchProducts_usesElasticsearchWhenAvailable() {
        ProductDocument laptop = new ProductDocument();
        laptop.setId(1L);
        laptop.setName("Laptop Pro");
        laptop.setDescription("A fast gaming laptop");
        laptop.setSku("LP-100");
        laptop.setCategoryName("electronics");

        ProductDocument phone = new ProductDocument();
        phone.setId(2L);
        phone.setName("Phone Max");
        phone.setDescription("Compact phone");
        phone.setSku("PM-200");
        phone.setCategoryName("mobile");

        when(productSearchRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(laptop, phone)));

        List<ProductDocument> result = service.searchProducts("laptop", "electronics");

        assertEquals(1, result.size());
        assertEquals("Laptop Pro", result.get(0).getName());
    }

    @Test
    void searchProducts_fallsBackToJpaWhenElasticsearchIsUnavailable() {
        SearchService fallbackService = new SearchService(
                mockProvider(null),
                mockProvider(null),
                productRepository,
                orderRepository
        );

        Category category = new Category();
        category.setName("electronics");

        Product product = new Product();
        product.setId(10L);
        product.setName("Smartphone");
        product.setDescription("Android smartphone");
        product.setSku("SP-500");
        product.setPrice(new BigDecimal("799.99"));
        product.setCategory(category);
        product.setCreatedAt(LocalDateTime.of(2024, 1, 15, 8, 30));

        when(productRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(product)));

        List<ProductDocument> result = fallbackService.searchProducts("smart", "electronics");

        assertEquals(1, result.size());
        assertEquals("Smartphone", result.get(0).getName());
        assertEquals("electronics", result.get(0).getCategoryName());
    }

    @Test
    void searchOrders_filtersByDateRange() {
        SearchService fallbackService = new SearchService(
                mockProvider(null),
                mockProvider(null),
                productRepository,
                orderRepository
        );

        OrderEntity inRange = new OrderEntity();
        inRange.setId(5L);
        inRange.setOrderNumber("ORD-100");
        inRange.setStatus("PAID");
        inRange.setCreatedAt(LocalDateTime.of(2024, 1, 20, 9, 0));

        OrderEntity tooOld = new OrderEntity();
        tooOld.setId(6L);
        tooOld.setOrderNumber("ORD-200");
        tooOld.setStatus("PENDING");
        tooOld.setCreatedAt(LocalDateTime.of(2023, 12, 15, 9, 0));

        when(orderRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(inRange, tooOld)));

        List<OrderDocument> result = fallbackService.searchOrders("ORD", "2024-01-01", "2024-01-31");

        assertEquals(1, result.size());
        assertEquals("ORD-100", result.get(0).getOrderNumber());
    }

    @Test
    void indexAndDeleteOperations_onlyExecuteWhenElasticsearchIsAvailable() {
        Product product = new Product();
        product.setId(30L);
        product.setName("Headphones");
        product.setDescription("Noise-cancelling headphones");
        product.setSku("HP-30");
        product.setPrice(new BigDecimal("249.99"));

        OrderEntity order = new OrderEntity();
        order.setId(40L);
        order.setOrderNumber("ORD-900");
        order.setStatus("SHIPPED");
        order.setCreatedAt(LocalDateTime.of(2024, 5, 1, 12, 0));

        service.indexProduct(product);
        service.indexOrder(order);
        service.deleteProduct(30L);
        service.deleteOrder(40L);

        verify(productSearchRepository).save(any(ProductDocument.class));
        verify(orderSearchRepository).save(any(OrderDocument.class));
        verify(productSearchRepository).deleteById(30L);
        verify(orderSearchRepository).deleteById(40L);
    }

    @Test
    void isElasticsearchAvailable_reportsRepositoryAvailability() {
        assertTrue(service.isElasticsearchAvailable());

        SearchService disabledService = new SearchService(
                mockProvider(null),
                mockProvider(null),
                productRepository,
                orderRepository
        );

        assertFalse(disabledService.isElasticsearchAvailable());
    }

    @SuppressWarnings("unchecked")
    private static <T> ObjectProvider<T> mockProvider(T value) {
        ObjectProvider<T> provider = (ObjectProvider<T>) mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(value);
        return provider;
    }
}
