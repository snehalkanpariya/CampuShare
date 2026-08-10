package com.campusshare.verificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("CampusShare Email Verification OTP");
            message.setText("Welcome to CampusShare!\n\nYour OTP for account verification is: " + otp + "\n\nThis OTP will expire in 10 minutes.");

            mailSender.send(message);
            log.info("OTP email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            // Log fallback for development testing
            log.info("DEVELOPMENT OTP FOR {}: {}", toEmail, otp);
        }
    }
}
