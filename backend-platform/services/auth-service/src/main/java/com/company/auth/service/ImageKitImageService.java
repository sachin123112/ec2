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
    }

    public String uploadProductImage(MultipartFile image, Long productId) {
        return uploadImage(image, "/products/" + productId);
    }

    public String uploadUserImage(MultipartFile image, Long userId) {
        return uploadImage(image, "/users/" + userId);
    }

    private String uploadImage(MultipartFile image, String folder) {
        if (!StringUtils.hasText(privateKey) || !StringUtils.hasText(urlEndpoint)) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR,
                    "ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.");
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
            logger.error("Unable to upload image to ImageKit", exception);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR,
                    "Unable to upload image to ImageKit", exception);
        }
    }

    private String safeFileName(String fileName) {
        String value = StringUtils.hasText(fileName) ? fileName : "image.jpg";
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
