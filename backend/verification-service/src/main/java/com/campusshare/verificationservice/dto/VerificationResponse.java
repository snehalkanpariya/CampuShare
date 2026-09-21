package com.campusshare.verificationservice.dto;

import lombok.Data;

@Data
public class VerificationResponse {

    private boolean success;
    private String message;
    private String enrollmentNumber;
    private String verificationMethod;
}