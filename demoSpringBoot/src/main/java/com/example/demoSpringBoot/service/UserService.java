package com.example.demoSpringBoot.service;

import com.example.demoSpringBoot.dto.UserDto;
import com.example.demoSpringBoot.entity.User;
import com.example.demoSpringBoot.mapper.UserMapper;
import com.example.demoSpringBoot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
// === THÊM IMPORT NÀY ===
import org.springframework.security.core.userdetails.UsernameNotFoundException; 
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    // Hàm tiện ích lấy User đang đăng nhập
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        // === SỬA LỖI TẠI ĐÂY ===
        return userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + currentUsername));
        // === HẾT SỬA ===
    }

    // 1. Lấy thông tin hồ sơ của tôi
    public UserDto getMyProfile() {
        User user = getCurrentUser();
        return UserMapper.toDTO(user);
    }

    // 2. Cập nhật hồ sơ của tôi
    @Transactional
    public UserDto updateMyProfile(String displayName, String phone, String address, MultipartFile image) {
        User user = getCurrentUser();

        if (displayName != null && !displayName.isEmpty()) {
            user.setDisplayName(displayName);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (address != null) {
            user.setAddress(address);
        }
        
        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(image);
            user.setImageUrl(imageUrl);
        }

        User savedUser = userRepository.save(user);
        return UserMapper.toDTO(savedUser);
    }
}