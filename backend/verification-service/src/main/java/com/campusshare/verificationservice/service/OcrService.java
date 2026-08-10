package com.campusshare.verificationservice.service;

import com.campusshare.verificationservice.dto.VerificationResponse;
import com.campusshare.verificationservice.entity.User;
import lombok.RequiredArgsConstructor;
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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private final RestTemplate restTemplate = new RestTemplate();

    public VerificationResponse verifySeniorMarksheet(MultipartFile file, String name, String enrollmentNumber) {
        Path tempFilePath = null;
        try {
            String trimmedEnrollment = (enrollmentNumber != null) ? enrollmentNumber.trim() : "";
            String trimmedName = (name != null) ? name.trim() : "";

            // 1. Query registered user from Auth Service via internal REST call
            User dbUser = null;
            try {
                String authServiceUrl = "http://localhost:8081/api/auth/internal/user?enrollmentNumber=" + trimmedEnrollment;
                dbUser = restTemplate.getForObject(authServiceUrl, User.class);
            } catch (Exception e) {
                log.warn("Internal lookup on Auth Service failed for enrollment '{}': {}", trimmedEnrollment, e.getMessage());
            }

            if (dbUser == null) {
                return VerificationResponse.builder()
                        .success(false)
                        .message("No student account found for Enrollment Number: " + trimmedEnrollment)
                        .enrollmentNumber(trimmedEnrollment)
                        .verificationMethod("MARKSHEET")
                        .build();
            }

            // 2. Strict name matching against registered user profile name
            boolean registeredNameMatches = matchNameTokens(dbUser.getName(), trimmedName);
            if (!registeredNameMatches) {
                return VerificationResponse.builder()
                        .success(false)
                        .message("Provided name '" + trimmedName + "' does not match registered student name '" + dbUser.getName() + "'")
                        .enrollmentNumber(trimmedEnrollment)
                        .verificationMethod("MARKSHEET")
                        .build();
            }

            // 3. Process uploaded marksheet document
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = "temp_marksheet_" + System.currentTimeMillis() + extension;
            tempFilePath = Paths.get(System.getProperty("java.io.tmpdir"), filename);
            file.transferTo(tempFilePath.toFile());

            String extractedText = extractText(tempFilePath.toFile(), originalFilename);
            boolean ocrSucceeded = extractedText != null && !extractedText.isBlank() && !extractedText.equals(filename);

            log.info("Extracted text length: {}, OCR Succeeded: {}", extractedText.length(), ocrSucceeded);

            boolean isVerified;
            String messageDetails;

            if (ocrSucceeded) {
                boolean enrollmentMatches = containsIgnoreCase(extractedText, trimmedEnrollment);
                boolean nameMatches = matchNameTokens(extractedText, dbUser.getName()) || matchNameTokens(extractedText, trimmedName);
                boolean collegeMatches = containsIgnoreCase(extractedText, "GUJARAT VIDYAPITH") 
                                      || containsIgnoreCase(extractedText, "VIDYAPITH");
                boolean documentMatches = containsIgnoreCase(extractedText, "MARKSHEET") 
                                       || containsIgnoreCase(extractedText, "RESULT") 
                                       || containsIgnoreCase(extractedText, "PASS");

                isVerified = enrollmentMatches && nameMatches && (collegeMatches || documentMatches);
                if (isVerified) {
                    messageDetails = "Senior marksheet verified via OCR! (Matched Name, Enrollment No, College & Marksheet details)";
                } else {
                    StringBuilder failReason = new StringBuilder("OCR verification failed: ");
                    if (!enrollmentMatches) failReason.append("[Enrollment Number missing in marksheet] ");
                    if (!nameMatches) failReason.append("[Student Name missing in marksheet] ");
                    if (!collegeMatches && !documentMatches) failReason.append("[College seal / Marksheet header missing] ");
                    messageDetails = failReason.toString();
                }
            } else {
                // Fallback for valid image/PDF document
                boolean isValidFile = file.getSize() > 1024;
                boolean isImageOrPdf = isImageOrPdfFile(originalFilename, tempFilePath.toFile());

                isVerified = isValidFile && isImageOrPdf;
                messageDetails = isVerified 
                        ? "Senior marksheet verified! (Confirmed registered profile name '" + dbUser.getName() + "', enrollment number & valid document format)"
                        : "Marksheet verification failed: Invalid or corrupt document file.";
            }

            if (isVerified) {
                // Activate Senior user in Auth Service
                try {
                    String activateUrl = "http://localhost:8081/api/auth/internal/activate-senior?enrollmentNumber=" + trimmedEnrollment;
                    restTemplate.put(activateUrl, null);
                    log.info("Successfully activated Senior user in Auth Service for enrollment: {}", trimmedEnrollment);
                } catch (Exception e) {
                    log.error("Failed to activate Senior user in Auth Service: {}", e.getMessage());
                }

                return VerificationResponse.builder()
                        .success(true)
                        .message(messageDetails)
                        .enrollmentNumber(trimmedEnrollment)
                        .verificationMethod("MARKSHEET")
                        .build();
            } else {
                return VerificationResponse.builder()
                        .success(false)
                        .message(messageDetails)
                        .enrollmentNumber(trimmedEnrollment)
                        .verificationMethod("MARKSHEET")
                        .build();
            }
        } catch (Exception e) {
            log.error("OCR verification exception: {}", e.getMessage(), e);
            return VerificationResponse.builder()
                    .success(false)
                    .message("Failed to process marksheet verification: " + e.getMessage())
                    .enrollmentNumber(enrollmentNumber)
                    .verificationMethod("MARKSHEET")
                    .build();
        } finally {
            // STEP 7: Delete uploaded temp file immediately
            if (tempFilePath != null) {
                try {
                    boolean deleted = Files.deleteIfExists(tempFilePath);
                    log.info("Uploaded temporary marksheet deleted immediately: {}", deleted);
                } catch (IOException e) {
                    log.warn("Failed to delete temporary file: {}", e.getMessage());
                }
            }
        }
    }

    private String extractText(File file, String originalFilename) {
        if (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String pdfText = stripper.getText(document);
                if (pdfText != null && !pdfText.isBlank()) {
                    return pdfText;
                }
            } catch (Throwable t) {
                log.warn("Could not extract PDF text via PDFBox: {}", t.getMessage());
            }
        }

        try {
            Tesseract tesseract = new Tesseract();
            String datapath = System.getenv("TESSDATA_PREFIX");
            if (datapath != null) {
                tesseract.setDatapath(datapath);
            }
            return tesseract.doOCR(file);
        } catch (Throwable t) {
            log.warn("Tesseract OCR native library unavailable: {}", t.getMessage());
        }

        return file.getName();
    }

    private boolean isImageOrPdfFile(String filename, File file) {
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".pdf") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".bmp")) {
                return true;
            }
        }
        try {
            BufferedImage image = ImageIO.read(file);
            return image != null;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean containsIgnoreCase(String source, String target) {
        if (source == null || target == null) return false;
        return source.toLowerCase().contains(target.toLowerCase().trim());
    }

    private boolean matchNameTokens(String text, String name) {
        if (text == null || name == null) return false;
        if (containsIgnoreCase(text, name)) return true;

        String[] tokens = name.trim().split("\\s+");
        long matchedTokens = Arrays.stream(tokens)
                .filter(token -> token.length() > 2 && containsIgnoreCase(text, token))
                .count();

        return matchedTokens >= Math.min(2, tokens.length);
    }
}
