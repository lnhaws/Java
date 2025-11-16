package com.example.demoSpringBoot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // Tên đăng nhập

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;
    
    // === CÁC TRƯNG MỚI ===
    @Column(name = "display_name")
    private String displayName; // Tên hiển thị
    
    private String phone;
    private String address;
    
    @Column(name = "image_url")
    private String imageUrl;
}