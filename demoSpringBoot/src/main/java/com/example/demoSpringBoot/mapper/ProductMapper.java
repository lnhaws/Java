package com.example.demoSpringBoot.mapper;

import com.example.demoSpringBoot.dto.CategoryDto;
import com.example.demoSpringBoot.dto.ProductDto;
import com.example.demoSpringBoot.entity.Product;

public class ProductMapper {

    public static ProductDto toDto(Product product) {
        if (product == null) return null;

        // SỬA ĐỔI: Dùng CategoryMapper.toSimpleDto
        CategoryDto categoryDto = CategoryMapper.toSimpleDto(product.getCategory());

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .imageUrl(product.getImageUrl())
                .category(categoryDto) // Dùng DTO đã map
                
                // === ÁNH XẠ 3 TRƯỜNG MỚI ===
                .priceS(product.getPriceS())
                .priceM(product.getPriceM())
                .priceL(product.getPriceL())
                
                .build();
    }

    public static Product toEntity(ProductDto dto) {
        if (dto == null) return null;
        
        // Logic `toEntity` của bạn vẫn ổn
        // Việc gán Category (Entity) cho Product (Entity)
        // nên được thực hiện trong ProductService, không phải trong Mapper.
        
        return Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .imageUrl(dto.getImageUrl())

                // === ÁNH XẠ 3 TRƯỜNG MỚI ===
                .priceS(dto.getPriceS())
                .priceM(dto.getPriceM())
                .priceL(dto.getPriceL())
                
                // Không set Category ở đây
                .build();
    }
}