package com.example.demoSpringBoot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demoSpringBoot.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Tìm sản phẩm có giá priceS nằm trong khoảng min và max
    List<Product> findByPriceSBetween(Double minPrice, Double maxPrice);
}
