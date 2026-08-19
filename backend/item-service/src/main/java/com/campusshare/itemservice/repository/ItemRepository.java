package com.campusshare.itemservice.repository;

import com.campusshare.itemservice.entity.Item;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<Item, String> {

    List<Item> findByCategory(String category);

    List<Item> findByOwnerId(String ownerId);

    List<Item> findByAvailability(String availability);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'description': { '$regex': ?0, '$options': 'i' } }, { 'location': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Item> searchItems(String keyword);
}
