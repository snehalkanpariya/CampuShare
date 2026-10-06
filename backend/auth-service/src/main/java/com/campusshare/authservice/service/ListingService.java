package com.campusshare.authservice.service;

import com.campusshare.authservice.dto.request.CreateListingRequest;
import com.campusshare.authservice.dto.response.ListingResponse;
import com.campusshare.authservice.dto.response.PageResponse;
import com.campusshare.authservice.entity.ListingStatus;

import java.util.List;

public interface ListingService {

    PageResponse<ListingResponse> getListings(
            String category,
            String resourceType,
            String status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ListingResponse getListingById(String id);

    ListingResponse createListing(CreateListingRequest request, String userIdentifier);

    ListingResponse updateListingStatus(String id, ListingStatus status, String userIdentifier);

    void deleteListing(String id, String userIdentifier);

    List<String> getCategories();

    List<String> getResourceTypes();
}
