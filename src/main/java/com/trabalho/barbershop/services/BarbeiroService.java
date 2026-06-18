package com.trabalho.barbershop.services;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public BarbeiroService(UsuarioRepository barbeiroRepository) {
        this.barbeiroRepository = barbeiroRepository;
    }

    @Transactional
    public UsuarioResponseDTO salvar(UsuarioRequestDTO dto) {
        if (barbeiroRepository.findByTelefone(dto.getTelefone()).isPresent()) {
            throw new DatabaseException("Já existe um usuário com esse telefone.");
        }
        if (barbeiroRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DatabaseException("Já existe um usuário com esse e-mail.");
        }
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new DatabaseException("A senha é obrigatória.");
        }

        Usuario barbeiro = new Usuario();
        barbeiro.setNome(dto.getNome());
        barbeiro.setTelefone(dto.getTelefone());
        barbeiro.setEmail(dto.getEmail());
        barbeiro.setTipoUsuario(dto.getTipoUsuario() != null ? dto.getTipoUsuario() : "BARBEIRO");
        barbeiro.setSenha(encoder.encode(dto.getSenha())); // hash BCrypt

        Usuario salvo = barbeiroRepository.save(barbeiro);
        return new UsuarioResponseDTO(salvo);
    }

    public UsuarioResponseDTO buscarPorId(Long id) {
        Usuario barbeiro = barbeiroRepository.findById(id)
                .orElseThrow(() -> new DatabaseException("Usuário não encontrado com id: " + id));
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

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO dto) {
        Usuario barbeiro = barbeiroRepository.findById(id)
                .orElseThrow(() -> new DatabaseException("Usuário não encontrado com id: " + id));

        if (!barbeiro.getTelefone().equals(dto.getTelefone()) &&
                barbeiroRepository.findByTelefone(dto.getTelefone()).isPresent()) {
            throw new DatabaseException("Já existe um usuário com esse telefone.");
        }

        barbeiro.setNome(dto.getNome());
        barbeiro.setTelefone(dto.getTelefone());
        barbeiro.setEmail(dto.getEmail());

        if (dto.getTipoUsuario() != null) {
            barbeiro.setTipoUsuario(dto.getTipoUsuario());
        }

        // Só atualiza a senha se uma nova foi informada
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            barbeiro.setSenha(encoder.encode(dto.getSenha()));
        }

        Usuario atualizado = barbeiroRepository.save(barbeiro);
        return new UsuarioResponseDTO(atualizado);
    }
}