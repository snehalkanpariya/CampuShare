package com.campusshare.itemservice.dto;

import lombok.Data;

@Data
public class SendMessageDTO {
    private String requestId;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String message;
}
