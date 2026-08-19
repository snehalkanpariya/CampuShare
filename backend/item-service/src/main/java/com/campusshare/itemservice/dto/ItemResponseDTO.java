package com.campusshare.itemservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponseDTO {

    private String id;
    private String name;
    private String description;
    private String category;
    private String condition;
    private String availability;
    private String price;
    private String originalPrice;
    private boolean isFree;
    private String location;
    private String image;

    private String ownerId;
    private String ownerName;
    private String ownerRole;
    private boolean verified;

    private Instant createdAt;
    private Instant updatedAt;
}
