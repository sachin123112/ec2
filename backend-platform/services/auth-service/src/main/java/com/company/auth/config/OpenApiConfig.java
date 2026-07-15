package com.company.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI platformOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("PawMart API")
                        .version("v1")
                        .description("APIs for the PawMart admin and mobile panels."))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("admin")
                .displayName("Admin Panel")
                .pathsToMatch(
                        "/api/v1/admin/**",
                        "/api/v1/users/**",
                        "/api/v1/roles/**",
                        "/api/v1/products/**",
                        "/api/v1/categories/**",
                        "/api/v1/orders/**",
                        "/api/v1/links/**")
                .build();
    }

    @Bean
    public GroupedOpenApi mobileApi() {
        return GroupedOpenApi.builder()
                .group("mobile")
                .displayName("Mobile Panel")
                .pathsToMatch(
                        "/api/v1/auth/**",
                        "/api/v1/products/**",
                        "/api/v1/categories/**",
                        "/api/v1/orders/**",
                        "/api/v1/users/me/**",
                        "/api/v1/addresses/**",
                        "/api/v1/health")
                .build();
    }
}
