package com.campusshare.itemservice.controller;

import com.campusshare.itemservice.dto.CreateExchangeRequestDTO;
import com.campusshare.itemservice.dto.SendMessageDTO;
import com.campusshare.itemservice.dto.UpdateRequestStatusDTO;
import com.campusshare.itemservice.entity.ItemRequest;
import com.campusshare.itemservice.service.ItemRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class ItemRequestController {

    private final ItemRequestService itemRequestService;

    public ItemRequestController(ItemRequestService itemRequestService) {
        this.itemRequestService = itemRequestService;
    }

    // 1. Junior or Senior requests an item
    @PostMapping
    public ResponseEntity<ItemRequest> createRequest(@RequestBody CreateExchangeRequestDTO dto) {
        ItemRequest created = itemRequestService.createRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 2. Owner views requests received for their items
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ItemRequest>> getRequestsForOwner(@PathVariable String ownerId) {
        return ResponseEntity.ok(itemRequestService.getRequestsForOwner(ownerId));
    }

    // 3. Student views requests they sent
    @GetMapping("/user/{requesterId}")
    public ResponseEntity<List<ItemRequest>> getRequestsByRequester(@PathVariable String requesterId) {
        return ResponseEntity.ok(itemRequestService.getRequestsByRequester(requesterId));
    }

    // 4. View single request details
    @GetMapping("/{id}")
    public ResponseEntity<ItemRequest> getRequestById(@PathVariable String id) {
        return ResponseEntity.ok(itemRequestService.getRequestById(id));
    }

    // 5. Owner accepts / rejects or marks complete
    @PutMapping("/{id}/status")
    public ResponseEntity<ItemRequest> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateRequestStatusDTO dto) {
        ItemRequest updated = itemRequestService.updateRequestStatus(id, dto.getStatus(), dto.getActorId());
        return ResponseEntity.ok(updated);
    }

    // 6. Send message regarding an item request
    @PostMapping("/{id}/message")
    public ResponseEntity<Void> sendMessage(
            @PathVariable String id,
            @RequestBody SendMessageDTO dto) {
        dto.setRequestId(id);
        itemRequestService.sendMessage(dto);
        return ResponseEntity.ok().build();
    }
}
