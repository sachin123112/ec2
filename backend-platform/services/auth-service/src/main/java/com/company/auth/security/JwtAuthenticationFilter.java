package com.company.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;

import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        filterChain.doFilter(request, response);
    }
}
