package com.example.demoSpringBoot.repository;

import com.example.demoSpringBoot.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Đếm số lượng OrderItem có chứa productId này
    long countByProductId(Integer productId);
}