package com.example.demoSpringBoot.repository;

import com.example.demoSpringBoot.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Lấy đơn hàng cho 1 user, sắp xếp mới nhất
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    
    // Lấy tất cả đơn hàng, sắp xếp mới nhất
    List<Order> findAllByOrderByOrderDateDesc();
}