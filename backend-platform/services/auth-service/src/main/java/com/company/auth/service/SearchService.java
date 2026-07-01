package com.company.auth.service;

import com.company.auth.document.OrderDocument;
import com.company.auth.document.ProductDocument;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.Product;
import com.company.auth.repository.OrderSearchRepository;
import com.company.auth.repository.ProductSearchRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class SearchService {

    private final ProductSearchRepository productSearchRepository;
    private final OrderSearchRepository orderSearchRepository;

    public SearchService(ProductSearchRepository productSearchRepository,
                         OrderSearchRepository orderSearchRepository) {
        this.productSearchRepository = productSearchRepository;
        this.orderSearchRepository = orderSearchRepository;
    }

    public List<ProductDocument> searchProducts(String search, String category) {
        List<ProductDocument> allProducts = StreamSupport.stream(productSearchRepository.findAll().spliterator(), false)
                .collect(Collectors.toList());

        if (!StringUtils.hasText(search) && !StringUtils.hasText(category)) {
            return allProducts;
        }

        String normalizedSearch = StringUtils.hasText(search) ? search.toLowerCase() : null;
        String normalizedCategory = StringUtils.hasText(category) ? category.toLowerCase() : null;

        return allProducts.stream()
                .filter(product -> {
                    boolean matchesSearch = normalizedSearch == null || (
                            containsIgnoreCase(product.getName(), normalizedSearch) ||
                            containsIgnoreCase(product.getDescription(), normalizedSearch) ||
                            containsIgnoreCase(product.getSku(), normalizedSearch) ||
                            containsIgnoreCase(product.getCategoryName(), normalizedSearch)
                    );
                    boolean matchesCategory = normalizedCategory == null ||
                            (product.getCategoryName() != null && product.getCategoryName().toLowerCase().equals(normalizedCategory));
                    return matchesSearch && matchesCategory;
                })
                .collect(Collectors.toList());
    }

    public List<OrderDocument> searchOrders(String search, String startDate, String endDate) {
        List<OrderDocument> allOrders = StreamSupport.stream(orderSearchRepository.findAll().spliterator(), false)
                .collect(Collectors.toList());

        if (!StringUtils.hasText(search) && !StringUtils.hasText(startDate) && !StringUtils.hasText(endDate)) {
            return allOrders;
        }

        String normalizedSearch = StringUtils.hasText(search) ? search.toLowerCase() : null;

        return allOrders.stream()
                .filter(order -> {
                    boolean matchesSearch = normalizedSearch == null || (
                            containsIgnoreCase(order.getOrderNumber(), normalizedSearch) ||
                            containsIgnoreCase(order.getStatus(), normalizedSearch)
                    );
                    boolean matchesStartDate = !StringUtils.hasText(startDate) ||
                            (order.getCreatedAt() != null && !order.getCreatedAt().toLocalDate().isBefore(java.time.LocalDate.parse(startDate)));
                    boolean matchesEndDate = !StringUtils.hasText(endDate) ||
                            (order.getCreatedAt() != null && !order.getCreatedAt().toLocalDate().isAfter(java.time.LocalDate.parse(endDate)));
                    return matchesSearch && matchesStartDate && matchesEndDate;
                })
                .collect(Collectors.toList());
    }

    private boolean containsIgnoreCase(String source, String search) {
        return source != null && source.toLowerCase().contains(search);
    }

    public void indexProduct(Product product) {
        if (product == null || product.getId() == null) {
            return;
        }

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

        productSearchRepository.save(document);
    }

    public void deleteProduct(Long productId) {
        if (productId != null) {
            productSearchRepository.deleteById(productId);
        }
    }

    public void indexOrder(OrderEntity order) {
        if (order == null || order.getId() == null) {
            return;
        }

        OrderDocument document = new OrderDocument();
        document.setId(order.getId());
        document.setOrderNumber(order.getOrderNumber());
        document.setTotalAmount(order.getTotalAmount());
        document.setStatus(order.getStatus());
        document.setCreatedAt(order.getCreatedAt());

        orderSearchRepository.save(document);
    }

    public void deleteOrder(Long orderId) {
        if (orderId != null) {
            orderSearchRepository.deleteById(orderId);
        }
    }
}
