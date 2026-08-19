package com.campusshare.itemservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequestDTO {

    @NotBlank(message = "Item name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Condition is required")
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
    private Boolean verified;
}
