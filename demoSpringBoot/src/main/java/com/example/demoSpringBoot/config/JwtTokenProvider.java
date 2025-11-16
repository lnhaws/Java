package com.example.demoSpringBoot.config; // Hoặc .security

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // (1) Tạo một khóa bí mật (secret key) an toàn.
    // Nên lưu key này trong file application.properties
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    private final long JWT_EXPIRATION = 86400000L; // 1 ngày (tính bằng mili giây)

    // (2) Hàm tạo Token từ thông tin Authentication
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .setSubject(userDetails.getUsername()) // Gán username vào "subject" của token
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // (3) Hàm lấy username từ Token
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // (4) Hàm kiểm tra Token có hợp lệ không
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            // Token không hợp lệ (hết hạn, sai chữ ký, v.v.)
            return false;
        }
    }
}