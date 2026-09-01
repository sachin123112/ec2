package com.company.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
public class ImageKitImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageKitImageService.class);
    private static final String UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

    private final String privateKey;
    private final String urlEndpoint;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public ImageKitImageService(
            @Value("${imagekit.private-key:}") String privateKey,
            @Value("${imagekit.url-endpoint:}") String urlEndpoint,
            ObjectMapper objectMapper) {
        this.privateKey = privateKey;
        this.urlEndpoint = urlEndpoint;
        this.objectMapper = objectMapper;

        if (StringUtils.hasText(privateKey) && StringUtils.hasText(urlEndpoint)) {
            logger.info("ImageKit active: cloud uploads enabled for product and profile images.");
        } else {
            logger.warn("ImageKit not configured: using local fallback uploads in the uploads/ directory.");
        }
    }

    public String uploadProductImage(MultipartFile image, Long productId) {
        return uploadImage(image, "/products/" + productId);
    }

    public String uploadUserImage(MultipartFile image, Long userId) {
        return uploadImage(image, "/users/" + userId);
    }

    private String uploadImage(MultipartFile image, String folder) {
        if (!StringUtils.hasText(privateKey) || !StringUtils.hasText(urlEndpoint)) {
            return saveLocalUploadFallback(image, folder);
        }

        try {
            String fileName = safeFileName(image.getOriginalFilename());
            ByteArrayResource fileResource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return fileName;
                }
            };

            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
            form.add("file", fileResource);
            form.add("fileName", fileName);
            form.add("folder", folder);
            form.add("useUniqueFileName", "true");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBasicAuth(privateKey, "", StandardCharsets.UTF_8);

            ResponseEntity<String> response = restTemplate.exchange(
                    UPLOAD_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(form, headers),
                    String.class);
            JsonNode body = objectMapper.readTree(response.getBody());
            String imageUrl = body.path("url").asText();
            if (!StringUtils.hasText(imageUrl)) {
                throw new IOException("ImageKit response did not contain an image URL");
            }
            return imageUrl;
        } catch (IOException | RestClientException exception) {
            logger.warn("ImageKit upload failed, falling back to local storage", exception);
            return saveLocalUploadFallback(image, folder);
        }
    }

    private String saveLocalUploadFallback(MultipartFile image, String folder) {
        try {
            String fileName = safeFileName(image.getOriginalFilename());
            String normalizedFolder = folder == null ? "uploads" : folder.replace("\\", "/").replace("//", "/");
            Path uploadRoot = Paths.get(System.getProperty("user.dir"), "uploads");
            Path targetDirectory = uploadRoot.resolve(normalizedFolder.replaceFirst("^/", "")).normalize();
            Files.createDirectories(targetDirectory);

            Path targetFile = targetDirectory.resolve(fileName).normalize();
            Files.write(targetFile, image.getBytes());

            String relativeUrl = "/uploads/" + uploadRoot.relativize(targetFile).toString().replace('\\', '/');
            return relativeUrl;
        } catch (IOException exception) {
            logger.error("Unable to save uploaded image locally", exception);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR,
                    "Unable to upload image. Please configure ImageKit or check the local upload directory.", exception);
        }
    }

    private String safeFileName(String fileName) {
        String value = StringUtils.hasText(fileName) ? fileName : "image.jpg";
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
