package com.example.demoSpringBoot.service;

import com.example.demoSpringBoot.dto.ProductDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ProductService {

    ProductDto addProduct(
            String name, String description, 
            Double priceS, Double priceM, Double priceL,
            Integer quantity, Integer categoryId, MultipartFile image
    );

    ProductDto updateProduct(
            Integer id, String name, String description, 
            Double priceS, Double priceM, Double priceL,
            Integer quantity, Integer categoryId, MultipartFile image
    );

    List<ProductDto> getAllProducts();
    ProductDto getProductById(Integer id);
    void deleteProduct(Integer id);
    List<ProductDto> searchByName(String keyword);
    List<ProductDto> filterProducts(Double minPrice, Double maxPrice);
}