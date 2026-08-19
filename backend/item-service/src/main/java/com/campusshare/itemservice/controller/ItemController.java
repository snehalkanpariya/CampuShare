package com.campusshare.itemservice.controller;

import com.campusshare.itemservice.dto.ItemRequestDTO;
import com.campusshare.itemservice.dto.ItemResponseDTO;
import com.campusshare.itemservice.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<ItemResponseDTO> createItem(@Valid @RequestBody ItemRequestDTO requestDTO) {
        ItemResponseDTO responseDTO = itemService.createItem(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<ItemResponseDTO> items = itemService.getAllItems(category, search);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItemById(@PathVariable String id) {
        ItemResponseDTO item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByOwner(@PathVariable String ownerId) {
        List<ItemResponseDTO> items = itemService.getItemsByOwner(ownerId);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> updateItem(
            @PathVariable String id,
            @Valid @RequestBody ItemRequestDTO requestDTO) {
        ItemResponseDTO updatedItem = itemService.updateItem(id, requestDTO);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
