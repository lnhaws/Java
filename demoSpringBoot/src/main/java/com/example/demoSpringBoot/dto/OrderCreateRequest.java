package com.example.demoSpringBoot.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequest {
    private String phone;
    private String address;
    private String note;
    
    private String paymentMethod; 
    
    private List<OrderItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private Integer productId;
        private Integer quantity;
        private Double price;
        private String productName;
        
    }
}