package com.example.demoSpringBoot.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.example.demoSpringBoot.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String phone;
    private String address;
    private String note;
    private Double totalAmount;
    
    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    @Builder.Default
    private String status = "pending";

    // === THÊM TRƯỜNG MỚI ===
    private String paymentMethod;
    // === HẾT ===

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items;
}