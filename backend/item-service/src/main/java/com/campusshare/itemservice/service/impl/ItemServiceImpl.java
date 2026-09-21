package com.campusshare.itemservice.service.impl;

import com.campusshare.itemservice.dto.ItemRequestDTO;
import com.campusshare.itemservice.dto.ItemResponseDTO;
import com.campusshare.itemservice.entity.Item;
import com.campusshare.itemservice.repository.ItemRepository;
import com.campusshare.itemservice.service.ItemService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;

    public ItemServiceImpl(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public ItemResponseDTO createItem(ItemRequestDTO dto) {

        Item item = new Item();

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setCategory(dto.getCategory());
        item.setCondition(dto.getCondition());

        item.setAvailability(
                dto.getAvailability() != null ? dto.getAvailability() : "Available"
        );

        item.setFree(dto.isFree());

        if (dto.isFree()) {
            item.setPrice("Free");
        } else {
            item.setPrice(dto.getPrice());
        }

        item.setOriginalPrice(dto.getOriginalPrice());
        item.setLocation(dto.getLocation());
        item.setImage(dto.getImage());

        item.setOwnerId(dto.getOwnerId());
        item.setOwnerName(dto.getOwnerName());
        item.setOwnerRole(dto.getOwnerRole());

        item.setVerified(
                dto.getVerified() != null ? dto.getVerified() : true
        );

        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());

        return mapToResponseDTO(itemRepository.save(item));
    }

    @Override
    public List<ItemResponseDTO> getAllItems(String category, String searchQuery) {

        List<Item> items;

        if (searchQuery != null && !searchQuery.isBlank()) {
            items = itemRepository.searchItems(searchQuery.trim());
        } else if (category != null && !category.equalsIgnoreCase("All")) {
            items = itemRepository.findByCategory(category);
        } else {
            items = itemRepository.findAll();
        }

        return items.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public ItemResponseDTO getItemById(String id) {

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        return mapToResponseDTO(item);
    }

    @Override
    public List<ItemResponseDTO> getItemsByOwner(String ownerId) {

        return itemRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public ItemResponseDTO updateItem(String id, ItemRequestDTO dto) {

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (dto.getName() != null)
            item.setName(dto.getName());

        if (dto.getDescription() != null)
            item.setDescription(dto.getDescription());

        if (dto.getCategory() != null)
            item.setCategory(dto.getCategory());

        if (dto.getCondition() != null)
            item.setCondition(dto.getCondition());

        if (dto.getAvailability() != null)
            item.setAvailability(dto.getAvailability());

        if (dto.getLocation() != null)
            item.setLocation(dto.getLocation());

        if (dto.getImage() != null)
            item.setImage(dto.getImage());

        item.setFree(dto.isFree());
        item.setPrice(dto.isFree() ? "Free" : dto.getPrice());
        item.setOriginalPrice(dto.getOriginalPrice());
        item.setUpdatedAt(Instant.now());

        return mapToResponseDTO(itemRepository.save(item));
    }

    @Override
    public void deleteItem(String id) {

        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found");
        }

        itemRepository.deleteById(id);
    }

    private ItemResponseDTO mapToResponseDTO(Item item) {

        ItemResponseDTO dto = new ItemResponseDTO();

        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setCondition(item.getCondition());
        dto.setAvailability(item.getAvailability());
        dto.setPrice(item.getPrice());
        dto.setOriginalPrice(item.getOriginalPrice());
        dto.setFree(item.isFree());
        dto.setLocation(item.getLocation());
        dto.setImage(item.getImage());
        dto.setOwnerId(item.getOwnerId());
        dto.setOwnerName(item.getOwnerName());
        dto.setOwnerRole(item.getOwnerRole());
        dto.setVerified(item.isVerified());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());

        return dto;
    }
}