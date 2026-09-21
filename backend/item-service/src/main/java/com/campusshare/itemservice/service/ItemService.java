package com.campusshare.itemservice.service;

import com.campusshare.itemservice.dto.ItemRequestDTO;
import com.campusshare.itemservice.dto.ItemResponseDTO;

import java.util.List;

public interface ItemService {

    ItemResponseDTO createItem(ItemRequestDTO requestDTO);

    List<ItemResponseDTO> getAllItems(String category, String searchQuery);

    ItemResponseDTO getItemById(String id);

    List<ItemResponseDTO> getItemsByOwner(String ownerId);

    ItemResponseDTO updateItem(String id, ItemRequestDTO requestDTO);

    void deleteItem(String id);
}
