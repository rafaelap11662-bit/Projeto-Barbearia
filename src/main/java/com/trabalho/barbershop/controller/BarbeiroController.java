package com.trabalho.barbershop.controller;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.trabalho.barbershop.dto.UsuarioRequestDTO;
import com.trabalho.barbershop.dto.UsuarioResponseDTO;
import com.trabalho.barbershop.services.BarbeiroService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/barbeiros")
public class BarbeiroController {
    
    private final BarbeiroService service;

    public BarbeiroController(BarbeiroService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> salvarBarbeiro(@RequestBody @Valid UsuarioRequestDTO dto) {
        UsuarioResponseDTO dtoSalvar = service.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(dtoSalvar);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        UsuarioResponseDTO obj = service.buscarPorId(id);
        return ResponseEntity.ok(obj);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deletarBarbeiroPorId(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        List<UsuarioResponseDTO> listDto = service.listarTodos();
        return ResponseEntity.ok(listDto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarBarbeiro(@PathVariable Long id, @RequestBody @Valid UsuarioRequestDTO dto) {
        UsuarioResponseDTO dtoAtualizado = service.atualizar(id, dto);
        return ResponseEntity.ok(dtoAtualizado);
    }
}
