package com.example.demoSpringBoot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Double total;
    
    // (Không cần @ManyToOne đến Order, vì đã dùng @JoinColumn bên Order)
}