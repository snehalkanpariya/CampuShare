package com.campusshare.itemservice.service;

import com.campusshare.itemservice.dto.CreateExchangeRequestDTO;
import com.campusshare.itemservice.dto.SendMessageDTO;
import com.campusshare.itemservice.entity.ItemRequest;

import java.util.List;

public interface ItemRequestService {

    // 1. Junior/Senior creates request for an item
    ItemRequest createRequest(CreateExchangeRequestDTO dto);

    // 2. Owner receives requests for their listings
    List<ItemRequest> getRequestsForOwner(String ownerId);

    // 3. Student views requests they sent
    List<ItemRequest> getRequestsByRequester(String requesterId);

    // 4. Get specific request by ID
    ItemRequest getRequestById(String id);

    // 5. Owner accepts or rejects; or marks exchange completed
    ItemRequest updateRequestStatus(String requestId, String newStatus, String actorId);

    // 6. Send a message between owner and requester
    void sendMessage(SendMessageDTO dto);
}
