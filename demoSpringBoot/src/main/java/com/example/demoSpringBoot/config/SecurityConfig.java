package com.example.demoSpringBoot.config;

import com.example.demoSpringBoot.service.impl.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Quan trọng
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Bắt buộc phải có để @PreAuthorize hoạt động
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;

    // (Các bean: PasswordEncoder, AuthenticationManager, Cors... giữ nguyên)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            ) 
            
            // === SỬA LỖI 403 TẠI ĐÂY ===
            .authorizeHttpRequests(auth -> auth
                // --- 1. PUBLIC (Ai cũng xem được) ---
                .requestMatchers("/api/auth/**").permitAll() 
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/uploads/**").permitAll() 
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()

                // --- 2. USER (Chỉ cần đăng nhập - authenticated()) ---
                .requestMatchers(HttpMethod.POST, "/api/orders").authenticated() // Tạo đơn hàng
                .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").authenticated() // Xem đơn của tôi
                .requestMatchers(HttpMethod.PUT, "/api/orders/{id}/cancel").authenticated() // Hủy đơn của tôi
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated() // Xem hồ sơ
                .requestMatchers(HttpMethod.PUT, "/api/users/profile").authenticated() // Cập nhật hồ sơ

                // --- 3. ADMIN (Bắt buộc ROLE_ADMIN) ---
                // C/U/D Sản phẩm & Danh mục
                .requestMatchers(HttpMethod.POST, "/api/products", "/api/categories").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**").hasRole("ADMIN")
                
                // Quản lý Đơn hàng (Admin)
                .requestMatchers(HttpMethod.GET, "/api/orders", "/api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/orders/{id}/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/auth/users").hasRole("ADMIN")
                
                // 4. Bất kỳ request nào còn lại đều cần đăng nhập
                .anyRequest().authenticated()
            )
            // === HẾT SỬA ===

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}