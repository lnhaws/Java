package com.example.demoSpringBoot.service.impl;

import com.example.demoSpringBoot.dto.ProductDto;
import com.example.demoSpringBoot.entity.Category;
import com.example.demoSpringBoot.entity.Product;
import com.example.demoSpringBoot.exception.ResourceNotFoundException;
import com.example.demoSpringBoot.mapper.ProductMapper;
import com.example.demoSpringBoot.repository.CategoryRepository;
import com.example.demoSpringBoot.repository.ProductRepository;
import com.example.demoSpringBoot.repository.OrderItemRepository; // 1. IMPORT REPO MỚI
import com.example.demoSpringBoot.service.FileStorageService; // 2. IMPORT FILE SERVICE
import com.example.demoSpringBoot.service.ProductService;
import lombok.RequiredArgsConstructor; // 3. IMPORT LOMBOK
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor // 4. SỬ DỤNG LOMBOK
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService; // 5. TIÊM FILE SERVICE
    private final OrderItemRepository orderItemRepository; // 6. TIÊM REPO ĐƠN HÀNG

    // (Hàm khởi tạo (constructor) cũ đã được @RequiredArgsConstructor thay thế)
    // (Hàm tạo thư mục 'uploads' đã được chuyển sang FileStorageService)

    @Override
    public ProductDto addProduct(String name, String description,
                                 Double priceS, Double priceM, Double priceL,
                                 Integer quantity, Integer categoryId, MultipartFile image) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeFile(image); // Dùng FileStorageService
        }

        Product product = Product.builder() // Dùng Builder cho sạch
                .name(name)
                .description(description)
                .priceS(priceS)
                .priceM(priceM)
                .priceL(priceL)
                .quantity(quantity)
                .category(category)
                .imageUrl(imageUrl)
                .build();
        
        return ProductMapper.toDto(productRepository.save(product));
    }

    @Override
    public ProductDto updateProduct(Integer id, String name, String description,
                                  Double priceS, Double priceM, Double priceL,
                                  Integer quantity, Integer categoryId, MultipartFile image) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        product.setName(name);
        product.setDescription(description);
        product.setQuantity(quantity);
        product.setPriceS(priceS);
        product.setPriceM(priceM);
        product.setPriceL(priceL);
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            // (Tùy chọn: Xóa ảnh cũ ở đây)
            product.setImageUrl(fileStorageService.storeFile(image)); // Dùng FileStorageService
        }

        return ProductMapper.toDto(productRepository.save(product));
    }

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return ProductMapper.toDto(product);
    }

    // === 7. SỬA HÀM DELETEPRODUCT ===
    @Override
    public void deleteProduct(Integer id) {
        // 1. Kiểm tra sản phẩm có tồn tại không
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        // 2. Kiểm tra xem sản phẩm có trong đơn hàng nào không
        long orderCount = orderItemRepository.countByProductId(id);
        if (orderCount > 0) {
            // 3. Nếu có, ném lỗi (Controller sẽ bắt lỗi này)
            throw new RuntimeException("Không thể xóa sản phẩm này! Sản phẩm đã tồn tại trong " + orderCount + " đơn hàng đã đặt.");
        }
        
        // 4. (Tùy chọn: Xóa file ảnh)
        
        // 5. Xóa sản phẩm
        productRepository.deleteById(id);
    }
    // === HẾT SỬA ===

    @Override
    public List<ProductDto> searchByName(String keyword) {
        // (Giả sử bạn có phương thức này trong ProductRepository)
        return productRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> filterProducts(Double minPrice, Double maxPrice) {
        // (Giả sử bạn có phương thức này trong ProductRepository)
        if (minPrice == null) minPrice = 0.0;
        if (maxPrice == null) maxPrice = Double.MAX_VALUE;
        
        return productRepository.findByPriceSBetween(minPrice, maxPrice).stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    // (Hàm storeImage đã được chuyển sang FileStorageService)
}