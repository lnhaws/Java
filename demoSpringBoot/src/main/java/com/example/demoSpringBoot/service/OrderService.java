package com.example.demoSpringBoot.service;

import com.example.demoSpringBoot.dto.OrderCreateRequest;
import com.example.demoSpringBoot.dto.OrderDto;
import com.example.demoSpringBoot.entity.Order;
import com.example.demoSpringBoot.entity.OrderItem;
import com.example.demoSpringBoot.entity.Product;
import com.example.demoSpringBoot.entity.User;
import com.example.demoSpringBoot.repository.OrderRepository;
import com.example.demoSpringBoot.repository.ProductRepository;
import com.example.demoSpringBoot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional 
    public OrderDto createOrder(OrderCreateRequest request) {
        try {
            User currentUser = getCurrentUser();

            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new RuntimeException("Giỏ hàng trống");
            }

            var items = request.getItems().stream().map(itemReq -> {
                var product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + itemReq.getProductId()));
                
                if (product.getQuantity() < itemReq.getQuantity()) {
                    throw new RuntimeException("Không đủ hàng: " + product.getName());
                }
                product.setQuantity(product.getQuantity() - itemReq.getQuantity());
                productRepository.save(product);

                String productName = (itemReq.getProductName() != null && !itemReq.getProductName().isEmpty())
                                     ? itemReq.getProductName() 
                                     : product.getName();

                return OrderItem.builder()
                        .productId(product.getId())
                        .productName(productName)
                        .quantity(itemReq.getQuantity())
                        .price(itemReq.getPrice())
                        .total(itemReq.getPrice() * itemReq.getQuantity())
                        .build();
            }).collect(Collectors.toList());

            Order order = Order.builder()
                    .user(currentUser)
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .note(request.getNote())
                    .paymentMethod(request.getPaymentMethod()) // Dòng này giờ sẽ hết lỗi
                    .items(items)
                    .totalAmount(items.stream().mapToDouble(OrderItem::getTotal).sum())
                    .build();

            Order saved = orderRepository.save(order);
            return mapToDto(saved);

        } catch (Exception e) {
            e.printStackTrace(); 
            throw new RuntimeException("Lỗi tạo đơn hàng: " + e.getMessage()); 
        }
    }

    // (Các hàm getAllOrders, getMyOrders, updateOrderStatus, cancelMyOrder, getOrderById... giữ nguyên)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    public List<OrderDto> getMyOrders() {
        User currentUser = getCurrentUser();
        return orderRepository.findByUserIdOrderByOrderDateDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        order.setStatus(status);
        if ("cancelled".equals(status)) {
            this.rollbackStock(order);
        }
        Order saved = orderRepository.save(order);
        return mapToDto(saved);
    }
    @Transactional
    public OrderDto cancelMyOrder(Long orderId) {
        User currentUser = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }
        if (!"pending".equals(order.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn hàng đang được xử lý hoặc đã hoàn thành");
        }
        this.rollbackStock(order);
        order.setStatus("cancelled");
        Order saved = orderRepository.save(order);
        return mapToDto(saved);
    }
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        return mapToDto(order);
    }

    // --- Hàm tiện ích ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        // === SỬA LỖI TẠI ĐÂY (bỏ chữ "V") ===
        return userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + currentUsername));
        // === HẾT SỬA ===
    }
    
    private void rollbackStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) { 
                var product = productRepository.findById(item.getProductId()).orElse(null);
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }
    }
    
    private OrderDto mapToDto(Order order) {
        var items = order.getItems().stream().map(item -> {
            String imageUrl = null;
            if (item.getProductId() != null) {
                Product product = productRepository.findById(item.getProductId()).orElse(null);
                if (product != null) {
                    imageUrl = product.getImageUrl();
                }
            }
            return OrderDto.OrderItemDto.builder()
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .total(item.getTotal())
                .imageUrl(imageUrl)
                .build();
        }).collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .username(order.getUser() != null ? order.getUser().getUsername() : null)
                .phone(order.getPhone())
                .address(order.getAddress())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .items(items)
                .build();
    }
}