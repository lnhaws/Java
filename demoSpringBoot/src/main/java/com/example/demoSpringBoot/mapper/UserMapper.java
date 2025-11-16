package com.example.demoSpringBoot.mapper;

import com.example.demoSpringBoot.dto.UserDto;
import com.example.demoSpringBoot.entity.User;

public class UserMapper {
    
    public static UserDto toDTO(User user) {
        if (user == null) return null;
        return new UserDto(
            user.getId(),
            user.getUsername(),
            user.getRole(),
            user.getDisplayName(),
            user.getPhone(),
            user.getAddress(),
            user.getImageUrl()
        );
    }
}