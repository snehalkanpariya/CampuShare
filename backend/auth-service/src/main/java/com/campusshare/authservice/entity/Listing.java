package com.campusshare.authservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    private String id;

    @Indexed
    private String title;

    private String description;

    @Indexed
    private String category;

    @Indexed
    @Builder.Default
    private ResourceType resourceType = ResourceType.SELL;

    @Indexed
    @Builder.Default
    private ListingStatus status = ListingStatus.AVAILABLE;

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
