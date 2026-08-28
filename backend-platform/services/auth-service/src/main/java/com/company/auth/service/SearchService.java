package com.company.auth.service;

import com.company.auth.document.OrderDocument;
import com.company.auth.document.ProductDocument;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.Product;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.OrderSearchRepository;
import com.company.auth.repository.ProductRepository;
import com.company.auth.repository.ProductSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
    private static final int MAX_SEARCH_RESULTS = 500;

    private final ProductSearchRepository productSearchRepository;
    private final OrderSearchRepository orderSearchRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final boolean elasticsearchAvailable;

    public SearchService(ObjectProvider<ProductSearchRepository> productSearchRepositoryProvider,
                         ObjectProvider<OrderSearchRepository> orderSearchRepositoryProvider,
                         ProductRepository productRepository,
                         OrderRepository orderRepository) {
        this.productSearchRepository = productSearchRepositoryProvider.getIfAvailable();
        this.orderSearchRepository = orderSearchRepositoryProvider.getIfAvailable();
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.elasticsearchAvailable = this.productSearchRepository != null && this.orderSearchRepository != null;

        if (elasticsearchAvailable) {
            logger.info("Elasticsearch repositories are enabled. SearchService will use Elasticsearch search.");
        } else {
            logger.warn("Elasticsearch repositories are disabled or unavailable. SearchService will fall back to JPA search and disable indexing operations.");
        }
    }

    public boolean isElasticsearchAvailable() {
        return elasticsearchAvailable;
    }

    public List<ProductDocument> searchProducts(String search, String category) {
        if (elasticsearchAvailable) {
            List<ProductDocument> allProducts = productSearchRepository
                .findAll(PageRequest.of(0, MAX_SEARCH_RESULTS)).getContent();

            if (!StringUtils.hasText(search) && !StringUtils.hasText(category)) {
                return allProducts;
            }

            String normalizedSearch = StringUtils.hasText(search) ? search.toLowerCase() : null;
            String normalizedCategory = StringUtils.hasText(category) ? category.toLowerCase() : null;

            return allProducts.stream()
                    .filter(product -> productMatches(product, normalizedSearch, normalizedCategory))
                    .collect(Collectors.toList());
        }

        List<Product> allProducts = productRepository.findAll(PageRequest.of(0, MAX_SEARCH_RESULTS)).getContent();
        if (!StringUtils.hasText(search) && !StringUtils.hasText(category)) {
            return allProducts.stream().map(this::toProductDocument).collect(Collectors.toList());
        }

        String normalizedSearch = StringUtils.hasText(search) ? search.toLowerCase() : null;
        String normalizedCategory = StringUtils.hasText(category) ? category.toLowerCase() : null;

        return allProducts.stream()
                .map(this::toProductDocument)
                .filter(product -> productMatches(product, normalizedSearch, normalizedCategory))
                .collect(Collectors.toList());
    }

    public List<OrderDocument> searchOrders(String search, String startDate, String endDate) {
        if (elasticsearchAvailable) {
            List<OrderDocument> allOrders = orderSearchRepository
                .findAll(PageRequest.of(0, MAX_SEARCH_RESULTS)).getContent();

            if (!StringUtils.hasText(search) && !StringUtils.hasText(startDate) && !StringUtils.hasText(endDate)) {
                return allOrders;
            }

            String normalizedSearch = StringUtils.hasText(search) ? search.toLowerCase() : null;

            return allOrders.stream()
                    .filter(order -> orderMatches(order, normalizedSearch, startDate, endDate))
                    .collect(Collectors.toList());
        }

        List<OrderEntity> allOrders = orderRepository.findAll(PageRequest.of(0, MAX_SEARCH_RESULTS)).getContent();
        if (!StringUtils.hasText(search) && !StringUtils.hasText(startDate) && !StringUtils.hasText(endDate)) {
            return allOrders.stream().map(this::toOrderDocument).collect(Collectors.toList());
        }

        String normalizedSearch = StringUtils.hasText(search) ? search.toLowerCase() : null;

        return allOrders.stream()
                .map(this::toOrderDocument)
                .filter(order -> orderMatches(order, normalizedSearch, startDate, endDate))
                .collect(Collectors.toList());
    }

    private boolean productMatches(ProductDocument product, String normalizedSearch, String normalizedCategory) {
        boolean matchesSearch = normalizedSearch == null || (
                containsIgnoreCase(product.getName(), normalizedSearch) ||
                containsIgnoreCase(product.getDescription(), normalizedSearch) ||
                containsIgnoreCase(product.getSku(), normalizedSearch) ||
                containsIgnoreCase(product.getCategoryName(), normalizedSearch)
        );
        boolean matchesCategory = normalizedCategory == null ||
                (product.getCategoryName() != null && product.getCategoryName().toLowerCase().equals(normalizedCategory));
        return matchesSearch && matchesCategory;
    }

    private boolean orderMatches(OrderDocument order, String normalizedSearch, String startDate, String endDate) {
        boolean matchesSearch = normalizedSearch == null || (
                containsIgnoreCase(order.getOrderNumber(), normalizedSearch) ||
                containsIgnoreCase(order.getStatus(), normalizedSearch)
        );
        boolean matchesStartDate = !StringUtils.hasText(startDate) ||
                (order.getCreatedAt() != null && !order.getCreatedAt().toLocalDate().isBefore(LocalDate.parse(startDate)));
        boolean matchesEndDate = !StringUtils.hasText(endDate) ||
                (order.getCreatedAt() != null && !order.getCreatedAt().toLocalDate().isAfter(LocalDate.parse(endDate)));
        return matchesSearch && matchesStartDate && matchesEndDate;
    }

    private boolean containsIgnoreCase(String source, String search) {
        return source != null && source.toLowerCase().contains(search);
    }

    public void indexProduct(Product product) {
        if (!elasticsearchAvailable || product == null || product.getId() == null) {
            return;
        }

        ProductDocument document = toProductDocument(product);
        productSearchRepository.save(document);
    }

    public void deleteProduct(Long productId) {
        if (!elasticsearchAvailable || productId == null) {
            return;
        }
        try {
            productSearchRepository.deleteById(productId);
        } catch (RuntimeException ex) {
            logger.warn("Unable to remove product {} from search index", productId, ex);
        }
    }

    public void indexOrder(OrderEntity order) {
        if (!elasticsearchAvailable || order == null || order.getId() == null) {
            return;
        }

        OrderDocument document = toOrderDocument(order);
        orderSearchRepository.save(document);
    }

    public void deleteOrder(Long orderId) {
        if (!elasticsearchAvailable || orderId == null) {
            return;
        }
        orderSearchRepository.deleteById(orderId);
    }

    private ProductDocument toProductDocument(Product product) {
        ProductDocument document = new ProductDocument();
        document.setId(product.getId());
        document.setName(product.getName());
        document.setDescription(product.getDescription());
        document.setSku(product.getSku());
        document.setPrice(product.getPrice());
        document.setStockQuantity(product.getStockQuantity());
        document.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        document.setCreatedAt(product.getCreatedAt());
        if (product.getImages() != null) {
            document.setImageUrls(product.getImages().stream()
                    .map(image -> image.getImageUrl())
                    .collect(Collectors.toList()));
        }
        return document;
    }

    private OrderDocument toOrderDocument(OrderEntity order) {
        OrderDocument document = new OrderDocument();
        document.setId(order.getId());
        document.setOrderNumber(order.getOrderNumber());
        document.setTotalAmount(order.getTotalAmount());
        document.setStatus(order.getStatus());
        document.setCreatedAt(order.getCreatedAt());
        return document;
    }
}
