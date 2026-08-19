package com.campusshare.itemservice.service.impl;

import com.campusshare.itemservice.dto.ItemRequestDTO;
import com.campusshare.itemservice.dto.ItemResponseDTO;
import com.campusshare.itemservice.entity.Item;
import com.campusshare.itemservice.repository.ItemRepository;
import com.campusshare.itemservice.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;

    @Override
    public ItemResponseDTO createItem(ItemRequestDTO dto) {
        String formattedPrice = dto.isFree() ? "Free" :
                (dto.getPrice() != null && !dto.getPrice().isBlank() ?
                        (dto.getPrice().startsWith("₹") ? dto.getPrice() : "₹" + dto.getPrice()) : "Free");

        String formattedOriginalPrice = (dto.getOriginalPrice() != null && !dto.getOriginalPrice().isBlank()) ?
                (dto.getOriginalPrice().startsWith("₹") ? dto.getOriginalPrice() : "₹" + dto.getOriginalPrice()) : "";

        Item item = Item.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .condition(dto.getCondition())
                .availability(dto.getAvailability() != null ? dto.getAvailability() : "Available")
                .price(formattedPrice)
                .originalPrice(formattedOriginalPrice)
                .isFree(dto.isFree())
                .location(dto.getLocation() != null ? dto.getLocation() : "Campus Main Gate")
                .image(dto.getImage())
                .ownerId(dto.getOwnerId() != null ? dto.getOwnerId() : "guest-user")
                .ownerName(dto.getOwnerName() != null ? dto.getOwnerName() : "Campus Student")
                .ownerRole(dto.getOwnerRole() != null ? dto.getOwnerRole() : "Verified Member")
                .verified(dto.getVerified() != null ? dto.getVerified() : true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Item saved = itemRepository.save(item);
        return mapToResponseDTO(saved);
    }

    @Override
    public List<ItemResponseDTO> getAllItems(String category, String searchQuery) {
        List<Item> items;

        if (searchQuery != null && !searchQuery.isBlank()) {
            items = itemRepository.searchItems(searchQuery.trim());
            if (category != null && !category.equalsIgnoreCase("All")) {
                items = items.stream()
                        .filter(item -> category.equalsIgnoreCase(item.getCategory()))
                        .collect(Collectors.toList());
            }
        } else if (category != null && !category.equalsIgnoreCase("All")) {
            items = itemRepository.findByCategory(category);
        } else {
            items = itemRepository.findAll();
        }

        return items.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public ItemResponseDTO getItemById(String id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        return mapToResponseDTO(item);
    }

    @Override
    public List<ItemResponseDTO> getItemsByOwner(String ownerId) {
        List<Item> items = itemRepository.findByOwnerId(ownerId);
        return items.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public ItemResponseDTO updateItem(String id, ItemRequestDTO dto) {
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));

        if (dto.getName() != null) existingItem.setName(dto.getName());
        if (dto.getDescription() != null) existingItem.setDescription(dto.getDescription());
        if (dto.getCategory() != null) existingItem.setCategory(dto.getCategory());
        if (dto.getCondition() != null) existingItem.setCondition(dto.getCondition());
        if (dto.getAvailability() != null) existingItem.setAvailability(dto.getAvailability());
        if (dto.getLocation() != null) existingItem.setLocation(dto.getLocation());
        if (dto.getImage() != null) existingItem.setImage(dto.getImage());
        
        existingItem.setFree(dto.isFree());
        if (dto.isFree()) {
            existingItem.setPrice("Free");
        } else if (dto.getPrice() != null && !dto.getPrice().isBlank()) {
            existingItem.setPrice(dto.getPrice().startsWith("₹") ? dto.getPrice() : "₹" + dto.getPrice());
        }

        if (dto.getOriginalPrice() != null) {
            existingItem.setOriginalPrice(dto.getOriginalPrice().isBlank() ? "" : 
                    (dto.getOriginalPrice().startsWith("₹") ? dto.getOriginalPrice() : "₹" + dto.getOriginalPrice()));
        }

        existingItem.setUpdatedAt(Instant.now());

        Item updated = itemRepository.save(existingItem);
        return mapToResponseDTO(updated);
    }

    @Override
    public void deleteItem(String id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }

    private ItemResponseDTO mapToResponseDTO(Item item) {
        return ItemResponseDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .condition(item.getCondition())
                .availability(item.getAvailability())
                .price(item.getPrice())
                .originalPrice(item.getOriginalPrice())
                .isFree(item.isFree())
                .location(item.getLocation())
                .image(item.getImage())
                .ownerId(item.getOwnerId())
                .ownerName(item.getOwnerName())
                .ownerRole(item.getOwnerRole())
                .verified(item.isVerified())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
