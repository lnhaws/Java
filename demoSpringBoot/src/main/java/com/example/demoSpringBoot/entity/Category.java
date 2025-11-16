package com.example.demoSpringBoot.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    // --- THÊM MỚI ---
    
    // Quan hệ Many-to-One: Nhiều danh mục con thuộc về MỘT danh mục cha
    @ManyToOne(fetch = FetchType.LAZY) // LAZY: Chỉ load khi được gọi
    @JoinColumn(name = "parent_id") // Tên cột trong DB để lưu ID của cha
    private Category parent;

    // Quan hệ One-to-Many: Một danh mục cha có NHIỀU danh mục con
    @OneToMany(
        mappedBy = "parent", // Ánh xạ tới trường 'parent' trong class này
        cascade = CascadeType.ALL, // Xóa/Cập nhật con khi cha bị xóa/cập nhật
        orphanRemoval = true, // Xóa con mồ côi
        fetch = FetchType.LAZY
    )
    private List<Category> children = new ArrayList<>();
    
    // --- HẾT PHẦN THÊM MỚI ---
}