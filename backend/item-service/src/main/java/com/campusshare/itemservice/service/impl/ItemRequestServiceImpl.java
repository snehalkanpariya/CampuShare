package com.campusshare.itemservice.service.impl;

import com.campusshare.itemservice.dto.CreateExchangeRequestDTO;
import com.campusshare.itemservice.dto.SendMessageDTO;
import com.campusshare.itemservice.entity.Item;
import com.campusshare.itemservice.entity.ItemRequest;
import com.campusshare.itemservice.repository.ItemRepository;
import com.campusshare.itemservice.repository.ItemRequestRepository;
import com.campusshare.itemservice.service.ItemRequestService;
import com.campusshare.itemservice.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ItemRequestServiceImpl implements ItemRequestService {

    private final ItemRequestRepository itemRequestRepository;
    private final ItemRepository itemRepository;
    private final NotificationService notificationService;

    public ItemRequestServiceImpl(
            ItemRequestRepository itemRequestRepository,
            ItemRepository itemRepository,
            NotificationService notificationService) {
        this.itemRequestRepository = itemRequestRepository;
        this.itemRepository = itemRepository;
        this.notificationService = notificationService;
    }

    @Override
    public ItemRequest createRequest(CreateExchangeRequestDTO dto) {
        // 1. Fetch the item
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + dto.getItemId()));

        // 2. Build the request entity
        ItemRequest request = new ItemRequest();
        request.setItemId(item.getId());
        request.setItemName(item.getName());
        request.setItemImage(item.getImage());
        request.setItemPrice(item.getPrice());

        request.setOwnerId(item.getOwnerId());
        request.setOwnerName(item.getOwnerName());

        request.setRequesterId(dto.getRequesterId());
        request.setRequesterName(dto.getRequesterName());
        request.setRequesterRole(dto.getRequesterRole() != null ? dto.getRequesterRole() : "Student");

        request.setMessage(dto.getMessage());
        request.setPickupLocation(dto.getPickupLocation() != null ? dto.getPickupLocation() : item.getLocation());

        // Default initial status
        request.setStatus("PENDING");
        request.setCreatedAt(Instant.now());
        request.setUpdatedAt(Instant.now());

        ItemRequest savedRequest = itemRequestRepository.save(request);

        // 3. Notify the item owner about the new request
        notificationService.createNotification(
                item.getOwnerId(),
                "New Item Request",
                dto.getRequesterName() + " requested your item '" + item.getName() + "'.",
                "NEW_REQUEST",
                item.getId(),
                savedRequest.getId(),
                dto.getRequesterName()
        );

        return savedRequest;
    }

    @Override
    public List<ItemRequest> getRequestsForOwner(String ownerId) {
        return itemRequestRepository.findByOwnerId(ownerId);
    }

    @Override
    public List<ItemRequest> getRequestsByRequester(String requesterId) {
        return itemRequestRepository.findByRequesterId(requesterId);
    }

    @Override
    public ItemRequest getRequestById(String id) {
        return itemRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item request not found with id: " + id));
    }

    @Override
    public ItemRequest updateRequestStatus(String requestId, String newStatus, String actorId) {
        ItemRequest request = getRequestById(requestId);
        String upperStatus = newStatus.toUpperCase();
        request.setStatus(upperStatus);
        request.setUpdatedAt(Instant.now());

        // When Owner ACCEPTS the request
        if ("ACCEPTED".equals(upperStatus)) {
            // Mark item as Reserved
            itemRepository.findById(request.getItemId()).ifPresent(item -> {
                item.setAvailability("Reserved");
                itemRepository.save(item);
            });

            // Notify Requester that request is accepted
            notificationService.createNotification(
                    request.getRequesterId(),
                    "Request Accepted! 🎉",
                    request.getOwnerName() + " accepted your request for '" + request.getItemName() + "'. Meet spot: " + request.getPickupLocation(),
                    "REQUEST_ACCEPTED",
                    request.getItemId(),
                    request.getId(),
                    request.getOwnerName()
            );
        }
        // When Owner REJECTS the request
        else if ("REJECTED".equals(upperStatus)) {
            // Notify Requester that request was rejected
            notificationService.createNotification(
                    request.getRequesterId(),
                    "Request Declined",
                    request.getOwnerName() + " was unable to accept your request for '" + request.getItemName() + "'.",
                    "REQUEST_REJECTED",
                    request.getItemId(),
                    request.getId(),
                    request.getOwnerName()
            );
        }
        // When Exchange is COMPLETED
        else if ("COMPLETED".equals(upperStatus)) {
            // Mark item as Claimed / Unavailable
            itemRepository.findById(request.getItemId()).ifPresent(item -> {
                item.setAvailability("Claimed / Unavailable");
                itemRepository.save(item);
            });

            // Notify Requester
            notificationService.createNotification(
                    request.getRequesterId(),
                    "Exchange Completed! 🤝",
                    "Handover for '" + request.getItemName() + "' with " + request.getOwnerName() + " is marked complete.",
                    "EXCHANGE_COMPLETED",
                    request.getItemId(),
                    request.getId(),
                    request.getOwnerName()
            );

            // Notify Owner
            notificationService.createNotification(
                    request.getOwnerId(),
                    "Exchange Completed! 🤝",
                    "Handover for '" + request.getItemName() + "' with " + request.getRequesterName() + " is marked complete.",
                    "EXCHANGE_COMPLETED",
                    request.getItemId(),
                    request.getId(),
                    request.getRequesterName()
            );
        }

        return itemRequestRepository.save(request);
    }

    @Override
    public void sendMessage(SendMessageDTO dto) {
        // Send a notification of type NEW_MESSAGE to the recipient
        notificationService.createNotification(
                dto.getReceiverId(),
                "New Message from " + dto.getSenderName(),
                dto.getMessage(),
                "NEW_MESSAGE",
                null,
                dto.getRequestId(),
                dto.getSenderName()
        );
    }
}
