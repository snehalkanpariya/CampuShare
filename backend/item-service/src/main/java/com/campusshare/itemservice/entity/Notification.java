package com.campusshare.itemservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    // Recipient student (owner or requester)
    private String userId;

    private String title;
    private String message;

    // Type: NEW_REQUEST, REQUEST_ACCEPTED, REQUEST_REJECTED, NEW_MESSAGE, EXCHANGE_COMPLETED
    private String type;

    // Reference IDs
    private String relatedItemId;
    private String relatedRequestId;

    // Sender details
    private String senderName;

    private boolean isRead;
    private Instant createdAt;
}
