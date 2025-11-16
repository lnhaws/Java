package com.example.demoSpringBoot.controller;

import com.example.demoSpringBoot.dto.ProductDto;
import com.example.demoSpringBoot.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // 1. IMPORT
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map; // 2. IMPORT

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor // 3. DÙNG LOMBOK
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')") // 4. THÊM BẢO MẬT
    public ResponseEntity<ProductDto> createProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Integer quantity,
            @RequestParam Integer category_id,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam Double priceS,
            @RequestParam Double priceM,
            @RequestParam Double priceL) {
        
        return ResponseEntity.ok(productService.addProduct(
                name, description,
                priceS, priceM, priceL, 
                quantity, category_id, image));
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')") // 4. THÊM BẢO MẬT
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Integer id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Integer quantity,
            @RequestParam Integer category_id,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam Double priceS,
            @RequestParam Double priceM,
            @RequestParam Double priceL) {
        
        return ResponseEntity.ok(productService.updateProduct(
                id, name, description,
                priceS, priceM, priceL, 
                quantity, category_id, image));
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // === 5. SỬA HÀM DELETE ===
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // 4. THÊM BẢO MẬT
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        try {
            productService.deleteProduct(id);
            // Trả về JSON message (React đang mong đợi)
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công")); 
        } catch (RuntimeException e) {
            // Bắt lỗi (vd: "Không thể xóa...") và gửi về cho React
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
    // === HẾT SỬA ===

    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchByName(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchByName(keyword));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ProductDto>> filterProducts(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        return ResponseEntity.ok(productService.filterProducts(minPrice, maxPrice));
    }
}