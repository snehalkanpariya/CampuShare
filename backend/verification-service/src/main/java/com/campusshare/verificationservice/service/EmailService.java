package com.campusshare.verificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:snehalkanpariya@gmail.com}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CampusShare Email Verification OTP");
            message.setText("Welcome to GVPCampusShare!\n\nYour OTP for account verification is: " + otp + "\n\nThis OTP will expire in 10 minutes.");

            mailSender.send(message);
            log.info("OTP email successfully sent from {} to {}", fromEmail, toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            // Log fallback for development testing
            log.info("DEVELOPMENT OTP FOR {}: {}", toEmail, otp);
        }
    }
}
