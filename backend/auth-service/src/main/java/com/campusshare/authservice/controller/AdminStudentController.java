package com.campusshare.authservice.controller;

import com.campusshare.authservice.dto.request.AuthorizedStudentRequest;
import com.campusshare.authservice.entity.AuthorizedStudent;
import com.campusshare.authservice.service.AdminStudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/authorized-students")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @PostMapping
    public ResponseEntity<AuthorizedStudent> addAuthorizedStudent(@Valid @RequestBody AuthorizedStudentRequest request, Principal principal) {
        AuthorizedStudent created = adminStudentService.addAuthorizedStudent(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<AuthorizedStudent>> getAuthorizedStudents(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(adminStudentService.searchAuthorizedStudents(search));
        }
        return ResponseEntity.ok(adminStudentService.getAllAuthorizedStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorizedStudent> getAuthorizedStudentById(@PathVariable String id) {
        return ResponseEntity.ok(adminStudentService.getAuthorizedStudentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthorizedStudent> updateAuthorizedStudent(@PathVariable String id, @Valid @RequestBody AuthorizedStudentRequest request) {
        return ResponseEntity.ok(adminStudentService.updateAuthorizedStudent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AuthorizedStudent> revokeAuthorization(@PathVariable String id) {
        return ResponseEntity.ok(adminStudentService.revokeAuthorization(id));
    }
}
