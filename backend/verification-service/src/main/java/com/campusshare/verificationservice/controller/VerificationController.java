package com.campusshare.verificationservice.controller;

import com.campusshare.verificationservice.dto.VerificationResponse;
import com.campusshare.verificationservice.service.EmailService;
import com.campusshare.verificationservice.service.OcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
public class VerificationController {

    private final EmailService emailService;
    private final OcrService ocrService;

    @PostMapping("/email/send-otp")
    public ResponseEntity<String> sendOtp(
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "otp", required = false) String otp) {
        if (email == null || email.isBlank() || otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body("Both 'email' and 'otp' parameters are required.");
        }
        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok("OTP dispatched to " + email);
    }

    @PostMapping("/ocr/marksheet")
    public ResponseEntity<?> verifySeniorMarksheet(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "enrollmentNumber", required = false) String enrollmentNumber,
            @RequestParam(value = "enrollmentnumber", required = false) String enrollmentnumberAlt) {

        String finalEnrollmentNumber = (enrollmentNumber != null && !enrollmentNumber.isBlank())
                ? enrollmentNumber
                : enrollmentnumberAlt;

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(VerificationResponse.builder()
                    .success(false)
                    .message("Missing required parameter: 'file' (Must select a valid file in Postman form-data)")
                    .build());
        }
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(VerificationResponse.builder()
                    .success(false)
                    .message("Missing required parameter: 'name'")
                    .build());
        }
        if (finalEnrollmentNumber == null || finalEnrollmentNumber.isBlank()) {
            return ResponseEntity.badRequest().body(VerificationResponse.builder()
                    .success(false)
                    .message("Missing required parameter: 'enrollmentNumber'")
                    .build());
        }

        VerificationResponse response = ocrService.verifySeniorMarksheet(file, name, finalEnrollmentNumber);
        return ResponseEntity.ok(response);
    }
}
