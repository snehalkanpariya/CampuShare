package com.campusshare.authservice.controller;

import com.campusshare.authservice.dto.request.CreateListingRequest;
import com.campusshare.authservice.dto.response.ListingResponse;
import com.campusshare.authservice.dto.response.PageResponse;
import com.campusshare.authservice.entity.ListingStatus;
import com.campusshare.authservice.exception.UnauthorizedException;
import com.campusshare.authservice.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ListingController {

    private final ListingService listingService;

    private String getAuthenticatedUserIdentifier(boolean required) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            if (required) {
                throw new UnauthorizedException("Unauthorized: Authentication required for this action");
            }
            return null;
        }
        return auth.getName();
    }

    /**
     * GET /api/listings
     * Query params: category, resourceType, status, search, page, size, sortBy, sortDir
     */
    @GetMapping
    public ResponseEntity<PageResponse<ListingResponse>> getListings(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PageResponse<ListingResponse> response = listingService.getListings(
                category,
                resourceType,
                status,
                search,
                page,
                size,
                sortBy,
                sortDir
        );
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/listings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable String id) {
        ListingResponse response = listingService.getListingById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/listings
     */
    @PostMapping
    public ResponseEntity<ListingResponse> createListing(@Valid @RequestBody CreateListingRequest request) {
        String userIdentifier = getAuthenticatedUserIdentifier(false);
        ListingResponse created = listingService.createListing(request, userIdentifier);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PATCH /api/listings/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponse> updateStatus(
            @PathVariable String id,
            @RequestParam ListingStatus status
    ) {
        String userIdentifier = getAuthenticatedUserIdentifier(false);
        ListingResponse updated = listingService.updateListingStatus(id, status, userIdentifier);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/listings/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable String id) {
        String userIdentifier = getAuthenticatedUserIdentifier(false);
        listingService.deleteListing(id, userIdentifier);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/listings/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(listingService.getCategories());
    }

    /**
     * GET /api/listings/resource-types
     */
    @GetMapping("/resource-types")
    public ResponseEntity<List<String>> getResourceTypes() {
        return ResponseEntity.ok(listingService.getResourceTypes());
    }
}
