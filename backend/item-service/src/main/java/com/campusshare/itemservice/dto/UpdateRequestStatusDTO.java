package com.campusshare.itemservice.dto;

import lombok.Data;

@Data
public class UpdateRequestStatusDTO {
    // Status can be ACCEPTED, REJECTED, or COMPLETED
    private String status;
    private String actorId;
}
