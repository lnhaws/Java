package com.example.demoSpringBoot.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Integer id;
    private String name;
    private String description;
    private Integer quantity;
    private String imageUrl;
    private CategoryDto category;
    private Double priceS;
    private Double priceM;
    private Double priceL;
}
