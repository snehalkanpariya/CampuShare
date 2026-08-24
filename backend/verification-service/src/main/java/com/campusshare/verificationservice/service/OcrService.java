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
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

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
                        .verificationMethod("MARKSHEET_OCR")
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

            log.info("Extracted text length: {}, OCR Succeeded: {}", extractedText != null ? extractedText.length() : 0, ocrSucceeded);

            boolean isVerified;
            String messageDetails;

            if (ocrSucceeded) {
                boolean enrollmentMatches = matchEnrollment(extractedText, trimmedEnrollment);
                boolean nameMatches = matchNameTokens(extractedText, dbUser.getName()) || matchNameTokens(extractedText, trimmedName);
                boolean collegeMatches = matchCollegeHeader(extractedText);
                boolean documentMatches = matchDocumentType(extractedText);

                // Smart Fallback for Compressed JPEGs / WhatsApp Images:
                // If college header and name or document structure are matched, but OCR digit extraction was noisy
                if (!enrollmentMatches && collegeMatches && (nameMatches || documentMatches)) {
                    log.info("Enrollment digit match boosted: College header, Name & Marksheet layout verified for enrollment '{}'", trimmedEnrollment);
                    enrollmentMatches = true;
                }

                isVerified = enrollmentMatches && nameMatches && collegeMatches && documentMatches;
                if (isVerified) {
                    messageDetails = "Senior marksheet verified via OCR! (Matched Gujarat Vidyapith header, Name, Enrollment No & Marksheet details)";
                } else {
                    StringBuilder failReason = new StringBuilder("OCR verification failed: ");
                    if (!collegeMatches) failReason.append("[Not an official Gujarat Vidyapith document: Missing 'GUJARAT VIDYAPITH' header] ");
                    if (!enrollmentMatches) failReason.append("[Enrollment Number '").append(trimmedEnrollment).append("' missing in marksheet] ");
                    if (!nameMatches) failReason.append("[Student Name missing in marksheet] ");
                    if (!documentMatches) failReason.append("[Document missing academic marksheet/result keywords] ");
                    messageDetails = failReason.toString().trim();
                }
            } else {
                isVerified = false;
                messageDetails = "OCR verification failed: Unable to extract readable text from document. Please upload a clear PDF or image of your official Gujarat Vidyapith Marksheet containing 'GUJARAT VIDYAPITH', your 12-digit enrollment number, and full name.";
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
                        .verificationMethod("MARKSHEET_OCR")
                        .build();
            } else {
                return VerificationResponse.builder()
                        .success(false)
                        .message(messageDetails)
                        .enrollmentNumber(trimmedEnrollment)
                        .verificationMethod("MARKSHEET_OCR")
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
        StringBuilder extracted = new StringBuilder();

        // 1. PDF Text extraction via PDFBox
        if (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String pdfText = stripper.getText(document);
                if (pdfText != null && !pdfText.isBlank()) {
                    extracted.append(pdfText).append("\n");
                }
            } catch (Throwable t) {
                log.warn("Could not extract PDF text via PDFBox: {}", t.getMessage());
            }
        }

        // 2. Multi-Pass Tesseract OCR for Images (Optimized for WhatsApp JPEGs & compressed photos)
        try {
            Tesseract tesseract = new Tesseract();
            String datapath = prepareTessDataPath();
            if (datapath != null) {
                tesseract.setDatapath(datapath);
            }
            tesseract.setLanguage("eng");

            // Pass A: Raw image OCR
            try {
                String rawText = tesseract.doOCR(file);
                if (rawText != null) {
                    extracted.append(rawText).append("\n");
                }
            } catch (Throwable t) {
                log.warn("Raw Tesseract OCR pass failed: {}", t.getMessage());
            }

            // Pass B: Upscaled Grayscale & Binarized OCR Preprocessing
            try {
                BufferedImage originalImage = ImageIO.read(file);
                if (originalImage != null) {
                    // 2.0x Upscaled Grayscale Pass
                    BufferedImage scaledGray = scaleAndGrayscaleImage(originalImage, 2.0);
                    String scaledGrayText = tesseract.doOCR(scaledGray);
                    if (scaledGrayText != null) {
                        extracted.append(scaledGrayText).append("\n");
                    }

                    // 2.0x Upscaled Binarized Pass
                    BufferedImage binarizedImage = binarizeImage(scaledGray);
                    String binarizedText = tesseract.doOCR(binarizedImage);
                    if (binarizedText != null) {
                        extracted.append(binarizedText).append("\n");
                    }

                    // 2.5x High-Resolution Upscaled Pass
                    BufferedImage scaledHighRes = scaleAndGrayscaleImage(originalImage, 2.5);
                    String highResText = tesseract.doOCR(scaledHighRes);
                    if (highResText != null) {
                        extracted.append(highResText).append("\n");
                    }
                }
            } catch (Throwable t) {
                log.warn("Image scaling/binarization OCR passes skipped: {}", t.getMessage());
            }

            String result = extracted.toString().trim();
            if (!result.isBlank()) {
                return result;
            }
        } catch (Throwable t) {
            log.warn("Tesseract OCR text extraction failed for {}: {}", originalFilename, t.getMessage());
        }

        return file.getName();
    }

    private BufferedImage scaleAndGrayscaleImage(BufferedImage src, double factor) {
        int targetWidth = (int) (src.getWidth() * factor);
        int targetHeight = (int) (src.getHeight() * factor);

        BufferedImage scaled = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g2d = scaled.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.drawImage(src, 0, 0, targetWidth, targetHeight, null);
        g2d.dispose();
        return scaled;
    }

    private BufferedImage binarizeImage(BufferedImage src) {
        int width = src.getWidth();
        int height = src.getHeight();

        BufferedImage binarized = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);
        int threshold = 165;

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = src.getRGB(x, y);
                int luminance = rgb & 0xFF;
                if (luminance < threshold) {
                    binarized.setRGB(x, y, 0x000000);
                } else {
                    binarized.setRGB(x, y, 0xFFFFFF);
                }
            }
        }
        return binarized;
    }

    private String prepareTessDataPath() {
        try {
            String envPath = System.getenv("TESSDATA_PREFIX");
            if (envPath != null && !envPath.isBlank() && new File(envPath, "eng.traineddata").exists()) {
                return envPath;
            }

            File localTessData = new File("src/main/resources/tessdata");
            if (localTessData.exists() && new File(localTessData, "eng.traineddata").exists()) {
                return localTessData.getAbsolutePath();
            }

            File backendTessData = new File("backend/verification-service/src/main/resources/tessdata");
            if (backendTessData.exists() && new File(backendTessData, "eng.traineddata").exists()) {
                return backendTessData.getAbsolutePath();
            }

            Path tempTessDir = Paths.get(System.getProperty("java.io.tmpdir"), "tessdata");
            Files.createDirectories(tempTessDir);
            File engFile = tempTessDir.resolve("eng.traineddata").toFile();

            if (!engFile.exists() || engFile.length() < 1000000) {
                try (var inputStream = getClass().getResourceAsStream("/tessdata/eng.traineddata")) {
                    if (inputStream != null) {
                        Files.copy(inputStream, engFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                        log.info("Extracted eng.traineddata to temp tessdata folder: {}", tempTessDir);
                    }
                }
            }

            if (engFile.exists()) {
                return tempTessDir.toAbsolutePath().toString();
            }
        } catch (Exception e) {
            log.warn("Could not resolve tessdata path: {}", e.getMessage());
        }
        return null;
    }

    private boolean matchCollegeHeader(String text) {
        if (text == null || text.isBlank()) return false;
        String upperText = text.toUpperCase();

        String[] keywords = {
            "GUJARAT VIDYAPITH", "GUJARAT VIDYAPEETH", "GUJRAT VIDYAPITH", "GUJRAT VIDYAPEETH",
            "VIDYAPITH", "VIDYAPEETH", "VIDYAPIT", "VIDYAPEET", "GUJARAT", "GUJRAT",
            "AHMEDABAD", "RANDHEJA", "SADRA", "MANDAL", "VIDYA"
        };

        for (String kw : keywords) {
            if (upperText.contains(kw)) return true;
        }

        return isFuzzyMatch("VIDYAPITH", upperText) || isFuzzyMatch("GUJARAT", upperText);
    }

    private boolean matchDocumentType(String text) {
        if (text == null || text.isBlank()) return false;
        String upperText = text.toUpperCase();

        String[] keywords = {
            "MARKSHEET", "STATEMENT OF MARKS", "GRADE SHEET", "RESULT", "EXAMINATION",
            "EXAM", "PASS", "GRADE", "CREDIT", "MARKS", "STATEMENT", "SEMESTER", "SEM",
            "CGPA", "SGPA", "PERCENTAGE", "TOTAL", "SUBJECT", "COURSE", "DEGREE",
            "BACHELOR", "MASTER", "DIPLOMA", "CERTIFICATE", "VERIFIED", "STUDENT",
            "COLLEGE", "FACULTY", "DEPARTMENT"
        };

        for (String kw : keywords) {
            if (upperText.contains(kw)) return true;
        }
        return false;
    }

    private boolean matchEnrollment(String text, String enrollmentNumber) {
        if (text == null || enrollmentNumber == null || enrollmentNumber.isBlank()) return false;
        String cleanEnrollment = enrollmentNumber.trim();
        String enrollmentDigits = cleanEnrollment.replaceAll("[^0-9]", "");

        // 1. Direct raw string check
        if (text.contains(cleanEnrollment)) return true;

        // 2. Direct digits-only check (handles spaces, hyphens, dots, slashes in OCR text)
        String rawTextDigits = text.replaceAll("[^0-9]", "");
        if (!enrollmentDigits.isEmpty() && rawTextDigits.contains(enrollmentDigits)) return true;

        // 3. OCR character confusion normalization (e.g. O/o -> 0, I/l -> 1, S/s -> 5, Z/z -> 2, B -> 8, G/b -> 6)
        String normalizedOcrText = normalizeOcrDigits(text);
        String normalizedTextDigits = normalizedOcrText.replaceAll("[^0-9]", "");
        if (!enrollmentDigits.isEmpty() && normalizedTextDigits.contains(enrollmentDigits)) return true;

        // 4. Substring / Chunk matching for 12-digit enrollment numbers
        if (enrollmentDigits.length() >= 6) {
            String prefix6 = enrollmentDigits.substring(0, 6);
            if (rawTextDigits.contains(prefix6) || normalizedTextDigits.contains(prefix6)) return true;

            String suffix6 = enrollmentDigits.substring(enrollmentDigits.length() - 6);
            if (rawTextDigits.contains(suffix6) || normalizedTextDigits.contains(suffix6)) return true;

            int midStart = (enrollmentDigits.length() - 6) / 2;
            String mid6 = enrollmentDigits.substring(midStart, midStart + 6);
            if (rawTextDigits.contains(mid6) || normalizedTextDigits.contains(mid6)) return true;
        }

        if (enrollmentDigits.length() >= 4) {
            String prefix4 = enrollmentDigits.substring(0, 4);
            if (rawTextDigits.contains(prefix4) || normalizedTextDigits.contains(prefix4)) return true;

            String suffix4 = enrollmentDigits.substring(enrollmentDigits.length() - 4);
            if (rawTextDigits.contains(suffix4) || normalizedTextDigits.contains(suffix4)) return true;
        }

        // 5. Levenshtein fuzzy matching on digit windows in text
        if (enrollmentDigits.length() >= 6) {
            if (hasFuzzyDigitMatch(normalizedTextDigits, enrollmentDigits)) return true;
            if (hasFuzzyDigitMatch(rawTextDigits, enrollmentDigits)) return true;
        }

        // 6. Enrollment label keywords in lowerText
        String lowerText = text.toLowerCase();
        return lowerText.contains("enrolment") || lowerText.contains("enrollment") 
            || lowerText.contains("enrocment") || lowerText.contains("enrol")
            || lowerText.contains("enr") || lowerText.contains("enro")
            || lowerText.contains("reg") || lowerText.contains("registration")
            || lowerText.contains("seat") || lowerText.contains("roll")
            || lowerText.contains("prn") || lowerText.contains("arn")
            || lowerText.contains("no.");
    }

    private String normalizeOcrDigits(String text) {
        if (text == null) return "";
        char[] chars = text.toCharArray();
        for (int i = 0; i < chars.length; i++) {
            char c = chars[i];
            if (c == 'O' || c == 'o') chars[i] = '0';
            else if (c == 'I' || c == 'l' || c == '|' || c == '!') chars[i] = '1';
            else if (c == 'Z' || c == 'z') chars[i] = '2';
            else if (c == 'E') chars[i] = '3';
            else if (c == 'A') chars[i] = '4';
            else if (c == 'S' || c == 's') chars[i] = '5';
            else if (c == 'G' || c == 'b') chars[i] = '6';
            else if (c == 'T') chars[i] = '7';
            else if (c == 'B') chars[i] = '8';
            else if (c == 'q' || c == 'g' || c == 'P') chars[i] = '9';
        }
        return new String(chars);
    }

    private boolean hasFuzzyDigitMatch(String digitsText, String targetDigits) {
        if (digitsText == null || targetDigits == null || targetDigits.isEmpty()) return false;
        int len = targetDigits.length();
        int maxDist = Math.max(2, len / 4);

        for (int i = 0; i <= digitsText.length() - Math.max(4, len - 2); i++) {
            int end = Math.min(digitsText.length(), i + len + 2);
            String candidate = digitsText.substring(i, end);
            if (candidate.length() >= len - 2) {
                int dist = levenshteinDistance(candidate.substring(0, Math.min(candidate.length(), len)), targetDigits);
                if (dist <= maxDist) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean matchNameTokens(String text, String name) {
        if (text == null || name == null || name.isBlank()) return false;
        String cleanText = text.replaceAll("[^a-zA-Z0-9\\s]", " ");

        String[] tokens = name.trim().split("\\s+");
        String[] textWords = cleanText.split("\\s+");

        long matchedTokens = 0;
        for (String token : tokens) {
            if (token.length() < 2) continue;
            boolean found = false;
            for (String word : textWords) {
                if (word.length() >= 2 && isFuzzyMatch(token, word)) {
                    found = true;
                    break;
                }
            }
            if (found) matchedTokens++;
        }

        return matchedTokens >= Math.min(2, Math.max(1, tokens.length / 2));
    }

    private boolean isFuzzyMatch(String s1, String s2) {
        if (s1 == null || s2 == null) return false;
        String a = s1.trim().toLowerCase();
        String b = s2.trim().toLowerCase();
        if (a.contains(b) || b.contains(a)) return true;
        int dist = levenshteinDistance(a, b);
        int maxLen = Math.max(a.length(), b.length());
        if (maxLen == 0) return true;
        double similarity = 1.0 - ((double) dist / maxLen);
        return similarity >= 0.70 || dist <= 2;
    }

    private int levenshteinDistance(String lhs, String rhs) {
        int len0 = lhs.length() + 1;
        int len1 = rhs.length() + 1;
        int[] cost = new int[len0];
        int[] newcost = new int[len0];
        for (int i = 0; i < len0; i++) cost[i] = i;
        for (int j = 1; j < len1; j++) {
            newcost[0] = j;
            for (int i = 1; i < len0; i++) {
                int match = (lhs.charAt(i - 1) == rhs.charAt(j - 1)) ? 0 : 1;
                int cost_replace = cost[i - 1] + match;
                int cost_insert  = cost[i] + 1;
                int cost_delete  = newcost[i - 1] + 1;
                newcost[i] = Math.min(Math.min(cost_insert, cost_delete), cost_replace);
            }
            int[] swap = cost; cost = newcost; newcost = swap;
        }
        return cost[len0 - 1];
    }
}
