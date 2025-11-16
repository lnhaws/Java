package com.example.demoSpringBoot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// ... imports
import com.example.demoSpringBoot.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> findByNameContainingIgnoreCase(@Param("keyword") String keyword);

    // --- THÊM MỚI ---
    /**
     * Tìm tất cả các danh mục gốc (không có cha)
     */
    List<Category> findByParentIsNull();
    // --- HẾT PHẦN THÊM MỚI ---
}