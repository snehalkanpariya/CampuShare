package com.campusshare.authservice.service.impl;

import com.campusshare.authservice.dto.request.CreateListingRequest;
import com.campusshare.authservice.dto.response.ListingResponse;
import com.campusshare.authservice.dto.response.PageResponse;
import com.campusshare.authservice.entity.Listing;
import com.campusshare.authservice.entity.ListingStatus;
import com.campusshare.authservice.entity.ResourceType;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.exception.ResourceNotFoundException;
import com.campusshare.authservice.repository.ListingRepository;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.ListingService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingServiceImpl implements ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    private static final List<String> CATEGORIES = List.of(
            "Charkhas",
            "Drafters",
            "Lab Aprons",
            "Books",
            "Electronics",
            "Hostel Needs",
            "Bicycles"
    );

    @PostConstruct
    public void initSeedData() {
        try {
            if (listingRepository.count() == 0) {
                log.info("Listing repository is empty. Seeding initial Gujarat Vidyapith campus resources...");
                List<Listing> seedListings = List.of(
                        Listing.builder()
                                .title("Traditional Wooden Charkha (યંત્ર રેંટિયો)")
                                .category("Charkhas")
                                .resourceType(ResourceType.SELL)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Verified Senior")
                                .badgeBg("bg-blue-100 text-blue-700")
                                .price(450.0)
                                .originalPrice(1200.0)
                                .location("Sadra Campus Chhatralay")
                                .hostel("Sadra Campus Chhatralay")
                                .condition("Like New (Used 1 Semester)")
                                .sellerName("Dhruvi Malaviya")
                                .sellerRole("SENIOR")
                                .sellerEmail("dhruvi.m@gujaratvidyapith.org")
                                .description("Authentic Gujarat Vidyapith spinning charkha with spare spindle and cotton slivers. Perfectly tuned.")
                                .imageUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(1))
                                .updatedAt(LocalDateTime.now().minusDays(1))
                                .build(),

                        Listing.builder()
                                .title("Engineering Mini Drafter & Scale Set")
                                .category("Drafters")
                                .resourceType(ResourceType.SELL)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Verified Senior")
                                .badgeBg("bg-blue-100 text-blue-700")
                                .price(320.0)
                                .originalPrice(850.0)
                                .location("Central Library Foyer")
                                .hostel("Bhadra Boys Hostel")
                                .condition("Good & Functional")
                                .sellerName("Snehal Kanpariya")
                                .sellerRole("SENIOR")
                                .sellerEmail("snehal.k@gujaratvidyapith.org")
                                .description("Omega mini drafter with clamp, acrylic scale, and protective water-resistant carrying pouch.")
                                .imageUrl("https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(2))
                                .updatedAt(LocalDateTime.now().minusDays(2))
                                .build(),

                        Listing.builder()
                                .title("Microbiology Lab Coat & Dissection Kit")
                                .category("Lab Aprons")
                                .resourceType(ResourceType.SELL)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Verified Senior")
                                .badgeBg("bg-blue-100 text-blue-700")
                                .price(180.0)
                                .originalPrice(550.0)
                                .location("Science Faculty Block")
                                .hostel("Kasturba Girls Hostel")
                                .condition("Like New (Cleaned & Washed)")
                                .sellerName("Pooja Patel")
                                .sellerRole("SENIOR")
                                .sellerEmail("pooja.p@gujaratvidyapith.org")
                                .description("Pure white cotton full-sleeve apron (Size L) with Gujarat Vidyapith crest pocket and dissection forceps set.")
                                .imageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(3))
                                .updatedAt(LocalDateTime.now().minusDays(3))
                                .build(),

                        Listing.builder()
                                .title("Algorithm Design - Kleinberg Tardos (MCA Sem 2)")
                                .category("Books")
                                .resourceType(ResourceType.SELL)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Verified Senior")
                                .badgeBg("bg-blue-100 text-blue-700")
                                .price(220.0)
                                .originalPrice(750.0)
                                .location("Central Library Foyer")
                                .hostel("Bhadra Boys Hostel")
                                .condition("Good & Functional")
                                .sellerName("Kishan Dave")
                                .sellerRole("SENIOR")
                                .sellerEmail("kishan.d@gujaratvidyapith.org")
                                .description("Official Pearson MCA reference textbook with clean highlighted notes for graph algorithms and dynamic programming.")
                                .imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(4))
                                .updatedAt(LocalDateTime.now().minusDays(4))
                                .build(),

                        Listing.builder()
                                .title("Casio Scientific Calculator fx-991EX ClassWiz")
                                .category("Electronics")
                                .resourceType(ResourceType.SELL)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Verified Senior")
                                .badgeBg("bg-blue-100 text-blue-700")
                                .price(550.0)
                                .originalPrice(1400.0)
                                .location("Student Canteen Plaza")
                                .hostel("Bhadra Boys Hostel")
                                .condition("Good & Functional")
                                .sellerName("Jayesh Parmar")
                                .sellerRole("SENIOR")
                                .sellerEmail("jayesh.p@gujaratvidyapith.org")
                                .description("Solar + battery dual powered scientific calculator permitted in GVP end-semester exams. Includes slide-on hard case.")
                                .imageUrl("https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(5))
                                .updatedAt(LocalDateTime.now().minusDays(5))
                                .build(),

                        Listing.builder()
                                .title("Hostel Study Table & LED Reading Lamp")
                                .category("Hostel Needs")
                                .resourceType(ResourceType.SELL)
                                .status(ListingStatus.RESERVED)
                                .badge("Urgent Move-Out")
                                .badgeBg("bg-rose-100 text-rose-800")
                                .price(350.0)
                                .originalPrice(1100.0)
                                .location("Kasturba Girls Hostel Block B")
                                .hostel("Kasturba Girls Hostel")
                                .condition("Good & Functional")
                                .sellerName("Radhika Mehta")
                                .sellerRole("SENIOR")
                                .sellerEmail("radhika.m@gujaratvidyapith.org")
                                .description("Foldable wooden study desk with cup holder + rechargeable 3-mode LED desk light. Moving out after final exam.")
                                .imageUrl("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(6))
                                .updatedAt(LocalDateTime.now().minusDays(6))
                                .build(),

                        Listing.builder()
                                .title("Gandhian Thought & Satyagraha Compendium")
                                .category("Books")
                                .resourceType(ResourceType.DONATION)
                                .status(ListingStatus.AVAILABLE)
                                .badge("100% Free Donation 🌿")
                                .badgeBg("bg-emerald-100 text-emerald-800")
                                .price(0.0)
                                .originalPrice(400.0)
                                .location("Gandhi Peace Research Center")
                                .hostel("Sadra Campus Chhatralay")
                                .condition("Like New")
                                .sellerName("Alumni Cell GVP")
                                .sellerRole("SENIOR")
                                .sellerEmail("alumni@gujaratvidyapith.org")
                                .description("Essential reader for mandatory first-year Gandhian Studies course. Donated for junior incoming batch.")
                                .imageUrl("https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(7))
                                .updatedAt(LocalDateTime.now().minusDays(7))
                                .build(),

                        Listing.builder()
                                .title("Hero Commuter Bicycle (Campus Edition)")
                                .category("Bicycles")
                                .resourceType(ResourceType.SELL)
                                .status(ListingStatus.UNAVAILABLE)
                                .badge("Verified Senior")
                                .badgeBg("bg-blue-100 text-blue-700")
                                .price(1600.0)
                                .originalPrice(4200.0)
                                .location("Main Campus Gate 1")
                                .hostel("Randheja Campus Hostel")
                                .condition("Good & Functional")
                                .sellerName("Amit Solanki")
                                .sellerRole("SENIOR")
                                .sellerEmail("amit.s@gujaratvidyapith.org")
                                .description("Sturdy single-speed bicycle with front basket and new inner tubes. Ideal for hostel-to-department commute.")
                                .imageUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusDays(8))
                                .updatedAt(LocalDateTime.now().minusDays(8))
                                .build(),

                        Listing.builder()
                                .title("Traditional Brass Takli & Cotton Sliver Bundle")
                                .category("Charkhas")
                                .resourceType(ResourceType.DONATION)
                                .status(ListingStatus.AVAILABLE)
                                .badge("100% Free Donation 🌿")
                                .badgeBg("bg-emerald-100 text-emerald-800")
                                .price(0.0)
                                .originalPrice(250.0)
                                .location("Satyagraha Ashram Lawn")
                                .hostel("Bhadra Boys Hostel")
                                .condition("Brand New")
                                .sellerName("Bhadra Ashram Cell")
                                .sellerRole("SENIOR")
                                .sellerEmail("ashram.cell@gujaratvidyapith.org")
                                .description("Hand-spinning brass takli disc with 10 rolls of clean cotton slivers for Gandhi Jayanti and daily prayer hour spinning.")
                                .imageUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusHours(12))
                                .updatedAt(LocalDateTime.now().minusHours(12))
                                .build(),

                        Listing.builder()
                                .title("Python for Data Analysis - Wes McKinney (3rd Edition)")
                                .category("Books")
                                .resourceType(ResourceType.RENT)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Semester Borrow")
                                .badgeBg("bg-purple-100 text-purple-700")
                                .price(50.0)
                                .originalPrice(890.0)
                                .location("Central Library Foyer")
                                .hostel("Sadra Campus Chhatralay")
                                .condition("Like New (Used 1 Semester)")
                                .sellerName("Priya Shah")
                                .sellerRole("SENIOR")
                                .sellerEmail("priya.s@gujaratvidyapith.org")
                                .description("Available for 1 semester rental or borrow. Includes Pandas, NumPy, and Jupyter notebook practice problems.")
                                .imageUrl("https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusHours(8))
                                .updatedAt(LocalDateTime.now().minusHours(8))
                                .build(),

                        Listing.builder()
                                .title("Digital Breadboard & Microcontroller Experiment Kit")
                                .category("Electronics")
                                .resourceType(ResourceType.EXCHANGE)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Item Exchange 🔄")
                                .badgeBg("bg-amber-100 text-amber-800")
                                .price(0.0)
                                .originalPrice(650.0)
                                .location("Computer Science Block")
                                .hostel("Bhadra Boys Hostel")
                                .condition("Good & Functional")
                                .sellerName("Kishan Dave")
                                .sellerRole("SENIOR")
                                .sellerEmail("kishan.d@gujaratvidyapith.org")
                                .description("Want to exchange for a Bluetooth wireless mouse or Arduino UNO board. Includes jumper wires, LEDs, and resistors.")
                                .imageUrl("https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusHours(4))
                                .updatedAt(LocalDateTime.now().minusHours(4))
                                .build(),

                        Listing.builder()
                                .title("Yonex Badminton Racket Set with Shuttlecocks")
                                .category("Hostel Needs")
                                .resourceType(ResourceType.RENT)
                                .status(ListingStatus.AVAILABLE)
                                .badge("Sports Gear")
                                .badgeBg("bg-teal-100 text-teal-800")
                                .price(30.0)
                                .originalPrice(950.0)
                                .location("Hostel Recreation Court")
                                .hostel("Bhadra Boys Hostel")
                                .condition("Good & Functional")
                                .sellerName("Jayesh Parmar")
                                .sellerRole("SENIOR")
                                .sellerEmail("jayesh.p@gujaratvidyapith.org")
                                .description("Weekend rental for campus tournament practice. Pair of aluminum frame rackets with nylon shuttles.")
                                .imageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80")
                                .createdAt(LocalDateTime.now().minusHours(2))
                                .updatedAt(LocalDateTime.now().minusHours(2))
                                .build()
                );

                listingRepository.saveAll(seedListings);
                log.info("Successfully seeded {} campus listings into MongoDB.", seedListings.size());
            }
        } catch (Exception e) {
            log.warn("Could not check/seed listings on startup (MongoDB might be initializing): {}", e.getMessage());
        }
    }

    @Override
    public PageResponse<ListingResponse> getListings(
            String category,
            String resourceType,
            String status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        // Category filter
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            criteriaList.add(Criteria.where("category").regex("^" + Pattern.quote(category.trim()) + "$", "i"));
        }

        // Resource type filter
        if (resourceType != null && !resourceType.isBlank() && !resourceType.equalsIgnoreCase("ALL")) {
            try {
                ResourceType type = ResourceType.valueOf(resourceType.trim().toUpperCase());
                criteriaList.add(Criteria.where("resourceType").is(type));
            } catch (IllegalArgumentException e) {
                log.debug("Invalid resourceType filter: {}", resourceType);
            }
        }

        // Status filter
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                ListingStatus listingStatus = ListingStatus.valueOf(status.trim().toUpperCase());
                criteriaList.add(Criteria.where("status").is(listingStatus));
            } catch (IllegalArgumentException e) {
                log.debug("Invalid status filter: {}", status);
            }
        }

        // Search filter (searches title, description, location)
        if (search != null && !search.isBlank()) {
            String trimmedSearch = Pattern.quote(search.trim());
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("title").regex(trimmedSearch, "i"),
                    Criteria.where("description").regex(trimmedSearch, "i"),
                    Criteria.where("location").regex(trimmedSearch, "i"),
                    Criteria.where("category").regex(trimmedSearch, "i")
            );
            criteriaList.add(searchCriteria);
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Count total elements matching criteria
        long totalElements = mongoTemplate.count(query, Listing.class);

        // Sorting
        String sortProperty = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortProperty);

        int sanitizedPage = Math.max(0, page);
        int sanitizedSize = Math.max(1, Math.min(size, 100)); // cap at 100 items per page

        Pageable pageable = PageRequest.of(sanitizedPage, sanitizedSize, sort);
        query.with(pageable);

        List<Listing> listings = mongoTemplate.find(query, Listing.class);
        List<ListingResponse> content = listings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        int totalPages = sanitizedSize == 0 ? 1 : (int) Math.ceil((double) totalElements / (double) sanitizedSize);
        boolean first = sanitizedPage == 0;
        boolean last = sanitizedPage >= totalPages - 1 || totalPages == 0;
        boolean empty = content.isEmpty();

        return PageResponse.<ListingResponse>builder()
                .content(content)
                .page(sanitizedPage)
                .size(sanitizedSize)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(first)
                .last(last)
                .empty(empty)
                .build();
    }

    @Override
    public ListingResponse getListingById(String id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + id));
        return mapToResponse(listing);
    }

    @Override
    public ListingResponse createListing(CreateListingRequest request, String userIdentifier) {
        User seller = null;
        if (userIdentifier != null && !userIdentifier.isBlank()) {
            seller = userRepository.findByEmail(userIdentifier)
                    .or(() -> userRepository.findByEnrollmentNumber(userIdentifier))
                    .or(() -> userRepository.findByKeycloakUserId(userIdentifier))
                    .orElse(null);
        }

        String sellerName = seller != null && seller.getName() != null ? seller.getName() : "Gujarat Vidyapith Student";
        String sellerRole = seller != null && seller.getRole() != null ? seller.getRole().name() : "STUDENT";
        String sellerEmail = seller != null ? seller.getEmail() : userIdentifier;
        String sellerId = seller != null ? seller.getId() : null;

        boolean isDonation = request.getResourceType() == ResourceType.DONATION;
        Double price = isDonation ? 0.0 : (request.getPrice() != null ? request.getPrice() : 0.0);

        String badge = isDonation ? "100% Free Donation 🌿" : ("SENIOR".equals(sellerRole) ? "Verified Senior" : "Campus Student");
        String badgeBg = isDonation ? "bg-emerald-100 text-emerald-800" : ("SENIOR".equals(sellerRole) ? "bg-blue-100 text-blue-700" : "bg-stone-100 text-stone-700");

        String defaultImage = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80";
        String image = (request.getImageUrl() != null && !request.getImageUrl().isBlank()) ? request.getImageUrl() : defaultImage;

        Listing listing = Listing.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .category(request.getCategory().trim())
                .resourceType(request.getResourceType())
                .status(request.getStatus() != null ? request.getStatus() : ListingStatus.AVAILABLE)
                .price(price)
                .originalPrice(request.getOriginalPrice() != null ? request.getOriginalPrice() : price * 1.5)
                .condition(request.getCondition() != null ? request.getCondition() : "Good & Functional")
                .location(request.getLocation() != null ? request.getLocation() : "Central Campus Foyer")
                .hostel(request.getHostel() != null ? request.getHostel() : "Campus Hostel")
                .imageUrl(image)
                .sellerId(sellerId)
                .sellerName(sellerName)
                .sellerRole(sellerRole)
                .sellerEmail(sellerEmail)
                .badge(badge)
                .badgeBg(badgeBg)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Listing saved = listingRepository.save(listing);
        log.info("Created new campus listing: id={}, title={}, seller={}", saved.getId(), saved.getTitle(), sellerName);
        return mapToResponse(saved);
    }

    @Override
    public ListingResponse updateListingStatus(String id, ListingStatus newStatus, String userIdentifier) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + id));

        listing.setStatus(newStatus);
        listing.setUpdatedAt(LocalDateTime.now());
        Listing updated = listingRepository.save(listing);
        log.info("Updated listing status: id={}, newStatus={}", id, newStatus);
        return mapToResponse(updated);
    }

    @Override
    public void deleteListing(String id, String userIdentifier) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + id));

        listingRepository.delete(listing);
        log.info("Deleted campus listing: id={}, title={}", id, listing.getTitle());
    }

    @Override
    public List<String> getCategories() {
        return CATEGORIES;
    }

    @Override
    public List<String> getResourceTypes() {
        return Arrays.stream(ResourceType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    private ListingResponse mapToResponse(Listing listing) {
        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .category(listing.getCategory())
                .resourceType(listing.getResourceType())
                .status(listing.getStatus())
                .price(listing.getPrice())
                .originalPrice(listing.getOriginalPrice())
                .condition(listing.getCondition())
                .location(listing.getLocation())
                .hostel(listing.getHostel())
                .imageUrl(listing.getImageUrl())
                .sellerId(listing.getSellerId())
                .sellerName(listing.getSellerName())
                .sellerRole(listing.getSellerRole())
                .sellerEmail(listing.getSellerEmail())
                .badge(listing.getBadge())
                .badgeBg(listing.getBadgeBg())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
