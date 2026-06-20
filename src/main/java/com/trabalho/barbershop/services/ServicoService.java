package com.trabalho.barbershop.services;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.trabalho.barbershop.dto.ServicoRequestDTO;
import com.trabalho.barbershop.dto.ServicoResponseDTO;
import com.trabalho.barbershop.models.Servico;
import com.trabalho.barbershop.repositories.ServicoRepository;
import com.trabalho.barbershop.services.exceptions.DatabaseException;

import jakarta.transaction.Transactional;

@Service
public class ServicoService {

    private final ServicoRepository Servicorepository;

    public ServicoService(ServicoRepository Servicorepository) {
        this.Servicorepository = Servicorepository;
    }

    @Transactional
    public ServicoResponseDTO salvar(ServicoRequestDTO dto) {                         
        if (Servicorepository.findByNome(dto.getNome()).isPresent()) {             
            throw new DatabaseException("Já existe um serviço com esse nome.");   
        }
        Servico servico = new Servico();
        servico.setNome(dto.getNome());
        servico.setDescricao(dto.getDescricao());
        servico.setPreco(dto.getPreco());
        servico.setDuracao(dto.getDuracao());
        servico.setImagemUrl(dto.getImagemUrl()); 
        Servico salvo = Servicorepository.save(servico);
        return new ServicoResponseDTO(salvo);
    }

    public ServicoResponseDTO buscarPorId(Long id) {
            Servico servico = Servicorepository.findById(id)
                    .orElseThrow(() -> new DatabaseException("Serviço não encontrado com id: " + id));

            return new ServicoResponseDTO(servico);
    }

    public List<ServicoResponseDTO> listarTodos() {
        List<Servico> list = Servicorepository.findAll();
        return list.stream().map(ServicoResponseDTO::new).collect(Collectors.toList());
    }
    
    public void deletar(Long id) {
        buscarPorId(id);

        Servicorepository.deleteById(id);
    }

    public ServicoResponseDTO atualizar(Long id, ServicoRequestDTO dto) {
        Servico servico = Servicorepository.findById(id)
                .orElseThrow(() -> new DatabaseException("Serviço não encontrado com id: " + id));

        if (!servico.getNome().equals(dto.getNome()) && Servicorepository.findByNome(dto.getNome()).isPresent()) {
            throw new DatabaseException("Já existe um serviço com esse nome.");
        }

        servico.setNome(dto.getNome());
        servico.setDescricao(dto.getDescricao());
        servico.setPreco(dto.getPreco());
        servico.setDuracao(dto.getDuracao());
        servico.setImagemUrl(dto.getImagemUrl());
        Servico atualizado = Servicorepository.save(servico);
        return new ServicoResponseDTO(atualizado);
    }
}