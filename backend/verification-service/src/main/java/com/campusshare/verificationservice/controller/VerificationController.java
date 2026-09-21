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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VerificationController {

    private final EmailService emailService;
    private final OcrService ocrService;

    @PostMapping("/email/send-otp")
    public ResponseEntity<String> sendOtp(
            @RequestParam String email,
            @RequestParam String otp) {

        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok("OTP dispatched to " + email);
    }

    @PostMapping("/ocr/marksheet")
    public ResponseEntity<VerificationResponse> verifySeniorMarksheet(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("enrollmentNumber") String enrollmentNumber) {

        VerificationResponse response =
                ocrService.verifySeniorMarksheet(
                        file,
                        name,
                        enrollmentNumber
                );

        return ResponseEntity.ok(response);
    }
}