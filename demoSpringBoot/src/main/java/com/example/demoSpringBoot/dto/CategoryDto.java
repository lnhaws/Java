package com.example.demoSpringBoot.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Thêm annotation này để không hiển thị các trường null (ví dụ: children)
@JsonInclude(JsonInclude.Include.NON_NULL) 
public class CategoryDto {
    private Integer id;
    private String name;

    // --- THÊM MỚI ---
    private Integer parentId; // Dùng để nhận ID của cha khi tạo/cập nhật
    private List<CategoryDto> children; // Dùng để trả về danh sách con
    // --- HẾT PHẦN THÊM MỚI ---
}