package com.example.demoSpringBoot.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Long id;
    private String username;
    private String phone;
    private String address;
    private Double totalAmount;
    private String status;
    private LocalDateTime orderDate;
    
    // === THÊM TRƯỜNG MỚI ===
    private String paymentMethod;
    // === HẾT ===
    
    private List<OrderItemDto> items;

    // Inner class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDto {
        private String productName;
        private Integer quantity;
        private Double price;
        private Double total;
        private String imageUrl; 
    }
}