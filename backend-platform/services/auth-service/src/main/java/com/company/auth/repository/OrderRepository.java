package com.company.auth.repository;

import com.company.auth.model.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
	List<OrderEntity> findTop100ByUserIdOrderByCreatedAtDescIdDesc(Long userId);

	List<OrderEntity> findTop500ByOrderByCreatedAtDescIdDesc();

	@Query("select coalesce(sum(o.totalAmount), 0) from OrderEntity o")
	java.math.BigDecimal sumTotalAmount();

	@Query("select o.status, count(o) from OrderEntity o group by o.status")
	List<Object[]> countByStatus();
}
