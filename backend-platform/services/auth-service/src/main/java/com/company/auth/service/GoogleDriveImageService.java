package com.company.auth.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Collections;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
public class GoogleDriveImageService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleDriveImageService.class);

    private final String credentialsFile;
    private final String folderId;
    private final Drive drive;

    public GoogleDriveImageService(
            @Value("${google.drive.credentials-file:}") String credentialsFile,
            @Value("${google.drive.folder-id:}") String folderId) {
        this.credentialsFile = credentialsFile;
        this.folderId = folderId;
        this.drive = createDriveClient();
    }

    public String uploadProductImage(MultipartFile image, Long productId) {
        return uploadImage(image, productId + "_product");
    }

    public String uploadUserImage(MultipartFile image, Long userId) {
        return uploadImage(image, userId + "_user");
    }

    private String uploadImage(MultipartFile image, String filePrefix) {
        if (drive == null || !StringUtils.hasText(folderId)) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR,
                    "Google Drive is not configured. Set GOOGLE_DRIVE_CREDENTIALS_FILE and GOOGLE_DRIVE_FOLDER_ID.");
        }

        try (InputStream inputStream = image.getInputStream()) {
            File metadata = new File()
                    .setName(filePrefix + "_" + System.currentTimeMillis() + "_" + safeFileName(image.getOriginalFilename()))
                    .setParents(Collections.singletonList(folderId));
            InputStreamContent content = new InputStreamContent(
                    image.getContentType() == null ? "application/octet-stream" : image.getContentType(),
                    inputStream);
            File uploaded = drive.files().create(metadata, content)
                    .setFields("id")
                    .execute();
            drive.permissions().create(uploaded.getId(), new Permission().setType("anyone").setRole("reader"))
                    .execute();
            return "https://drive.google.com/uc?export=view&id=" + uploaded.getId();
        } catch (IOException exception) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Unable to upload product image to Google Drive", exception);
        }
    }

    private Drive createDriveClient() {
        if (!StringUtils.hasText(credentialsFile)) return null;
        java.nio.file.Path credentialsPath = java.nio.file.Paths.get(credentialsFile);
        if (!java.nio.file.Files.isRegularFile(credentialsPath)) {
            logger.warn("Google Drive credentials file was not found; Drive uploads are disabled");
            return null;
        }
        try (InputStream credentials = java.nio.file.Files.newInputStream(credentialsPath)) {
            GoogleCredentials googleCredentials = GoogleCredentials.fromStream(credentials)
                    .createScoped(Collections.singleton("https://www.googleapis.com/auth/drive.file"));
            return new Drive.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(googleCredentials))
                    .setApplicationName("PawMart")
                    .build();
        } catch (IOException | GeneralSecurityException exception) {
            logger.error("Unable to initialize Google Drive client; Drive uploads are disabled", exception);
            return null;
        }
    }

    private String safeFileName(String fileName) {
        String value = StringUtils.hasText(fileName) ? fileName : "image.jpg";
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}