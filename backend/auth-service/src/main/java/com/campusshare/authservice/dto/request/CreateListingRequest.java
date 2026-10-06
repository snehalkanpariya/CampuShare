package com.campusshare.authservice.dto.request;

import com.campusshare.authservice.entity.ListingStatus;
import com.campusshare.authservice.entity.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateListingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    @PositiveOrZero(message = "Price must be greater than or equal to 0")
    private Double price;

    private Double originalPrice;

    private String condition;

    private String location;

    private String hostel;

    private String imageUrl;

    private ListingStatus status;
}
