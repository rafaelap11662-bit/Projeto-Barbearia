package com.trabalho.barbershop.controller;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.trabalho.barbershop.dto.AgendamentoRequestDTO;
import com.trabalho.barbershop.dto.AgendamentoResponseDTO;
import com.trabalho.barbershop.services.AgendamentoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    private final AgendamentoService service;
    
    public AgendamentoController(AgendamentoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDTO> salvarAgendamento(@RequestBody @Valid AgendamentoRequestDTO dto) {
        AgendamentoResponseDTO dtoSalvar = service.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(dtoSalvar);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<AgendamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        AgendamentoResponseDTO obj = service.buscarPorId(id);
        return ResponseEntity.ok(obj);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deletarAgendamentoPorId(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

     @GetMapping
     public ResponseEntity<List<AgendamentoResponseDTO>> listarTodos() {
        List<AgendamentoResponseDTO> listDto = service.listarTodos();
        return ResponseEntity.ok(listDto);
     } 

    @PutMapping(value = "/{id}")
    public ResponseEntity<AgendamentoResponseDTO> atualizarAgendamento(@PathVariable Long id, @RequestBody @Valid AgendamentoRequestDTO dto) {
        AgendamentoResponseDTO dtoAtualizado = service.atualizar(id, dto);
        return ResponseEntity.ok(dtoAtualizado);
    }

    @GetMapping("/horarios")
    public ResponseEntity<List<String>> listarHorariosDisponiveis(@RequestParam String data) {

        List<String> horarios = service.listarHorariosDisponiveis(data);

        return ResponseEntity.ok(horarios);
    }

}
