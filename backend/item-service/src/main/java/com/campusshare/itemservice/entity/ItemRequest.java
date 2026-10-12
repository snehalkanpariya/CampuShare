package com.campusshare.itemservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "item_requests")
public class ItemRequest {

    @Id
    private String id;

    // Item Information
    private String itemId;
    private String itemName;
    private String itemImage;
    private String itemPrice;

    // Owner Information
    private String ownerId;
    private String ownerName;

    // Requester Information (Junior or Senior)
    private String requesterId;
    private String requesterName;
    private String requesterRole;

    // Request Details
    private String message;
    private String pickupLocation;

    // Status: PENDING, ACCEPTED, REJECTED, COMPLETED
    private String status;

    private Instant createdAt;
    private Instant updatedAt;
}
