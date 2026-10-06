package com.campusshare.authservice.dto.response;

import com.campusshare.authservice.entity.ListingStatus;
import com.campusshare.authservice.entity.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingResponse {

    private String id;
    private String title;
    private String description;
    private String category;
    private ResourceType resourceType;
    private ListingStatus status;
    private Double price;
    private Double originalPrice;
    private String condition;
    private String location;
    private String hostel;
    private String imageUrl;
    private String sellerId;
    private String sellerName;
    private String sellerRole;
    private String sellerEmail;
    private String badge;
    private String badgeBg;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
