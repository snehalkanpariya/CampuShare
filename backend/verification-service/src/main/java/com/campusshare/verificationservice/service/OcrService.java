package com.campusshare.verificationservice.service;

import com.campusshare.verificationservice.dto.VerificationResponse;
import com.campusshare.verificationservice.entity.User;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.*;
import java.util.Arrays;

@Service
@Slf4j
public class OcrService {

    private final RestTemplate restTemplate = new RestTemplate();

    public VerificationResponse verifySeniorMarksheet(
            MultipartFile file, String name, String enrollmentNumber) {

        Path tempFile = null;

        try {
            String enrollment = enrollmentNumber.trim();
            String studentName = name.trim();

            User user = restTemplate.getForObject(
                    "http://localhost:8081/api/auth/internal/user?enrollmentNumber="
                            + enrollment, User.class);

            if (user == null)
                return response(false, "Student not found", enrollment);

            if (!matchNameTokens(user.getName(), studentName))
                return response(false, "Name does not match", enrollment);

            String original = file.getOriginalFilename();
            String extension = original != null && original.contains(".")
                    ? original.substring(original.lastIndexOf("."))
                    : "";

            tempFile = Paths.get(
                    System.getProperty("java.io.tmpdir"),
                    "marksheet_" + System.currentTimeMillis() + extension);

            file.transferTo(tempFile.toFile());

            String text = extractText(tempFile.toFile(), original);

            boolean verified = text != null && !text.isBlank()
                    && containsIgnoreCase(text, enrollment)
                    && matchNameTokens(text, user.getName())
                    && (containsIgnoreCase(text, "MARKSHEET")
                    || containsIgnoreCase(text, "RESULT")
                    || containsIgnoreCase(text, "VIDYAPITH"));

            if (verified) {
                try {
                    restTemplate.put(
                            "http://localhost:8081/api/auth/internal/activate-senior?enrollmentNumber="
                                    + enrollment, null);
                } catch (Exception e) {
                    log.error("Senior activation failed: {}", e.getMessage());
                }
            }

            return response(
                    verified,
                    verified ? "Marksheet verified successfully"
                            : "Marksheet verification failed",
                    enrollment);

        } catch (Exception e) {
            log.error("OCR error: {}", e.getMessage());
            return response(false, "Failed to process marksheet", enrollmentNumber);

        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (Exception ignored) {
                }
            }
        }
    }

    private VerificationResponse response(
            boolean success, String message, String enrollment) {

        VerificationResponse response = new VerificationResponse();
        response.setSuccess(success);
        response.setMessage(message);
        response.setEnrollmentNumber(enrollment);
        response.setVerificationMethod("MARKSHEET_OCR");
        return response;
    }

    private String extractText(File file, String filename) {

        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file)) {
                return new PDFTextStripper().getText(document);
            } catch (Exception e) {
                log.warn("PDF extraction failed");
            }
        }

        try {
            return new Tesseract().doOCR(file);
        } catch (Exception e) {
            log.warn("OCR failed");
            return "";
        }
    }

    private boolean containsIgnoreCase(String text, String value) {
        return text != null && value != null
                && text.toLowerCase().contains(value.toLowerCase().trim());
    }

    private boolean matchNameTokens(String text, String name) {

        if (text == null || name == null)
            return false;

        if (containsIgnoreCase(text, name))
            return true;

        String[] tokens = name.trim().split("\\s+");

        long matched = Arrays.stream(tokens)
                .filter(t -> t.length() > 2 && containsIgnoreCase(text, t))
                .count();

        return matched >= Math.min(2, tokens.length);
    }
}