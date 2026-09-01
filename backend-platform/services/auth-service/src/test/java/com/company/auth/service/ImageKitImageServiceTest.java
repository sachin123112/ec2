package com.company.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ImageKitImageServiceTest {

    @Test
    void uploadProductImage_withoutImageKitConfig_fallsBackToLocalStorage() throws IOException {
        Path originalCwd = Path.of(System.getProperty("user.dir"));
        Path tempDir = Files.createTempDirectory("imagekit-fallback-");
        System.setProperty("user.dir", tempDir.toString());

        try {
            ImageKitImageService service = new ImageKitImageService("", "", new ObjectMapper());
            MockMultipartFile image = new MockMultipartFile(
                    "image",
                    "sample.png",
                    "image/png",
                    new byte[] {1, 2, 3, 4, 5}
            );

            String url = service.uploadProductImage(image, 42L);

            assertTrue(url.startsWith("/uploads/products/42/"));
            assertTrue(Files.exists(tempDir.resolve("uploads/products/42/sample.png")));
        } finally {
            System.setProperty("user.dir", originalCwd.toString());
        }
    }
}
