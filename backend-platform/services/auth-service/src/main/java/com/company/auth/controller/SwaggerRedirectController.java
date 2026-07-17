package com.company.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SwaggerRedirectController {

    @GetMapping("/swagger-admin.html")
    public String swaggerAdmin() {
        return "redirect:/swagger-ui/index.html?url=/v3/api-docs/admin";
    }

    @GetMapping("/swagger-mobile.html")
    public String swaggerMobile() {
        return "redirect:/swagger-ui/index.html?url=/v3/api-docs/mobile";
    }
}
