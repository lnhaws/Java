package com.example.demoSpringBoot.mapper;

import com.example.demoSpringBoot.dto.CategoryDto;
import com.example.demoSpringBoot.entity.Category;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    /**
     * Chuyển Entity sang DTO (Bao gồm cả danh sách con - đệ quy)
     */
    public static CategoryDto toDto(Category category) {
        if (category == null) return null;

        List<CategoryDto> childrenDtos = new ArrayList<>();
        // Kiểm tra để tránh lỗi NullPointerException và gọi đệ quy
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            childrenDtos = category.getChildren().stream()
                    .map(CategoryMapper::toDto) // Gọi đệ quy cho các con
                    .collect(Collectors.toList());
        }

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(childrenDtos.isEmpty() ? null : childrenDtos) // Trả về null nếu không có con
                .build();
    }

    /**
     * Chuyển Entity sang DTO (Phiên bản đơn giản, không lấy con)
     * Dùng cho các trường hợp như hiển thị danh mục của sản phẩm
     */
    public static CategoryDto toSimpleDto(Category category) {
        if (category == null) return null;

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                // Không lấy danh sách children
                .build();
    }

    /**
     * Chuyển DTO sang Entity (Phiên bản cơ bản)
     * Việc set 'parent' (object) sẽ được xử lý ở tầng Service
     */
    public static Category toEntity(CategoryDto dto) {
        if (dto == null) return null;

        return Category.builder()
                .id(dto.getId()) // Id sẽ là null khi tạo mới
                .name(dto.getName())
                .build();
    }
}