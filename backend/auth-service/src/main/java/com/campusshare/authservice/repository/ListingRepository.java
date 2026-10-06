package com.campusshare.authservice.repository;

import com.campusshare.authservice.entity.Listing;
import com.campusshare.authservice.entity.ListingStatus;
import com.campusshare.authservice.entity.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends MongoRepository<Listing, String> {

    List<Listing> findByCategory(String category);

    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findByResourceType(ResourceType resourceType);

    List<Listing> findBySellerId(String sellerId);

    long countByStatus(ListingStatus status);
}
