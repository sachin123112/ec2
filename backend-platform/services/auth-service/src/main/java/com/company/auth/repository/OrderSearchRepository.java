package com.company.auth.repository;

import com.company.auth.document.OrderDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface OrderSearchRepository extends ElasticsearchRepository<OrderDocument, Long> {
}
