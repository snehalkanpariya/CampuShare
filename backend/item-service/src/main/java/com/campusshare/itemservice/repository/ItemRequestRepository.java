package com.campusshare.itemservice.repository;

import com.campusshare.itemservice.entity.ItemRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ItemRequestRepository extends MongoRepository<ItemRequest, String> {

    // Find requests received by an item owner
    List<ItemRequest> findByOwnerId(String ownerId);

    // Find requests made by a student (junior or senior)
    List<ItemRequest> findByRequesterId(String requesterId);

    // Find all requests for a specific item
    List<ItemRequest> findByItemId(String itemId);
}
