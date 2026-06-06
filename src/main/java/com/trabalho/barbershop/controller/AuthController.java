package com.trabalho.barbershop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.trabalho.barbershop.dto.AuthRequestDTO;
import com.trabalho.barbershop.dto.AuthResponseDTO;
import com.trabalho.barbershop.services.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO dto) {
        AuthResponseDTO response = service.login(dto);
        return ResponseEntity.ok(response);
    }
}