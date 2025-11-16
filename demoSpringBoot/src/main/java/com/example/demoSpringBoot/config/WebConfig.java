package com.example.demoSpringBoot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry; // <-- THÊM IMPORT
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    // Hàm này của bạn đã có, giữ nguyên
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true);
    }

    // === THÊM PHẦN NÀY VÀO ===
    // Cấu hình này dùng để "phục vụ" (serve) các file tĩnh (hình ảnh)
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        // Khi trình duyệt (React) gọi đến URL có dạng /uploads/**
        registry.addResourceHandler("/uploads/**")
            
            // Spring Boot sẽ tìm file trong thư mục vật lý 'uploads/'
            // (Đường dẫn 'file:./uploads/' trỏ đến thư mục 'uploads' 
            // ở thư mục gốc của dự án, cùng cấp với pom.xml)
            .addResourceLocations("file:./uploads/");
    }
    // === KẾT THÚC PHẦN THÊM ===
}
