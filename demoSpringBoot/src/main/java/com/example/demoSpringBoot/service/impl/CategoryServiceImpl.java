package com.example.demoSpringBoot.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demoSpringBoot.dto.CategoryDto;
import com.example.demoSpringBoot.entity.Category;
import com.example.demoSpringBoot.mapper.CategoryMapper; // THÊM IMPORT
import com.example.demoSpringBoot.repository.CategoryRepository;
import com.example.demoSpringBoot.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Create new category
    @Override
    public CategoryDto addCategory(CategoryDto categoryDto) {
        // Chuyển DTO sang Entity (chỉ lấy name, id)
        Category category = CategoryMapper.toEntity(categoryDto);

        // Xử lý logic gán 'parent'
        if (categoryDto.getParentId() != null) {
            Category parent = categoryRepository.findById(categoryDto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category with ID " + categoryDto.getParentId() + " not found."));
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        // Trả về DTO đơn giản (không cần trả về cả cây)
        return CategoryMapper.toSimpleDto(savedCategory);
    }

    // Get all categories (TRẢ VỀ DẠNG CÂY)
    @Override
    public List<CategoryDto> getAllCategories() {
        // Chỉ tìm các danh mục gốc (parent = null)
        return categoryRepository.findByParentIsNull().stream()
                .map(CategoryMapper::toDto) // Mapper sẽ đệ quy để lấy các con
                .collect(Collectors.toList());
    }

    // Get category by ID (TRẢ VỀ KÈM CON)
    @Override
    public CategoryDto getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + id + " not found."));
        // Dùng mapper đệ quy để lấy cả cây con
        return CategoryMapper.toDto(category);
    }

    // Update category
    @Override
    public CategoryDto updateCategory(Integer id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + id + " not found."));

        // Cập nhật tên
        category.setName(categoryDto.getName());

        // Xử lý logic cập nhật 'parent'
        if (categoryDto.getParentId() != null) {
            // Kiểm tra: không cho phép tự làm cha của chính mình
            if (id.equals(categoryDto.getParentId())) {
                throw new IllegalArgumentException("Category cannot be its own parent.");
            }
            Category parent = categoryRepository.findById(categoryDto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category with ID " + categoryDto.getParentId() + " not found."));
            category.setParent(parent);
        } else {
            // Nếu parentId là null, nghĩa là muốn nó trở thành danh mục gốc
            category.setParent(null);
        }

        Category updatedCategory = categoryRepository.save(category);
        // Trả về DTO đơn giản
        return CategoryMapper.toSimpleDto(updatedCategory);
    }

    // Delete category
    @Override
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category with ID " + id + " not found.");
        }
        // Nhờ 'cascade = CascadeType.ALL' trong Entity, các con cũng sẽ bị xóa
        categoryRepository.deleteById(id);
    }

    // Search categories by name (TRẢ VỀ DANH SÁCH PHẲNG)
    @Override
    public List<CategoryDto> searchByName(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            // Nếu tìm kiếm rỗng, trả về dạng cây (giống getAll)
            return getAllCategories(); 
        }
        // Khi tìm kiếm, chỉ trả về danh sách phẳng (không đệ quy)
        return categoryRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(CategoryMapper::toSimpleDto) // Dùng mapper đơn giản
                .collect(Collectors.toList());
    }

    // Xóa phương thức private convertToDto(Category category)
    // Vì chúng ta đã chuyển nó vào CategoryMapper
}