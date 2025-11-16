package com.example.demoSpringBoot.service;

import java.util.List;

import com.example.demoSpringBoot.dto.CategoryDto;

public interface CategoryService {
    CategoryDto addCategory(CategoryDto categoryDto);
    List<CategoryDto> getAllCategories();
    CategoryDto getCategoryById(Integer id);
    CategoryDto updateCategory(Integer id, CategoryDto categoryDto);
    void deleteCategory(Integer id);
    List<CategoryDto> searchByName(String keyword);
}