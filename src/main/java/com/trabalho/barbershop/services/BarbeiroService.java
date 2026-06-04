package com.trabalho.barbershop.services;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.trabalho.barbershop.dto.UsuarioRequestDTO;
import com.trabalho.barbershop.dto.UsuarioResponseDTO;
import com.trabalho.barbershop.models.Usuario;
import com.trabalho.barbershop.repositories.UsuarioRepository;
import com.trabalho.barbershop.services.exceptions.DatabaseException;

import jakarta.transaction.Transactional;

@Service
public class BarbeiroService {

    private final UsuarioRepository barbeiroRepository;

    public BarbeiroService(UsuarioRepository barbeiroRepository) {
        this.barbeiroRepository = barbeiroRepository;
    }

    @Transactional
    public UsuarioResponseDTO salvar(UsuarioRequestDTO dto) {                         
        if (barbeiroRepository.findByTelefone(dto.getTelefone()).isPresent()) {             
            throw new DatabaseException("Já existe um barbeiro com esse telefone.");   
        }

        Usuario barbeiro = new Usuario();
        barbeiro.setNome(dto.getNome());
        barbeiro.setTelefone(dto.getTelefone());
        barbeiro.setEmail(dto.getEmail());
        Usuario salvo = barbeiroRepository.save(barbeiro);
        return new UsuarioResponseDTO(salvo);
    }

    public UsuarioResponseDTO buscarPorId(Long id) {
            Usuario barbeiro = barbeiroRepository.findById(id)
                    .orElseThrow(() -> new DatabaseException("Barbeiro não encontrado com id: " + id));

            return new UsuarioResponseDTO(barbeiro);
    }

    public List<UsuarioResponseDTO> listarTodos() {
        List<Usuario> list = barbeiroRepository.findAll();
        return list.stream().map(UsuarioResponseDTO::new).collect(Collectors.toList());
    }

    public void deletar(Long id) {
        buscarPorId(id);

        barbeiroRepository.deleteById(id);
    }

    public UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO dto) {
        Usuario barbeiro = barbeiroRepository.findById(id)
                .orElseThrow(() -> new DatabaseException("Barbeiro não encontrado com id: " + id));

        if (!barbeiro.getTelefone().equals(dto.getTelefone()) && barbeiroRepository.findByTelefone(dto.getTelefone()).isPresent()) { 
            throw new DatabaseException("Já existe um barbeiro com esse telefone.");
        }

        barbeiro.setNome(dto.getNome());
        barbeiro.setTelefone(dto.getTelefone());
        barbeiro.setEmail(dto.getEmail());
        Usuario atualizado = barbeiroRepository.save(barbeiro);
        return new UsuarioResponseDTO(atualizado);
    }
}
