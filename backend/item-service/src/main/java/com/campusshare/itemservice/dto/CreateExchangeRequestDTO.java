package com.campusshare.itemservice.dto;

import lombok.Data;

@Data
public class CreateExchangeRequestDTO {
    private String itemId;
    private String requesterId;
    private String requesterName;
    private String requesterRole;
    private String message;
    private String pickupLocation;
}
