package com.company.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebResourceConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        registry.addResourceHandler("/users/**")
                .addResourceLocations("file:uploads/users/");
        registry.addResourceHandler("/products/**")
                .addResourceLocations("file:uploads/products/");
        registry.addResourceHandler("/profile-images/**")
                .addResourceLocations("file:uploads/profile-images/");
    }
}
