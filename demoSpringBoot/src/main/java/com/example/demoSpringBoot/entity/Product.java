package com.example.demoSpringBoot.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    // Chỉ cho Java biết 'priceS' tương ứng với cột 'prices'
    @Column(name = "prices")
    private Double priceS;

    // Chỉ cho Java biết 'priceM' tương ứng với cột 'pricem'
    @Column(name = "pricem")
    private Double priceM;

    // Chỉ cho Java biết 'priceL' tương ứng với cột 'pricel'
    @Column(name = "pricel")
    private Double priceL;
    
    private Integer quantity;

    // Chỉ cho Java biết 'imageUrl' tương ứng với cột 'image_url'
    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne
    // Chỉ cho Java biết 'category' tương ứng với cột 'category_id'
    @JoinColumn(name = "category_id")
    private Category category;
}
